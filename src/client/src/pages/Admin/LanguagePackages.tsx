/**
 * arithwise_hrms Language Packages Page
 * Copyright (C) 2024 Arithwise Inc.
 */

import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import ProtectedRoute from '../../components/ProtectedRoute';

const COLORS = {
  primary: '#78176b',
  success: '#28a745',
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

interface LanguagePackage {
  id: number;
  name: string;
}

const LanguagePackages: React.FC = () => {
  const [packages, setPackages] = useState<LanguagePackage[]>([
    { id: 1, name: 'Chinese (Simplified, China) - 中文 (简体, 中国)' },
    { id: 2, name: 'Chinese (Traditional, Taiwan) - 中文 (繁體, 台灣)' },
    { id: 3, name: 'Dutch - Nederlands' },
    { id: 4, name: 'English (United States)' },
    { id: 5, name: 'French - Français' },
    { id: 6, name: 'German - Deutsch' },
    { id: 7, name: 'Spanish (Costa Rica) - Español (Costa Rica)' },
    { id: 8, name: 'Spanish - Español' },
    { id: 9, name: 'Tamil (India) - தமிழ் (இந்தியா)' },
  ]);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(packages.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(pid => pid !== id));
    }
  };

  const handleAdd = () => {
    alert('Add language package feature coming soon!\n\nThis will allow you to upload a new language package file.');
  };

  const handleImport = (id: number) => {
    const pkg = packages.find(p => p.id === id);
    alert(`Import language package: ${pkg?.name}\n\nThis will import the translation strings.`);
  };

  const handleExport = (id: number) => {
    const pkg = packages.find(p => p.id === id);
    alert(`Export language package: ${pkg?.name}\n\nThis will download the translation file.`);
  };

  const handleDownload = (id: number) => {
    const pkg = packages.find(p => p.id === id);
    alert(`Download language package: ${pkg?.name}\n\nThis will download the language pack file.`);
  };

  const handleDelete = (id: number) => {
    const pkg = packages.find(p => p.id === id);
    if (window.confirm(`Are you sure you want to delete ${pkg?.name}?`)) {
      setPackages(packages.filter(p => p.id !== id));
      setSelectedIds(selectedIds.filter(pid => pid !== id));
    }
  };

  return (
    <ProtectedRoute requiredPermission="manage_users">
      <AdminLayout title="Configuration" breadcrumbs={['Admin', 'Configuration', 'Language Packages']}>
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
              Language Packages
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
            ({packages.length}) Records Found
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
                  <input
                    type="checkbox"
                    checked={selectedIds.length === packages.length && packages.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th style={{
                  padding: '12px',
                  textAlign: 'left',
                  borderBottom: `2px solid ${COLORS.border}`,
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontWeight: 500,
                }}>
                  Language Packages ⇅
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
              {packages.map((pkg) => (
                <tr key={pkg.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  <td style={{ padding: '12px' }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(pkg.id)}
                      onChange={(e) => handleSelect(pkg.id, e.target.checked)}
                    />
                  </td>
                  <td style={{ padding: '12px', fontFamily: TYPOGRAPHY.fontFamily }}>
                    {pkg.name}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleImport(pkg.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '18px',
                        marginRight: '8px',
                        color: COLORS.primary,
                      }}
                      title="Import"
                    >
                      📤
                    </button>
                    <button
                      onClick={() => handleExport(pkg.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '18px',
                        marginRight: '8px',
                        color: '#4a90e2',
                      }}
                      title="Export"
                    >
                      📋
                    </button>
                    <button
                      onClick={() => handleDownload(pkg.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '18px',
                        marginRight: '8px',
                        color: COLORS.success,
                      }}
                      title="Download"
                    >
                      📥
                    </button>
                    <button
                      onClick={() => handleDelete(pkg.id)}
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
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default LanguagePackages;

