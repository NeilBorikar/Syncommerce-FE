import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Business, AuthState } from '../types';
import API from '../services/api';

interface AuthContextType extends AuthState {
  loginBusiness: (token: string, business: Business, users: User[]) => Promise<void>;
  loginUser: (token: string, user: User) => Promise<void>;
  logoutUser: () => Promise<void>;
  logoutBusiness: () => Promise<void>;
  logout: () => Promise<void>;              // alias for full logout
  switchWorkspace: (level: 'user' | 'business') => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    businessToken: null,
    business: null,
    userToken: null,
    user: null,
    usersInBusiness: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [busToken, busJson, usrToken, usrJson, usersJson] = await Promise.all([
          AsyncStorage.getItem('businessToken'),
          AsyncStorage.getItem('business'),
          AsyncStorage.getItem('userToken'),
          AsyncStorage.getItem('user'),
          AsyncStorage.getItem('usersInBusiness'),
        ]);

        const business = busJson ? JSON.parse(busJson) : null;
        const user = usrJson ? JSON.parse(usrJson) : null;
        const usersInBusiness = usersJson ? JSON.parse(usersJson) : [];

        setState({
          businessToken: busToken,
          business,
          userToken: usrToken,
          user,
          usersInBusiness,
        });
      } catch (error) {
        console.error('Failed to bootstrap auth', error);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const loginBusiness = async (token: string, business: Business, users: User[]) => {
    await AsyncStorage.setItem('businessToken', token);
    await AsyncStorage.setItem('business', JSON.stringify(business));
    await AsyncStorage.setItem('usersInBusiness', JSON.stringify(users));
    setState(prev => ({ ...prev, businessToken: token, business, usersInBusiness: users }));
  };

  const loginUser = async (token: string, user: User) => {
    await AsyncStorage.setItem('userToken', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    setState(prev => ({ ...prev, userToken: token, user }));
  };

  const logoutUser = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('user');
    setState(prev => ({ ...prev, userToken: null, user: null }));
  };

  const logoutBusiness = async () => {
    await AsyncStorage.multiRemove(['businessToken', 'business', 'userToken', 'user', 'usersInBusiness']);
    setState({
      businessToken: null,
      business: null,
      userToken: null,
      user: null,
      usersInBusiness: [],
    });
  };

  // convenience alias
  const logout = logoutBusiness;

  const switchWorkspace = async (level: 'user' | 'business') => {
    if (level === 'user') {
      await logoutUser();
    } else {
      await logoutBusiness();
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, loginBusiness, loginUser, logoutUser, logoutBusiness, logout, switchWorkspace, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
