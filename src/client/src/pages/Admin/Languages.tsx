/**
 * Arithwise HRM Languages Management Page
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

interface Language {
  id: number;
  name: string;
}

const Languages: React.FC = () => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Language | null>(null);
  const [formData, setFormData] = useState({ name: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    setLoading(true);
    try {
      const data = await apiService.getLanguages();
      setLanguages(data || []);
    } catch (error) {
      console.error('Error fetching languages:', error);
      alert('Failed to load languages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedItems(languages.map(l => l.id));
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
    if (window.confirm('Are you sure you want to delete this language?')) {
      try {
        await apiService.deleteLanguage(id);
        setLanguages(languages.filter(l => l.id !== id));
        setSelectedItems(selectedItems.filter(i => i !== id));
        alert('Language deleted successfully!');
      } catch (error: any) {
        console.error('Error deleting language:', error);
        alert(`Failed to delete language: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ name: '' });
    setShowAddModal(true);
  };

  const handleEdit = (item: Language) => {
    setEditingItem(item);
    setFormData({ name: item.name });
    setShowAddModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Language name is required');
      return;
    }
    
    try {
      if (editingItem) {
        const updated = await apiService.updateLanguage(editingItem.id, {
          name: formData.name
        });
        setLanguages(languages.map(l => l.id === editingItem.id ? updated : l));
        alert('Language updated successfully!');
      } else {
        const newLanguage = await apiService.createLanguage({
          name: formData.name
        });
        setLanguages([...languages, newLanguage]);
        alert('Language created successfully!');
      }
      setShowAddModal(false);
      setFormData({ name: '' });
    } catch (error: any) {
      console.error('Error saving language:', error);
      alert(`Failed to save language: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <ProtectedRoute requiredPermission="view_employees">
      <AdminLayout title="Languages" breadcrumbs={['Admin', 'Qualifications']}>
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
              Languages
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
            ({languages.length}) Records Found
          </div>

          {/* Table */}
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
                      checked={selectedItems.length === languages.length && languages.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, fontWeight: 500, color: COLORS.text }}>
                    Name
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, fontWeight: 500, color: COLORS.text }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} style={{ padding: '40px', textAlign: 'center', color: COLORS.textLight }}>
                      Loading languages...
                    </td>
                  </tr>
                ) : languages.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ padding: '40px', textAlign: 'center', color: COLORS.textLight }}>
                      No languages found. Click "Add" to create a new language.
                    </td>
                  </tr>
                ) : (
                  languages.map(language => (
                    <tr key={language.id} style={{ borderBottom: `1px solid ${COLORS.border}`, backgroundColor: COLORS.white }}>
                      <td style={{ padding: '16px' }}>
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(language.id)}
                          onChange={() => handleSelectItem(language.id)}
                        />
                      </td>
                      <td style={{ padding: '16px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, color: COLORS.text }}>
                        {language.name}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleDelete(language.id)}
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
                            onClick={() => handleEdit(language)}
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
                  ))
                )}
              </tbody>
            </table>
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
                  {editingItem ? 'Edit Language' : 'Add Language'}
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
                    placeholder="Enter language name"
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
                    style={{
                      padding: '10px 20px',
                      backgroundColor: COLORS.primary,
                      color: COLORS.white,
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontFamily: TYPOGRAPHY.fontFamily,
                      fontSize: TYPOGRAPHY.textImportant.fontSize,
                    }}
                  >
                    Save
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

export default Languages;

