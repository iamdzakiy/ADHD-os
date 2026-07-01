// context/AuthContext.jsx
'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Baca allowed email dari env, fallback ke email default
          const ALLOWED_EMAIL = process.env.NEXT_PUBLIC_ALLOWED_EMAIL || 'fadzaro10@gmail.com';
          
          if (firebaseUser.email === ALLOWED_EMAIL) {
            setUser(firebaseUser);
          } else {
            // Jika email salah, logout dan beri tahu user
            await signOut(auth);
            console.warn('Access denied for:', firebaseUser.email);
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
      } finally {
        // KRUSIAL: Pastikan loading SELALU berhenti
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};