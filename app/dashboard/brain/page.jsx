'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import GlassCard from '@/components/GlassCard';
import { Brain, Search, Send, Loader2, Link2 } from 'lucide-react';
import { pushDailyLog } from '@/lib/api/capacities';

export default function BrainPage() {
  const { user } = useAuth();
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState([
    { id: 1, title: 'Project Alpha Ideas', date: '2026-06-29', tags: ['#work', '#creativity'] },
    { id: 2, title: 'BCA Meeting Notes', date: '2026-06-28', tags: ['#finance', '#bank'] },
  ]);
  const [isSyncing, setIsSyncing] = useState(false);

  const handlePushToCapacities = async () => {
    if (!note.trim()) return;
    setIsSyncing(true);
    try {
      await pushDailyLog({
        content: note,
        userId: user.uid,
        date: new Date().toISOString().split('T')[0],
      });
      setNotes([{ id: Date.now(), title: note.slice(0, 30) + '...', date: 'Today', tags: ['#brain'] }, ...notes]);
      setNote('');
      alert('✅ Synced to Capacities!');
    } catch (e) {
      alert('Failed to sync: ' + e.message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3"><Brain /> 2nd Brain</h1>
        <span className="text-xs text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/5">🔗 Linked to Capacities</span>
      </div>

      {/* Quick Note Input */}
      <GlassCard>
        <h2 className="text-white font-semibold mb-3">🧠 Instant Capture</h2>
        <div className="flex gap-3">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Write your thoughts, meeting notes, or ideas..."
            className="glass-input min-h-[100px] flex-1"
          />
        </div>
        <div className="flex justify-end mt-3 gap-3">
          <button 
            onClick={handlePushToCapacities}
            disabled={isSyncing || !note.trim()}
            className="glass-card px-6 py-2 flex items-center gap-2 text-sm text-white hover:border-purple-500/50 disabled:opacity-50"
          >
            {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {isSyncing ? 'Syncing...' : 'Push to Capacities'}
          </button>
        </div>
      </GlassCard>

      {/* Search & Notes List */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input type="text" placeholder="Search your brain..." className="glass-input pl-10" />
          </div>
        </div>
        <div className="space-y-2">
          {notes.map(n => (
            <div key={n.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/20 transition-colors">
              <div>
                <p className="text-white text-sm">{n.title}</p>
                <div className="flex gap-2 mt-1">
                  {n.tags.map(t => <span key={t} className="text-[10px] text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full">{t}</span>)}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">{n.date}</span>
                <button className="p-1.5 rounded-lg hover:bg-white/10">
                  <Link2 size={14} className="text-gray-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}