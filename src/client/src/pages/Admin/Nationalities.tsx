/**
 * arithwise_hrms Nationalities Management Page
 * Copyright (C) 2024 Arithwise Inc.
 */

import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import { apiService } from '../../services/api';

const COLORS = {
  primary: '#78176b',
  success: '#78176b', // Using primary purple instead of green
  danger: '#dc3545',
  white: '#ffffff',
  text: '#333333',
  textLight: '#666666',
  border: '#e0e0e0',
  lightBg: '#faf3ff',
};

const TYPOGRAPHY = {
  fontFamily: "'Segoe UI', Arial, sans-serif",
};

interface Nationality {
  id: number;
  name: string;
}

const Nationalities: React.FC = () => {
  const [nationalities, setNationalities] = useState<Nationality[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingNationality, setEditingNationality] = useState<Nationality | null>(null);
  const [formData, setFormData] = useState({ name: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNationalities();
  }, []);

  const fetchNationalities = async () => {
    setLoading(true);
    try {
      const data = await apiService.getNationalities();
      setNationalities(data || []);
    } catch (error) {
      console.error('Error fetching nationalities:', error);
      alert('Failed to load nationalities. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(nationalities.map(n => n.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(nid => nid !== id));
    }
  };

  const handleAdd = () => {
    setEditingNationality(null);
    setFormData({ name: '' });
    setShowModal(true);
  };

  const handleEdit = (nationality: Nationality) => {
    setEditingNationality(nationality);
    setFormData({ name: nationality.name });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this nationality?')) {
      try {
        await apiService.deleteNationality(id);
        setNationalities(nationalities.filter(n => n.id !== id));
        setSelectedIds(selectedIds.filter(nid => nid !== id));
        alert('Nationality deleted successfully!');
      } catch (error: any) {
        console.error('Error deleting nationality:', error);
        alert(`Failed to delete nationality: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a nationality name');
      return;
    }

    try {
      if (editingNationality) {
        const updated = await apiService.updateNationality(editingNationality.id, {
          name: formData.name
        });
        setNationalities(nationalities.map(n => n.id === editingNationality.id ? updated : n));
        alert('Nationality updated successfully!');
      } else {
        const newNationality = await apiService.createNationality({
          name: formData.name
        });
        setNationalities([...nationalities, newNationality]);
        alert('Nationality created successfully!');
      }
      setShowModal(false);
      setFormData({ name: '' });
    } catch (error: any) {
      console.error('Error saving nationality:', error);
      alert(`Failed to save nationality: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      alert('Please select nationalities to delete');
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} nationality(ies)?`)) {
      try {
        // Delete each selected nationality
        await Promise.all(selectedIds.map(id => apiService.deleteNationality(id)));
        setNationalities(nationalities.filter(n => !selectedIds.includes(n.id)));
        setSelectedIds([]);
        alert(`${selectedIds.length} nationality(ies) deleted successfully!`);
      } catch (error: any) {
        console.error('Error deleting nationalities:', error);
        alert(`Failed to delete nationalities: ${error.message || 'Unknown error'}`);
      }
    }
  };

  return (
    <ProtectedRoute requiredPermission="view_employees">
      <AdminLayout title="Nationalities" breadcrumbs={['Admin', 'Nationalities']}>
        <div style={{
          backgroundColor: COLORS.white,
          padding: '24px',
          borderRadius: '8px',
          border: `1px solid ${COLORS.border}`,
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          {/* Header with Add Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
            <button
              onClick={handleAdd}
              style={{
                padding: '10px 24px',
                backgroundColor: COLORS.success,
                color: COLORS.white,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: TYPOGRAPHY.fontFamily,
                fontWeight: 500,
              }}
            >
              + Add
            </button>
          </div>

          {/* Delete Selected Button */}
          {selectedIds.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <button
                onClick={handleDeleteSelected}
                style={{
                  padding: '8px 16px',
                  backgroundColor: COLORS.danger,
                  color: COLORS.white,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontFamily: TYPOGRAPHY.fontFamily,
                }}
              >
                Delete Selected ({selectedIds.length})
              </button>
            </div>
          )}

          {/* Records Count */}
          <div style={{ marginBottom: '16px', color: COLORS.textLight, fontFamily: TYPOGRAPHY.fontFamily }}>
            ({nationalities.length}) Records Found
          </div>

          {/* Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: COLORS.lightBg }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: `2px solid ${COLORS.border}` }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.length === nationalities.length && nationalities.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: `2px solid ${COLORS.border}`, fontFamily: TYPOGRAPHY.fontFamily }}>
                  Nationality
                </th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: `2px solid ${COLORS.border}`, fontFamily: TYPOGRAPHY.fontFamily }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} style={{ padding: '40px', textAlign: 'center', color: COLORS.textLight, fontFamily: TYPOGRAPHY.fontFamily }}>
                    Loading nationalities...
                  </td>
                </tr>
              ) : nationalities.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: '40px', textAlign: 'center', color: COLORS.textLight, fontFamily: TYPOGRAPHY.fontFamily }}>
                    No nationalities found. Click "Add" to create a new nationality.
                  </td>
                </tr>
              ) : (
                nationalities.map((nationality) => (
                  <tr key={nationality.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <td style={{ padding: '12px' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(nationality.id)}
                        onChange={(e) => handleSelect(nationality.id, e.target.checked)}
                      />
                    </td>
                    <td style={{ padding: '12px', fontFamily: TYPOGRAPHY.fontFamily }}>
                      {nationality.name}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete(nationality.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '18px',
                          marginRight: '8px',
                          color: COLORS.danger,
                        }}
                        title="Delete"
                      >
                        🗑️
                      </button>
                      <button
                        onClick={() => handleEdit(nationality)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '18px',
                          color: '#4a90e2',
                        }}
                        title="Edit"
                      >
                        ✏️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
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
              padding: '32px',
              borderRadius: '8px',
              width: '90%',
              maxWidth: '500px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}>
              <h2 style={{
                marginTop: 0,
                marginBottom: '24px',
                color: COLORS.primary,
                fontFamily: TYPOGRAPHY.fontFamily,
              }}>
                {editingNationality ? 'Edit Nationality' : 'Add Nationality'}
              </h2>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  color: COLORS.text,
                  fontWeight: 500,
                }}>
                  Nationality Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '6px',
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                  placeholder="Enter nationality name"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: 'transparent',
                    color: COLORS.text,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontFamily: TYPOGRAPHY.fontFamily,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: COLORS.primary,
                    color: COLORS.white,
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontWeight: 500,
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

export default Nationalities;
