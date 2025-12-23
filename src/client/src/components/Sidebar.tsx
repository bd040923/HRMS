/**
 * Arithwise HRM Sidebar Navigation Component
 * Copyright (C) 2024 Arithwise Inc.
 */

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';
import { useAuth } from '../context/AuthContext';

const COLORS = {
  primary: '#78176b',
  primaryHover: '#590a4f',
  lightBg: '#faf3ff',
  white: '#ffffff',
  text: '#333333',
  textLight: '#666666',
  border: '#e0e0e0',
};

const TYPOGRAPHY = {
  fontFamily: "'Segoe UI', Arial, sans-serif",
};

interface SidebarItem {
  name: string;
  path: string;
  icon: string;
  submenu?: { name: string; path: string }[];
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { collapsed, setCollapsed } = useSidebar();
  const { isAdmin } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Collapse sidebar by default on mount
  React.useEffect(() => {
    setCollapsed(true);
  }, [setCollapsed]);

  const menuItems: SidebarItem[] = [
    ...(isAdmin() ? [{ name: 'Admin', path: '/admin/users', icon: '👥' }] : []),
    ...(isAdmin() ? [{ name: 'PIM', path: '/employees', icon: '👤' }] : []),
    { 
      name: 'Leave', 
      path: '/leave', 
      icon: '📋'
    },
    { name: 'Time', path: '/attendance', icon: '⏰' },
    { name: 'Recruitment', path: '/recruitment', icon: '🔍' },
    { name: 'My Info', path: '/my-info', icon: '👤' },
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
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      overflowX: 'hidden',
      boxShadow: '2px 0 4px rgba(0,0,0,0.05)',
    }}>
      {/* Logo and Toggle */}
      <div style={{
        padding: '16px',
        borderBottom: `1px solid ${COLORS.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
      }}>
        {!collapsed && (
          <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <img 
              src="/images/arithwise_logo.png"
              alt="arithwise_hrms" 
              style={{ 
                height: '40px', 
                width: 'auto',
                maxWidth: '180px',
                objectFit: 'contain'
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent && !parent.querySelector('span')) {
                  const fallback = document.createElement('span');
                  fallback.textContent = 'arithwise_hrms';
                  fallback.style.color = COLORS.primary;
                  fallback.style.fontSize = '1.25rem';
                  fallback.style.fontFamily = TYPOGRAPHY.fontFamily;
                  fallback.style.fontWeight = '600';
                  parent.appendChild(fallback);
                }
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
            padding: '4px',
          }}
        >
          {collapsed ? '☰' : '×'}
        </button>
      </div>

      {/* Search */}
      {!collapsed && (
        <div style={{ padding: '16px' }}>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}>
            <span style={{
              position: 'absolute',
              left: '12px',
              fontSize: '18px',
              color: COLORS.textLight,
            }}>
              🔍
            </span>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 10px 10px 40px',
                border: `1px solid ${COLORS.border}`,
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: TYPOGRAPHY.fontFamily,
                boxSizing: 'border-box',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = COLORS.primary;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = COLORS.border;
              }}
            />
          </div>
        </div>
      )}

      {/* Menu Items */}
      <nav style={{ 
        flex: 1, 
        padding: '8px 0',
      }}>
        {menuItems
          .filter(item => {
            // Filter by search query
            if (searchQuery !== '' && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
              return false;
            }
            // Hide Recruitment for non-admin users
            if (item.name === 'Recruitment' && !isAdmin()) {
              return false;
            }
            return true;
          })
          .map((item) => {
          const active = isActive(item.path);
          const hasSubmenu = item.submenu && item.submenu.length > 0;
          const submenuExpanded = isSubmenuExpanded(item.name);

          return (
            <div key={item.path}>
              {/* Main Menu Item */}
              {hasSubmenu ? (
                <button
                  onClick={(e) => {
                    if (collapsed) {
                      // When collapsed, navigate to the main path
                      navigate(item.path);
                    } else {
                      // When expanded, toggle submenu
                      toggleSubmenu(item.name);
                    }
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'space-between',
                    padding: collapsed ? '12px 18px' : '12px 20px',
                    color: active ? COLORS.white : COLORS.text,
                    backgroundColor: active ? COLORS.primary : 'transparent',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontSize: '15px',
                    fontWeight: active ? 500 : 400,
                    borderRadius: active ? '25px 0 0 25px' : '0',
                    marginRight: active ? '0' : '0',
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
                    <span style={{ fontSize: '10px' }}>
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
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    padding: collapsed ? '12px 18px' : '12px 20px',
                    color: active ? COLORS.white : COLORS.text,
                    backgroundColor: active ? COLORS.primary : 'transparent',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontSize: '15px',
                    fontWeight: active ? 500 : 400,
                    gap: '12px',
                    borderRadius: active ? '25px 0 0 25px' : '0',
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
                  backgroundColor: COLORS.lightBg,
                  paddingLeft: '20px',
                }}>
                  {item.submenu!.map((subItem) => {
                    const subActive = location.pathname === subItem.path;
                    return (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        style={{
                          display: 'block',
                          padding: '10px 20px 10px 50px',
                          color: subActive ? COLORS.primary : COLORS.textLight,
                          backgroundColor: subActive ? COLORS.white : 'transparent',
                          textDecoration: 'none',
                          transition: 'all 0.2s',
                          fontFamily: TYPOGRAPHY.fontFamily,
                          fontSize: '14px',
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
