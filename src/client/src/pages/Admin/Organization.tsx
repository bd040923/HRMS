/**
 * Arithwise HRM Organization Management Page
 * Copyright (C) 2024 Arithwise Inc.
 */

import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import ProtectedRoute from '../../components/ProtectedRoute';

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

const Organization: React.FC = () => {
  return (
    <ProtectedRoute requiredPermission="manage_departments">
      <AdminLayout title="Organization" breadcrumbs={['Admin', 'Organization']}>
        <div style={{
          backgroundColor: COLORS.white,
          padding: '24px',
          borderRadius: '8px',
          border: `1px solid ${COLORS.border}`,
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <p style={{
            fontSize: TYPOGRAPHY.textImportant.fontSize,
            fontFamily: TYPOGRAPHY.fontFamily,
            color: COLORS.text
          }}>
            Organization management features coming soon...
          </p>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default Organization;

