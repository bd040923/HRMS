/**
 * arithwise_hrms Configuration Page
 * Copyright (C) 2024 Arithwise Inc.
 */

import React, { useState, useRef, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useNavigate } from 'react-router-dom';

const COLORS = {
  primary: '#78176b',
  success: '#78176b', // Using primary purple instead of green
  white: '#ffffff',
  text: '#333333',
  textLight: '#666666',
  border: '#e0e0e0',
  lightBg: '#f9f9f9',
};

const TYPOGRAPHY = {
  fontFamily: "'Segoe UI', Arial, sans-serif",
};

interface ConfigOption {
  name: string;
  path: string;
  description: string;
}

const Configuration: React.FC = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const configOptions: ConfigOption[] = [
    { name: 'Email Configuration', path: '/admin/config/email', description: 'Configure email server settings' },
    { name: 'Email Subscriptions', path: '/admin/config/email-subscriptions', description: 'Manage email notification subscriptions' },
    { name: 'Localization', path: '/admin/config/localization', description: 'Set date format, language, and time zone' },
    { name: 'Language Packages', path: '/admin/config/language-packages', description: 'Manage translation language packages' },
    { name: 'Modules', path: '/admin/config/modules', description: 'Enable or disable system modules' },
    { name: 'Social Media Authentication', path: '/admin/config/social-auth', description: 'Configure social media login options' },
    { name: 'Register OAuth Client', path: '/admin/config/oauth-client', description: 'Register OAuth client applications' },
    { name: 'LDAP Configuration', path: '/admin/config/ldap', description: 'Configure LDAP authentication settings' },
  ];

  const [selectedOption, setSelectedOption] = useState<ConfigOption | null>(null);

  const handleOptionClick = (option: ConfigOption) => {
    setSelectedOption(option);
    setDropdownOpen(false);
    navigate(option.path);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <ProtectedRoute requiredPermission="manage_users">
      <AdminLayout title="Configuration" breadcrumbs={['Admin', 'Configuration']}>
        <div style={{
          backgroundColor: COLORS.white,
          padding: '32px',
          borderRadius: '8px',
          border: `1px solid ${COLORS.border}`,
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          {/* Dropdown Container */}
          <div style={{ position: 'relative', marginBottom: '32px' }} ref={dropdownRef}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontFamily: TYPOGRAPHY.fontFamily,
              color: COLORS.text,
              fontSize: '14px',
              fontWeight: 500,
            }}>
              Configuration Options
            </label>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                width: '100%',
                maxWidth: '400px',
                padding: '12px 16px',
                backgroundColor: COLORS.success,
                color: COLORS.white,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: TYPOGRAPHY.fontFamily,
                fontSize: '14px',
                fontWeight: 500,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <span>Configuration ▼</span>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '4px',
                width: '100%',
                maxWidth: '400px',
                backgroundColor: COLORS.white,
                border: `1px solid ${COLORS.border}`,
                borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 100,
                maxHeight: '400px',
                overflowY: 'auto',
              }}>
                {configOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionClick(option)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: 'transparent',
                      color: COLORS.text,
                      border: 'none',
                      borderBottom: index < configOptions.length - 1 ? `1px solid ${COLORS.border}` : 'none',
                      cursor: 'pointer',
                      fontFamily: TYPOGRAPHY.fontFamily,
                      fontSize: '14px',
                      textAlign: 'left',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = COLORS.lightBg;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {option.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Configuration Options Grid */}
          <div>
            <h3 style={{
              marginTop: 0,
              marginBottom: '24px',
              color: COLORS.primary,
              fontFamily: TYPOGRAPHY.fontFamily,
              fontSize: '18px',
            }}>
              Available Configuration Options
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '16px',
            }}>
              {configOptions.map((option, index) => (
                <div
                  key={index}
                  onClick={() => handleOptionClick(option)}
                  style={{
                    padding: '20px',
                    backgroundColor: COLORS.lightBg,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.white;
                    e.currentTarget.style.borderColor = COLORS.primary;
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(120, 23, 107, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.lightBg;
                    e.currentTarget.style.borderColor = COLORS.border;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <h4 style={{
                    marginTop: 0,
                    marginBottom: '8px',
                    color: COLORS.primary,
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontSize: '16px',
                  }}>
                    {option.name}
                  </h4>
                  <p style={{
                    margin: 0,
                    color: COLORS.textLight,
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontSize: '14px',
                    lineHeight: '1.5',
                  }}>
                    {option.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Help Text */}
          <div style={{
            marginTop: '32px',
            padding: '16px',
            backgroundColor: COLORS.lightBg,
            borderRadius: '6px',
            border: `1px solid ${COLORS.border}`,
          }}>
            <p style={{
              margin: 0,
              color: COLORS.textLight,
              fontFamily: TYPOGRAPHY.fontFamily,
              fontSize: '14px',
              lineHeight: '1.6',
            }}>
              <strong>Note:</strong> System configuration settings allow you to customize various aspects of arithwise_hrms. 
              Click on any configuration option above to access its settings. Changes to these settings may affect 
              system behavior and should be made carefully.
            </p>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default Configuration;
