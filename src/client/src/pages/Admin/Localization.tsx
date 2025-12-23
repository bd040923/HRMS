/**
 * arithwise_hrms Localization Page
 * Copyright (C) 2024 Arithwise Inc.
 */

import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import ProtectedRoute from '../../components/ProtectedRoute';

const COLORS = {
  primary: '#78176b',
  success: '#78176b', // Using primary purple instead of green
  white: '#ffffff',
  text: '#333333',
  textLight: '#666666',
  border: '#e0e0e0',
};

const TYPOGRAPHY = {
  fontFamily: "'Segoe UI', Arial, sans-serif",
};

const Localization: React.FC = () => {
  const [language, setLanguage] = useState('English (United States)');
  const [dateFormat, setDateFormat] = useState('yyyy-dd-mm ( 2025-17-12 )');

  const languages = [
    'English (United States)',
    'English (United Kingdom)',
    'Spanish',
    'French',
    'German',
    'Chinese (Simplified)',
    'Chinese (Traditional)',
    'Japanese',
    'Korean',
  ];

  const dateFormats = [
    'yyyy-dd-mm ( 2025-17-12 )',
    'yyyy-mm-dd ( 2025-12-17 )',
    'dd-mm-yyyy ( 17-12-2025 )',
    'mm-dd-yyyy ( 12-17-2025 )',
    'dd/mm/yyyy ( 17/12/2025 )',
    'mm/dd/yyyy ( 12/17/2025 )',
  ];

  const handleSave = () => {
    alert('Localization settings saved successfully!');
  };

  return (
    <ProtectedRoute requiredPermission="manage_users">
      <AdminLayout title="Configuration" breadcrumbs={['Admin', 'Configuration', 'Localization']}>
        <div style={{
          backgroundColor: COLORS.white,
          padding: '32px',
          borderRadius: '8px',
          border: `1px solid ${COLORS.border}`,
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{
            marginTop: 0,
            marginBottom: '24px',
            color: COLORS.text,
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '18px',
          }}>
            Localization
          </h2>

          {/* Language */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontFamily: TYPOGRAPHY.fontFamily,
              color: COLORS.text,
              fontSize: '14px',
            }}>
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '400px',
                padding: '10px',
                border: `1px solid ${COLORS.border}`,
                borderRadius: '6px',
                fontFamily: TYPOGRAPHY.fontFamily,
                fontSize: '14px',
                backgroundColor: COLORS.white,
                cursor: 'pointer',
              }}
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          {/* Date Format */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontFamily: TYPOGRAPHY.fontFamily,
              color: COLORS.text,
              fontSize: '14px',
            }}>
              Date Format
            </label>
            <select
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '400px',
                padding: '10px',
                border: `1px solid ${COLORS.border}`,
                borderRadius: '6px',
                fontFamily: TYPOGRAPHY.fontFamily,
                fontSize: '14px',
                backgroundColor: COLORS.white,
                cursor: 'pointer',
              }}
            >
              {dateFormats.map((format) => (
                <option key={format} value={format}>
                  {format}
                </option>
              ))}
            </select>
          </div>

          {/* Save Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleSave}
              style={{
                padding: '10px 24px',
                backgroundColor: COLORS.success,
                color: COLORS.white,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: TYPOGRAPHY.fontFamily,
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              Save
            </button>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default Localization;

