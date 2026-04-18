import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isGerant: boolean;
  isClient: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (nom: string, prenom: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  hasHotels: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isGerant: false,
  isClient: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  hasHotels: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasHotels, setHasHotels] = useState(false);

  const checkManagerHotels = async (userId: string) => {
    try {
      const hotels = await api.get(`/manager/${userId}/hotels`);
      setHasHotels(hotels.length > 0);
    } catch (err) {
      console.error("Error checking hotels:", err);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await api.get('/auth/profile');
          setUser(userData);
          if (userData.role === 'gerant') {
            checkManagerHotels(userData.id);
          }
        } catch (err) {
          console.error("Auth init failed", err);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const { user: userData, token } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', token);
    setUser(userData);
    if (userData.role === 'gerant') {
      await checkManagerHotels(userData.id);
    }
  };

  const register = async (nom: string, prenom: string, email: string, password: string, role: UserRole) => {
    const { id } = await api.post('/auth/register', { nom, prenom, email, password, role });
    // After registration, usually we login or just auto-login
    await login(email, password);
  };

  const logout = async () => {
    localStorage.removeItem('token');
    setUser(null);
    setHasHotels(false);
  };

  const value = {
    user,
    profile: user,
    loading,
    isAdmin: user?.role === 'admin',
    isGerant: user?.role === 'gerant',
    isClient: user?.role === 'client' || !user,
    login,
    register,
    logout,
    hasHotels
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
