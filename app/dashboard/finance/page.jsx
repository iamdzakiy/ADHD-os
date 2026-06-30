'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext'; // Sesuaikan dengan context auth kamu

export default function FinancePage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  useEffect(() => {
    if (user) fetchTransactions();
  }, [user, selectedMonth, selectedYear]); // Akan fetch ulang setiap dropdown berubah!

  const fetchTransactions = async () => {
    const res = await fetch(`/api/finance?userId=${user.uid}&month=${selectedMonth}&year=${selectedYear}`);
    const data = await res.json();
    setTransactions(data.transactions || []);
  };

  // KALKULASI LAPORAN KEUANGAN OTOMATIS
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netCashflow = totalIncome - totalExpense;
  const healthScore = totalIncome > 0 ? Math.min(100, Math.round((netCashflow / totalIncome) * 100)) : 0;

  return (
    <div className="p-6 space-y-6 text-white">
      <h1 className="text-2xl font-bold">💰 Manajemen Keuangan</h1>

      {/* DROPDOWN BULAN & TAHUN */}
      <div className="flex gap-4 items-center bg-white/10 p-4 rounded-xl backdrop-blur-md">
        <span>Periode:</span>
        <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="bg-gray-800 p-2 rounded">
          {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="bg-gray-800 p-2 rounded">
          {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* KARTU LAPORAN KEUANGAN */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-500/20 p-4 rounded-xl"><p className="text-sm opacity-70">Pemasukan</p><p className="text-xl font-bold">Rp {totalIncome.toLocaleString()}</p></div>
        <div className="bg-red-500/20 p-4 rounded-xl"><p className="text-sm opacity-70">Pengeluaran</p><p className="text-xl font-bold">Rp {totalExpense.toLocaleString()}</p></div>
        <div className="bg-blue-500/20 p-4 rounded-xl"><p className="text-sm opacity-70">Net Cashflow</p><p className={`text-xl font-bold ${netCashflow >= 0 ? 'text-green-400' : 'text-red-400'}`}>Rp {netCashflow.toLocaleString()}</p></div>
        <div className="bg-purple-500/20 p-4 rounded-xl"><p className="text-sm opacity-70">Health Score</p><p className="text-xl font-bold">{healthScore}/100</p></div>
      </div>

      {/* DAFTAR TRANSAKSI */}
      <div className="bg-white/5 p-4 rounded-xl">
        <h2 className="text-lg mb-4">Transaksi Periode Ini ({transactions.length})</h2>
        <ul className="space-y-2">
          {transactions.map(t => (
            <li key={t.id} className="flex justify-between bg-black/20 p-3 rounded">
              <span>{t.description} ({t.category})</span>
              <span className={t.type === 'income' ? 'text-green-400' : 'text-red-400'}>Rp {t.amount.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}