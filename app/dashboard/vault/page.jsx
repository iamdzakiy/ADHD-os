'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import GlassCard from '@/components/GlassCard';
import { Lock, Plus, Eye, EyeOff } from 'lucide-react';
import CryptoJS from 'crypto-js';

export default function VaultPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [masterKey, setMasterKey] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [visibleItems, setVisibleItems] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', username: '', password: '' });

  useEffect(() => { if (user && isUnlocked) fetchItems(); }, [user, isUnlocked]);

  const fetchItems = async () => {
    const res = await fetch(`/api/vault?userId=${user.uid}`);
    const result = await res.json();
    setItems(result.data || []); // FIX: API return { data: [] }
  };

  const handleAdd = async () => {
    if (!newItem.title || !masterKey) return;
    await fetch('/api/vault', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.uid, ...newItem, masterKey })
    });
    setNewItem({ title: '', username: '', password: '' });
    setShowAdd(false);
    fetchItems();
  };

  const toggleVisibility = (id, encryptedUser, encryptedPass) => {
    const dUser = CryptoJS.AES.decrypt(encryptedUser, masterKey).toString(CryptoJS.enc.Utf8);
    const dPass = CryptoJS.AES.decrypt(encryptedPass, masterKey).toString(CryptoJS.enc.Utf8);
    setVisibleItems(prev => ({ ...prev, [id]: { user: dUser, pass: dPass } }));
    setTimeout(() => { setVisibleItems(prev => { const s = { ...prev }; delete s[id]; return s; }); }, 10000);
  };

  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-white">
        <GlassCard className="text-center max-w-md w-full">
          <Lock size={48} className="mx-auto mb-4 text-purple-400" />
          <h1 className="text-2xl font-bold mb-2">Brankas Digital</h1>
          <p className="text-gray-400 text-sm mb-6">Masukkan Master Password untuk membuka enkripsi AES-256.</p>
          <input type="password" placeholder="Master Password" onChange={(e) => setMasterKey(e.target.value)} className="glass-input mb-4" />
          <button onClick={() => setIsUnlocked(true)} className="w-full bg-purple-600 px-6 py-3 rounded-xl font-semibold">Buka Brankas</button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3"><Lock /> Vault</h1>
        <button onClick={() => setShowAdd(!showAdd)} className="glass-card px-4 py-2 text-sm text-white flex items-center gap-2"><Plus size={16}/> Add Secret</button>
      </div>

      {showAdd && (
        <GlassCard className="border-purple-500/20">
          <h2 className="text-white font-semibold mb-3">Tambah Data Rahasia</h2>
          <div className="grid grid-cols-1 gap-3">
            <input placeholder="Title (e.g. BCA, Twitter)" value={newItem.title} onChange={e => setNewItem({...newItem, title: e.target.value})} className="glass-input" />
            <input placeholder="Username / Email" value={newItem.username} onChange={e => setNewItem({...newItem, username: e.target.value})} className="glass-input" />
            <input placeholder="Password / PIN" type="password" value={newItem.password} onChange={e => setNewItem({...newItem, password: e.target.value})} className="glass-input" />
          </div>
          <button onClick={handleAdd} className="mt-3 bg-purple-600 px-6 py-2 rounded-lg text-white">Simpan & Enkripsi</button>
        </GlassCard>
      )}

      <div className="grid gap-4">
        {items.length === 0 && <p className="text-gray-500 text-center py-8">Brankas kosong.</p>}
        {items.map(item => (
          <GlassCard key={item.id} className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-white">{item.title}</h3>
              {visibleItems[item.id] ? (
                <div className="text-sm text-green-400 mt-1">
                  <p>U: {visibleItems[item.id].user}</p><p>P: {visibleItems[item.id].pass}</p>
                  <p className="text-xs text-gray-500 mt-1">Auto-hide in 10s...</p>
                </div>
              ) : (<p className="text-sm text-gray-500 mt-1">••••••••••••</p>)}
            </div>
            <button onClick={() => toggleVisibility(item.id, item.username, item.password)} className="bg-white/10 p-2 rounded-lg hover:bg-white/20">
              {visibleItems[item.id] ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}