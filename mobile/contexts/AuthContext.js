import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load auth state from storage on app start
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
          // Get user info from API
          await getCurrentUser(storedToken);
        }
      } catch (err) {
        console.error('Failed to load auth state:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAuthState();
  }, []);

  // Get current user from API
  const getCurrentUser = async (authToken) => {
    try {
      const response = await api.get('/api/auth/me', authToken);
      if (response.success) {
        setUser(response.user);
      } else {
        // If API call fails, clear auth state
        await logout();
      }
    } catch (err) {
      console.error('Failed to get current user:', err);
      await logout();
    }
  };

  // Register new user
  const register = async (userData) => {
    setError(null);
    try {
      const response = await api.post('/api/auth/register', userData);
      if (response.success) {
        setToken(response.token);
        setUser(response.user);
        await AsyncStorage.setItem('token', response.token);
        return { success: true };
      } else {
        setError(response.message || 'Registration failed');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMessage = err.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Login user
  const login = async (credentials) => {
    setError(null);
    try {
      const response = await api.post('/api/auth/login', credentials);
      if (response.success) {
        setToken(response.token);
        setUser(response.user);
        await AsyncStorage.setItem('token', response.token);
        return { success: true };
      } else {
        setError(response.message || 'Login failed');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Logout user
  const logout = async () => {
    setUser(null);
    setToken(null);
    setError(null);
    await AsyncStorage.removeItem('token');
  };

  // Refresh user data
  const refreshUser = async () => {
    if (token) {
      await getCurrentUser(token);
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    register,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isVendor: user?.role === 'vendor',
    isCustomer: user?.role === 'customer',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
