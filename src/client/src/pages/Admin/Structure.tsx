/**
 * Arithwise HRM Organization Structure Page
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

interface OrgUnit {
  id: number;
  name: string;
  unit_id?: string;
  level: number;
  parent_id?: number;
  children?: OrgUnit[];
}

const Structure: React.FC = () => {
  const [orgStructure, setOrgStructure] = useState<OrgUnit | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<OrgUnit | null>(null);
  const [parentUnit, setParentUnit] = useState<OrgUnit | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    unit_id: '',
    description: '',
  });

  // Fetch organization structure from API
  useEffect(() => {
    fetchOrganizationStructure();
  }, []);

  const fetchOrganizationStructure = async () => {
    try {
      setLoading(true);
      const data = await apiService.getOrganizationStructure();
      if (data) {
        setOrgStructure(data);
        // Expand root node by default
        if (data.id) {
          setExpandedNodes(new Set([data.id]));
        }
      }
    } catch (error) {
      console.error('Error fetching organization structure:', error);
      // Set default empty structure
      setOrgStructure({
        id: 1,
        name: 'arithwise_hrms',
        level: 0,
        children: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (id: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  const handleAdd = (parent: OrgUnit) => {
    setParentUnit(parent);
    setEditingUnit(null);
    setFormData({ name: '', unit_id: '', description: '' });
    setShowAddModal(true);
  };

  const handleEdit = (unit: OrgUnit) => {
    setEditingUnit(unit);
    setParentUnit(null);
    setFormData({
      name: unit.name,
      unit_id: unit.unit_id || '',
      description: '',
    });
    setShowAddModal(true);
  };

  const handleDelete = async (unit: OrgUnit) => {
    if (window.confirm(`Are you sure you want to delete "${unit.name}"? This will also delete all child units.`)) {
      try {
        await apiService.deleteOrganizationUnit(unit.id);
        alert('Unit deleted successfully');
        fetchOrganizationStructure();
      } catch (error: any) {
        console.error('Error deleting unit:', error);
        alert(`Failed to delete unit: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Unit name is required');
      return;
    }

    try {
      if (editingUnit) {
        // Update existing unit
        await apiService.updateOrganizationUnit(editingUnit.id, {
          name: formData.name,
          unit_id: formData.unit_id || undefined,
          description: formData.description || undefined,
          parent_id: editingUnit.parent_id,
          level: editingUnit.level,
        });
        alert('Unit updated successfully');
      } else {
        // Create new unit
        await apiService.createOrganizationUnit({
          name: formData.name,
          unit_id: formData.unit_id || undefined,
          description: formData.description || undefined,
          parent_id: parentUnit?.id,
          level: (parentUnit?.level || 0) + 1,
        });
        alert('Unit created successfully');
      }
      setShowAddModal(false);
      setFormData({ name: '', unit_id: '', description: '' });
      fetchOrganizationStructure();
    } catch (error: any) {
      console.error('Error saving unit:', error);
      alert(`Failed to save unit: ${error.message || 'Unknown error'}`);
    }
  };

  const renderOrgUnit = (unit: OrgUnit, depth: number = 0): React.ReactNode => {
    const hasChildren = unit.children && unit.children.length > 0;
    const isExpanded = expandedNodes.has(unit.id);
    const indent = depth * 30;

    return (
      <div key={unit.id}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px',
            paddingLeft: `${16 + indent}px`,
            backgroundColor: depth === 0 ? COLORS.lightBgAlt : COLORS.white,
            borderBottom: `1px solid ${COLORS.border}`,
            position: 'relative',
          }}
        >
          {/* Connector lines */}
          {depth > 0 && (
            <>
              <div
                style={{
                  position: 'absolute',
                  left: `${indent - 15}px`,
                  top: 0,
                  bottom: '50%',
                  width: '1px',
                  backgroundColor: COLORS.primary,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: `${indent - 15}px`,
                  top: '50%',
                  width: '15px',
                  height: '1px',
                  backgroundColor: COLORS.primary,
                }}
              />
            </>
          )}

          {/* Expand/Collapse button */}
          {hasChildren && (
            <button
              onClick={() => toggleNode(unit.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                marginRight: '8px',
                fontSize: '14px',
                color: COLORS.text,
              }}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}

          {!hasChildren && <span style={{ width: '22px', display: 'inline-block' }} />}

          {/* Unit name */}
          <span
            style={{
              fontFamily: TYPOGRAPHY.fontFamily,
              fontSize: TYPOGRAPHY.textImportant.fontSize,
              color: depth === 0 ? COLORS.primary : COLORS.text,
              fontWeight: depth === 0 ? 600 : 400,
              flex: 1,
            }}
          >
            {unit.unit_id ? `${unit.unit_id}: ${unit.name}` : unit.name}
          </span>

          {/* Edit mode actions */}
          {isEditing && (
            <div style={{ display: 'flex', gap: '8px', marginLeft: '12px' }}>
              <button
                onClick={() => handleAdd(unit)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: COLORS.green,
                  fontSize: '18px',
                  padding: '4px 8px',
                  title: 'Add Child Unit',
                }}
                title="Add Child Unit"
              >
                +
              </button>
              {depth > 0 && (
                <>
                  <button
                    onClick={() => handleEdit(unit)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: COLORS.primary,
                      fontSize: '18px',
                      padding: '4px 8px',
                    }}
                    title="Edit Unit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(unit)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: COLORS.red,
                      fontSize: '18px',
                      padding: '4px 8px',
                    }}
                    title="Delete Unit"
                  >
                    🗑️
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && unit.children!.map(child => renderOrgUnit(child, depth + 1))}
      </div>
    );
  };

  return (
    <ProtectedRoute requiredPermission="manage_departments">
      <AdminLayout title="Organization Structure" breadcrumbs={['Admin', 'Organization']}>
        <div style={{
          backgroundColor: COLORS.lightBg,
          minHeight: 'calc(100vh - 200px)',
          padding: '24px',
        }}>
          {/* Card */}
          <div style={{
            backgroundColor: COLORS.white,
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 24px',
              borderBottom: `1px solid ${COLORS.border}`,
              backgroundColor: COLORS.lightBgAlt,
            }}>
              <h2 style={{
                color: COLORS.primary,
                fontSize: '1.25rem',
                fontFamily: TYPOGRAPHY.fontFamily,
                fontWeight: 500,
                margin: 0,
              }}>
                Organization Structure
              </h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: COLORS.white,
                  color: COLORS.primary,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontSize: TYPOGRAPHY.textNote.fontSize,
                }}
              >
                Edit
              </button>
            </div>

            {/* Organization Tree */}
            <div style={{ padding: '0' }}>
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: COLORS.textLight }}>
                  Loading organization structure...
                </div>
              ) : orgStructure ? (
                renderOrgUnit(orgStructure)
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: COLORS.textLight }}>
                  No organization structure found. The structure will be created automatically.
                </div>
              )}
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
                  {editingUnit ? 'Edit Organization Unit' : 'Add Organization Unit'}
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
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: TYPOGRAPHY.textImportant.fontSize,
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontWeight: 500,
                    color: COLORS.text
                  }}>
                    Unit ID
                  </label>
                  <input
                    type="text"
                    value={formData.unit_id}
                    onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}
                    placeholder="e.g., dept-001"
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
                    Description
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

                {parentUnit && (
                  <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: COLORS.lightBg, borderRadius: '6px' }}>
                    <span style={{ fontSize: TYPOGRAPHY.textNote.fontSize, color: COLORS.textLight }}>
                      Parent Unit: <strong>{parentUnit.name}</strong>
                    </span>
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
                    disabled={!formData.name.trim()}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: formData.name.trim() ? COLORS.primary : '#999',
                      color: COLORS.white,
                      border: 'none',
                      borderRadius: '6px',
                      cursor: formData.name.trim() ? 'pointer' : 'not-allowed',
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
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default Structure;

