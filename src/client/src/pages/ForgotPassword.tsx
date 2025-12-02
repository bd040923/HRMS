/**
 * Arithwise HRM Forgot Password Page
 * Copyright (C) 2024 Arithwise Inc.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      // In production, this would call your backend API
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost/orangehrm/web';
      
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage('Password reset link has been sent to your email address.');
        setEmail('');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to send reset link. Please try again.');
      }
    } catch (err) {
      // Mock success for development
      setMessage('Password reset link has been sent to your email address. (Demo mode)');
      setEmail('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#faf3ff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#fffafe',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            color: '#78176b',
            fontSize: '2rem',
            fontFamily: "'Segoe UI', Arial, sans-serif",
            fontWeight: 500,
            margin: 0,
            marginBottom: '8px'
          }}>
            Forgot Password?
          </h1>
          <p style={{
            color: '#666',
            fontSize: '14px',
            fontFamily: "'Segoe UI', Arial, sans-serif"
          }}>
            Enter your email address and we'll send you a link to reset your password.
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

        {message && (
          <div style={{
            backgroundColor: '#efe',
            color: '#28a745',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '14px',
            fontFamily: "'Segoe UI', Arial, sans-serif"
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#333',
              fontSize: '16px',
              fontFamily: "'Segoe UI', Arial, sans-serif",
              fontWeight: 500
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              placeholder="Enter your email address"
            />
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
              transition: 'background-color 0.3s',
              marginBottom: '20px'
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
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <Link
            to="/login"
            style={{
              color: '#78176b',
              textDecoration: 'none',
              fontSize: '14px',
              fontFamily: "'Segoe UI', Arial, sans-serif"
            }}
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

