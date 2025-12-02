/**
 * Arithwise HRM Protected Route Component
 * Copyright (C) 2024 Arithwise Inc.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredRole?: 'admin' | 'user' | 'manager';
  requiredPermission?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  requiredPermission 
}) => {
  const { isAuthenticated, isLoading, user, hasPermission } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontFamily: "'Segoe UI', Arial, sans-serif",
        color: '#78176b'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole && user?.role !== 'admin') {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        fontFamily: "'Segoe UI', Arial, sans-serif"
      }}>
        <h1 style={{ color: '#dc3545', fontSize: '2rem', fontWeight: 500 }}>
          Access Denied
        </h1>
        <p style={{ fontSize: '16px', color: '#666', marginTop: '16px' }}>
          You don't have permission to access this page.
        </p>
      </div>
    );
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        fontFamily: "'Segoe UI', Arial, sans-serif"
      }}>
        <h1 style={{ color: '#dc3545', fontSize: '2rem', fontWeight: 500 }}>
          Access Denied
        </h1>
        <p style={{ fontSize: '16px', color: '#666', marginTop: '16px' }}>
          You don't have the required permission to access this page.
        </p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;

