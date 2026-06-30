'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import GlassCard from '@/components/GlassCard';
import { Upload, FileSpreadsheet, Target, PieChart } from 'lucide-react';
import axios from 'axios';

export default function FinancePage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    axios.get(`/api/finance?userId=${user.uid}`)
      .then(res => setTransactions(res.data))
      .finally(() => setLoading(false));
  }, [user]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', user.uid);
    await axios.post('/api/finance', formData);
    alert('CSV Imported!');
    window.location.reload();
  };

  if (loading) return <div className="text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">💰 Finance</h1>
        <div className="flex gap-3">
          <label className="glass-card px-5 py-2 flex items-center gap-2 text-sm text-gray-300 hover:text-white cursor-pointer hover:border-purple-500/30">
            <Upload size={16} /> Import CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
          </label>
          <button className="glass-card px-5 py-2 flex items-center gap-2 text-sm text-gray-300 hover:text-white hover:border-purple-500/30">
            <Target size={16} /> Set Target
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard>Total Income: <span className="text-green-400 float-right">Rp 18,500,000</span></GlassCard>
        <GlassCard>Total Expenses: <span className="text-red-400 float-right">Rp 9,200,000</span></GlassCard>
        <GlassCard>Net: <span className="text-blue-400 float-right">Rp 9,300,000</span></GlassCard>
      </div>

      <GlassCard>
        <h2 className="text-white font-semibold mb-4">📋 Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-white/5">
                <th className="text-left py-3">Date</th>
                <th className="text-left">Description</th>
                <th className="text-left">Category</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 text-gray-300">{tx.date}</td>
                  <td className="text-gray-200">{tx.description}</td>
                  <td><span className="bg-white/10 px-2 py-1 rounded-full text-xs">{tx.category}</span></td>
                  <td className={`text-right font-medium ${tx.type === 'Income' ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.type === 'Income' ? '+' : '-'}{tx.amount.toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}