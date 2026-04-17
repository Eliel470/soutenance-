import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isGerant: boolean;
  isClient: boolean;
  needsProfile: boolean;
  createProfile: (role: UserRole) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasHotels: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isGerant: false,
  isClient: true,
  needsProfile: false,
  createProfile: async () => {},
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
  hasHotels: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [hasHotels, setHasHotels] = useState(false);

  const checkManagerHotels = async (uid: string) => {
    const q = query(collection(db, 'hotels'), where('managerId', '==', uid));
    const snap = await getDocs(q);
    setHasHotels(!snap.empty);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setNeedsProfile(false);
      
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        const unsubProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
            setNeedsProfile(false);
            if (docSnap.data().role === 'gerant') {
              checkManagerHotels(firebaseUser.uid);
            }
          } else {
            // User exists in Auth but not in Firestore
            setProfile(null);
            setNeedsProfile(true);
          }
          setLoading(false);
        }, (error) => {
          // If permission error, it might be because the document doesn't exist 
          // and rules are strict about reading non-existent docs (unlikely for oneself)
          // Or because the user is actually unauthorized.
          console.error("Profile snapshot error:", error);
          setLoading(false);
        });

        return () => unsubProfile();
      } else {
        setProfile(null);
        setLoading(false);
        setNeedsProfile(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string, displayName: string, role: UserRole) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    await sendEmailVerification(userCredential.user);
    
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    const newProfile: UserProfile = {
      uid: userCredential.user.uid,
      email,
      displayName,
      role,
      createdAt: new Date().toISOString(),
    };
    await setDoc(userDocRef, newProfile);
    setProfile(newProfile);
    setNeedsProfile(false);
  };

  const logoutAction = async () => {
    await signOut(auth);
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setUser({...auth.currentUser});
    }
  };

  const createProfile = async (role: UserRole) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    const newProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'Utilisateur',
      role,
      createdAt: new Date().toISOString(),
      photoURL: user.photoURL || undefined,
    };
    await setDoc(userDocRef, newProfile);
    setProfile(newProfile);
    setNeedsProfile(false);
  };

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    isGerant: profile?.role === 'gerant' || profile?.role === 'admin',
    isClient: profile?.role === 'client' || !profile,
    needsProfile,
    createProfile,
    login,
    register,
    logout: logoutAction,
    refreshUser,
    hasHotels
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
