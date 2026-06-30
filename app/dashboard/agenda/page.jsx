'use client';
import { useState } from 'react';
import GlassCard from '@/components/GlassCard';
import { Calendar, Clock, CheckCircle, Circle } from 'lucide-react';

export default function AgendaPage() {
  const [tasks] = useState([
    { id: 1, title: 'Deep Work: Q3 Report', time: '09:00 - 11:00', date: 'Today', done: false },
    { id: 2, title: 'Call BCA CS', time: '14:00 - 14:30', date: 'Today', done: false },
    { id: 3, title: 'Review Budget', time: '11:00 - 12:00', date: 'Tomorrow', done: false },
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white flex items-center gap-3"><Calendar /> Agenda</h1>
      <p className="text-gray-400 text-sm -mt-4">Auto-blocked by ADHD OS based on your free time.</p>

      <GlassCard>
        <h2 className="text-white font-semibold mb-4">📅 Today</h2>
        {tasks.filter(t => t.date === 'Today').map(t => (
          <div key={t.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors border-b border-white/5">
            <button className="text-gray-400 hover:text-green-400"><Circle size={20} /></button>
            <div className="flex-1">
              <span className="text-white">{t.title}</span>
              <div className="flex items-center gap-2 text-xs text-gray-400"><Clock size={12} /> {t.time}</div>
            </div>
            <span className="text-xs text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full">Auto-blocked</span>
          </div>
        ))}
      </GlassCard>

      <GlassCard>
        <h2 className="text-white font-semibold mb-4">📅 Upcoming</h2>
        {tasks.filter(t => t.date !== 'Today').map(t => (
          <div key={t.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors border-b border-white/5">
            <button className="text-gray-400 hover:text-green-400"><Circle size={20} /></button>
            <div className="flex-1">
              <span className="text-white">{t.title}</span>
              <div className="flex items-center gap-2 text-xs text-gray-400"><Clock size={12} /> {t.time}</div>
            </div>
            <span className="text-xs text-blue-300 bg-blue-500/20 px-3 py-1 rounded-full">{t.date}</span>
          </div>
        ))}
      </GlassCard>
    </div>
  );
}