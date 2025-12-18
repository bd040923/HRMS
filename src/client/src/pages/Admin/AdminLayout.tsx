/**
 * Arithwise HRM Admin Layout Component
 * Copyright (C) 2024 Arithwise Inc.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

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
  textImportant: { fontSize: '16px' },
  textNote: { fontSize: '14px' },
};

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  breadcrumbs?: string[];
}

interface DropdownItem {
  name: string;
  path: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, breadcrumbs = ['Admin'] }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const adminTabs = [
    { name: 'User Management', path: '/admin/users', permission: 'manage_users' },
    { 
      name: 'Job', 
      path: '/admin/job', 
      permission: 'manage_departments',
      dropdown: [
        { name: 'Job Titles', path: '/admin/job-titles' },
        { name: 'Pay Grades', path: '/admin/pay-grades' },
        { name: 'Employment Status', path: '/admin/employment-status' },
        { name: 'Job Categories', path: '/admin/job-categories' },
        { name: 'Work Shifts', path: '/admin/work-shifts' },
      ]
    },
    { 
      name: 'Organization', 
      path: '/admin/organization', 
      permission: 'manage_departments',
      dropdown: [
        { name: 'General Information', path: '/admin/general-information' },
        { name: 'Locations', path: '/admin/locations' },
        { name: 'Structure', path: '/admin/structure' },
      ]
    },
    { 
      name: 'Qualifications', 
      path: '/admin/qualifications', 
      permission: 'view_employees',
      dropdown: [
        { name: 'Skills', path: '/admin/skills' },
        { name: 'Education', path: '/admin/education' },
        { name: 'Licenses', path: '/admin/licenses' },
        { name: 'Languages', path: '/admin/languages' },
        { name: 'Memberships', path: '/admin/memberships' },
      ]
    },
    { name: 'Nationalities', path: '/admin/nationalities', permission: 'view_employees' },
    { name: 'Corporate Branding', path: '/admin/branding', permission: 'manage_users' },
    { name: 'Configuration', path: '/admin/configuration', permission: 'manage_users' },
  ];

  // Determine active tab based on current path
  const getActiveTab = () => {
    if (location.pathname.startsWith('/admin/users')) return '/admin/users';
    if (location.pathname.startsWith('/admin/job') || 
        location.pathname.startsWith('/admin/pay-grades') ||
        location.pathname.startsWith('/admin/employment-status') ||
        location.pathname.startsWith('/admin/work-shifts')) return '/admin/job';
    if (location.pathname.startsWith('/admin/organization') ||
        location.pathname.startsWith('/admin/general-information') ||
        location.pathname.startsWith('/admin/locations') ||
        location.pathname.startsWith('/admin/structure')) return '/admin/organization';
    if (location.pathname.startsWith('/admin/qualifications') ||
        location.pathname.startsWith('/admin/skills') ||
        location.pathname.startsWith('/admin/education') ||
        location.pathname.startsWith('/admin/licenses') ||
        location.pathname.startsWith('/admin/languages') ||
        location.pathname.startsWith('/admin/memberships')) return '/admin/qualifications';
    if (location.pathname.startsWith('/admin/nationalities')) return '/admin/nationalities';
    if (location.pathname.startsWith('/admin/branding')) return '/admin/branding';
    if (location.pathname.startsWith('/admin/configuration')) return '/admin/configuration';
    return '/admin/users';
  };

  const activeTab = getActiveTab();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTabClick = (tab: any) => {
    if (tab.dropdown) {
      // Toggle dropdown
      setActiveDropdown(activeDropdown === tab.path ? null : tab.path);
    } else {
      // Navigate directly
      navigate(tab.path);
      setActiveDropdown(null);
    }
  };

  const handleDropdownItemClick = (path: string) => {
    navigate(path);
    setActiveDropdown(null);
  };

  return (
    <div style={{
      backgroundColor: COLORS.lightBg,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Bar */}
      <div style={{
        backgroundColor: COLORS.primary,
        color: COLORS.white,
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h2 style={{
            margin: 0,
            fontSize: '1.25rem',
            fontFamily: TYPOGRAPHY.fontFamily,
            fontWeight: 500
          }}>
            {breadcrumbs.join(' / ')}
          </h2>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: COLORS.white,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: COLORS.primary,
            fontWeight: 600,
            fontSize: '16px'
          }}>
            A
          </div>
          <span style={{
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: TYPOGRAPHY.textImportant.fontSize,
            fontWeight: 500
          }}>
            Admin User
          </span>
        </div>
      </div>

      {/* Admin Tabs with Dropdowns */}
      <div style={{
        backgroundColor: '#f5f5f5',
        borderBottom: `1px solid ${COLORS.border}`,
        borderTop: `1px solid ${COLORS.border}`,
        display: 'flex',
        padding: '0 24px',
        gap: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        position: 'relative',
      }} ref={dropdownRef}>
        {adminTabs.map((tab) => {
          const isActive = activeTab === tab.path;
          const hasDropdown = !!tab.dropdown;
          const isDropdownOpen = activeDropdown === tab.path;

          return (
            <div key={tab.path} style={{ position: 'relative' }}>
              <button
                onClick={() => handleTabClick(tab)}
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
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
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
                {hasDropdown && (
                  <span style={{ fontSize: '10px' }}>
                    {isDropdownOpen ? '▲' : '▼'}
                  </span>
                )}
              </button>

              {/* Dropdown Menu */}
              {hasDropdown && isDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  backgroundColor: COLORS.white,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '0 0 6px 6px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  minWidth: '200px',
                  zIndex: 1000,
                  marginTop: '-3px',
                }}>
                  {tab.dropdown!.map((item: DropdownItem) => (
                    <button
                      key={item.path}
                      onClick={() => handleDropdownItemClick(item.path)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        backgroundColor: location.pathname === item.path ? COLORS.lightBg : COLORS.white,
                        color: location.pathname === item.path ? COLORS.primary : COLORS.text,
                        border: 'none',
                        borderBottom: `1px solid ${COLORS.border}`,
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: TYPOGRAPHY.textNote.fontSize,
                        fontFamily: TYPOGRAPHY.fontFamily,
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        if (location.pathname !== item.path) {
                          e.currentTarget.style.backgroundColor = COLORS.lightBg;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (location.pathname !== item.path) {
                          e.currentTarget.style.backgroundColor = COLORS.white;
                        }
                      }}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        padding: '24px',
      }}>
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
