// src/hooks/useAuth.js - SINGLE SOURCE OF TRUTH
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create context
const AuthContext = createContext({});

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userData = await AsyncStorage.getItem('@user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.log('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const mockUser = {
        id: `user_${Date.now()}`,
        email: email,
        name: email.split('@')[0],
        role: email.includes('admin') ? 'admin' : 'user',
        isPremium: email.includes('premium') || email.includes('admin')
      };

      await AsyncStorage.setItem('@user', JSON.stringify(mockUser));
      setUser(mockUser);
      return { success: true, user: mockUser };
    } catch (error) {
      console.log('Login error:', error);
      return { success: false, error: 'Failed to login' };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@user');
      setUser(null);
      return { success: true };
    } catch (error) {
      console.log('Logout error:', error);
      return { success: false, error: 'Failed to logout' };
    }
  };

  const checkAdminStatus = () => {
    return user?.role === 'admin' || user?.email?.includes('admin');
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    checkAdminStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default useAuth;
