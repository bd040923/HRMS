/**
 * Arithwise HRM User Management Page (Admin Only)
 * Copyright (C) 2024 Arithwise Inc.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminLayout from './Admin/AdminLayout';
import { apiService } from '../services/api';

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
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  // Fetch users from API on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getUsers();
        // Map API response to User interface
        const mappedUsers: User[] = data.map((u: any) => ({
          id: u.id,
          username: u.username,
          email: u.email,
          firstName: u.first_name,
          lastName: u.last_name,
          role: u.role as 'admin' | 'employee' | 'manager',
          status: (u.status === 'active' ? 'enabled' : 'disabled') as 'enabled' | 'disabled',
          employeeName: u.employee_name || `${u.first_name} ${u.last_name}`
        }));
        setUsers(mappedUsers);
      } catch (err: any) {
        console.error('Error fetching users:', err);
        setError(err.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

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

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await apiService.deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
      setSelectedItems(selectedItems.filter(i => i !== id));
      alert('User deleted successfully');
    } catch (err: any) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user: ' + (err.message || 'Unknown error'));
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

  const handleSave = async () => {
    // Validation
    if (!formData.username || !formData.email || !formData.firstName || !formData.lastName) {
      alert('Please fill in all required fields');
      return;
    }
    if (!editingItem && !formData.password) {
      alert('Password is required for new users');
      return;
    }

    try {
      if (editingItem) {
        // Update existing user
        const updateData: any = {
          username: formData.username,
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          role: formData.role,
          status: editingItem.status === 'enabled' ? 'active' : 'inactive' // Map 'enabled' to 'active' for API
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        const updated = await apiService.updateUser(editingItem.id, updateData);
        
        // Map API response back to User interface
        const updatedUser: User = {
          id: updated.id,
          username: updated.username,
          email: updated.email,
          firstName: updated.first_name,
          lastName: updated.last_name,
          role: updated.role as 'admin' | 'employee' | 'manager',
          status: updated.status === 'active' ? 'enabled' : 'disabled',
          employeeName: updated.employee_name || `${updated.first_name} ${updated.last_name}`
        };
        
        setUsers(users.map(u => u.id === editingItem.id ? updatedUser : u));
        alert('User updated successfully');
      } else {
        // Create new user
        const newUser = await apiService.createUser({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName,
          role: formData.role,
          status: 'active'
        });
        
        // Map API response back to User interface
        const mappedUser: User = {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          firstName: newUser.first_name,
          lastName: newUser.last_name,
          role: newUser.role as 'admin' | 'employee' | 'manager',
          status: newUser.status === 'active' ? 'enabled' : 'disabled',
          employeeName: newUser.employee_name || `${newUser.first_name} ${newUser.last_name}`
        };
        
        setUsers([...users, mappedUser]);
        alert('User created successfully');
      }
      
      setShowAddModal(false);
      setFormData({ username: '', email: '', firstName: '', lastName: '', role: 'employee', password: '', employeeName: '' });
      setEditingItem(null);
    } catch (err: any) {
      console.error('Error saving user:', err);
      alert('Failed to save user: ' + (err.message || 'Unknown error'));
    }
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

  if (loading) {
    return (
      <ProtectedRoute requiredRole="admin">
        <AdminLayout title="System Users" breadcrumbs={['Admin']}>
          <div style={{ padding: '40px', textAlign: 'center', fontFamily: TYPOGRAPHY.fontFamily }}>
            <div>Loading users...</div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requiredRole="admin">
        <AdminLayout title="System Users" breadcrumbs={['Admin']}>
          <div style={{ padding: '40px', textAlign: 'center', fontFamily: TYPOGRAPHY.fontFamily }}>
            <div style={{ color: '#dc3545' }}>Error: {error}</div>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '16px',
                padding: '8px 16px',
                backgroundColor: COLORS.primary,
                color: COLORS.white,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        </AdminLayout>
      </ProtectedRoute>
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
