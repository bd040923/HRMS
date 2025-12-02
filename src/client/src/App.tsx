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

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { SidebarProvider, useSidebar } from './context/SidebarContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Employees from './pages/Employees';
import Departments from './pages/Departments';
import Projects from './pages/Projects';
import Calendar from './pages/Calendar';
import Attendance from './pages/Attendance';
import LeaveManagement from './pages/LeaveManagement';
import Payroll from './pages/Payroll';
import Expenses from './pages/Expenses';
import Recruitment from './pages/Recruitment';
import Performance from './pages/Performance';
import Training from './pages/Training';
import Reports from './pages/Reports';
import UserManagement from './pages/UserManagement';
import JobTitles from './pages/Admin/JobTitles';
import Organization from './pages/Admin/Organization';
import Qualifications from './pages/Admin/Qualifications';
import Nationalities from './pages/Admin/Nationalities';
import CorporateBranding from './pages/Admin/CorporateBranding';
import Configuration from './pages/Admin/Configuration';

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
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect to dashboard if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Don't show home page if authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

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

// Simple SVG Icon Components
const UsersIcon = ({ color, size = 48 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BuildingIcon = ({ color, size = 48 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 21H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 21V7L13 2V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19 21V11H5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 9V9.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 12V12.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 15V15.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 18V18.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChartIcon = ({ color, size = 48 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3V21H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 16L12 11L16 15L21 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 10H16V15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CalendarIcon = ({ color, size = 48 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth="2"/>
    <path d="M16 2V6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 2V6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M3 10H21" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const ClockIcon = ({ color, size = 48 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/>
    <path d="M12 6V12L16 14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const UmbrellaIcon = ({ color, size = 48 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2V12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 12C17 15.866 13.866 19 10 19C6.13401 19 3 15.866 3 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 12C12 9.79086 10.2091 8 8 8C5.79086 8 4 9.79086 4 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MoneyIcon = ({ color, size = 48 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 1V23" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CardIcon = ({ color, size = 48 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="4" width="22" height="16" rx="2" stroke={color} strokeWidth="2"/>
    <path d="M1 10H23" stroke={color} strokeWidth="2"/>
  </svg>
);

const UserTieIcon = ({ color, size = 48 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 22V20C5 18.9391 5.42143 17.9217 6.17157 17.1716C6.92172 16.4214 7.93913 16 9 16H15C16.0609 16 17.0783 16.4214 17.8284 17.1716C18.5786 17.9217 19 18.9391 19 20V22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 12V22" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M9 16L10 22" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M15 16L14 22" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const ChartLineIcon = ({ color, size = 48 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3V21H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 16L12 11L16 15L21 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const GraduationIcon = ({ color, size = 48 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 10V15M22 10L12 5L2 10L12 15L22 10Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 10V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ClipboardIcon = ({ color, size = 48 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 12H15" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M9 16H15" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Dashboard Component
const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const dashboardItems = [
    { name: 'Employees', icon: UsersIcon, color: '#78176b' },
    { name: 'Departments', icon: BuildingIcon, color: '#666666' },
    { name: 'Projects', icon: ChartIcon, color: '#28a745' },
    { name: 'Calendar', icon: CalendarIcon, color: '#007bff' },
    { name: 'Attendances', icon: ClockIcon, color: '#dc3545' },
    { name: 'Time Off', icon: UmbrellaIcon, color: '#ffc107' },
    { name: 'Payroll', icon: MoneyIcon, color: '#ff9800' },
    { name: 'Expenses', icon: CardIcon, color: '#2196f3' },
    { name: 'Recruitment', icon: UserTieIcon, color: '#9c27b0' },
    { name: 'Performance', icon: ChartLineIcon, color: '#00bcd4' },
    { name: 'Training', icon: GraduationIcon, color: '#78176b' },
    { name: 'Reports', icon: ClipboardIcon, color: '#ff5722' },
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
        {dashboardItems.map((item, index) => {
          const IconComponent = item.icon;
          const routeMap: { [key: string]: string } = {
            'Employees': '/employees',
            'Departments': '/departments',
            'Projects': '/projects',
            'Calendar': '/calendar',
            'Attendances': '/attendance',
            'Time Off': '/leave',
            'Payroll': '/payroll',
            'Expenses': '/expenses',
            'Recruitment': '/recruitment',
            'Performance': '/performance',
            'Training': '/training',
            'Reports': '/reports'
          };
          const route = routeMap[item.name] || '/dashboard';
          
          return (
            <div
              key={index}
              onClick={() => navigate(route)}
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
                const iconElement = e.currentTarget.querySelector('svg');
                if (iconElement) {
                  iconElement.style.stroke = COLORS.primary;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                const iconElement = e.currentTarget.querySelector('svg');
                if (iconElement) {
                  iconElement.style.stroke = item.color;
                }
              }}
            >
              <div style={{
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <IconComponent color={item.color} size={48} />
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
          );
        })}
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
        
        {isAdmin() && (
          <div style={{ marginTop: '20px' }}>
            <Link
              to="/admin/users"
              style={{
                display: 'inline-block',
                padding: '10px 20px',
                backgroundColor: COLORS.primary,
                color: COLORS.white,
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: TYPOGRAPHY.textImportant.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                fontWeight: 500,
                transition: 'background-color 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.primaryHover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.primary}
            >
              Manage Users (Admin)
            </Link>
          </div>
        )}
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

// Header Icons
const MessageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const HeaderClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke={COLORS.text} strokeWidth="2"/>
    <path d="M12 6V12L16 14" stroke={COLORS.text} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 9L12 15L18 9" stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 18L15 12L9 6" stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Profile Dropdown Component
const ProfileDropdown: React.FC<{ isOpen: boolean; onClose: () => void; onLogout: () => void }> = ({ isOpen, onClose, onLogout }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: '8px',
        backgroundColor: COLORS.white,
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        minWidth: '200px',
        zIndex: 1000,
        padding: '8px 0'
      }}
    >
      <div
        style={{
          padding: '10px 16px',
          fontSize: TYPOGRAPHY.textImportant.fontSize,
          fontFamily: TYPOGRAPHY.fontFamily,
          color: COLORS.text,
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.lightBg}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        onClick={onClose}
      >
        Help
      </div>
      <div
        style={{
          padding: '10px 16px',
          fontSize: TYPOGRAPHY.textImportant.fontSize,
          fontFamily: TYPOGRAPHY.fontFamily,
          color: COLORS.text,
          cursor: 'pointer',
          transition: 'background-color 0.2s',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.lightBg}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        onClick={onClose}
      >
        <span>Shortcuts</span>
        <span style={{ fontWeight: 600, color: COLORS.textLight }}>CTRL+K</span>
      </div>
      <div style={{
        height: '1px',
        backgroundColor: COLORS.border,
        margin: '4px 0'
      }} />
      <div
        style={{
          padding: '10px 16px',
          fontSize: TYPOGRAPHY.textImportant.fontSize,
          fontFamily: TYPOGRAPHY.fontFamily,
          color: COLORS.text,
          cursor: 'pointer',
          transition: 'background-color 0.2s',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.lightBg}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        onClick={onClose}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#28a745'
          }} />
          <span>Online</span>
        </div>
        <ChevronRightIcon />
      </div>
      <div
        style={{
          padding: '10px 16px',
          fontSize: TYPOGRAPHY.textImportant.fontSize,
          fontFamily: TYPOGRAPHY.fontFamily,
          color: COLORS.text,
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.lightBg}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        onClick={onClose}
      >
        My Preferences
      </div>
      <div
        style={{
          padding: '10px 16px',
          fontSize: TYPOGRAPHY.textImportant.fontSize,
          fontFamily: TYPOGRAPHY.fontFamily,
          color: COLORS.text,
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.lightBg}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        onClick={onClose}
      >
        My databases
      </div>
      <div
        style={{
          padding: '10px 16px',
          fontSize: TYPOGRAPHY.textImportant.fontSize,
          fontFamily: TYPOGRAPHY.fontFamily,
          color: COLORS.text,
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.lightBg}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        onClick={() => {
          onClose();
          onLogout();
        }}
      >
        Log out
      </div>
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🎉 App component mounted!');
    console.log('API Base URL:', API_BASE_URL);
    console.log('App Name:', APP_NAME);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setProfileDropdownOpen(false);
  };


  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  const { collapsed } = useSidebar();

  return (
    <div className="app" style={{ 
      minHeight: '100vh',
      backgroundColor: COLORS.lightBg,
      display: 'flex'
    }}>
      {/* Sidebar Navigation */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div style={{ 
        flex: 1, 
        marginLeft: collapsed ? '60px' : '240px', 
        transition: 'margin-left 0.3s ease',
        display: 'flex', 
        flexDirection: 'column' 
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
          maxWidth: '1400px',
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
                height: '40px',
                width: 'auto',
                objectFit: 'contain',
                maxWidth: '200px'
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `<span style="color: ${COLORS.primary}; font-size: ${TYPOGRAPHY.heading.fontSize}; font-family: ${TYPOGRAPHY.fontFamily}; font-weight: ${TYPOGRAPHY.heading.fontWeight}; letter-spacing: 0.5px;">${APP_NAME}</span>`;
                }
              }}
            />
          </Link>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '20px' 
          }}>
            {/* Messages Icon with Notification */}
            <div style={{
              position: 'relative',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.lightBg}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <MessageIcon />
              <div style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: '#dc3545',
                color: COLORS.white,
                fontSize: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontFamily: TYPOGRAPHY.fontFamily
              }}>
                2
              </div>
            </div>

            {/* Clock Icon */}
            <div style={{
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.lightBg}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <HeaderClockIcon />
            </div>

            {/* Company Name */}
            <div style={{
              fontSize: TYPOGRAPHY.textImportant.fontSize,
              fontFamily: TYPOGRAPHY.fontFamily,
              fontWeight: 500,
              color: COLORS.text
            }}>
              {APP_NAME}
            </div>

            {/* Profile Picture with Dropdown */}
            <div style={{
              position: 'relative',
              cursor: 'pointer'
            }}>
              <div
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.lightBg}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: COLORS.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: COLORS.white,
                  fontSize: '16px',
                  fontWeight: 600,
                  fontFamily: TYPOGRAPHY.fontFamily,
                  position: 'relative'
                }}>
                  {user?.firstName?.charAt(0) || user?.username?.charAt(0).toUpperCase() || 'U'}
                  <div style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#28a745',
                    border: `2px solid ${COLORS.white}`
                  }} />
                </div>
                <ChevronDownIcon />
              </div>
              <ProfileDropdown 
                isOpen={profileDropdownOpen} 
                onClose={() => setProfileDropdownOpen(false)}
                onLogout={handleLogout}
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
        
        <Route path="/employees" element={<ProtectedRoute requiredPermission="view_employees"><Employees /></ProtectedRoute>} />
        <Route path="/departments" element={<ProtectedRoute requiredPermission="view_departments"><Departments /></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
        <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
        <Route path="/leave" element={<ProtectedRoute><LeaveManagement /></ProtectedRoute>} />
        <Route path="/payroll" element={<ProtectedRoute requiredPermission="view_payroll"><Payroll /></ProtectedRoute>} />
        <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
        <Route path="/recruitment" element={<ProtectedRoute><Recruitment /></ProtectedRoute>} />
        <Route path="/performance" element={<ProtectedRoute><Performance /></ProtectedRoute>} />
        <Route path="/training" element={<ProtectedRoute><Training /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute requiredPermission="view_reports"><Reports /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><UserManagement /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><UserManagement /></ProtectedRoute>} />
        <Route path="/admin/job" element={<JobTitles />} />
        <Route path="/admin/job-titles" element={<JobTitles />} />
        <Route path="/admin/organization" element={<Organization />} />
        <Route path="/admin/qualifications" element={<Qualifications />} />
        <Route path="/admin/nationalities" element={<Nationalities />} />
        <Route path="/admin/branding" element={<CorporateBranding />} />
        <Route path="/admin/configuration" element={<Configuration />} />
      </Routes>
      </div>
      </div>
  );
};

export default App;
