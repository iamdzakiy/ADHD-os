'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import GlassCard from '@/components/GlassCard';
import { Lock, Unlock, Plus, Eye, EyeOff, KeyRound } from 'lucide-react';
import { encryptData, decryptData } from '@/lib/encryption';
import axios from 'axios';

export default function VaultPage() {
  const { user } = useAuth();
  const [masterPassword, setMasterPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [entries, setEntries] = useState([]);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newCategory, setNewCategory] = useState('Banking');
  const [revealedIds, setRevealedIds] = useState({});

  useEffect(() => {
    if (user && isUnlocked) {
      axios.get(`/api/vault?userId=${user.uid}`)
        .then(res => setEntries(res.data.entries || []));
    }
  }, [user, isUnlocked]);

  const handleUnlock = async () => {
    if (masterPassword.length < 6) {
      alert('Master password must be at least 6 characters.');
      return;
    }
    setIsUnlocked(true);
  };

  const handleAddEntry = async () => {
    if (!newTitle || !newValue) return;
    const encrypted = await encryptData(newValue, masterPassword);
    await axios.post('/api/vault', {
      userId: user.uid,
      title: newTitle,
      category: newCategory,
      encryptedData: encrypted,
    });
    setEntries([...entries, { id: Date.now().toString(), title: newTitle, category: newCategory, encryptedData: encrypted }]);
    setNewTitle('');
    setNewValue('');
    setShowNewEntry(false);
  };

  const handleReveal = async (id, encrypted) => {
    try {
      const decrypted = await decryptData(encrypted, masterPassword);
      setRevealedIds({ ...revealedIds, [id]: decrypted });
      setTimeout(() => {
        setRevealedIds(prev => ({ ...prev, [id]: undefined }));
      }, 10000);
    } catch (e) {
      alert('Wrong master password or corrupted data.');
    }
  };

  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <GlassCard className="w-full max-w-md text-center p-8">
          <Lock size={48} className="text-purple-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">🔐 Unlock Vault</h1>
          <p className="text-gray-400 text-sm mb-6">Your master password never leaves this browser.</p>
          <input
            type="password"
            value={masterPassword}
            onChange={(e) => setMasterPassword(e.target.value)}
            placeholder="Enter Master Password"
            className="glass-input mb-4"
            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
          />
          <button onClick={handleUnlock} className="glass-card w-full py-3 text-white hover:border-purple-500/50">
            Unlock Vault
          </button>
          <p className="text-xs text-gray-500 mt-4">Uses AES-256-GCM encryption locally.</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3"><KeyRound /> Vault</h1>
        <button onClick={() => setShowNewEntry(true)} className="glass-card px-5 py-2 flex items-center gap-2 text-sm text-white hover:border-purple-500/50">
          <Plus size={16} /> Add Entry
        </button>
      </div>

      {showNewEntry && (
        <GlassCard className="border-purple-500/20">
          <h2 className="text-white font-semibold mb-3">➕ New Entry</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input placeholder="Title (e.g. BCA PIN)" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="glass-input" />
            <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="glass-input">
              <option value="Banking">Banking</option>
              <option value="Email">Email</option>
              <option value="Social">Social</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <input placeholder="Secret Value" value={newValue} onChange={(e) => setNewValue(e.target.value)} className="glass-input mt-3" type="text" />
          <div className="flex gap-3 mt-3 justify-end">
            <button onClick={() => setShowNewEntry(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
            <button onClick={handleAddEntry} className="glass-card px-6 py-2 text-white hover:border-green-500/50">Save Encrypted</button>
          </div>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {entries.map(entry => (
          <GlassCard key={entry.id} className="flex flex-col">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-white font-medium">{entry.title}</h3>
                <span className="text-xs text-gray-400">{entry.category}</span>
              </div>
              <button onClick={() => handleReveal(entry.id, entry.encryptedData)} className="p-2 rounded-full hover:bg-white/10">
                {revealedIds[entry.id] ? <EyeOff size={16} className="text-green-400" /> : <Eye size={16} className="text-gray-400" />}
              </button>
            </div>
            <div className="mt-3 p-3 rounded-xl bg-black/20 font-mono text-sm text-gray-300 overflow-x-auto">
              {revealedIds[entry.id] || '•••••••••••••••••••••'}
            </div>
            {revealedIds[entry.id] && <span className="text-[10px] text-green-400 mt-1">Hidden after 10s</span>}
          </GlassCard>
        ))}
        {entries.length === 0 && <p className="text-gray-500 col-span-2 text-center py-10">No entries saved yet.</p>}
      </div>
    </div>
  );
}