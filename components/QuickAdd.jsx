'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function QuickAdd() {
  const { user } = useAuth();
  const [text, setText] = useState('');

  const handleMagicAdd = async () => {
    if (!text.trim() || !user) return; // SAFETY CHECK
    const lowerText = text.toLowerCase();
    const moneyRegex = /(Rp\s*|IDR\s*)?([\d,.]+)\s*([kK])?/;
    const isMoney = moneyRegex.test(text) && !lowerText.includes('remind') && !lowerText.includes('idea') && !lowerText.includes('besok');

    if (isMoney) {
      const match = text.match(moneyRegex);
      let amount = parseFloat(match[2].replace(',', '.'));
      if (match[3]) amount *= 1000; 
      await fetch('/api/finance', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, collection: 'transactions', data: { type: 'expense', amount, description: text, category: 'Auto-QuickAdd', date: new Date().toISOString() } })
      });
      alert('Tercatat sebagai Pengeluaran!');
    } else if (lowerText.includes('besok') || lowerText.includes('jam') || lowerText.includes('remind')) {
      await fetch('/api/calendar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary: text, start: new Date().toISOString(), end: new Date().toISOString() })
      });
      alert('Ditambahkan ke Agenda!');
    } else {
      await fetch('/api/brain', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, title: text.slice(0, 40), content: text, tags: ['#quickadd'] })
      });
      alert('Disimpan di 2nd Brain!');
    }
    setText('');
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end z-50">
      <input type="text" value={text} onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleMagicAdd()}
        placeholder="Ketik: Lunch 35k, Meeting besok, Idea..." 
        className="p-3 rounded-lg bg-gray-800 text-white mb-2 w-80 glass-input" />
      <button onClick={handleMagicAdd} className="p-4 bg-purple-600 rounded-full shadow-lg hover:bg-purple-700 text-white">✨</button>
    </div>
  );
}