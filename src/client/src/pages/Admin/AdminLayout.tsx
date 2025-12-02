/**
 * Arithwise HRM Admin Layout Component
 * Copyright (C) 2024 Arithwise Inc.
 */

import React, { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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

const TYPOGRAPHY = {
  fontFamily: "'Segoe UI', Arial, sans-serif",
  heading: { fontSize: '2rem', fontWeight: 500 },
  subheading: { fontSize: '20px' },
  textImportant: { fontSize: '16px' },
  textNote: { fontSize: '14px' },
};

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  breadcrumbs?: string[];
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, breadcrumbs = ['Admin'] }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const adminTabs = [
    { name: 'User Management', path: '/admin/users', permission: 'manage_users' },
    { name: 'Job', path: '/admin/job', permission: 'manage_departments' },
    { name: 'Organization', path: '/admin/organization', permission: 'manage_departments' },
    { name: 'Qualifications', path: '/admin/qualifications', permission: 'view_employees' },
    { name: 'Nationalities', path: '/admin/nationalities', permission: 'view_employees' },
    { name: 'Corporate Branding', path: '/admin/branding', permission: 'manage_users' },
    { name: 'Configuration', path: '/admin/configuration', permission: 'manage_users' },
  ];

  // Determine active tab based on current path
  const getActiveTab = () => {
    if (location.pathname.startsWith('/admin/users')) return '/admin/users';
    if (location.pathname.startsWith('/admin/job')) return '/admin/job';
    if (location.pathname.startsWith('/admin/organization')) return '/admin/organization';
    if (location.pathname.startsWith('/admin/qualifications')) return '/admin/qualifications';
    if (location.pathname.startsWith('/admin/nationalities')) return '/admin/nationalities';
    if (location.pathname.startsWith('/admin/branding')) return '/admin/branding';
    if (location.pathname.startsWith('/admin/configuration')) return '/admin/configuration';
    return '/admin/users';
  };

  const activeTab = getActiveTab();

  return (
    <div style={{ 
        flex: 1, 
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh'
      }}>
        {/* Top Header */}
        <div style={{
          backgroundColor: COLORS.primary,
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: COLORS.white,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            fontSize: TYPOGRAPHY.textImportant.fontSize,
            fontFamily: TYPOGRAPHY.fontFamily,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                <span>{crumb}</span>
                {index < breadcrumbs.length - 1 && <span> / </span>}
              </React.Fragment>
            ))}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: TYPOGRAPHY.textImportant.fontSize,
              fontFamily: TYPOGRAPHY.fontFamily
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: COLORS.white,
                color: COLORS.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '14px'
              }}>
                {user?.firstName?.charAt(0) || 'U'}
              </div>
              <span>{user?.firstName} {user?.lastName}</span>
            </div>
          </div>
        </div>

        {/* Admin Tabs */}
        <div style={{
          backgroundColor: '#f5f5f5',
          borderBottom: `1px solid ${COLORS.border}`,
          borderTop: `1px solid ${COLORS.border}`,
          display: 'flex',
          padding: '0 24px',
          gap: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          {adminTabs.map((tab) => {
            const isActive = activeTab === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                style={{
                  padding: '12px 16px',
                  backgroundColor: isActive ? COLORS.primary : 'transparent',
                  color: isActive ? COLORS.white : COLORS.textLight,
                  border: 'none',
                  borderBottom: isActive ? `3px solid ${COLORS.primary}` : '3px solid transparent',
                  borderRadius: '6px 6px 0 0',
                  cursor: 'pointer',
                  fontSize: TYPOGRAPHY.textImportant.fontSize,
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontWeight: isActive ? 500 : 400,
                  transition: 'all 0.2s',
                  marginTop: '4px'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = COLORS.lightBg;
                    e.currentTarget.style.color = COLORS.primary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = COLORS.textLight;
                  }
                }}
              >
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Main Content */}
        <div style={{
          flex: 1,
          padding: '24px',
          backgroundColor: COLORS.lightBg
        }}>
          <h1 style={{
            color: COLORS.primary,
            fontSize: TYPOGRAPHY.heading.fontSize,
            fontFamily: TYPOGRAPHY.fontFamily,
            fontWeight: TYPOGRAPHY.heading.fontWeight,
            marginTop: 0,
            marginBottom: '24px'
          }}>
            {title}
          </h1>
          {children}
        </div>
      </div>
  );
};

export default AdminLayout;

