import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, setAccessToken } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while checking session

  // On mount — try to restore session using httpOnly refresh cookie
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await authAPI.refresh();
        setAccessToken(res.data.accessToken);
        const meRes = await authAPI.getMe();
        setUser(meRes.data.user);
      } catch {
        // No valid session — user is logged out
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await authAPI.login(credentials);
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    toast.success(`Welcome back, ${res.data.user.name}!`);
    return res.data.user;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authAPI.register(data);
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    toast.success('Account created successfully!');
    return res.data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch {}
    setAccessToken(null);
    setUser(null);
    toast.success('Logged out');
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isFaculty: user?.role === 'faculty' || user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
