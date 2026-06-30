// components/QuickAdd.jsx
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function QuickAdd() {
  const { user } = useAuth();
  const [text, setText] = useState('');

  const handleMagicAdd = async () => {
    if (!text.trim() || !user) return;
    const lowerText = text.toLowerCase();

    // 1. DETEKSI UANG (Finance)
    // Cek apakah ada angka dan tidak ada kata kunci jadwal/ide
    const moneyRegex = /(Rp\s*|IDR\s*)?([\d,.]+)\s*([kK])?/;
    const isMoney = moneyRegex.test(text) && !lowerText.includes('remind') && !lowerText.includes('idea') && !lowerText.includes('besok');
    
    if (isMoney) {
      const match = text.match(moneyRegex);
      let amount = parseFloat(match[2].replace(',', '.'));
      if (match[3]) amount *= 1000; // Jika ada 'k' (35k -> 35000)
      
      await fetch('/api/finance', {
        method: 'POST',
        body: JSON.stringify({ userId: user.uid, type: 'expense', amount, description: text, category: 'Auto-QuickAdd' })
      });
      alert('Tercatat sebagai Pengeluaran!');
    } 
    // 2. DETEKSI JADWAL (Calendar)
    else if (lowerText.includes('besok') || lowerText.includes('jam') || lowerText.includes('remind') || lowerText.includes('meeting')) {
      await fetch('/api/calendar', {
        method: 'POST',
        body: JSON.stringify({ userId: user.uid, title: text, autoSchedule: true })
      });
      alert('Ditambahkan ke Agenda & Kalender!');
    } 
    // 3. DEFAULT: 2ND BRAIN
    else {
      await fetch('/api/brain', {
        method: 'POST',
        body: JSON.stringify({ userId: user.uid, content: text })
      });
      alert('Disimpan di 2nd Brain!');
    }
    
    setText(''); // Reset input
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end">
      <input 
        type="text" value={text} onChange={(e) => setText(e.target.value)} 
        onKeyDown={(e) => e.key === 'Enter' && handleMagicAdd()}
        placeholder="Ketik apapun (Lunch 35k, Meeting besok jam 10, Idea...)" 
        className="p-3 rounded-lg bg-gray-800 text-white mb-2 w-80"
      />
      <button onClick={handleMagicAdd} className="p-4 bg-purple-600 rounded-full shadow-lg hover:bg-purple-700">
        ✨ Quick Add
      </button>
    </div>
  );
}