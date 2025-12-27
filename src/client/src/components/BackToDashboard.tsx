/**
 * Back to Dashboard Component
 * Reusable component to navigate back to dashboard from Quick Launch pages
 * Copyright (C) 2024 Arithwise Inc.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const COLORS = {
  primary: '#78176b',
  primaryHover: '#590a4f',
  white: '#ffffff',
  text: '#333333',
  textLight: '#666666',
  border: '#e0e0e0',
};

const TYPOGRAPHY = {
  fontFamily: "'Segoe UI', Arial, sans-serif",
};

interface BackToDashboardProps {
  style?: React.CSSProperties;
}

const BackToDashboard: React.FC<BackToDashboardProps> = ({ style }) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  // Only show for admins
  if (!isAdmin()) {
    return null;
  }

  return (
    <button
      onClick={() => navigate('/dashboard')}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        backgroundColor: COLORS.white,
        border: `1px solid ${COLORS.border}`,
        borderRadius: '6px',
        color: COLORS.text,
        fontFamily: TYPOGRAPHY.fontFamily,
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#faf3ff';
        e.currentTarget.style.borderColor = COLORS.primary;
        e.currentTarget.style.color = COLORS.primary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = COLORS.white;
        e.currentTarget.style.borderColor = COLORS.border;
        e.currentTarget.style.color = COLORS.text;
      }}
    >
      <span style={{ fontSize: '16px' }}>←</span>
      <span>Back to Dashboard</span>
    </button>
  );
};

export default BackToDashboard;

