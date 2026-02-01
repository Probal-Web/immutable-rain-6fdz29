import React, { useState, useEffect } from "react";
import {
  Plus, Trash2, Wallet, Save, Download, FileText,
  AlertTriangle, CheckCircle, LayoutDashboard, History,
  PieChart, Landmark, Scale, Coins, Zap, LogOut
} from "lucide-react";
import { initializeApp } from "firebase/app";
import {
  getAuth, signInAnonymously, onAuthStateChanged
} from "firebase/auth";
import {
  getFirestore, doc, setDoc, onSnapshot
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
  measurementId: "G-L9KDY1HGSD"
};

const appId = "amar-hisab-pro-final-v7"; // Unique App ID for Vercel
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ==========================================
//  DEFAULT CATEGORIES
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
  expenses: [
    { id: "e1", name: "TOTAL EXPENSE", amount: 0 }
  ],
  payables: [
    { id: "p1", name: "CREDIT CARD DUE", amount: 0 },
    { id: "p2", name: "AD ACCOUNT - T-SHIRT", amount: 0 },
    { id: "p3", name: "AD ACCOUNT - ADVANTAGE", amount: 0 },
    { id: "p4", name: "AD ACCOUNT - PONNOBARI", amount: 0 },
    { id: "p5", name: "AD ACCOUNT - BORKOTMOY", amount: 0 },
    { id: "p6", name: "AD ACCOUNT - DIGIBIZZ", amount: 0 },
    { id: "p7", name: "AD ACCOUNT - OTHERS", amount: 0 },
  ]
};

// ==========================================
//  UI COMPONENTS
// ==========================================

const StatCard = ({ title, value, icon, subtext, variant }) => {
  const styles = {
    dark: "bg-gray-900 text-white shadow-xl shadow-gray-200/50",
    white: "bg-white text-gray-900 shadow-sm border border-gray-100",
    emerald: "bg-emerald-600 text-white shadow-lg shadow-emerald-200/50",
  };
  return (
    <div className={`p-5 rounded-3xl transition-all hover:-translate-y-1 ${styles[variant] || styles.white}`}>
      <div className="p-2.5 bg-white/10 rounded-2xl w-fit mb-4 backdrop-blur-md border border-white/20">
        {React.cloneElement(icon, { size: 18 })}
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">{title}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-sm font-medium opacity-60">৳</span>
        <h3 className="text-2xl font-black tracking-tight">{value}</h3>
      </div>
      <p className="text-[9px] mt-2 opacity-60 font-bold uppercase tracking-tighter">{subtext}</p>
    </div>
  );
};

const EditableList = ({ title, items, onUpdate, totalLabel, totalValue, accent }) => {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
        <h3 className="font-black text-gray-800 text-[10px] uppercase tracking-widest flex items-center gap-2">
           <div className={`w-1.5 h-1.5 rounded-full ${accent}`}></div>
           {title}
        </h3>
        <button onClick={() => onUpdate("add")} className="p-1.5 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-gray-900 transition-colors">
          <Plus size={16}/>
        </button>
      </div>
      <div className="p-4 space-y-2 flex-grow overflow-auto max-h-[350px]">
        {items.map(item => (
          <div key={item.id} className="flex gap-2 items-center group bg-gray-50/50 p-2.5 rounded-2xl border border-transparent hover:border-gray-100 transition-all">
            <input 
              type="text" 
              value={item.name} 
              onChange={(e) => onUpdate("update", {id: item.id, field: "name", val: e.target.value})} 
              className="flex-1 bg-transparent text-[11px] font-bold text-gray-600 outline-none" 
            />
            <div className="flex items-center bg-white px-2.5 py-1 rounded-xl shadow-sm border border-gray-100">
              <span className="text-[10px] text-gray-400 mr-1">৳</span>
              <input 
                type="number" 
                value={item.amount} 
                onChange={(e) => onUpdate("update", {id: item.id, field: "amount", val: e.target.value})} 
                className="w-20 bg-transparent text-xs font-black text-right outline-none text-gray-900" 
              />
            </div>
            <button onClick={() => onUpdate("remove", item.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all">
              <Trash2 size={14}/>
            </button>
          </div>
        ))}
      </div>
      <div className="px-6 py-3.5 bg-gray-50/80 border-t border-gray-50 flex justify-between items-center">
        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{totalLabel}</span>
        <span className="text-base font-black text-gray-900">৳ {totalValue.toLocaleString()}</span>
      </div>
    </div>
  );
};

// ==========================================
//  MAIN APP
// ==========================================

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startingBalance, setStartingBalance] = useState(0);
  const [assets, setAssets] = useState(DEFAULTS.assets);
  const [incomes, setIncomes] = useState(DEFAULTS.incomes);
  const [expenses, setExpenses] = useState(DEFAULTS.expenses);
  const [payables, setPayables] = useState(DEFAULTS.payables);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (e) {
        console.error("Auth failed:", e);
      }
    };
    initAuth();
    const unsubAuth = onAuthStateChanged(auth, u => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    // Path Rule 1: /artifacts/{appId}/users/{userId}/data/{collectionName}
    const basePath = ['artifacts', appId, 'users', user.uid, 'data'];
    
    const unsubs = [
      onSnapshot(doc(db, ...basePath, 'config'), d => d.exists() && setStartingBalance(d.data().val), (e) => {}),
      onSnapshot(doc(db, ...basePath, 'assets'), d => d.exists() && setAssets(d.data().items), (e) => {}),
      onSnapshot(doc(db, ...basePath, 'incomes'), d => d.exists() && setIncomes(d.data().items), (e) => {}),
      onSnapshot(doc(db, ...basePath, 'expenses'), d => d.exists() && setExpenses(d.data().items), (e) => {}),
      onSnapshot(doc(db, ...basePath, 'payables'), d => d.exists() && setPayables(d.data().items), (e) => {}),
    ];
    
    return () => unsubs.forEach(f => f());
  }, [user]);

  const saveToFirebase = async (key, data, isVal = false) => {
    if (!user) return;
    const ref = doc(db, 'artifacts', appId, 'users', user.uid, 'data', key);
    await setDoc(ref, isVal ? { val: data } : { items: data });
  };

  const updateList = (list, setList, key, action, payload) => {
    let nl = [...list];
    if (action === "add") nl.push({ id: Date.now().toString(), name: "New Entry", amount: 0 });
    if (action === "remove") nl = nl.filter(i => i.id !== payload);
    if (action === "update") nl = nl.map(i => i.id === payload.id ? {...i, [payload.field]: payload.field === "amount" ? Number(payload.val) : payload.val} : i);
    
    setList(nl);
    saveToFirebase(key, nl);
  };

  const tAssets = assets.reduce((s,i) => s + i.amount, 0);
  const tInc = incomes.reduce((s,i) => s + i.amount, 0);
  const tExp = expenses.reduce((s,i) => s + i.amount, 0);
  const tDebt = payables.reduce((s,i) => s + i.amount, 0);

  const expected = startingBalance + tInc - tExp;
  const netWealth = tAssets - tDebt;
  const discrepancy = tAssets - expected;
  const isBalanced = Math.abs(discrepancy) < 1;

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
       <div className="flex flex-col items-center gap-4">
          <Zap size={40} className="text-gray-900 animate-pulse fill-gray-900"/>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Syncing Amar Hisab...</p>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-4 sm:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gray-900 p-2.5 rounded-2xl text-yellow-400 shadow-xl shadow-gray-200">
               <Zap size={22} fill="currentColor"/>
            </div>
            <div>
               <h1 className="text-xl font-black uppercase tracking-tighter text-gray-900 leading-none">Amar Hisab</h1>
               <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">Personal Wealth Tracker</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="hidden sm:flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Storage: Online</span>
             </div>
             <button onClick={() => window.location.reload()} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                <LogOut size={20}/>
             </button>
          </div>
        </header>

        {/* METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
               <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Opening Capital</p>
               <Landmark size={18} className="text-gray-200"/>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xl font-light text-gray-300">৳</span>
              <input 
                type="number" 
                value={startingBalance} 
                onChange={e => { setStartingBalance(Number(e.target.value)); saveToFirebase("config", Number(e.target.value), true); }} 
                className="w-full text-3xl font-black outline-none bg-transparent text-gray-900" 
              />
            </div>
          </div>
          <StatCard title="Expected Balance" value={expected.toLocaleString()} icon={<Scale size={20}/>} subtext="History Calculation" variant="white" />
          <StatCard title="Gross Assets" value={tAssets.toLocaleString()} icon={<Coins size={20}/>} subtext="Total Physical Value" variant="dark" />
          <StatCard title="Actual Net" value={netWealth.toLocaleString()} icon={<Wallet size={20}/>} subtext="Assets minus Debt" variant="emerald" />
        </div>

        {/* RECONCILIATION */}
        <div className={`rounded-3xl px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all ${isBalanced ? 'bg-white border border-emerald-50 shadow-sm' : 'bg-amber-50 border border-amber-100 shadow-amber-100/50 shadow-lg animate-pulse'}`}>
           <div className="flex items-center gap-4">
              <div className={`p-2 rounded-full ${isBalanced ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                 {isBalanced ? <CheckCircle size={20}/> : <AlertTriangle size={20}/>}
              </div>
              <div className="text-center sm:text-left">
                 <p className={`text-[11px] font-black uppercase ${isBalanced ? 'text-gray-900' : 'text-amber-900'}`}>{isBalanced ? 'Records Balanced' : 'Discrepancy Detected'}</p>
                 <p className="text-[10px] text-gray-500 font-medium">
                   {isBalanced ? 'Your physical assets match your ledger history.' : `Expected ৳${expected.toLocaleString()} but assets show ৳${tAssets.toLocaleString()}.`}
                 </p>
              </div>
           </div>
           {!isBalanced && (
             <div className="text-[10px] font-black uppercase bg-amber-200 text-amber-900 px-4 py-1.5 rounded-full">
                Diff: ৳{discrepancy.toLocaleString()}
             </div>
           )}
        </div>

        {/* LISTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-8">
            <EditableList title="Actual Assets (Cash/Bank)" items={assets} onUpdate={(a,p) => updateList(assets, setAssets, "assets", a,p)} totalLabel="Gross" totalValue={tAssets} accent="bg-indigo-500" />
            <EditableList title="Income Records" items={incomes} onUpdate={(a,p) => updateList(incomes, setIncomes, "incomes", a,p)} totalLabel="Total" totalValue={tInc} accent="bg-emerald-500" />
          </div>
          <div className="space-y-8">
            <EditableList title="Expense Records" items={expenses} onUpdate={(a,p) => updateList(expenses, setExpenses, "expenses", a,p)} totalLabel="Total" totalValue={tExp} accent="bg-rose-500" />
            <EditableList title="Payables (Debt)" items={payables} onUpdate={(a,p) => updateList(payables, setPayables, "payables", a,p)} totalLabel="Total" totalValue={tDebt} accent="bg-amber-500" />
          </div>
        </div>

      </div>
      <script src="https://cdn.tailwindcss.com"></script>
    </div>
  );
}
