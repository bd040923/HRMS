/**
 * arithwise_hrms Social Media Authentication Page
 * Copyright (C) 2024 Arithwise Inc.
 */

import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import ProtectedRoute from '../../components/ProtectedRoute';

const COLORS = {
  primary: '#78176b',
  success: '#78176b', // Using primary purple instead of green
  white: '#ffffff',
  text: '#333333',
  textLight: '#666666',
  border: '#e0e0e0',
  lightBg: '#faf3ff',
};

const TYPOGRAPHY = {
  fontFamily: "'Segoe UI', Arial, sans-serif",
};

interface Provider {
  id: number;
  name: string;
  clientId: string;
  clientSecret: string;
  enabled: boolean;
}

const SocialMediaAuth: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    clientId: '',
    clientSecret: '',
  });

  const handleAdd = () => {
    setFormData({ name: '', clientId: '', clientSecret: '' });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.clientId || !formData.clientSecret) {
      alert('Please fill in all fields');
      return;
    }

    const newProvider: Provider = {
      id: Math.max(...providers.map(p => p.id), 0) + 1,
      name: formData.name,
      clientId: formData.clientId,
      clientSecret: formData.clientSecret,
      enabled: true,
    };

    setProviders([...providers, newProvider]);
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    const provider = providers.find(p => p.id === id);
    if (window.confirm(`Are you sure you want to delete ${provider?.name}?`)) {
      setProviders(providers.filter(p => p.id !== id));
    }
  };

  return (
    <ProtectedRoute requiredPermission="manage_users">
      <AdminLayout title="Configuration" breadcrumbs={['Admin', 'Configuration', 'Social Media Authentication']}>
        <div style={{
          backgroundColor: COLORS.white,
          padding: '32px',
          borderRadius: '8px',
          border: `1px solid ${COLORS.border}`,
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <h2 style={{
              margin: 0,
              color: COLORS.text,
              fontFamily: TYPOGRAPHY.fontFamily,
              fontSize: '18px',
            }}>
              Provider List
            </h2>
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
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              + Add
            </button>
          </div>

          {providers.length === 0 ? (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: COLORS.textLight,
              fontFamily: TYPOGRAPHY.fontFamily,
            }}>
              No Records Found
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: COLORS.lightBg }}>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    borderBottom: `2px solid ${COLORS.border}`,
                  }}>
                    <input type="checkbox" />
                  </th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    borderBottom: `2px solid ${COLORS.border}`,
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontWeight: 500,
                  }}>
                    Name
                  </th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'right',
                    borderBottom: `2px solid ${COLORS.border}`,
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontWeight: 500,
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {providers.map((provider) => (
                  <tr key={provider.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <td style={{ padding: '12px' }}>
                      <input type="checkbox" />
                    </td>
                    <td style={{ padding: '12px', fontFamily: TYPOGRAPHY.fontFamily }}>
                      {provider.name}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete(provider.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '18px',
                          color: '#dc3545',
                        }}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Add Provider Modal */}
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
                  Add Social Media Provider
                </h2>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontFamily: TYPOGRAPHY.fontFamily,
                    color: COLORS.text,
                    fontWeight: 500,
                  }}>
                    Provider Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Google, Facebook, LinkedIn"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: '6px',
                      fontFamily: TYPOGRAPHY.fontFamily,
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontFamily: TYPOGRAPHY.fontFamily,
                    color: COLORS.text,
                    fontWeight: 500,
                  }}>
                    Client ID *
                  </label>
                  <input
                    type="text"
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: '6px',
                      fontFamily: TYPOGRAPHY.fontFamily,
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontFamily: TYPOGRAPHY.fontFamily,
                    color: COLORS.text,
                    fontWeight: 500,
                  }}>
                    Client Secret *
                  </label>
                  <input
                    type="password"
                    value={formData.clientSecret}
                    onChange={(e) => setFormData({ ...formData, clientSecret: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: '6px',
                      fontFamily: TYPOGRAPHY.fontFamily,
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
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
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default SocialMediaAuth;

