/**
 * Arithwise HRM Employment Status Management Page
 * Copyright (C) 2024 Arithwise Inc.
 */

import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import { apiService } from '../../services/api';

const COLORS = {
  primary: '#78176b',
  primaryHover: '#590a4f',
  lightBg: '#faf3ff',
  lightBgAlt: '#fffafe',
  white: '#ffffff',
  text: '#333333',
  textLight: '#666666',
  border: '#e0e0e0',
  green: '#76c043',
  red: '#dc3545',
};

const TYPOGRAPHY = {
  fontFamily: "'Segoe UI', Arial, sans-serif",
  textImportant: { fontSize: '16px' },
  textNote: { fontSize: '14px' },
};

interface EmploymentStatusItem {
  id: number;
  name: string;
}

const EmploymentStatus: React.FC = () => {
  const [statuses, setStatuses] = useState<EmploymentStatusItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<EmploymentStatusItem | null>(null);
  const [formData, setFormData] = useState({ name: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEmploymentStatuses();
  }, []);

  const fetchEmploymentStatuses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getEmploymentStatus();
      setStatuses(data || []);
    } catch (err: any) {
      console.error('Error fetching employment statuses:', err);
      setError(err.message || 'Failed to fetch employment statuses');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedItems(statuses.map(s => s.id));
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
    if (window.confirm('Are you sure you want to delete this employment status?')) {
      try {
        await apiService.deleteEmploymentStatus(id);
        setStatuses(statuses.filter(s => s.id !== id));
        setSelectedItems(selectedItems.filter(i => i !== id));
      } catch (err: any) {
        console.error('Error deleting employment status:', err);
        alert(`Failed to delete employment status: ${err.message || 'Unknown error'}`);
      }
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ name: '' });
    setShowAddModal(true);
  };

  const handleEdit = (item: EmploymentStatusItem) => {
    setEditingItem(item);
    setFormData({ name: item.name });
    setShowAddModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Please enter an employment status name');
      return;
    }
    
    setSaving(true);
    try {
      const payload = { name: formData.name.trim() };

      if (editingItem) {
        await apiService.updateEmploymentStatus(editingItem.id, payload);
      } else {
        await apiService.createEmploymentStatus(payload);
      }
      
      await fetchEmploymentStatuses();
      setShowAddModal(false);
      setFormData({ name: '' });
      setEditingItem(null);
    } catch (err: any) {
      console.error('Error saving employment status:', err);
      alert(`Failed to save employment status: ${err.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute requiredPermission="manage_departments">
      <AdminLayout title="Employment Status" breadcrumbs={['Admin', 'Job']}>
        <div style={{
          backgroundColor: COLORS.lightBg,
          minHeight: 'calc(100vh - 200px)',
          padding: '24px',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
          }}>
            <h1 style={{
              color: COLORS.primary,
              fontSize: '1.5rem',
              fontFamily: TYPOGRAPHY.fontFamily,
              fontWeight: 500,
              margin: 0,
            }}>
              Employment Status
            </h1>
            <button
              onClick={handleAdd}
              style={{
                backgroundColor: COLORS.green,
                color: COLORS.white,
                border: 'none',
                borderRadius: '6px',
                padding: '10px 20px',
                fontSize: TYPOGRAPHY.textImportant.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              + Add
            </button>
          </div>

          {/* Records count */}
          <div style={{
            color: COLORS.textLight,
            fontSize: TYPOGRAPHY.textNote.fontSize,
            fontFamily: TYPOGRAPHY.fontFamily,
            marginBottom: '16px',
          }}>
            ({statuses.length}) Records Found
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              backgroundColor: '#fee',
              color: COLORS.red,
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '16px',
              fontFamily: TYPOGRAPHY.fontFamily,
            }}>
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div style={{
              backgroundColor: COLORS.white,
              borderRadius: '8px',
              padding: '40px',
              textAlign: 'center',
              color: COLORS.textLight,
              fontFamily: TYPOGRAPHY.fontFamily,
            }}>
              Loading employment statuses...
            </div>
          ) : statuses.length === 0 ? (
            <div style={{
              backgroundColor: COLORS.white,
              borderRadius: '8px',
              padding: '40px',
              textAlign: 'center',
              color: COLORS.textLight,
              fontFamily: TYPOGRAPHY.fontFamily,
            }}>
              No employment statuses found. Click "+ Add" to create one.
            </div>
          ) : (
            /* Table */
            <div style={{
              backgroundColor: COLORS.white,
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              overflow: 'hidden',
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: COLORS.lightBgAlt, borderBottom: `1px solid ${COLORS.border}` }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', width: '50px' }}>
                      <input
                        type="checkbox"
                        checked={selectedItems.length === statuses.length && statuses.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, fontWeight: 500, color: COLORS.text }}>
                      Employment Status
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, fontWeight: 500, color: COLORS.text }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {statuses.map(status => (
                    <tr key={status.id} style={{ borderBottom: `1px solid ${COLORS.border}`, backgroundColor: COLORS.white }}>
                      <td style={{ padding: '16px' }}>
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(status.id)}
                          onChange={() => handleSelectItem(status.id)}
                        />
                      </td>
                      <td style={{ padding: '16px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, color: COLORS.text }}>
                        {status.name}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleDelete(status.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: COLORS.textLight,
                              fontSize: '18px',
                              padding: '4px 8px',
                            }}
                            title="Delete"
                          >
                            🗑️
                          </button>
                          <button
                            onClick={() => handleEdit(status)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: COLORS.textLight,
                              fontSize: '18px',
                              padding: '4px 8px',
                            }}
                            title="Edit"
                          >
                            ✏️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

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
              zIndex: 1000,
            }}>
              <div style={{
                backgroundColor: COLORS.white,
                borderRadius: '8px',
                padding: '24px',
                width: '500px',
                maxWidth: '90%',
              }}>
                <h2 style={{
                  color: COLORS.primary,
                  fontSize: '1.25rem',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  marginBottom: '20px',
                }}>
                  {editingItem ? 'Edit Employment Status' : 'Add Employment Status'}
                </h2>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, color: COLORS.text }}>
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: '4px',
                      fontFamily: TYPOGRAPHY.fontFamily,
                      fontSize: TYPOGRAPHY.textImportant.fontSize,
                    }}
                    placeholder="Enter employment status name"
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setShowAddModal(false)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: COLORS.textLight,
                      color: COLORS.white,
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontFamily: TYPOGRAPHY.fontFamily,
                      fontSize: TYPOGRAPHY.textImportant.fontSize,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: saving ? COLORS.textLight : COLORS.primary,
                      color: COLORS.white,
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      fontFamily: TYPOGRAPHY.fontFamily,
                      fontSize: TYPOGRAPHY.textImportant.fontSize,
                    }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default EmploymentStatus;

