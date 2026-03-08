import { useState, useEffect, useContext, createContext } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getUserRole, setUserDoc } from '../firebase/firestore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRole = await getUserRole(firebaseUser.uid);
        setUser(firebaseUser);
        setRole(userRole);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const userRole = await getUserRole(cred.user.uid);
    setRole(userRole);
    return cred;
  };

  const register = async (email, password, displayName, userRole) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setUserDoc(cred.user.uid, {
      uid: cred.user.uid,
      email,
      displayName,
      role: userRole
    });
    setRole(userRole);
    return cred;
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, role, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
