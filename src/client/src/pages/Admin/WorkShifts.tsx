/**
 * Arithwise HRM Work Shifts Management Page
 * Copyright (C) 2024 Arithwise Inc.
 */

import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import { apiService } from '../../services/api';

const COLORS = {
  primary: '#78176b',
  primaryHover: '#590a4f',
  lightBg: '#f9f9f9',
  lightBgAlt: '#f9f9f9',
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

interface WorkShift {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  hours_per_day: number | string;
}

const WorkShifts: React.FC = () => {
  const [shifts, setShifts] = useState<WorkShift[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkShift | null>(null);
  const [formData, setFormData] = useState({ name: '', from: '09:00', to: '17:00', hoursPerDay: '8.00' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkShifts();
  }, []);

  const fetchWorkShifts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getWorkShifts();
      setShifts(data || []);
    } catch (err: any) {
      console.error('Error fetching work shifts:', err);
      setError(err.message || 'Failed to fetch work shifts');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedItems(shifts.map(s => s.id));
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
    if (window.confirm('Are you sure you want to delete this work shift?')) {
      try {
        await apiService.deleteWorkShift(id);
        setShifts(shifts.filter(s => s.id !== id));
        setSelectedItems(selectedItems.filter(i => i !== id));
      } catch (err: any) {
        console.error('Error deleting work shift:', err);
        alert(`Failed to delete work shift: ${err.message || 'Unknown error'}`);
      }
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ name: '', from: '09:00', to: '17:00', hoursPerDay: '8.00' });
    setShowAddModal(true);
  };

  const handleEdit = (item: WorkShift) => {
    setEditingItem(item);
    // API returns times in 24-hour format (HH:MM:SS or HH:MM), convert to HH:MM for input
    const from24 = item.start_time ? item.start_time.substring(0, 5) : '09:00';
    const to24 = item.end_time ? item.end_time.substring(0, 5) : '17:00';
    setFormData({ 
      name: item.name, 
      from: from24, 
      to: to24, 
      hoursPerDay: String(item.hours_per_day || '8.00')
    });
    setShowAddModal(true);
  };

  const convertTo24Hour = (time12: string): string => {
    const [time, period] = time12.split(' ');
    let [hours, minutes] = time.split(':');
    let hour = parseInt(hours);
    
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    
    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  };

  const convertTo12Hour = (time24: string): string => {
    const [hours, minutes] = time24.split(':');
    let hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    
    if (hour === 0) hour = 12;
    else if (hour > 12) hour -= 12;
    
    return `${hour.toString().padStart(2, '0')}:${minutes} ${period}`;
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a shift name');
      return;
    }
    
    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        start_time: formData.from + ':00', // Add seconds for API
        end_time: formData.to + ':00',
        hours_per_day: parseFloat(formData.hoursPerDay) || 8.0
      };

      if (editingItem) {
        await apiService.updateWorkShift(editingItem.id, payload);
      } else {
        await apiService.createWorkShift(payload);
      }
      
      await fetchWorkShifts();
      setShowAddModal(false);
      setFormData({ name: '', from: '09:00', to: '17:00', hoursPerDay: '8.00' });
      setEditingItem(null);
    } catch (err: any) {
      console.error('Error saving work shift:', err);
      alert(`Failed to save work shift: ${err.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute requiredPermission="manage_departments">
      <AdminLayout title="Work Shifts" breadcrumbs={['Admin', 'Job']}>
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
              Work Shifts
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
            ({shifts.length}) Records Found
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
              Loading work shifts...
            </div>
          ) : shifts.length === 0 ? (
            <div style={{
              backgroundColor: COLORS.white,
              borderRadius: '8px',
              padding: '40px',
              textAlign: 'center',
              color: COLORS.textLight,
              fontFamily: TYPOGRAPHY.fontFamily,
            }}>
              No work shifts found. Click "+ Add" to create one.
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
                        checked={selectedItems.length === shifts.length && shifts.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, fontWeight: 500, color: COLORS.text }}>
                      Name
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, fontWeight: 500, color: COLORS.text }}>
                      From
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, fontWeight: 500, color: COLORS.text }}>
                      To
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, fontWeight: 500, color: COLORS.text }}>
                      Hours Per Day
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, fontWeight: 500, color: COLORS.text }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {shifts.map(shift => {
                    const from12 = shift.start_time ? convertTo12Hour(shift.start_time.substring(0, 5)) : '';
                    const to12 = shift.end_time ? convertTo12Hour(shift.end_time.substring(0, 5)) : '';
                    return (
                      <tr key={shift.id} style={{ borderBottom: `1px solid ${COLORS.border}`, backgroundColor: COLORS.white }}>
                        <td style={{ padding: '16px' }}>
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(shift.id)}
                            onChange={() => handleSelectItem(shift.id)}
                          />
                        </td>
                        <td style={{ padding: '16px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, color: COLORS.text }}>
                          {shift.name}
                        </td>
                        <td style={{ padding: '16px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, color: COLORS.textLight }}>
                          {from12}
                        </td>
                        <td style={{ padding: '16px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, color: COLORS.textLight }}>
                          {to12}
                        </td>
                        <td style={{ padding: '16px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, color: COLORS.primary }}>
                          {shift.hours_per_day}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              onClick={() => handleDelete(shift.id)}
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
                              onClick={() => handleEdit(shift)}
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
                    );
                  })}
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
                  {editingItem ? 'Edit Work Shift' : 'Add Work Shift'}
                </h2>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, color: COLORS.text }}>
                    Shift Name *
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
                    placeholder="Enter shift name"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, color: COLORS.text }}>
                      From *
                    </label>
                    <input
                      type="time"
                      value={formData.from}
                      onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: '4px',
                        fontFamily: TYPOGRAPHY.fontFamily,
                        fontSize: TYPOGRAPHY.textImportant.fontSize,
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, color: COLORS.text }}>
                      To *
                    </label>
                    <input
                      type="time"
                      value={formData.to}
                      onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: '4px',
                        fontFamily: TYPOGRAPHY.fontFamily,
                        fontSize: TYPOGRAPHY.textImportant.fontSize,
                      }}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, color: COLORS.text }}>
                    Hours Per Day
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={formData.hoursPerDay}
                    onChange={(e) => setFormData({ ...formData, hoursPerDay: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: '4px',
                      fontFamily: TYPOGRAPHY.fontFamily,
                      fontSize: TYPOGRAPHY.textImportant.fontSize,
                    }}
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

export default WorkShifts;

