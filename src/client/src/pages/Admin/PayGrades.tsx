/**
 * Arithwise HRM Pay Grades Management Page
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
  green: '#78176b', // Using primary purple instead of green
  red: '#dc3545',
};

const TYPOGRAPHY = {
  fontFamily: "'Segoe UI', Arial, sans-serif",
  textImportant: { fontSize: '16px' },
  textNote: { fontSize: '14px' },
};

interface PayGrade {
  id: number;
  name: string;
  currency: string;
  min_salary?: number | null;
  max_salary?: number | null;
}

const PayGrades: React.FC = () => {
  const [payGrades, setPayGrades] = useState<PayGrade[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PayGrade | null>(null);
  const [formData, setFormData] = useState({ name: '', currency: 'United States Dollar' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPayGrades();
  }, []);

  const fetchPayGrades = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getPayGrades();
      setPayGrades(data || []);
    } catch (err: any) {
      console.error('Error fetching pay grades:', err);
      setError(err.message || 'Failed to fetch pay grades');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedItems(payGrades.map(g => g.id));
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
    if (window.confirm('Are you sure you want to delete this pay grade?')) {
      try {
        await apiService.deletePayGrade(id);
        setPayGrades(payGrades.filter(g => g.id !== id));
        setSelectedItems(selectedItems.filter(i => i !== id));
      } catch (err: any) {
        console.error('Error deleting pay grade:', err);
        alert(`Failed to delete pay grade: ${err.message || 'Unknown error'}`);
      }
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ name: '', currency: 'United States Dollar' });
    setShowAddModal(true);
  };

  const handleEdit = (item: PayGrade) => {
    setEditingItem(item);
    setFormData({ name: item.name, currency: item.currency || 'United States Dollar' });
    setShowAddModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a pay grade name');
      return;
    }
    
    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        currency: formData.currency,
        min_salary: null,
        max_salary: null
      };

      if (editingItem) {
        await apiService.updatePayGrade(editingItem.id, payload);
      } else {
        await apiService.createPayGrade(payload);
      }
      
      await fetchPayGrades();
      setShowAddModal(false);
      setFormData({ name: '', currency: 'United States Dollar' });
      setEditingItem(null);
    } catch (err: any) {
      console.error('Error saving pay grade:', err);
      alert(`Failed to save pay grade: ${err.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute requiredPermission="manage_departments">
      <AdminLayout title="Pay Grades" breadcrumbs={['Admin', 'Job']}>
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
              Pay Grades
            </h1>
            <button
              onClick={handleAdd}
              style={{
                backgroundColor: COLORS.primary,
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
            ({payGrades.length}) Records Found
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
              Loading pay grades...
            </div>
          ) : payGrades.length === 0 ? (
            <div style={{
              backgroundColor: COLORS.white,
              borderRadius: '8px',
              padding: '40px',
              textAlign: 'center',
              color: COLORS.textLight,
              fontFamily: TYPOGRAPHY.fontFamily,
            }}>
              No pay grades found. Click "+ Add" to create one.
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
                        checked={selectedItems.length === payGrades.length && payGrades.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, fontWeight: 500, color: COLORS.text }}>
                      Name
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, fontWeight: 500, color: COLORS.text }}>
                      Currency
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, fontWeight: 500, color: COLORS.text }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payGrades.map(grade => (
                    <tr key={grade.id} style={{ borderBottom: `1px solid ${COLORS.border}`, backgroundColor: COLORS.white }}>
                      <td style={{ padding: '16px' }}>
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(grade.id)}
                          onChange={() => handleSelectItem(grade.id)}
                        />
                      </td>
                      <td style={{ padding: '16px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, color: COLORS.text }}>
                        {grade.name}
                      </td>
                      <td style={{ padding: '16px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, color: COLORS.textLight }}>
                        {grade.currency || 'United States Dollar'}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleDelete(grade.id)}
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
                            onClick={() => handleEdit(grade)}
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
                  {editingItem ? 'Edit Pay Grade' : 'Add Pay Grade'}
                </h2>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, color: COLORS.text }}>
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: '4px',
                      fontFamily: TYPOGRAPHY.fontFamily,
                      fontSize: TYPOGRAPHY.textImportant.fontSize,
                    }}
                    placeholder="Enter pay grade name"
                  />
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, color: COLORS.text }}>
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: '4px',
                      fontFamily: TYPOGRAPHY.fontFamily,
                      fontSize: TYPOGRAPHY.textImportant.fontSize,
                    }}
                  >
                    <option value="United States Dollar">United States Dollar</option>
                    <option value="Euro">Euro</option>
                    <option value="British Pound">British Pound</option>
                    <option value="Indian Rupee">Indian Rupee</option>
                  </select>
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

export default PayGrades;

