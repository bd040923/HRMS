/**
 * Arithwise HRM Sidebar Navigation Component
 * Copyright (C) 2024 Arithwise Inc.
 */

import React, { useState } from 'react';
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
  submenu?: { name: string; path: string }[];
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { collapsed, setCollapsed } = useSidebar();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

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
    { 
      name: 'Reports', 
      path: '/reports', 
      icon: '📊',
      submenu: [
        { name: 'PIM Reports', path: '/reports/pim' },
        { name: 'Employee Reports', path: '/reports/employee' },
      ]
    },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname.startsWith('/admin');
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const toggleSubmenu = (itemName: string) => {
    setExpandedMenus(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isSubmenuExpanded = (itemName: string) => {
    return expandedMenus.includes(itemName);
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
      flexDirection: 'column',
      overflowY: 'auto',
      overflowX: 'hidden',
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
            <span style={{
              color: COLORS.primary,
              fontSize: '1.25rem',
              fontFamily: TYPOGRAPHY.fontFamily,
              fontWeight: 600,
            }}>
              arithwise_hrms
            </span>
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
          }}
        >
          {collapsed ? '☰' : '×'}
        </button>
      </div>

      {/* Menu Items */}
      <nav style={{ 
        flex: 1, 
        padding: '8px 0',
      }}>
        {menuItems.map((item) => {
          const active = isActive(item.path);
          const hasSubmenu = item.submenu && item.submenu.length > 0;
          const submenuExpanded = isSubmenuExpanded(item.name);

          return (
            <div key={item.path}>
              {/* Main Menu Item */}
              {hasSubmenu ? (
                <button
                  onClick={() => toggleSubmenu(item.name)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: collapsed ? '12px 18px' : '12px 16px',
                    color: active ? COLORS.white : COLORS.text,
                    backgroundColor: active ? COLORS.primary : 'transparent',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    borderLeft: active ? `4px solid ${COLORS.primaryHover}` : '4px solid transparent',
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontSize: TYPOGRAPHY.textNote.fontSize,
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = COLORS.lightBg;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '18px' }}>{item.icon}</span>
                    {!collapsed && <span>{item.name}</span>}
                  </div>
                  {!collapsed && hasSubmenu && (
                    <span style={{ fontSize: '12px' }}>
                      {submenuExpanded ? '▼' : '▶'}
                    </span>
                  )}
                </button>
              ) : (
                <Link
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: collapsed ? '12px 18px' : '12px 16px',
                    color: active ? COLORS.white : COLORS.text,
                    backgroundColor: active ? COLORS.primary : 'transparent',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    borderLeft: active ? `4px solid ${COLORS.primaryHover}` : '4px solid transparent',
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontSize: TYPOGRAPHY.textNote.fontSize,
                    gap: '12px',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = COLORS.lightBg;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{item.icon}</span>
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              )}

              {/* Submenu Items */}
              {hasSubmenu && submenuExpanded && !collapsed && (
                <div style={{
                  backgroundColor: COLORS.lightBgAlt,
                  borderLeft: `3px solid ${COLORS.primary}`,
                  marginLeft: '16px',
                }}>
                  {item.submenu!.map((subItem) => {
                    const subActive = location.pathname === subItem.path;
                    return (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        style={{
                          display: 'block',
                          padding: '10px 16px 10px 40px',
                          color: subActive ? COLORS.primary : COLORS.textLight,
                          backgroundColor: subActive ? COLORS.white : 'transparent',
                          textDecoration: 'none',
                          transition: 'all 0.2s',
                          fontFamily: TYPOGRAPHY.fontFamily,
                          fontSize: TYPOGRAPHY.textNote.fontSize,
                          fontWeight: subActive ? 500 : 400,
                        }}
                        onMouseEnter={(e) => {
                          if (!subActive) {
                            e.currentTarget.style.backgroundColor = COLORS.white;
                            e.currentTarget.style.color = COLORS.primary;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!subActive) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = COLORS.textLight;
                          }
                        }}
                      >
                        {subItem.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
