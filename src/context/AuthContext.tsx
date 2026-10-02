import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api, getAuthToken, setAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name?: string; phone?: string; avatar?: string }) => Promise<void>;
  addAddress: (address: any) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      if (getAuthToken()) {
        const res = await api.getMe();
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch {
      setAuthToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await api.login(credentials);
    setUser(res.user);
    setToken(res.token);
  };

  const register = async (data: { name: string; email: string; password: string; phone?: string }) => {
    const res = await api.register(data);
    setUser(res.user);
    setToken(res.token);
  };

  const logout = () => {
    api.logout();
    setUser(null);
    setToken(null);
  };

  const updateProfile = async (data: { name?: string; phone?: string; avatar?: string }) => {
    const res = await api.updateProfile(data);
    setUser(res.user);
  };

  const addAddress = async (address: any) => {
    const res = await api.addAddress(address);
    if (user) {
      setUser({ ...user, addresses: res.addresses });
    }
  };

  const deleteAddress = async (id: string) => {
    const res = await api.deleteAddress(id);
    if (user) {
      setUser({ ...user, addresses: res.addresses });
    }
  };

  const isStaffRole = user ? [
    'super_admin',
    'store_manager',
    'order_manager',
    'inventory_manager',
    'marketing_manager',
    'support_staff'
  ].includes(user.role) : false;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: isStaffRole,
        login,
        register,
        logout,
        updateProfile,
        addAddress,
        deleteAddress,
        refreshUser
      }}
    >
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
