/**
 * Arithwise HRM Job Titles Management Page
 * Copyright (C) 2024 Arithwise Inc.
 */

import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import ProtectedRoute from '../../components/ProtectedRoute';

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

interface JobTitle {
  id: number;
  title: string;
  description: string;
}

const JobTitles: React.FC = () => {
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([
    { id: 1, title: 'Account Assistant', description: '' },
    { id: 2, title: 'Automaton Tester', description: '' },
    { id: 3, title: 'Chief Executive Officer', description: '' },
    { id: 4, title: 'Chief Financial Officer', description: '' },
    { id: 5, title: 'Chief Technical Officer', description: '' },
    { id: 6, title: 'Content Specialist', description: '' },
    { id: 7, title: 'Customer Success Manager', description: '' },
    { id: 8, title: 'Database Administrator', description: '' },
  ]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<JobTitle | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '' });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedItems(jobTitles.map(j => j.id));
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
    if (window.confirm('Are you sure you want to delete this job title?')) {
      setJobTitles(jobTitles.filter(j => j.id !== id));
      setSelectedItems(selectedItems.filter(i => i !== id));
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ title: '', description: '' });
    setShowAddModal(true);
  };

  const handleEdit = (item: JobTitle) => {
    setEditingItem(item);
    setFormData({ title: item.title, description: item.description });
    setShowAddModal(true);
  };

  const handleSave = () => {
    if (editingItem) {
      setJobTitles(jobTitles.map(j => 
        j.id === editingItem.id 
          ? { ...j, title: formData.title, description: formData.description }
          : j
      ));
    } else {
      const newId = Math.max(...jobTitles.map(j => j.id), 0) + 1;
      setJobTitles([...jobTitles, { id: newId, title: formData.title, description: formData.description }]);
    }
    setShowAddModal(false);
    setFormData({ title: '', description: '' });
  };

  return (
    <ProtectedRoute requiredPermission="manage_departments">
      <AdminLayout title="Job Titles" breadcrumbs={['Admin', 'Job']}>
        <div style={{
          backgroundColor: COLORS.white,
          borderRadius: '8px',
          border: `1px solid ${COLORS.border}`,
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          {/* Header with Add Button */}
          <div style={{
            padding: '20px 24px',
            borderBottom: `1px solid ${COLORS.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{
              fontSize: TYPOGRAPHY.textImportant.fontSize,
              fontFamily: TYPOGRAPHY.fontFamily,
              color: COLORS.textLight
            }}>
              ({jobTitles.length}) Records Found
            </div>
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
          </div>

          {/* Table */}
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
                      checked={selectedItems.length === jobTitles.length && jobTitles.length > 0}
                      onChange={handleSelectAll}
                      style={{ marginRight: '8px' }}
                    />
                    Job Titles
                  </th>
                  <th style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontSize: TYPOGRAPHY.textImportant.fontSize,
                    fontWeight: 500,
                    color: COLORS.text
                  }}>
                    Job Description
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
                {jobTitles.map((item) => (
                  <tr
                    key={item.id}
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
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        style={{ marginRight: '8px' }}
                      />
                      {item.title}
                    </td>
                    <td style={{
                      padding: '12px 16px',
                      fontSize: TYPOGRAPHY.textImportant.fontSize,
                      color: COLORS.textLight
                    }}>
                      {item.description || '-'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleEdit(item)}
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
                          onClick={() => handleDelete(item.id)}
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
                {editingItem ? 'Edit Job Title' : 'Add Job Title'}
              </h2>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: TYPOGRAPHY.textImportant.fontSize,
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontWeight: 500,
                  color: COLORS.text
                }}>
                  Job Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: TYPOGRAPHY.textImportant.fontSize,
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontWeight: 500,
                  color: COLORS.text
                }}>
                  Job Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '6px',
                    fontSize: TYPOGRAPHY.textImportant.fontSize,
                    fontFamily: TYPOGRAPHY.fontFamily,
                    boxSizing: 'border-box',
                    resize: 'vertical'
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
                  disabled={!formData.title}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: formData.title ? COLORS.primary : '#999',
                    color: COLORS.white,
                    border: 'none',
                    borderRadius: '6px',
                    cursor: formData.title ? 'pointer' : 'not-allowed',
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

export default JobTitles;

