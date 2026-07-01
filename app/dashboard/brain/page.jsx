'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import GlassCard from '@/components/GlassCard';
import { Brain, Search, Plus, X } from 'lucide-react';

export default function BrainPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) { setLoading(false); return; } // FIX: Stop loading jika user null
    
    const fetchNotes = async () => {
      try {
        const res = await fetch(`/api/brain?userId=${user.uid}`);
        const data = await res.json();
        setNotes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [user]);

  const handleSaveNote = async () => {
    if (!newContent.trim() || !user) return;
    await fetch('/api/brain', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newContent.slice(0, 40) + (newContent.length > 40 ? '...' : ''),
        content: newContent, userId: user.uid, tags: ['#brain'],
      })
    });
    setNewContent(''); setShowNew(false);
    const res = await fetch(`/api/brain?userId=${user.uid}`);
    const data = await res.json();
    setNotes(Array.isArray(data) ? data : []);
  };

  const filteredNotes = notes.filter(n => n.title?.toLowerCase().includes(search.toLowerCase()) || n.content?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="text-gray-400 p-6">Loading your brain...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3"><Brain /> 2nd Brain</h1>
        <button onClick={() => setShowNew(true)} className="glass-card px-5 py-2 flex items-center gap-2 text-sm text-white hover:border-purple-500/50"><Plus size={16} /> New Note</button>
      </div>
      {showNew && (
        <GlassCard className="border-purple-500/20">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-white font-semibold">✍️ New Thought</h2>
            <button onClick={() => setShowNew(false)} className="text-gray-400 hover:text-white"><X size={18} /></button>
          </div>
          <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="Write anything..." className="glass-input min-h-[120px]" />
          <div className="flex justify-end mt-3"><button onClick={handleSaveNote} className="glass-card px-6 py-2 text-white hover:border-green-500/50">Save to Brain</button></div>
        </GlassCard>
      )}
      <GlassCard>
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search your brain..." className="glass-input pl-10" />
        </div>
        <div className="space-y-2">
          {filteredNotes.length === 0 && <p className="text-gray-500 text-center py-8">No notes found.</p>}
          {filteredNotes.map(n => (
            <div key={n.id} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/20 transition-colors">
              <div className="flex justify-between items-start">
                <h3 className="text-white font-medium">{n.title || 'Untitled'}</h3>
                <span className="text-xs text-gray-500">{n.date}</span>
              </div>
              <p className="text-sm text-gray-300 mt-1 line-clamp-2">{n.content}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}