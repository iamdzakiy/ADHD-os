import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const AuthContext = createContext();
// GANTI DENGAN EMAIL KAMU. HANYA EMAIL INI YANG BISA AKSES APLIKASI.
const ALLOWED_EMAIL = "fadzaro10@gmail.com"; 

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (firebaseUser.email === ALLOWED_EMAIL) {
          setUser(firebaseUser);
          setIsAuthorized(true);
        } else {
          // Paksa logout jika email tidak terdaftar
          await signOut(auth);
          alert("Akses ditolak. Aplikasi ini dikunci untuk pemilik tertentu.");
          setIsAuthorized(false);
        }
      } else {
        setUser(null);
        setIsAuthorized(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthorized, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);