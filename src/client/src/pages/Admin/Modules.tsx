/**
 * arithwise_hrms Modules Configuration Page
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
};

const TYPOGRAPHY = {
  fontFamily: "'Segoe UI', Arial, sans-serif",
};

interface Module {
  id: number;
  name: string;
  enabled: boolean;
}

const Modules: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([
    { id: 1, name: 'Admin Module', enabled: true },
    { id: 2, name: 'Pim Module', enabled: true },
    { id: 3, name: 'Leave Module', enabled: true },
    { id: 4, name: 'Time Module', enabled: true },
    { id: 5, name: 'Recruitment Module', enabled: true },
    { id: 6, name: 'Performance Module', enabled: true },
    { id: 7, name: 'Directory Module', enabled: true },
    { id: 8, name: 'Maintenance Module', enabled: true },
    { id: 9, name: 'Mobile', enabled: true },
    { id: 10, name: 'Claim Module', enabled: true },
    { id: 11, name: 'Buzz', enabled: true },
  ]);

  const handleToggle = (id: number) => {
    setModules(modules.map(mod =>
      mod.id === id ? { ...mod, enabled: !mod.enabled } : mod
    ));
  };

  const handleSave = () => {
    alert('Module configuration saved successfully!');
  };

  return (
    <ProtectedRoute requiredPermission="manage_users">
      <AdminLayout title="Configuration" breadcrumbs={['Admin', 'Configuration', 'Modules']}>
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
            Module Configuration
          </h2>

          {/* Modules List */}
          <div style={{ marginBottom: '32px' }}>
            {modules.map((module) => (
              <div
                key={module.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 0',
                  borderBottom: `1px solid ${COLORS.border}`,
                }}
              >
                <span style={{
                  fontFamily: TYPOGRAPHY.fontFamily,
                  color: COLORS.text,
                  fontSize: '14px',
                }}>
                  {module.name}
                </span>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={module.enabled}
                    onChange={() => handleToggle(module.id)}
                    style={{
                      width: '40px',
                      height: '20px',
                      cursor: 'pointer',
                      accentColor: COLORS.success,
                    }}
                  />
                </label>
              </div>
            ))}
          </div>

          {/* Save Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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

export default Modules;

