'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
// PERBAIKAN: Import dari firebaseClient, BUKAN firebase.js
import { auth } from '@/lib/firebaseClient'; 

const AuthContext = createContext();
const ALLOWED_EMAIL = process.env.NEXT_PUBLIC_ALLOWED_EMAIL || 'fadzaro10@gmail.com';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (firebaseUser.email === ALLOWED_EMAIL) {
          setUser(firebaseUser);
        } else {
          await signOut(auth);
          alert('Akses Ditolak: Aplikasi ini dikunci untuk pemilik tertentu.');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);