/**
 * Arithwise HRM Login Page
 * Copyright (C) 2024 Arithwise Inc.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(username, password);
      if (result.success) {
        const from = (location.state as any)?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else {
        setError(result.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9f9f9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img 
            src="/OIP.webp" 
            alt="Arithwise Logo" 
            style={{
              height: '60px',
              width: 'auto',
              objectFit: 'contain',
              marginBottom: '16px'
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <h1 style={{
            color: '#78176b',
            fontSize: '2rem',
            fontFamily: "'Segoe UI', Arial, sans-serif",
            fontWeight: 500,
            margin: 0
          }}>
            Welcome Back
          </h1>
          <p style={{
            color: '#666',
            fontSize: '14px',
            fontFamily: "'Segoe UI', Arial, sans-serif",
            marginTop: '8px'
          }}>
            Sign in to continue to Arithwise HRM
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee',
            color: '#dc3545',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '14px',
            fontFamily: "'Segoe UI', Arial, sans-serif"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#333',
              fontSize: '16px',
              fontFamily: "'Segoe UI', Arial, sans-serif",
              fontWeight: 500
            }}>
              Username or Email
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '16px',
                fontFamily: "'Segoe UI', Arial, sans-serif",
                boxSizing: 'border-box'
              }}
              placeholder="Enter your username or email"
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#333',
              fontSize: '16px',
              fontFamily: "'Segoe UI', Arial, sans-serif",
              fontWeight: 500
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '16px',
                fontFamily: "'Segoe UI', Arial, sans-serif",
                boxSizing: 'border-box'
              }}
              placeholder="Enter your password"
            />
          </div>

          <div style={{ marginBottom: '24px', textAlign: 'right' }}>
            <a
              href="/forgot-password"
              style={{
                color: '#78176b',
                textDecoration: 'none',
                fontSize: '14px',
                fontFamily: "'Segoe UI', Arial, sans-serif"
              }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
            >
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: isLoading ? '#999' : '#78176b',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontFamily: "'Segoe UI', Arial, sans-serif",
              fontWeight: 500,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.3s'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#590a4f';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#78176b';
              }
            }}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: '#f9f9f9',
          borderRadius: '6px',
          fontSize: '14px',
          fontFamily: "'Segoe UI', Arial, sans-serif",
          color: '#666'
        }}>
          <strong>Demo Credentials:</strong><br />
          Admin: admin / Admin@123<br />
          User: user / User@123
        </div>
      </div>
    </div>
  );
};

export default Login;

