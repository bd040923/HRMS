/**
 * Arithwise HRM Authentication Context
 * Copyright (C) 2024 Arithwise Inc.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user' | 'manager';
  status: 'active' | 'inactive' | 'suspended';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  isAdmin: () => boolean;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const sessionToken = localStorage.getItem('sessionToken');
        
        if (storedUser && sessionToken) {
          // In production, verify token with backend
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('sessionToken');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      
      // In production, this would call your backend API
      // For now, using mock authentication
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost/orangehrm/web';
      
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const userData: User = {
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
          firstName: data.user.first_name || data.user.firstName,
          lastName: data.user.last_name || data.user.lastName,
          role: data.user.role,
          status: data.user.status,
        };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('sessionToken', data.token || data.sessionToken);
        
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, message: error.message || 'Invalid credentials' };
      }
    } catch (error) {
      // Fallback to mock auth for development
      console.warn('API call failed, using mock auth:', error);
      
      // Mock authentication for development
      if (username === 'admin' && password === 'Admin@123') {
        const mockUser: User = {
          id: 1,
          username: 'admin',
          email: 'admin@arithwise.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          status: 'active',
        };
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('sessionToken', 'mock-token-' + Date.now());
        return { success: true };
      } else if (username === 'user' && password === 'User@123') {
        const mockUser: User = {
          id: 2,
          username: 'user',
          email: 'user@arithwise.com',
          firstName: 'Regular',
          lastName: 'User',
          role: 'user',
          status: 'active',
        };
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('sessionToken', 'mock-token-' + Date.now());
        return { success: true };
      }
      
      return { success: false, message: 'Invalid username or password' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('sessionToken');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    
    // Define permissions for each role
    const userPermissions: string[] = [
      'view_employees',
      'view_departments',
      'view_reports',
    ];
    
    const managerPermissions: string[] = [
      ...userPermissions,
      'edit_employees',
      'view_payroll',
    ];
    
    if (user.role === 'manager') {
      return managerPermissions.includes(permission);
    }
    
    return userPermissions.includes(permission);
  };

  const isAdmin = (): boolean => {
    return user?.role === 'admin';
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasPermission,
        isAdmin,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

