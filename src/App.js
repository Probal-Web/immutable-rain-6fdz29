import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Wallet,
  TrendingUp,
  TrendingDown,
  Save,
  ArrowRight,
  ArrowLeft,
  Layers,
  LogOut,
  Lock,
  Calculator,
  Download,
  FileText,
  AlertTriangle,
  CheckCircle,
  LayoutDashboard,
  History,
  PieChart,
  MoreHorizontal,
  Landmark,
  ChevronRight,
  Activity,
  Zap,
  Scale,
  Coins,
} from "lucide-react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithCustomToken,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  collection,
} from "firebase/firestore";

// ==========================================
//  FIREBASE CONFIGURATION
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyBnpwHwBtf0QJpkC1FdYMdGMJrIsQ3AShs",
  authDomain: "my-finance-tracker-d6413.firebaseapp.com",
  projectId: "my-finance-tracker-d6413",
  storageBucket: "my-finance-tracker-d6413.firebasestorage.app",
  messagingSenderId: "1065127351804",
  appId: "1:1065127351804:web:c2f850e14fa485680d8e79",
  measurementId: "G-L9KDY1HGSD",
};

const appId = typeof __app_id !== "undefined" ? __app_id : "amar-hisab-pro";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Demo Data Manager (Local Storage Fallback) ---
const localDb = {
  get: (key) => JSON.parse(localStorage.getItem(key) || "null"),
  set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
};

// ==========================================
//  DEFAULT DATA DEFINITIONS
// ==========================================
const DEFAULTS = {
  assets: [
    { id: "a1", name: "CASH", amount: 0 },
    { id: "a2", name: "BKASH", amount: 0 },
    { id: "a3", name: "NAGAD", amount: 0 },
    { id: "a4", name: "CITY BANK", amount: 0 },
    { id: "a5", name: "PUBALI BANK", amount: 0 },
    { id: "a6", name: "EBL", amount: 0 },
    { id: "a7", name: "PAYONEER", amount: 0 },
  ],
  incomes: [
    { id: "i1", name: "T-SHIRT - NIROB", amount: 0 },
    { id: "i2", name: "PONNOBARI", amount: 0 },
    { id: "i3", name: "BORKOTMOY", amount: 0 },
    { id: "i4", name: "OTHERS", amount: 0 },
    { id: "i5", name: "DUE COLLECTION", amount: 0 },
  ],
  expenses: [{ id: "e1", name: "TOTAL EXPENSE", amount: 0 }],
  payables: [
    { id: "p1", name: "CREDIT CARD DUE", amount: 0 },
    { id: "p2", name: "AD ACCOUNT - T-SHIRT", amount: 0 },
    { id: "p3", name: "AD ACCOUNT - ADVANTAGE", amount: 0 },
    { id: "p4", name: "AD ACCOUNT - PONNOBARI", amount: 0 },
    { id: "p5", name: "AD ACCOUNT - BORKOTMOY", amount: 0 },
    { id: "p6", name: "AD ACCOUNT - DIGIBIZZ", amount: 0 },
    { id: "p7", name: "AD ACCOUNT - OTHERS", amount: 0 },
  ],
  receivables: [],
};

// ==========================================
//  PREMIUM UI COMPONENTS
// ==========================================

const StatCard = ({ title, value, icon, subtext, variant }) => {
  const styles = {
    dark: "bg-gray-900 text-white shadow-xl shadow-gray-900/20 ring-1 ring-gray-900",
    white:
      "bg-white text-gray-900 shadow-md shadow-gray-100 ring-1 ring-gray-100",
    gradient:
      "bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-xl shadow-indigo-500/30",
    emerald:
      "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/20",
    blue: "bg-blue-50 text-blue-900 ring-1 ring-blue-100",
  };

  const currentStyle = styles[variant] || styles.white;

  return (
    <div
      className={`p-5 rounded-2xl relative overflow-hidden transition-all duration-300 hover:-translate-y-1 ${currentStyle}`}
    >
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-3">
          <div
            className={`p-2.5 rounded-xl ${
              variant === "white" || variant === "blue"
                ? "bg-white text-gray-900 shadow-sm border border-gray-100"
                : "bg-white/10 text-white backdrop-blur-sm"
            }`}
          >
            {React.cloneElement(icon, { size: 18 })}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-70">
            {title}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-medium opacity-60">৳</span>
            <h3 className="text-xl font-black tracking-tighter sm:text-2xl">
              {value}
            </h3>
          </div>
          {subtext && (
            <p className="mt-1.5 text-[9px] font-medium opacity-70 uppercase tracking-tighter">
              {subtext}
            </p>
          )}
        </div>
      </div>
      <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-current opacity-5 blur-3xl"></div>
    </div>
  );
};

const EditableList = ({
  title,
  items,
  onUpdate,
  totalLabel,
  totalValue,
  accentColor,
}) => {
  const accentColors = {
    indigo: "text-indigo-600 bg-indigo-50",
    emerald: "text-emerald-600 bg-emerald-50",
    rose: "text-rose-600 bg-rose-50",
    amber: "text-amber-600 bg-amber-50",
    cyan: "text-cyan-600 bg-cyan-50",
  };
  const accent = accentColors[accentColor] || accentColors.indigo;

  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 flex flex-col min-h-[150px] overflow-hidden hover:shadow-md transition-all duration-300">
      <div className="px-5 py-3.5 border-b border-gray-50 flex justify-between items-center bg-white">
        <h3 className="font-bold text-gray-800 text-xs tracking-wide flex items-center gap-2.5">
          <span className={`p-1 rounded-lg ${accent}`}>
            <LayoutDashboard size={12} />
          </span>
          {title}
        </h3>
        <button
          onClick={() => onUpdate("add")}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 text-gray-400 hover:bg-gray-900 hover:text-white transition-all"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="p-3 space-y-1.5 flex-grow">
        {items.length === 0 && (
          <div className="text-center py-5">
            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-1.5 text-gray-200">
              <FileText size={16} />
            </div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
              Empty
            </p>
          </div>
        )}
        {items.map((item) => (
          <div
            key={item.id}
            className="flex gap-2 items-center group p-1.5 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
          >
            <input
              type="text"
              placeholder="Label"
              value={item.name}
              onChange={(e) =>
                onUpdate("update", {
                  id: item.id,
                  field: "name",
                  val: e.target.value,
                })
              }
              className="flex-1 bg-transparent border-none p-0 text-sm font-semibold text-gray-700 focus:outline-none placeholder:text-gray-300"
            />
            <div className="relative w-24 flex items-center justify-end bg-white rounded-lg px-2 py-1 shadow-sm ring-1 ring-gray-100 group-hover:ring-gray-200">
              <span className="text-[10px] text-gray-400 mr-1 font-bold">
                ৳
              </span>
              <input
                type="number"
                placeholder="0"
                value={item.amount}
                onChange={(e) =>
                  onUpdate("update", {
                    id: item.id,
                    field: "amount",
                    val: e.target.value,
                  })
                }
                className="w-full bg-transparent border-none p-0 text-sm font-bold text-right text-gray-900 focus:outline-none"
              />
            </div>
            <button
              onClick={() => onUpdate("remove", item.id)}
              className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-rose-500 transition-all p-1"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      <div className="px-5 py-2.5 bg-gray-50/50 border-t border-gray-50 flex justify-between items-center">
        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
          {totalLabel}
        </span>
        <span className="text-base font-black text-gray-900 tracking-tight">
          {new Intl.NumberFormat("en-BD", {
            style: "currency",
            currency: "BDT",
            minimumFractionDigits: 0,
          }).format(totalValue)}
        </span>
      </div>
    </div>
  );
};

// ==========================================
//  AUTH SCREEN
// ==========================================
const AuthScreen = ({ onDemoLogin }) => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      if (typeof __initial_auth_token !== "undefined" && __initial_auth_token) {
        try {
          await signInWithCustomToken(auth, __initial_auth_token);
        } catch (tokenErr) {
          console.warn("Token mismatch, falling back to anonymous auth");
          await signInAnonymously(auth);
        }
      } else {
        await signInAnonymously(auth);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 font-sans text-gray-900 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50 to-transparent"></div>
      <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl shadow-indigo-100 w-full max-w-sm text-center border border-white relative z-10">
        <div className="w-14 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl rotate-3">
          <Zap className="w-7 h-7 text-yellow-400 fill-yellow-400" />
        </div>
        <h1 className="text-2xl font-black tracking-tighter mb-1">
          Amar Hisab
        </h1>
        <p className="text-gray-500 text-xs mb-8 font-medium">
          Personal Finance System
        </p>
        <div className="space-y-3">
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm bg-gray-900 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            {loading ? "Connecting..." : "Cloud Access"}
          </button>
          <button
            onClick={onDemoLogin}
            className="w-full bg-white text-gray-600 border border-gray-100 py-3.5 rounded-xl font-bold text-sm hover:border-gray-200 hover:text-gray-900 transition-all"
          >
            Local Device Only
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
//  MAIN DASHBOARD
// ==========================================
const Dashboard = ({ user, isDemo }) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [startingBalance, setStartingBalance] = useState(0);
  const [assets, setAssets] = useState(DEFAULTS.assets);
  const [incomes, setIncomes] = useState(DEFAULTS.incomes);
  const [expenses, setExpenses] = useState(DEFAULTS.expenses);
  const [payables, setPayables] = useState(DEFAULTS.payables);
  const [receivables, setReceivables] = useState(DEFAULTS.receivables);
  const [monthSaveName, setMonthSaveName] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemo) {
      setStartingBalance(localDb.get("startingBalance") || 0);
      setAssets(localDb.get("assets") || DEFAULTS.assets);
      setIncomes(localDb.get("incomes") || DEFAULTS.incomes);
      setExpenses(localDb.get("expenses") || DEFAULTS.expenses);
      setPayables(localDb.get("payables") || DEFAULTS.payables);
      setReceivables(localDb.get("receivables") || DEFAULTS.receivables);
      setHistory(localDb.get("history") || []);
      setLoading(false);
    } else if (user) {
      const basePath = ["artifacts", appId, "users", user.uid];
      const unsub = [
        onSnapshot(
          doc(db, ...basePath, "data", "starting"),
          (d) =>
            d.exists()
              ? setStartingBalance(d.data().val)
              : setStartingBalance(0),
          (err) => console.error(err)
        ),
        onSnapshot(
          doc(db, ...basePath, "data", "assets"),
          (d) =>
            d.exists() ? setAssets(d.data().items) : setAssets(DEFAULTS.assets),
          (err) => console.error(err)
        ),
        onSnapshot(
          doc(db, ...basePath, "data", "incomes"),
          (d) =>
            d.exists()
              ? setIncomes(d.data().items)
              : setIncomes(DEFAULTS.incomes),
          (err) => console.error(err)
        ),
        onSnapshot(
          doc(db, ...basePath, "data", "expenses"),
          (d) =>
            d.exists()
              ? setExpenses(d.data().items)
              : setExpenses(DEFAULTS.expenses),
          (err) => console.error(err)
        ),
        onSnapshot(
          doc(db, ...basePath, "data", "payables"),
          (d) =>
            d.exists()
              ? setPayables(d.data().items)
              : setPayables(DEFAULTS.payables),
          (err) => console.error(err)
        ),
        onSnapshot(
          doc(db, ...basePath, "data", "receivables"),
          (d) =>
            d.exists()
              ? setReceivables(d.data().items)
              : setReceivables(DEFAULTS.receivables),
          (err) => console.error(err)
        ),
        onSnapshot(
          doc(db, ...basePath, "data", "history"),
          (d) => (d.exists() ? setHistory(d.data().items) : setHistory([])),
          (err) => console.error(err)
        ),
      ];
      setLoading(false);
      return () => unsub.forEach((fn) => fn());
    }
  }, [user, isDemo]);

  const saveToStore = async (key, data, isVal = false) => {
    if (isDemo) {
      localDb.set(key, data);
    } else if (user) {
      const ref = doc(db, "artifacts", appId, "users", user.uid, "data", key);
      await setDoc(ref, isVal ? { val: data } : { items: data });
    }
  };

  const updateList = (list, setList, key, action, payload) => {
    let newList = [];
    if (action === "add")
      newList = [...list, { id: Date.now(), name: "", amount: 0 }];
    if (action === "remove") newList = list.filter((i) => i.id !== payload);
    if (action === "update")
      newList = list.map((i) =>
        i.id === payload.id
          ? {
              ...i,
              [payload.field]:
                payload.field === "amount" ? Number(payload.val) : payload.val,
            }
          : i
      );

    setList(newList);
    saveToStore(key, newList);
  };

  const totalAssets = assets.reduce((s, i) => s + i.amount, 0);
  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpense = expenses.reduce((s, i) => s + i.amount, 0);
  const totalDebt = payables.reduce((s, i) => s + i.amount, 0);
  const totalDue = receivables.reduce((s, i) => s + i.amount, 0);

  const expectedBalance = startingBalance + totalIncome - totalExpense;
  const grossBalance = totalAssets;
  const netBalance = grossBalance - totalDebt;

  const discrepancy = grossBalance - expectedBalance;
  const isBalanced = Math.abs(discrepancy) < 1;

  const formatMoney = (n) =>
    new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(n);

  const exportData = () => {
    const data = [
      ["Type", "Name", "Amount"],
      ["Initial", "Starting Balance", startingBalance],
      ...assets.map((a) => ["Asset", a.name, a.amount]),
      ...incomes.map((i) => ["Income", i.name, i.amount]),
      ...expenses.map((e) => ["Expense", e.name, e.amount]),
      ...payables.map((p) => ["Debt", p.name, p.amount]),
      ...receivables.map((r) => ["Receivable", r.name, r.amount]),
      ["SUMMARY", "Expected Balance", expectedBalance],
      ["SUMMARY", "Actual Net Balance", netBalance],
    ];
    const csvContent =
      "data:text/csv;charset=utf-8," + data.map((e) => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute(
      "download",
      `amar_hisab_${new Date().toLocaleDateString()}.csv`
    );
    document.body.appendChild(link);
    link.click();
  };

  const archiveMonth = () => {
    if (!monthSaveName) return;
    const snap = {
      id: Date.now(),
      name: monthSaveName,
      date: new Date().toLocaleDateString(),
      expectedBalance,
      grossBalance,
      netBalance,
      totalDebt,
    };
    const newHistory = [snap, ...history];
    setHistory(newHistory);
    saveToStore("history", newHistory);
    setMonthSaveName("");
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center font-bold text-gray-300">
        Loading Workspace...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-gray-900 font-sans pb-12 relative">
      <div className="fixed top-0 left-0 w-full h-80 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50/50 via-gray-50 to-transparent pointer-events-none -z-10"></div>

      {/* --- Navbar --- */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Zap size={16} className="text-gray-900 fill-gray-900" />
            <span className="font-black text-xs uppercase tracking-widest hidden sm:block">
              Amar Hisab
            </span>
          </div>
          <div className="flex bg-gray-100/80 p-0.5 rounded-lg border border-gray-200/50">
            {["dashboard", "history"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest transition-all ${
                  activeTab === tab
                    ? "bg-white text-black shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab === "dashboard" ? (
                  <LayoutDashboard size={10} />
                ) : (
                  <History size={10} />
                )}
                <span>{tab}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={exportData}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-lg"
            >
              <Download size={14} />
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-rose-50 hover:text-rose-500 rounded-lg"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-5 space-y-4 mt-2">
        {activeTab === "dashboard" && (
          <>
            {/* --- METRICS --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[8px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded uppercase">
                    Start
                  </span>
                  <Landmark size={14} className="text-gray-300" />
                </div>
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-lg font-light text-gray-300">৳</span>
                  <input
                    type="number"
                    value={startingBalance}
                    onChange={(e) => {
                      setStartingBalance(Number(e.target.value));
                      saveToStore("starting", Number(e.target.value), true);
                    }}
                    className="w-full text-xl font-black text-gray-900 focus:outline-none bg-transparent"
                    placeholder="0"
                  />
                </div>
                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">
                  Opening Capital
                </p>
              </div>

              <StatCard
                title="Expected Balance"
                value={formatMoney(expectedBalance)}
                icon={<Scale />}
                subtext="Start + Income - Expenses"
                variant="white"
              />
              <StatCard
                title="Gross Assets"
                value={formatMoney(grossBalance)}
                icon={<Coins />}
                subtext="Total Physical Assets"
                variant="dark"
              />
              <StatCard
                title="Actual Net Balance"
                value={formatMoney(netBalance)}
                icon={<Wallet />}
                subtext="Assets - All Debts"
                variant="emerald"
              />
            </div>

            {/* --- RECONCILIATION BAR --- */}
            <div
              className={`border rounded-xl px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 transition-all ${
                isBalanced
                  ? "bg-white border-emerald-100"
                  : "bg-white border-amber-100 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-1.5 rounded-full ${
                    isBalanced
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-amber-100 text-amber-600"
                  }`}
                >
                  {isBalanced ? (
                    <CheckCircle size={14} />
                  ) : (
                    <AlertTriangle size={14} />
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <span
                    className={`text-[10px] font-bold ${
                      isBalanced ? "text-gray-900" : "text-amber-800 uppercase"
                    }`}
                  >
                    {isBalanced ? "Records Sync" : "Discrepancy Detected"}
                  </span>
                  <p className="text-[9px] text-gray-500">
                    {isBalanced ? (
                      "Everything matches."
                    ) : (
                      <span>
                        Expected {formatMoney(expectedBalance)} but assets total{" "}
                        {formatMoney(grossBalance)}.
                      </span>
                    )}
                  </p>
                </div>
              </div>
              {!isBalanced && (
                <div className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-100 text-[8px] font-black uppercase tracking-widest">
                  Diff: {formatMoney(discrepancy)}
                </div>
              )}
            </div>

            {/* --- LISTS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
              <div className="space-y-4">
                <EditableList
                  title="Physical Assets (Cash/Bank)"
                  items={assets}
                  onUpdate={(a, p) =>
                    updateList(assets, setAssets, "assets", a, p)
                  }
                  totalLabel="Gross"
                  totalValue={totalAssets}
                  accentColor="indigo"
                />
                <EditableList
                  title="Income"
                  items={incomes}
                  onUpdate={(a, p) =>
                    updateList(incomes, setIncomes, "incomes", a, p)
                  }
                  totalLabel="Total"
                  totalValue={totalIncome}
                  accentColor="emerald"
                />
                <EditableList
                  title="Receivables (Due)"
                  items={receivables}
                  onUpdate={(a, p) =>
                    updateList(receivables, setReceivables, "receivables", a, p)
                  }
                  totalLabel="Total"
                  totalValue={totalDue}
                  accentColor="cyan"
                />
              </div>

              <div className="space-y-4">
                <EditableList
                  title="Expenses"
                  items={expenses}
                  onUpdate={(a, p) =>
                    updateList(expenses, setExpenses, "expenses", a, p)
                  }
                  totalLabel="Total"
                  totalValue={totalExpense}
                  accentColor="rose"
                />
                <EditableList
                  title="Payables (Debt)"
                  items={payables}
                  onUpdate={(a, p) =>
                    updateList(payables, setPayables, "payables", a, p)
                  }
                  totalLabel="Total"
                  totalValue={totalDebt}
                  accentColor="amber"
                />

                {/* ARCHIVE */}
                <div className="bg-gray-900 text-white rounded-2xl p-5 shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div>
                      <h3 className="font-bold text-[8px] uppercase tracking-widest text-gray-400">
                        Monthly Close
                      </h3>
                      <p className="text-base font-black mt-0.5">
                        Archive Snapshot
                      </p>
                    </div>
                    <div className="p-2 bg-white/10 rounded-lg">
                      <Save size={16} />
                    </div>
                  </div>
                  <div className="flex gap-1.5 bg-white/5 rounded-xl p-1 border border-white/10 relative z-10">
                    <input
                      type="text"
                      value={monthSaveName}
                      onChange={(e) => setMonthSaveName(e.target.value)}
                      placeholder="e.g. Feb 2026"
                      className="flex-1 bg-transparent border-none px-2 text-[10px] font-medium focus:outline-none"
                    />
                    <button
                      onClick={archiveMonth}
                      className="bg-white text-black px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "history" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {history.length === 0 && (
              <div className="col-span-full py-20 text-center text-gray-300">
                <FileText size={32} className="mx-auto mb-2 opacity-20" />
                <p className="text-[9px] uppercase font-bold tracking-widest">
                  No history
                </p>
              </div>
            )}
            {history.map((rec) => (
              <div
                key={rec.id}
                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-black text-base text-gray-900">
                      {rec.name}
                    </h3>
                    <p className="text-[8px] font-bold text-gray-400 uppercase">
                      {rec.date}
                    </p>
                  </div>
                  <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                    <PieChart size={12} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                    <span className="text-[8px] font-bold text-gray-400 uppercase">
                      Net Wealth
                    </span>
                    <span className="font-black text-gray-900 text-sm">
                      {formatMoney(rec.netBalance)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[8px] font-black uppercase">
                    <div>
                      <p className="text-gray-400">Gross</p>
                      <p className="text-gray-700">
                        {formatMoney(rec.grossBalance)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400">Debt</p>
                      <p className="text-rose-500">
                        {formatMoney(rec.totalDebt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (
          typeof __initial_auth_token !== "undefined" &&
          __initial_auth_token
        ) {
          try {
            await signInWithCustomToken(auth, __initial_auth_token);
          } catch (tokenErr) {
            console.warn(
              "Token mismatch for current config, falling back to anonymous login."
            );
            await signInAnonymously(auth);
          }
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) {
        console.error("Auth failed:", e);
      }
    };

    if (!isDemo) {
      initAuth();
      const unsub = onAuthStateChanged(auth, (u) => {
        setUser(u);
        setLoading(false);
      });
      return () => unsub();
    } else {
      setLoading(false);
    }
  }, [isDemo]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center font-bold text-gray-300">
        Loading System...
      </div>
    );
  if (!user && !isDemo)
    return <AuthScreen onDemoLogin={() => setIsDemo(true)} />;
  return <Dashboard user={user} isDemo={isDemo} />;
}
