/**
 * Arithwise HRM User Management Page (Admin Only)
 * Copyright (C) 2024 Arithwise Inc.
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminLayout from './Admin/AdminLayout';

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

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'employee' | 'manager';
  status: 'enabled' | 'disabled';
  employeeName?: string;
}

const UserManagement: React.FC = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([
    { id: 1, username: 'admin', email: 'admin@arithwise.com', firstName: 'Admin', lastName: 'User', role: 'admin', status: 'enabled', employeeName: 'Admin User' },
    { id: 2, username: 'user', email: 'user@arithwise.com', firstName: 'Regular', lastName: 'User', role: 'employee', status: 'enabled', employeeName: 'Regular User' },
  ]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<User | null>(null);
  const [formData, setFormData] = useState({ username: '', email: '', firstName: '', lastName: '', role: 'employee' as 'admin' | 'employee' | 'manager', password: '', employeeName: '' });
  
  // Search/Filter state
  const [searchFilters, setSearchFilters] = useState({
    username: '',
    userRole: '',
    employeeName: '',
    status: ''
  });
  const [showFilters, setShowFilters] = useState(true);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedItems(users.map(u => u.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: number) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== id));
      setSelectedItems(selectedItems.filter(i => i !== id));
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ username: '', email: '', firstName: '', lastName: '', role: 'employee', password: '', employeeName: '' });
    setShowAddModal(true);
  };

  const handleEdit = (user: User) => {
    setEditingItem(user);
    setFormData({ 
      username: user.username, 
      email: user.email, 
      firstName: user.firstName, 
      lastName: user.lastName, 
      role: user.role, 
      password: '', 
      employeeName: user.employeeName || `${user.firstName} ${user.lastName}`
    });
    setShowAddModal(true);
  };

  const handleSave = () => {
    if (editingItem) {
      setUsers(users.map(u => 
        u.id === editingItem.id 
          ? { ...u, ...formData, employeeName: formData.employeeName || `${formData.firstName} ${formData.lastName}` }
          : u
      ));
    } else {
      const newId = Math.max(...users.map(u => u.id), 0) + 1;
      setUsers([...users, { 
        id: newId, 
        ...formData, 
        status: 'enabled',
        employeeName: formData.employeeName || `${formData.firstName} ${formData.lastName}`
      }]);
    }
    setShowAddModal(false);
    setFormData({ username: '', email: '', firstName: '', lastName: '', role: 'employee', password: '', employeeName: '' });
  };

  const handleReset = () => {
    setSearchFilters({
      username: '',
      userRole: '',
      employeeName: '',
      status: ''
    });
  };

  const handleSearch = () => {
    // Filter logic would go here
    // For now, just showing all users
  };

  // Filter users based on search criteria
  const filteredUsers = users.filter(user => {
    if (searchFilters.username && !user.username.toLowerCase().includes(searchFilters.username.toLowerCase())) return false;
    if (searchFilters.userRole && user.role !== searchFilters.userRole) return false;
    if (searchFilters.employeeName && !user.employeeName?.toLowerCase().includes(searchFilters.employeeName.toLowerCase())) return false;
    if (searchFilters.status && user.status !== searchFilters.status) return false;
    return true;
  });

  if (!isAdmin()) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontFamily: "'Segoe UI', Arial, sans-serif" }}>
        <h1 style={{ color: '#dc3545', fontSize: '2rem', fontWeight: 500 }}>Access Denied</h1>
        <p style={{ fontSize: '16px', color: '#666', marginTop: '16px' }}>Admin access required.</p>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout title="System Users" breadcrumbs={['Admin']}>
        {/* Search/Filter Section */}
        {showFilters && (
          <div style={{
            backgroundColor: COLORS.white,
            borderRadius: '8px',
            border: `1px solid ${COLORS.border}`,
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            marginBottom: '20px',
            padding: '20px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{
                color: COLORS.text,
                fontSize: TYPOGRAPHY.textImportant.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                fontWeight: 500,
                margin: 0
              }}>
                System Users
              </h2>
              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                  color: COLORS.textLight
                }}
              >
                {showFilters ? '▲' : '▼'}
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: TYPOGRAPHY.textNote.fontSize,
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontWeight: 500,
                  color: COLORS.text
                }}>
                  Username
                </label>
                <input
                  type="text"
                  value={searchFilters.username}
                  onChange={(e) => setSearchFilters({ ...searchFilters, username: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '6px',
                    fontSize: TYPOGRAPHY.textImportant.fontSize,
                    fontFamily: TYPOGRAPHY.fontFamily,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: TYPOGRAPHY.textNote.fontSize,
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontWeight: 500,
                  color: COLORS.text
                }}>
                  User Role
                </label>
                <select
                  value={searchFilters.userRole}
                  onChange={(e) => setSearchFilters({ ...searchFilters, userRole: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '6px',
                    fontSize: TYPOGRAPHY.textImportant.fontSize,
                    fontFamily: TYPOGRAPHY.fontFamily,
                    boxSizing: 'border-box',
                    backgroundColor: COLORS.white
                  }}
                >
                  <option value="">-- Select --</option>
                  <option value="admin">Admin</option>
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: TYPOGRAPHY.textNote.fontSize,
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontWeight: 500,
                  color: COLORS.text
                }}>
                  Employee Name
                </label>
                <input
                  type="text"
                  value={searchFilters.employeeName}
                  onChange={(e) => setSearchFilters({ ...searchFilters, employeeName: e.target.value })}
                  placeholder="Type for hints..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '6px',
                    fontSize: TYPOGRAPHY.textImportant.fontSize,
                    fontFamily: TYPOGRAPHY.fontFamily,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: TYPOGRAPHY.textNote.fontSize,
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontWeight: 500,
                  color: COLORS.text
                }}>
                  Status
                </label>
                <select
                  value={searchFilters.status}
                  onChange={(e) => setSearchFilters({ ...searchFilters, status: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '6px',
                    fontSize: TYPOGRAPHY.textImportant.fontSize,
                    fontFamily: TYPOGRAPHY.fontFamily,
                    boxSizing: 'border-box',
                    backgroundColor: COLORS.white
                  }}
                >
                  <option value="">-- Select --</option>
                  <option value="enabled">Enabled</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={handleReset}
                style={{
                  padding: '8px 20px',
                  backgroundColor: COLORS.white,
                  color: '#28a745',
                  border: `1px solid #28a745`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: TYPOGRAPHY.textImportant.fontSize,
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontWeight: 500
                }}
              >
                Reset
              </button>
              <button
                onClick={handleSearch}
                style={{
                  padding: '8px 20px',
                  backgroundColor: '#28a745',
                  color: COLORS.white,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: TYPOGRAPHY.textImportant.fontSize,
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontWeight: 500
                }}
              >
                Search
              </button>
            </div>
          </div>
        )}

        {/* Add Button and Table */}
        <div style={{
          backgroundColor: COLORS.white,
          borderRadius: '8px',
          border: `1px solid ${COLORS.border}`,
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: `1px solid ${COLORS.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <button
              onClick={handleAdd}
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: COLORS.white,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: TYPOGRAPHY.textImportant.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#218838'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
            >
              + Add
            </button>
            <div style={{
              fontSize: TYPOGRAPHY.textImportant.fontSize,
              fontFamily: TYPOGRAPHY.fontFamily,
              color: COLORS.textLight
            }}>
              ({filteredUsers.length}) Records Found
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: TYPOGRAPHY.fontFamily
            }}>
              <thead>
                <tr style={{
                  backgroundColor: COLORS.lightBg,
                  borderBottom: `2px solid ${COLORS.border}`
                }}>
                  <th style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontSize: TYPOGRAPHY.textImportant.fontSize,
                    fontWeight: 500,
                    color: COLORS.text
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedItems.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={handleSelectAll}
                      style={{ marginRight: '8px' }}
                    />
                    Username
                  </th>
                  <th style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontSize: TYPOGRAPHY.textImportant.fontSize,
                    fontWeight: 500,
                    color: COLORS.text
                  }}>
                    User Role
                  </th>
                  <th style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontSize: TYPOGRAPHY.textImportant.fontSize,
                    fontWeight: 500,
                    color: COLORS.text
                  }}>
                    Employee Name
                  </th>
                  <th style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontSize: TYPOGRAPHY.textImportant.fontSize,
                    fontWeight: 500,
                    color: COLORS.text
                  }}>
                    Status
                  </th>
                  <th style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontSize: TYPOGRAPHY.textImportant.fontSize,
                    fontWeight: 500,
                    color: COLORS.text
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    style={{
                      borderBottom: `1px solid ${COLORS.border}`,
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.lightBg}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{
                      padding: '12px 16px',
                      fontSize: TYPOGRAPHY.textImportant.fontSize,
                      color: COLORS.text
                    }}>
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(user.id)}
                        onChange={() => handleSelectItem(user.id)}
                        style={{ marginRight: '8px' }}
                      />
                      {user.username}
                    </td>
                    <td style={{
                      padding: '12px 16px',
                      fontSize: TYPOGRAPHY.textImportant.fontSize,
                      color: COLORS.text
                    }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '4px',
                        backgroundColor: user.role === 'admin' ? COLORS.primary : COLORS.textLight,
                        color: COLORS.white,
                        fontSize: TYPOGRAPHY.textNote.fontSize,
                        fontWeight: 500
                      }}>
                        {user.role === 'employee' ? 'Employee' : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td style={{
                      padding: '12px 16px',
                      fontSize: TYPOGRAPHY.textImportant.fontSize,
                      color: COLORS.text
                    }}>
                      {user.employeeName || `${user.firstName} ${user.lastName}`}
                    </td>
                    <td style={{
                      padding: '12px 16px',
                      fontSize: TYPOGRAPHY.textImportant.fontSize,
                      color: COLORS.text
                    }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '4px',
                        backgroundColor: user.status === 'enabled' ? '#28a745' : '#dc3545',
                        color: COLORS.white,
                        fontSize: TYPOGRAPHY.textNote.fontSize,
                        fontWeight: 500
                      }}>
                        {user.status === 'enabled' ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleEdit(user)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '18px',
                            color: COLORS.primary,
                            padding: '4px'
                          }}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '18px',
                            color: '#dc3545',
                            padding: '4px'
                          }}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowAddModal(false)}
          >
            <div
              style={{
                backgroundColor: COLORS.white,
                padding: '32px',
                borderRadius: '8px',
                width: '90%',
                maxWidth: '500px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{
                color: COLORS.primary,
                fontSize: '20px',
                fontFamily: TYPOGRAPHY.fontFamily,
                fontWeight: 500,
                marginTop: 0,
                marginBottom: '24px'
              }}>
                {editingItem ? 'Edit User' : 'Add User'}
              </h2>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: TYPOGRAPHY.textImportant.fontSize,
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontWeight: 500,
                  color: COLORS.text
                }}>
                  Username *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '6px',
                    fontSize: TYPOGRAPHY.textImportant.fontSize,
                    fontFamily: TYPOGRAPHY.fontFamily,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: TYPOGRAPHY.textImportant.fontSize,
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontWeight: 500,
                  color: COLORS.text
                }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '6px',
                    fontSize: TYPOGRAPHY.textImportant.fontSize,
                    fontFamily: TYPOGRAPHY.fontFamily,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: TYPOGRAPHY.textImportant.fontSize,
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontWeight: 500,
                    color: COLORS.text
                  }}>
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: '6px',
                      fontSize: TYPOGRAPHY.textImportant.fontSize,
                      fontFamily: TYPOGRAPHY.fontFamily,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: TYPOGRAPHY.textImportant.fontSize,
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontWeight: 500,
                    color: COLORS.text
                  }}>
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: '6px',
                      fontSize: TYPOGRAPHY.textImportant.fontSize,
                      fontFamily: TYPOGRAPHY.fontFamily,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: TYPOGRAPHY.textImportant.fontSize,
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontWeight: 500,
                  color: COLORS.text
                }}>
                  User Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '6px',
                    fontSize: TYPOGRAPHY.textImportant.fontSize,
                    fontFamily: TYPOGRAPHY.fontFamily,
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {!editingItem && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: TYPOGRAPHY.textImportant.fontSize,
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontWeight: 500,
                    color: COLORS.text
                  }}>
                    Password *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingItem}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: '6px',
                      fontSize: TYPOGRAPHY.textImportant.fontSize,
                      fontFamily: TYPOGRAPHY.fontFamily,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: COLORS.textLight,
                    color: COLORS.white,
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: TYPOGRAPHY.textImportant.fontSize,
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontWeight: 500
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!formData.username || !formData.email || (!editingItem && !formData.password)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: (formData.username && formData.email && (editingItem || formData.password)) ? COLORS.primary : '#999',
                    color: COLORS.white,
                    border: 'none',
                    borderRadius: '6px',
                    cursor: (formData.username && formData.email && (editingItem || formData.password)) ? 'pointer' : 'not-allowed',
                    fontSize: TYPOGRAPHY.textImportant.fontSize,
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontWeight: 500
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default UserManagement;
