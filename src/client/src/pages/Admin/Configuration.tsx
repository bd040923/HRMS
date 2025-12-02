/**
 * Arithwise HRM Configuration Page
 * Copyright (C) 2024 Arithwise Inc.
 */

import React from 'react';
import AdminLayout from './AdminLayout';
import ProtectedRoute from '../../components/ProtectedRoute';

const COLORS = {
  white: '#ffffff',
  text: '#333333',
  border: '#e0e0e0',
};

const TYPOGRAPHY = {
  fontFamily: "'Segoe UI', Arial, sans-serif",
  textImportant: { fontSize: '16px' },
};

const Configuration: React.FC = () => {
  return (
    <ProtectedRoute requiredPermission="manage_users">
      <AdminLayout title="Configuration" breadcrumbs={['Admin', 'Configuration']}>
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
            System configuration settings coming soon...
          </p>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default Configuration;

