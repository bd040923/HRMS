/**
 * Arithwise HRM is a comprehensive Human Resource Management (HRM) System that captures
 * all the essential functionalities required for any enterprise.
 * Copyright (C) 2024 Arithwise Inc.
 *
 * Arithwise HRM is free software: you can redistribute it and/or modify it under the terms of
 * the GNU General Public License as published by the Free Software Foundation, either
 * version 3 of the License, or (at your option) any later version.
 *
 * Arithwise HRM is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with Arithwise HRM.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';

// Brand Colors
const COLORS = {
  primary: '#78176b',
  primaryHover: '#590a4f',
  lightBg: '#faf3ff',
  lightBgAlt: '#fffafe',
  white: '#ffffff',
  text: '#333333',
  textLight: '#666666',
  border: '#e0e0e0',
};

// Typography Constants
const TYPOGRAPHY = {
  fontFamily: "'Segoe UI', Arial, sans-serif",
  heading: {
    fontSize: '2rem',      // 32px
    fontWeight: 500,
  },
  subheading: {
    fontSize: '20px',
    fontWeight: 400,
  },
  textImportant: {
    fontSize: '16px',
    fontWeight: 400,
  },
  textNote: {
    fontSize: '14px',
    fontWeight: 400,
  },
};

// Environment variables are available via process.env
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost/arithwise/web';
const APP_NAME = process.env.REACT_APP_NAME || 'Arithwise HRM';

// Home Page Component
const HomePage: React.FC = () => {
  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '60px 20px 40px',
      backgroundColor: COLORS.lightBg,
      minHeight: 'calc(100vh - 80px)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: COLORS.lightBgAlt,
        padding: '32px 28px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <h1 style={{ 
          color: COLORS.primary, 
          fontSize: TYPOGRAPHY.heading.fontSize,
          fontFamily: TYPOGRAPHY.fontFamily,
          marginBottom: '24px',
          marginTop: 0,
          fontWeight: TYPOGRAPHY.heading.fontWeight
        }}>
          Welcome to {APP_NAME}
        </h1>
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Link 
            to="/dashboard" 
            style={{
              display: 'inline-block',
              padding: '10px 24px',
              backgroundColor: COLORS.primary,
              color: COLORS.white,
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: 500,
              fontSize: TYPOGRAPHY.textImportant.fontSize,
              fontFamily: TYPOGRAPHY.fontFamily,
              transition: 'background-color 0.3s',
              boxShadow: '0 2px 4px rgba(120, 23, 107, 0.2)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.primaryHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.primary}
          >
            Go to Dashboard
          </Link>
          <Link 
            to="/about" 
            style={{
              display: 'inline-block',
              padding: '10px 24px',
              backgroundColor: COLORS.white,
              color: COLORS.primary,
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: 500,
              fontSize: TYPOGRAPHY.textImportant.fontSize,
              fontFamily: TYPOGRAPHY.fontFamily,
              border: `2px solid ${COLORS.primary}`,
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.primary;
              e.currentTarget.style.color = COLORS.white;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.white;
              e.currentTarget.style.color = COLORS.primary;
            }}
          >
            About
          </Link>
        </div>
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const dashboardItems = [
    { name: 'Employees', icon: '👥' },
    { name: 'Departments', icon: '🏢' },
    { name: 'Projects', icon: '📊' },
    { name: 'Calendar', icon: '📅' },
    { name: 'Attendances', icon: '⏰' },
    { name: 'Time Off', icon: '🏖️' },
    { name: 'Payroll', icon: '💰' },
    { name: 'Expenses', icon: '💳' },
    { name: 'Recruitment', icon: '📝' },
    { name: 'Performance', icon: '📈' },
    { name: 'Training', icon: '🎓' },
    { name: 'Reports', icon: '📋' },
  ];

  return (
    <div style={{ 
      padding: '24px 20px', 
      maxWidth: '1400px', 
      margin: '0 auto',
      backgroundColor: COLORS.lightBg,
      minHeight: 'calc(100vh - 80px)'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '8px 16px',
            backgroundColor: COLORS.textLight,
            color: COLORS.white,
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: TYPOGRAPHY.textNote.fontSize,
            fontFamily: TYPOGRAPHY.fontFamily,
            fontWeight: 500,
            transition: 'background-color 0.3s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.textLight}
        >
          ← Back to Home
        </button>
      </div>
      
      <h1 style={{ 
        color: COLORS.primary, 
        marginBottom: '24px',
        marginTop: 0,
        fontSize: TYPOGRAPHY.heading.fontSize,
        fontFamily: TYPOGRAPHY.fontFamily,
        fontWeight: TYPOGRAPHY.heading.fontWeight
      }}>
        Dashboard
      </h1>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '32px 24px',
        maxWidth: '100%'
      }}>
        {dashboardItems.map((item, index) => (
          <div
            key={index}
            style={{
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.opacity = '1';
            }}
          >
            <div style={{
              fontSize: '56px',
              marginBottom: '12px',
              lineHeight: 1,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
            }}>
              {item.icon}
            </div>
            <div style={{
              color: COLORS.text,
              fontSize: TYPOGRAPHY.textImportant.fontSize,
              fontFamily: TYPOGRAPHY.fontFamily,
              fontWeight: 500
            }}>
              {item.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// About Component
const About: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      padding: '24px 20px', 
      maxWidth: '900px', 
      margin: '0 auto',
      backgroundColor: COLORS.lightBg,
      minHeight: 'calc(100vh - 80px)'
    }}>
      <button
        onClick={() => navigate('/')}
        style={{
          padding: '8px 16px',
          backgroundColor: COLORS.textLight,
          color: COLORS.white,
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          marginBottom: '16px',
          fontSize: TYPOGRAPHY.textNote.fontSize,
          fontFamily: TYPOGRAPHY.fontFamily,
          fontWeight: 500,
          transition: 'background-color 0.3s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.textLight}
      >
        ← Back to Home
      </button>
      
      <h1 style={{ 
        color: COLORS.primary, 
        marginBottom: '20px',
        marginTop: 0,
        fontSize: TYPOGRAPHY.heading.fontSize,
        fontFamily: TYPOGRAPHY.fontFamily,
        fontWeight: TYPOGRAPHY.heading.fontWeight
      }}>
        About Arithwise HRM
      </h1>
      
      <div style={{
        padding: '24px',
        backgroundColor: COLORS.lightBgAlt,
        borderRadius: '8px',
        border: `1px solid ${COLORS.border}`,
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ 
            color: COLORS.text, 
            marginBottom: '8px',
            fontSize: TYPOGRAPHY.textImportant.fontSize,
            fontFamily: TYPOGRAPHY.fontFamily
          }}>
            <strong style={{ color: COLORS.primary }}>Version:</strong> {process.env.REACT_APP_VERSION || '5.0.0'}
          </p>
          <p style={{ 
            color: COLORS.text, 
            marginBottom: '8px',
            fontSize: TYPOGRAPHY.textImportant.fontSize,
            fontFamily: TYPOGRAPHY.fontFamily
          }}>
            <strong style={{ color: COLORS.primary }}>Environment:</strong> {process.env.REACT_APP_ENV || 'development'}
          </p>
          <p style={{ 
            color: COLORS.text,
            marginBottom: 0,
            fontSize: TYPOGRAPHY.textImportant.fontSize,
            fontFamily: TYPOGRAPHY.fontFamily
          }}>
            <strong style={{ color: COLORS.primary }}>API Base URL:</strong> {API_BASE_URL}
          </p>
        </div>
        
        <h3 style={{ 
          marginTop: '20px', 
          marginBottom: '12px',
          color: COLORS.primary,
          fontSize: TYPOGRAPHY.subheading.fontSize,
          fontFamily: TYPOGRAPHY.fontFamily,
          fontWeight: 500
        }}>
          Features
        </h3>
        <ul style={{ 
          color: COLORS.text,
          lineHeight: '1.6',
          paddingLeft: '20px',
          margin: 0,
          fontSize: TYPOGRAPHY.textImportant.fontSize,
          fontFamily: TYPOGRAPHY.fontFamily
        }}>
          <li>✅ React 18.2.0</li>
          <li>✅ TypeScript Support</li>
          <li>✅ React Router for Navigation</li>
          <li>✅ Webpack Dev Server</li>
          <li>✅ Hot Module Replacement</li>
        </ul>
      </div>
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  useEffect(() => {
    console.log('🎉 App component mounted!');
    console.log('API Base URL:', API_BASE_URL);
    console.log('App Name:', APP_NAME);
  }, []);

  return (
    <div className="app" style={{ 
      minHeight: '100vh',
      backgroundColor: COLORS.lightBg
    }}>
      {/* Navigation Bar */}
      <nav style={{
        backgroundColor: COLORS.white,
        padding: '12px 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '0',
        borderBottom: `2px solid ${COLORS.primary}`
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <Link 
            to="/" 
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              gap: '12px'
            }}
          >
            <img 
              src="/OIP.webp" 
              alt="Arithwise Logo" 
              style={{
                height: '56px',
                width: 'auto',
                objectFit: 'contain',
                maxWidth: '200px'
              }}
              onError={(e) => {
                // Fallback if logo doesn't load - show text instead
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `<span style="color: ${COLORS.primary}; font-size: ${TYPOGRAPHY.heading.fontSize}; font-family: ${TYPOGRAPHY.fontFamily}; font-weight: ${TYPOGRAPHY.heading.fontWeight}; letter-spacing: 0.5px;">${APP_NAME}</span>`;
                }
              }}
            />
          </Link>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link 
              to="/" 
              style={{
                color: COLORS.text,
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: TYPOGRAPHY.textImportant.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                fontWeight: 500,
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.lightBg;
                e.currentTarget.style.color = COLORS.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = COLORS.text;
              }}
            >
              Home
            </Link>
            <Link 
              to="/dashboard" 
              style={{
                color: COLORS.text,
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: TYPOGRAPHY.textImportant.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                fontWeight: 500,
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.lightBg;
                e.currentTarget.style.color = COLORS.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = COLORS.text;
              }}
            >
              Dashboard
            </Link>
            <Link 
              to="/about" 
              style={{
                color: COLORS.text,
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: TYPOGRAPHY.textImportant.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                fontWeight: 500,
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.lightBg;
                e.currentTarget.style.color = COLORS.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = COLORS.text;
              }}
            >
              About
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  );
};

export default App;
