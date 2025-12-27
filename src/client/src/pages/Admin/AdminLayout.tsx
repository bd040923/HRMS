/**
 * Arithwise HRM Admin Layout Component
 * Copyright (C) 2024 Arithwise Inc.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import BackToDashboard from '../../components/BackToDashboard';

const COLORS = {
  primary: '#78176b',
  primaryHover: '#590a4f',
  lightBg: '#f9f9f9',
  lightBgAlt: '#f9f9f9',
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
      ]
    },
    { name: 'KYC Verification', path: '/admin/kyc-verification', permission: 'manage_users' },
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
        location.pathname.startsWith('/admin/languages')) return '/admin/qualifications';
    if (location.pathname.startsWith('/admin/kyc-verification')) return '/admin/kyc-verification';
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
      padding: '24px',
      backgroundColor: COLORS.lightBg,
      minHeight: '100vh',
    }}>
      {/* Back to Dashboard Button */}
      <div style={{ marginBottom: '16px' }}>
        <BackToDashboard />
      </div>

      {/* Admin Tabs with Dropdowns */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        flexWrap: 'wrap',
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
                  padding: '12px 24px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: isActive ? '#f5f5f5' : 'transparent',
                  color: isActive ? COLORS.text : COLORS.textLight,
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontSize: '15px',
                  cursor: 'pointer',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#f9f9f9';
                    e.currentTarget.style.color = COLORS.text;
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
                  <span style={{ fontSize: '10px', marginLeft: '4px' }}>
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
                  marginTop: '4px',
                  backgroundColor: COLORS.white,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '6px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  minWidth: '200px',
                  zIndex: 1000,
                }}>
                  {tab.dropdown!.map((item: DropdownItem) => (
                    <button
                      key={item.path}
                      onClick={() => handleDropdownItemClick(item.path)}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontFamily: TYPOGRAPHY.fontFamily,
                        color: location.pathname === item.path ? COLORS.text : COLORS.textLight,
                        fontSize: '14px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = COLORS.lightBg;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
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
      <div>
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
