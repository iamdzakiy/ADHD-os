'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import CryptoJS from 'crypto-js';

export default function VaultPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [masterKey, setMasterKey] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [visibleItems, setVisibleItems] = useState({});

  useEffect(() => { if (user && isUnlocked) fetchItems(); }, [user, isUnlocked]);

  const fetchItems = async () => {
    const res = await fetch(`/api/vault?userId=${user.uid}`);
    const data = await res.json();
    setItems(data.items);
  };

  const handleAdd = async (title, username, password) => {
    await fetch('/api/vault', {
      method: 'POST',
      body: JSON.stringify({ userId: user.uid, title, username, password, masterKey })
    });
    fetchItems();
  };

  const toggleVisibility = (id, encryptedUser, encryptedPass) => {
    // Decrypt
    const dUser = CryptoJS.AES.decrypt(encryptedUser, masterKey).toString(CryptoJS.enc.Utf8);
    const dPass = CryptoJS.AES.decrypt(encryptedPass, masterKey).toString(CryptoJS.enc.Utf8);
    
    setVisibleItems(prev => ({ ...prev, [id]: { user: dUser, pass: dPass } }));
    
    // AUTO-HIDE setelah 10 detik (Fitur keamanan ADHD OS)
    setTimeout(() => {
      setVisibleItems(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }, 10000);
  };

  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-white">
        <h1 className="text-3xl mb-4">🔒 Brankas Digital</h1>
        <input type="password" placeholder="Masukkan Master Password" 
          onChange={(e) => setMasterKey(e.target.value)} className="p-3 bg-gray-800 rounded text-white mb-4" />
        <button onClick={() => setIsUnlocked(true)} className="bg-purple-600 px-6 py-2 rounded">Buka</button>
      </div>
    );
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl mb-6">🔒 Vault (Terkunci dengan AES-256)</h1>
      <div className="grid gap-4">
        {items.map(item => (
          <div key={item.id} className="bg-white/10 p-4 rounded-xl flex justify-between items-center">
            <div>
              <h3 className="font-bold">{item.title}</h3>
              {visibleItems[item.id] ? (
                <div className="text-sm text-green-400">
                  <p>U: {visibleItems[item.id].user}</p>
                  <p>P: {visibleItems[item.id].pass}</p>
                  <p className="text-xs text-gray-400 mt-1">Menyembunyikan dalam beberapa detik...</p>
                </div>
              ) : (
                <p className="text-sm text-gray-400">••••••••••••</p>
              )}
            </div>
            <button onClick={() => toggleVisibility(item.id, item.username, item.password)} className="bg-blue-600 px-3 py-1 rounded">
              👁️ Lihat
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}