'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import GlassCard from '@/components/GlassCard';
import Papa from 'papaparse';
import { Wallet, Plus, Upload } from 'lucide-react';

export default function FinancePage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showAdd, setShowAdd] = useState(false);
  const [newTx, setNewTx] = useState({ description: '', amount: '', type: 'expense', category: 'General' });
  const fileInputRef = useRef(null);
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  useEffect(() => { if (user) fetchTransactions(); }, [user, selectedMonth, selectedYear]);

  const fetchTransactions = async () => {
    const res = await fetch(`/api/finance?userId=${user.uid}&type=transactions&month=${selectedMonth}&year=${selectedYear}`);
    const result = await res.json();
    setTransactions(result.data || []); // FIX: API return { data: [] }
  };

  const handleAddTx = async () => {
    if (!newTx.description || !newTx.amount) return;
    await fetch('/api/finance', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.uid, collection: 'transactions', data: { ...newTx, amount: parseFloat(newTx.amount), date: new Date().toISOString() } })
    });
    setNewTx({ description: '', amount: '', type: 'expense', category: 'General' });
    setShowAdd(false);
    fetchTransactions();
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
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
        alert(`${txs.length} transaksi berhasil diimpor!`);
        fetchTransactions();
      }
    });
  };

  const totalIncome = transactions.filter(t => t.type === 'income' || t.type === 'Income').reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense' || t.type === 'Expense').reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3"><Wallet /> Keuangan</h1>
        <div className="flex gap-2">
          <button onClick={() => fileInputRef.current?.click()} className="glass-card px-4 py-2 text-sm text-white flex items-center gap-2"><Upload size={16}/> Import CSV</button>
          <input type="file" accept=".csv" ref={fileInputRef} onChange={handleCSVUpload} className="hidden" />
          <button onClick={() => setShowAdd(!showAdd)} className="glass-card px-4 py-2 text-sm text-white flex items-center gap-2 hover:border-purple-500/50"><Plus size={16}/> Add Manual</button>
        </div>
      </div>

      {showAdd && (
        <GlassCard className="border-purple-500/20">
          <h2 className="text-white font-semibold mb-3">Tambah Transaksi</h2>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Deskripsi" value={newTx.description} onChange={e => setNewTx({...newTx, description: e.target.value})} className="glass-input" />
            <input placeholder="Jumlah" type="number" value={newTx.amount} onChange={e => setNewTx({...newTx, amount: e.target.value})} className="glass-input" />
            <select value={newTx.type} onChange={e => setNewTx({...newTx, type: e.target.value})} className="glass-input">
              <option value="expense">Pengeluaran</option><option value="income">Pemasukan</option>
            </select>
            <input placeholder="Kategori" value={newTx.category} onChange={e => setNewTx({...newTx, category: e.target.value})} className="glass-input" />
          </div>
          <button onClick={handleAddTx} className="mt-3 bg-purple-600 px-6 py-2 rounded-lg text-white">Simpan</button>
        </GlassCard>
      )}

      <div className="flex gap-4 items-center glass-card">
        <span className="text-gray-400">Periode:</span>
        <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="glass-input w-auto">
          {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="glass-input w-auto">
          {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard><p className="text-sm text-gray-400">Pemasukan</p><p className="text-xl font-bold text-green-400">Rp {totalIncome.toLocaleString()}</p></GlassCard>
        <GlassCard><p className="text-sm text-gray-400">Pengeluaran</p><p className="text-xl font-bold text-red-400">Rp {totalExpense.toLocaleString()}</p></GlassCard>
        <GlassCard><p className="text-sm text-gray-400">Net Cashflow</p><p className={`text-xl font-bold ${totalIncome - totalExpense >= 0 ? 'text-green-400' : 'text-red-400'}`}>Rp {(totalIncome - totalExpense).toLocaleString()}</p></GlassCard>
      </div>

      <GlassCard>
        <h2 className="text-white font-semibold mb-4">Transaksi ({transactions.length})</h2>
        <div className="space-y-2">
          {transactions.length === 0 && <p className="text-gray-500 text-center py-8">Belum ada transaksi di periode ini.</p>}
          {transactions.map(t => (
            <div key={t.id} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
              <div><p className="text-white text-sm">{t.description}</p><p className="text-xs text-gray-500">{t.category} • {new Date(t.date).toLocaleDateString()}</p></div>
              <span className={t.type === 'income' || t.type === 'Income' ? 'text-green-400' : 'text-red-400'}>
                {t.type === 'income' || t.type === 'Income' ? '+' : '-'} Rp {t.amount?.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}