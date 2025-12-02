/**
 * Arithwise HRM Sidebar Navigation Component
 * Copyright (C) 2024 Arithwise Inc.
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';

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

interface SidebarItem {
  name: string;
  path: string;
  icon: string;
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { collapsed, setCollapsed } = useSidebar();

  const menuItems: SidebarItem[] = [
    { name: 'Admin', path: '/admin/users', icon: '⚙️' },
    { name: 'PIM', path: '/employees', icon: '👤' },
    { name: 'Leave', path: '/leave', icon: '📋' },
    { name: 'Time', path: '/attendance', icon: '⏰' },
    { name: 'Recruitment', path: '/recruitment', icon: '🔍' },
    { name: 'My Info', path: '/my-info', icon: 'ℹ️' },
    { name: 'Performance', path: '/performance', icon: '⭐' },
    { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { name: 'Directory', path: '/directory', icon: '📂' },
    { name: 'Maintenance', path: '/maintenance', icon: '🔧' },
    { name: 'Claim', path: '/expenses', icon: '💰' },
    { name: 'Buzz', path: '/buzz', icon: '💬' },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname.startsWith('/admin');
    }
    return location.pathname === path;
  };

  return (
    <div style={{
      width: collapsed ? '60px' : '240px',
      backgroundColor: COLORS.white,
      minHeight: '100vh',
      borderRight: `1px solid ${COLORS.border}`,
      transition: 'width 0.3s ease',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Logo */}
      <div style={{
        padding: '16px',
        borderBottom: `1px solid ${COLORS.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {!collapsed && (
          <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img 
              src="/OIP.webp" 
              alt="Logo" 
              style={{ height: '32px', width: 'auto' }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '18px',
            color: COLORS.text,
            padding: '4px'
          }}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Search */}
      {!collapsed && (
        <div style={{ padding: '16px', borderBottom: `1px solid ${COLORS.border}` }}>
          <input
            type="text"
            placeholder="Search"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: `1px solid ${COLORS.border}`,
              borderRadius: '6px',
              fontSize: TYPOGRAPHY.textNote.fontSize,
              fontFamily: TYPOGRAPHY.fontFamily,
              boxSizing: 'border-box'
            }}
          />
        </div>
      )}

      {/* Menu Items */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              textDecoration: 'none',
              color: isActive(item.path) ? COLORS.primary : COLORS.text,
              backgroundColor: isActive(item.path) ? COLORS.lightBg : 'transparent',
              borderLeft: isActive(item.path) ? `3px solid ${COLORS.primary}` : '3px solid transparent',
              fontSize: TYPOGRAPHY.textImportant.fontSize,
              fontFamily: TYPOGRAPHY.fontFamily,
              fontWeight: isActive(item.path) ? 500 : 400,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!isActive(item.path)) {
                e.currentTarget.style.backgroundColor = COLORS.lightBg;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive(item.path)) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <span style={{ fontSize: '20px', marginRight: collapsed ? 0 : '12px', minWidth: '20px', textAlign: 'center' }}>
              {item.icon}
            </span>
            {!collapsed && <span>{item.name}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;

