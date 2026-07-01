'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import GlassCard from '@/components/GlassCard';
import Papa from 'papaparse';
import { Wallet, Plus, Upload, TrendingUp, TrendingDown, Landmark, Target } from 'lucide-react';

export default function FinancePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [wealth, setWealth] = useState({ accounts: [], goals: [], totalAssets: 0, totalDebt: 0, netWorth: 0 });
  const [transactions, setTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const [showAddTx, setShowAddTx] = useState(false);
  const [newTx, setNewTx] = useState({ description: '', amount: '', type: 'expense', category: 'General' });
  const [showAddAcc, setShowAddAcc] = useState(false);
  const [newAcc, setNewAcc] = useState({ name: '', type: 'bank', balance: '' });
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', target: '', current: 0 });
  
  const fileInputRef = useRef(null);
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  useEffect(() => { if (user) { fetchWealth(); fetchTransactions(); } }, [user, selectedMonth, selectedYear]);

  const fetchWealth = async () => {
    if (!user) return;
    const res = await fetch(`/api/wealth?userId=${user.uid}`);
    const result = await res.json();
    if (result) setWealth(result);
  };

  const fetchTransactions = async () => {
    if (!user) return;
    const res = await fetch(`/api/finance?userId=${user.uid}&type=transactions&month=${selectedMonth}&year=${selectedYear}`);
    const result = await res.json();
    setTransactions(result.data || []);
  };

  const handleAddTx = async () => {
    if (!user) return;
    if (!newTx.description || !newTx.amount) return;
    await fetch('/api/finance', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.uid, collection: 'transactions', data: { ...newTx, amount: parseFloat(newTx.amount), date: new Date().toISOString() } })
    });
    setNewTx({ description: '', amount: '', type: 'expense', category: 'General' });
    setShowAddTx(false); fetchTransactions();
  };

  const handleAddAcc = async () => {
    if (!user) return;
    if (!newAcc.name || !newAcc.balance) return;
    await fetch('/api/wealth', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.uid, collection: 'accounts', data: { ...newAcc, balance: parseFloat(newAcc.balance) } })
    });
    setNewAcc({ name: '', type: 'bank', balance: '' }); setShowAddAcc(false); fetchWealth();
  };

  const handleAddGoal = async () => {
    if (!user) return; // INI YANG MENCEGAH ERROR user is null
    if (!newGoal.name || !newGoal.target) return;
    await fetch('/api/wealth', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.uid, collection: 'goals', data: { ...newGoal, target: parseFloat(newGoal.target), current: parseFloat(newGoal.current) || 0 } })
    });
    setNewGoal({ name: '', target: '', current: 0 }); setShowAddGoal(false); fetchWealth();
  };

  const handleCSVUpload = (e) => {
    if (!user) return;
    const file = e.target.files[0]; if (!file) return;
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: async (results) => {
        const txs = results.data.map(row => {
          const date = row['Tanggal'] || row['Date'];
          const desc = row['Keterangan'] || row['Description'];
          const debit = parseFloat(row['Debit'] || row['Mutasi (DB)'] || 0) || 0;
          const credit = parseFloat(row['Kredit'] || row['Mutasi (CR)'] || 0) || 0;
          if (!desc) return null;
          return { userId: user.uid, collection: 'transactions', data: { date: new Date(date).toISOString(), description: desc, amount: debit > 0 ? debit : credit, type: debit > 0 ? 'expense' : 'income', category: 'CSV Import' } };
        }).filter(Boolean);

        for (const tx of txs) {
          await fetch('/api/finance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(tx) });
        }
        alert(`${txs.length} transaksi berhasil diimpor!`); fetchTransactions();
      }
    });
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white flex items-center gap-3"><Wallet /> Wealth & Finance</h1>

      <div className="flex gap-2 border-b border-white/10 pb-2">
        {['overview', 'accounts', 'transactions', 'goals'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === tab ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GlassCard className="bg-green-500/10 border-green-500/20"><p className="text-sm text-gray-400 flex items-center gap-2"><TrendingUp size={16}/> Total Assets</p><p className="text-2xl font-bold text-green-400 mt-2">Rp {wealth.totalAssets?.toLocaleString()}</p></GlassCard>
            <GlassCard className="bg-red-500/10 border-red-500/20"><p className="text-sm text-gray-400 flex items-center gap-2"><TrendingDown size={16}/> Total Debt</p><p className="text-2xl font-bold text-red-400 mt-2">Rp {wealth.totalDebt?.toLocaleString()}</p></GlassCard>
            <GlassCard className="bg-purple-500/10 border-purple-500/20"><p className="text-sm text-gray-400 flex items-center gap-2"><Landmark size={16}/> Net Worth</p><p className={`text-2xl font-bold mt-2 ${wealth.netWorth >= 0 ? 'text-purple-400' : 'text-red-400'}`}>Rp {wealth.netWorth?.toLocaleString()}</p></GlassCard>
          </div>
          <GlassCard>
            <h2 className="text-white font-semibold mb-4">Cashflow Bulan Ini</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-gray-400 text-sm">Pemasukan</p><p className="text-xl font-bold text-green-400">Rp {totalIncome.toLocaleString()}</p></div>
              <div><p className="text-gray-400 text-sm">Pengeluaran</p><p className="text-xl font-bold text-red-400">Rp {totalExpense.toLocaleString()}</p></div>
            </div>
          </GlassCard>
        </div>
      )}

      {activeTab === 'accounts' && (
        <div className="space-y-4">
          <div className="flex justify-end"><button onClick={() => setShowAddAcc(!showAddAcc)} className="glass-card px-4 py-2 text-sm text-white flex items-center gap-2"><Plus size={16}/> Add Account/Debt</button></div>
          {showAddAcc && (
            <GlassCard className="border-purple-500/20">
              <div className="grid grid-cols-3 gap-3">
                <input placeholder="Name (e.g. BCA, Paylater)" value={newAcc.name} onChange={e => setNewAcc({...newAcc, name: e.target.value})} className="glass-input" />
                <select value={newAcc.type} onChange={e => setNewAcc({...newAcc, type: e.target.value})} className="glass-input">
                  <option value="bank">Bank / Asset</option><option value="cash">Cash / Asset</option><option value="debt">Debt / Loan</option>
                </select>
                <input placeholder="Balance" type="number" value={newAcc.balance} onChange={e => setNewAcc({...newAcc, balance: e.target.value})} className="glass-input" />
              </div>
              <button onClick={handleAddAcc} className="mt-3 bg-purple-600 px-6 py-2 rounded-lg text-white">Save</button>
            </GlassCard>
          )}
          <div className="grid gap-3">
            {wealth.accounts?.map(acc => (
              <GlassCard key={acc.id} className="flex justify-between items-center">
                <div><h3 className="text-white font-semibold">{acc.name}</h3><p className="text-xs text-gray-400 capitalize">{acc.type}</p></div>
                <span className={`text-xl font-bold ${acc.type === 'debt' ? 'text-red-400' : 'text-green-400'}`}>Rp {acc.balance?.toLocaleString()}</span>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 justify-between items-center">
            <div className="flex gap-2">
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="glass-input w-auto">{months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}</select>
              <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="glass-input w-auto">{[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}</select>
            </div>
            <div className="flex gap-2">
              <button onClick={() => fileInputRef.current?.click()} className="glass-card px-4 py-2 text-sm text-white flex items-center gap-2"><Upload size={16}/> Import CSV</button>
              <input type="file" accept=".csv" ref={fileInputRef} onChange={handleCSVUpload} className="hidden" />
              <button onClick={() => setShowAddTx(!showAddTx)} className="glass-card px-4 py-2 text-sm text-white flex items-center gap-2"><Plus size={16}/> Add Manual</button>
            </div>
          </div>
          {showAddTx && (
            <GlassCard className="border-purple-500/20">
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Description" value={newTx.description} onChange={e => setNewTx({...newTx, description: e.target.value})} className="glass-input" />
                <input placeholder="Amount" type="number" value={newTx.amount} onChange={e => setNewTx({...newTx, amount: e.target.value})} className="glass-input" />
                <select value={newTx.type} onChange={e => setNewTx({...newTx, type: e.target.value})} className="glass-input"><option value="expense">Expense</option><option value="income">Income</option></select>
                <input placeholder="Category" value={newTx.category} onChange={e => setNewTx({...newTx, category: e.target.value})} className="glass-input" />
              </div>
              <button onClick={handleAddTx} className="mt-3 bg-purple-600 px-6 py-2 rounded-lg text-white">Save</button>
            </GlassCard>
          )}
          <GlassCard>
            <h2 className="text-white font-semibold mb-4">Transactions ({transactions.length})</h2>
            <div className="space-y-2">
              {transactions.length === 0 && <p className="text-gray-500 text-center py-8">No transactions.</p>}
              {transactions.map(t => (
                <div key={t.id} className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                  <div><p className="text-white text-sm">{t.description}</p><p className="text-xs text-gray-500">{t.category} • {new Date(t.date).toLocaleDateString()}</p></div>
                  <span className={t.type === 'income' ? 'text-green-400' : 'text-red-400'}>{t.type === 'income' ? '+' : '-'} Rp {t.amount?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {activeTab === 'goals' && (
        <div className="space-y-4">
          <div className="flex justify-end"><button onClick={() => setShowAddGoal(!showAddGoal)} className="glass-card px-4 py-2 text-sm text-white flex items-center gap-2"><Plus size={16}/> Add Savings Goal</button></div>
          {showAddGoal && (
            <GlassCard className="border-purple-500/20">
              <div className="grid grid-cols-3 gap-3">
                <input placeholder="Goal Name" value={newGoal.name} onChange={e => setNewGoal({...newGoal, name: e.target.value})} className="glass-input" />
                <input placeholder="Target Amount" type="number" value={newGoal.target} onChange={e => setNewGoal({...newGoal, target: e.target.value})} className="glass-input" />
                <input placeholder="Current Saved" type="number" value={newGoal.current} onChange={e => setNewGoal({...newGoal, current: e.target.value})} className="glass-input" />
              </div>
              <button onClick={handleAddGoal} className="mt-3 bg-purple-600 px-6 py-2 rounded-lg text-white">Save</button>
            </GlassCard>
          )}
          <div className="grid gap-4">
            {wealth.goals?.map(goal => {
              const progress = Math.min(100, (goal.current / goal.target) * 100);
              return (
                <GlassCard key={goal.id}>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-white font-semibold flex items-center gap-2"><Target size={16}/> {goal.name}</h3>
                    <span className="text-sm text-gray-400">Rp {goal.current?.toLocaleString()} / Rp {goal.target?.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500" style={{ width: `${progress}%` }}></div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}