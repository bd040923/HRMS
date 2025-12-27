/**
 * arithwise_hrms OAuth Client Configuration Page
 * Copyright (C) 2024 Arithwise Inc.
 */

import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import ProtectedRoute from '../../components/ProtectedRoute';

const COLORS = {
  primary: '#78176b',
  success: '#78176b', // Using primary purple instead of green
  danger: '#dc3545',
  white: '#ffffff',
  text: '#333333',
  textLight: '#666666',
  border: '#e0e0e0',
  lightBg: '#f9f9f9',
};

const TYPOGRAPHY = {
  fontFamily: "'Segoe UI', Arial, sans-serif",
};

interface OAuthClient {
  id: number;
  name: string;
  redirectUri: string;
  status: 'Enabled' | 'Disabled';
}

const OAuthClient: React.FC = () => {
  const [clients, setClients] = useState<OAuthClient[]>([
    {
      id: 1,
      name: 'OrangeHRM Mobile App',
      redirectUri: 'com.orangehrm.opensource://oauthredirect',
      status: 'Enabled',
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    redirectUri: '',
    status: 'Enabled' as 'Enabled' | 'Disabled',
  });

  const handleAdd = () => {
    setFormData({ name: '', redirectUri: '', status: 'Enabled' });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.redirectUri) {
      alert('Please fill in all fields');
      return;
    }

    const newClient: OAuthClient = {
      id: Math.max(...clients.map(c => c.id), 0) + 1,
      name: formData.name,
      redirectUri: formData.redirectUri,
      status: formData.status,
    };

    setClients([...clients, newClient]);
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    const client = clients.find(c => c.id === id);
    if (window.confirm(`Are you sure you want to delete ${client?.name}?`)) {
      setClients(clients.filter(c => c.id !== id));
    }
  };

  return (
    <ProtectedRoute requiredPermission="manage_users">
      <AdminLayout title="Configuration" breadcrumbs={['Admin', 'Configuration', 'Register OAuth Client']}>
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
              OAuth Client List
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

          <div style={{ marginBottom: '16px', color: COLORS.textLight, fontFamily: TYPOGRAPHY.fontFamily }}>
            ({clients.length}) Record Found
          </div>

          {/* Table */}
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
                  textAlign: 'left',
                  borderBottom: `2px solid ${COLORS.border}`,
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontWeight: 500,
                }}>
                  Redirect URI
                </th>
                <th style={{
                  padding: '12px',
                  textAlign: 'left',
                  borderBottom: `2px solid ${COLORS.border}`,
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontWeight: 500,
                }}>
                  Status
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
              {clients.map((client) => (
                <tr key={client.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  <td style={{ padding: '12px' }}>
                    <input type="checkbox" />
                  </td>
                  <td style={{ padding: '12px', fontFamily: TYPOGRAPHY.fontFamily }}>
                    {client.name}
                  </td>
                  <td style={{ padding: '12px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '13px' }}>
                    {client.redirectUri}
                  </td>
                  <td style={{ padding: '12px', fontFamily: TYPOGRAPHY.fontFamily }}>
                    <span style={{
                      color: client.status === 'Enabled' ? COLORS.success : COLORS.danger,
                      fontWeight: 500,
                    }}>
                      {client.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleDelete(client.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '18px',
                        color: COLORS.danger,
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

          {/* Add Client Modal */}
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
                  Add OAuth Client
                </h2>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontFamily: TYPOGRAPHY.fontFamily,
                    color: COLORS.text,
                    fontWeight: 500,
                  }}>
                    Client Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    Redirect URI *
                  </label>
                  <input
                    type="text"
                    value={formData.redirectUri}
                    onChange={(e) => setFormData({ ...formData, redirectUri: e.target.value })}
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
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Enabled' | 'Disabled' })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: '6px',
                      fontFamily: TYPOGRAPHY.fontFamily,
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      backgroundColor: COLORS.white,
                    }}
                  >
                    <option value="Enabled">Enabled</option>
                    <option value="Disabled">Disabled</option>
                  </select>
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

export default OAuthClient;

