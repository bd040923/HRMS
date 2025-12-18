/**
 * arithwise_hrms LDAP Configuration Page
 * Copyright (C) 2024 Arithwise Inc.
 */

import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import ProtectedRoute from '../../components/ProtectedRoute';

const COLORS = {
  primary: '#78176b',
  success: '#28a745',
  white: '#ffffff',
  text: '#333333',
  textLight: '#666666',
  border: '#e0e0e0',
  warning: '#ff9800',
};

const TYPOGRAPHY = {
  fontFamily: "'Segoe UI', Arial, sans-serif",
};

const LDAPConfiguration: React.FC = () => {
  const [config, setConfig] = useState({
    enableLDAP: false,
    host: '',
    port: '389',
    encryption: 'None',
    ldapImplementation: 'OpenLDAP',
    baseDN: '',
    searchScope: 'Subtree',
    userNameAttribute: 'cn',
    userSearchFilter: '',
    userUniqueIdAttribute: 'cn',
    bindAnonymously: true,
    bindUserDN: '',
    bindUserPassword: '',
    userDNPattern: 'cn={user},dc=example,dc=org',
    dataMapping: {
      firstName: '',
      middleName: '',
      lastName: '',
      workEmail: '',
      employeeId: '',
    },
    mergeLDAPUsers: false,
    syncInterval: '1',
  });

  const handleChange = (field: string, value: any) => {
    setConfig({ ...config, [field]: value });
  };

  const handleDataMappingChange = (field: string, value: string) => {
    setConfig({
      ...config,
      dataMapping: { ...config.dataMapping, [field]: value },
    });
  };

  const handleTestConnection = () => {
    if (!config.host) {
      alert('Please enter LDAP host before testing connection.');
      return;
    }
    alert(`Testing LDAP connection to ${config.host}:${config.port}...\n\nConnection test feature coming soon!`);
  };

  const handleSave = () => {
    alert('LDAP configuration saved successfully!');
  };

  return (
    <ProtectedRoute requiredPermission="manage_users">
      <AdminLayout title="Configuration" breadcrumbs={['Admin', 'Configuration', 'LDAP Configuration']}>
        <div style={{
          backgroundColor: COLORS.white,
          padding: '32px',
          borderRadius: '8px',
          border: `1px solid ${COLORS.border}`,
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{
            marginTop: 0,
            marginBottom: '24px',
            color: COLORS.text,
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '18px',
          }}>
            LDAP Configuration
          </h2>

          {/* Warning */}
          <div style={{
            padding: '16px',
            backgroundColor: '#fff3cd',
            border: `1px solid ${COLORS.warning}`,
            borderRadius: '6px',
            marginBottom: '24px',
          }}>
            <p style={{
              margin: 0,
              color: COLORS.text,
              fontFamily: TYPOGRAPHY.fontFamily,
              fontSize: '14px',
              lineHeight: '1.6',
            }}>
              ⚠️ <strong>Warning:</strong> Enabling LDAP allows external users to access the system. Please verify your LDAP server
              configuration and user permissions before enabling. Test the connection using the "Test Connection" button to verify settings.
            </p>
          </div>

          {/* Enable LDAP */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              fontFamily: TYPOGRAPHY.fontFamily,
              fontSize: '16px',
              fontWeight: 500,
            }}>
              <input
                type="checkbox"
                checked={config.enableLDAP}
                onChange={(e) => handleChange('enableLDAP', e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                }}
              />
              Enable LDAP
            </label>
          </div>

          {/* Server Configuration */}
          <h3 style={{
            color: COLORS.primary,
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '16px',
            marginBottom: '16px',
          }}>
            Server Configuration
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontFamily: TYPOGRAPHY.fontFamily,
                fontSize: '14px',
              }}>
                Host *
              </label>
              <input
                type="text"
                value={config.host}
                onChange={(e) => handleChange('host', e.target.value)}
                placeholder="ldap.example.com"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '6px',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontFamily: TYPOGRAPHY.fontFamily,
                fontSize: '14px',
              }}>
                Port *
              </label>
              <input
                type="text"
                value={config.port}
                onChange={(e) => handleChange('port', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '6px',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontFamily: TYPOGRAPHY.fontFamily,
                fontSize: '14px',
              }}>
                Encryption
              </label>
              <select
                value={config.encryption}
                onChange={(e) => handleChange('encryption', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '6px',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  boxSizing: 'border-box',
                  backgroundColor: COLORS.white,
                }}
              >
                <option value="None">None</option>
                <option value="TLS">TLS</option>
                <option value="SSL">SSL</option>
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontFamily: TYPOGRAPHY.fontFamily,
                fontSize: '14px',
              }}>
                LDAP Implementation *
              </label>
              <select
                value={config.ldapImplementation}
                onChange={(e) => handleChange('ldapImplementation', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '6px',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  boxSizing: 'border-box',
                  backgroundColor: COLORS.white,
                }}
              >
                <option value="OpenLDAP">OpenLDAP</option>
                <option value="Active Directory">Active Directory</option>
              </select>
            </div>
          </div>

          {/* User Lookup Settings */}
          <h3 style={{
            color: COLORS.primary,
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '16px',
            marginBottom: '16px',
            marginTop: '32px',
          }}>
            User Lookup Settings
          </h3>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontFamily: TYPOGRAPHY.fontFamily,
              fontSize: '14px',
            }}>
              Base DN *
            </label>
            <input
              type="text"
              value={config.baseDN}
              onChange={(e) => handleChange('baseDN', e.target.value)}
              placeholder="dc=example,dc=org"
              style={{
                width: '100%',
                padding: '10px',
                border: `1px solid ${COLORS.border}`,
                borderRadius: '6px',
                fontFamily: TYPOGRAPHY.fontFamily,
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontFamily: TYPOGRAPHY.fontFamily,
                fontSize: '14px',
              }}>
                Search Scope
              </label>
              <select
                value={config.searchScope}
                onChange={(e) => handleChange('searchScope', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '6px',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  boxSizing: 'border-box',
                  backgroundColor: COLORS.white,
                }}
              >
                <option value="Subtree">Subtree</option>
                <option value="One Level">One Level</option>
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontFamily: TYPOGRAPHY.fontFamily,
                fontSize: '14px',
              }}>
                User Name Attribute *
              </label>
              <input
                type="text"
                value={config.userNameAttribute}
                onChange={(e) => handleChange('userNameAttribute', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '6px',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Data Mapping */}
          <h3 style={{
            color: COLORS.primary,
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '16px',
            marginBottom: '16px',
            marginTop: '32px',
          }}>
            Data Mapping
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontFamily: TYPOGRAPHY.fontFamily,
                fontSize: '14px',
              }}>
                First Name
              </label>
              <input
                type="text"
                value={config.dataMapping.firstName}
                onChange={(e) => handleDataMappingChange('firstName', e.target.value)}
                placeholder="givenName"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '6px',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontFamily: TYPOGRAPHY.fontFamily,
                fontSize: '14px',
              }}>
                Last Name
              </label>
              <input
                type="text"
                value={config.dataMapping.lastName}
                onChange={(e) => handleDataMappingChange('lastName', e.target.value)}
                placeholder="sn"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '6px',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontFamily: TYPOGRAPHY.fontFamily,
                fontSize: '14px',
              }}>
                Work Email
              </label>
              <input
                type="text"
                value={config.dataMapping.workEmail}
                onChange={(e) => handleDataMappingChange('workEmail', e.target.value)}
                placeholder="mail"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '6px',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontFamily: TYPOGRAPHY.fontFamily,
                fontSize: '14px',
              }}>
                Employee ID
              </label>
              <input
                type="text"
                value={config.dataMapping.employeeId}
                onChange={(e) => handleDataMappingChange('employeeId', e.target.value)}
                placeholder="employeeNumber"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '6px',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px' }}>
            <button
              onClick={handleTestConnection}
              style={{
                padding: '10px 24px',
                backgroundColor: 'transparent',
                color: COLORS.text,
                border: `1px solid ${COLORS.border}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: TYPOGRAPHY.fontFamily,
                fontSize: '14px',
              }}
            >
              Test Connection
            </button>
            <button
              onClick={handleSave}
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
              Save
            </button>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default LDAPConfiguration;

