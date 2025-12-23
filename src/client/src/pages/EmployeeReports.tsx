/**
 * arithwise_hrms Employee Reports Page
 * Copyright (C) 2024 Arithwise Inc.
 */

import React, { useState } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import { useNavigate } from 'react-router-dom';

const COLORS = {
  primary: '#78176b',
  primaryHover: '#590a4f',
  lightBg: '#faf3ff',
  white: '#ffffff',
  text: '#333333',
  textLight: '#666666',
  border: '#e0e0e0',
  success: '#78176b',
  danger: '#dc3545',
};

const TYPOGRAPHY = {
  fontFamily: "'Segoe UI', Arial, sans-serif",
  heading: { fontSize: '28px', fontWeight: 600 },
  subheading: { fontSize: '20px', fontWeight: 500 },
};

interface Report {
  id: number;
  name: string;
  description: string;
  createdDate: string;
  category: string;
}

const EmployeeReports: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([
    { id: 1, name: 'Employee Attendance Report', description: 'Monthly attendance summary', createdDate: '2024-01-15', category: 'Attendance' },
    { id: 2, name: 'Employee Performance Review', description: 'Annual performance metrics', createdDate: '2024-01-16', category: 'Performance' },
    { id: 3, name: 'Leave Balance Report', description: 'Current leave balances', createdDate: '2024-01-17', category: 'Leave' },
    { id: 4, name: 'Salary Report', description: 'Salary and compensation details', createdDate: '2024-01-18', category: 'Payroll' },
    { id: 5, name: 'Training History', description: 'Employee training records', createdDate: '2024-01-19', category: 'Training' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', category: 'General' });
  const [selectedReports, setSelectedReports] = useState<number[]>([]);
  const [reportsDropdownOpen, setReportsDropdownOpen] = useState(false);

  const categories = ['General', 'Attendance', 'Performance', 'Leave', 'Payroll', 'Training'];

  const filteredReports = reports.filter(report =>
    report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingReport(null);
    setFormData({ name: '', description: '', category: 'General' });
    setShowModal(true);
  };

  const handleEdit = (report: Report) => {
    setEditingReport(report);
    setFormData({ name: report.name, description: report.description, category: report.category });
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      setReports(reports.filter(r => r.id !== id));
    }
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Please enter a report name');
      return;
    }

    if (editingReport) {
      setReports(reports.map(r =>
        r.id === editingReport.id
          ? { ...r, name: formData.name, description: formData.description, category: formData.category }
          : r
      ));
    } else {
      const newReport: Report = {
        id: Math.max(...reports.map(r => r.id), 0) + 1,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        createdDate: new Date().toISOString().split('T')[0],
      };
      setReports([...reports, newReport]);
    }
    setShowModal(false);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReports(filteredReports.map(r => r.id));
    } else {
      setSelectedReports([]);
    }
  };

  const handleSelectReport = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedReports([...selectedReports, id]);
    } else {
      setSelectedReports(selectedReports.filter(rid => rid !== id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedReports.length === 0) {
      alert('Please select reports to delete');
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${selectedReports.length} report(s)?`)) {
      setReports(reports.filter(r => !selectedReports.includes(r.id)));
      setSelectedReports([]);
    }
  };

  const handleRunReport = (report: Report) => {
    alert(`Running report: ${report.name}\n\nCategory: ${report.category}\nThis will generate and download the report.`);
  };

  return (
    <ProtectedRoute requiredPermission="view_reports">
      <div style={{ padding: '24px', backgroundColor: COLORS.lightBg, minHeight: '100vh' }}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '10px 20px',
            backgroundColor: COLORS.text,
            color: COLORS.white,
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontFamily: TYPOGRAPHY.fontFamily,
            marginBottom: '16px',
          }}
        >
          ← Back to Dashboard
        </button>

        <h1 style={{ color: COLORS.primary, fontFamily: TYPOGRAPHY.fontFamily, ...TYPOGRAPHY.heading }}>
          Employee Reports
        </h1>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          borderBottom: `2px solid ${COLORS.border}`,
        }}>
          <button
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              color: COLORS.textLight,
              border: 'none',
              borderBottom: '3px solid transparent',
              cursor: 'pointer',
              fontFamily: TYPOGRAPHY.fontFamily,
              fontSize: '16px',
            }}
          >
            Configuration ▼
          </button>
          <button
            onClick={() => navigate('/employees')}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              color: COLORS.textLight,
              border: 'none',
              borderBottom: '3px solid transparent',
              cursor: 'pointer',
              fontFamily: TYPOGRAPHY.fontFamily,
              fontSize: '16px',
            }}
          >
            Employee List
          </button>
          <button
            onClick={() => navigate('/employees')}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              color: COLORS.textLight,
              border: 'none',
              borderBottom: '3px solid transparent',
              cursor: 'pointer',
              fontFamily: TYPOGRAPHY.fontFamily,
              fontSize: '16px',
            }}
          >
            Add Employee
          </button>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setReportsDropdownOpen(!reportsDropdownOpen)}
              style={{
                padding: '12px 24px',
                backgroundColor: COLORS.primary,
                color: COLORS.white,
                border: 'none',
                borderBottom: `3px solid ${COLORS.primaryHover}`,
                cursor: 'pointer',
                fontFamily: TYPOGRAPHY.fontFamily,
                fontSize: '16px',
                borderRadius: '6px 6px 0 0',
              }}
            >
              Reports ▼
            </button>
            {reportsDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                backgroundColor: COLORS.white,
                border: `1px solid ${COLORS.border}`,
                borderRadius: '0 8px 8px 8px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                zIndex: 100,
                minWidth: '200px',
                marginTop: '-3px',
              }}>
                <button
                  onClick={() => {
                    navigate('/reports/pim');
                    setReportsDropdownOpen(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: 'transparent',
                    color: COLORS.text,
                    border: 'none',
                    borderBottom: `1px solid ${COLORS.border}`,
                    cursor: 'pointer',
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontSize: '14px',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.lightBg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  PIM Reports
                </button>
                <button
                  onClick={() => {
                    navigate('/reports/employee');
                    setReportsDropdownOpen(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: COLORS.lightBg,
                    color: COLORS.primary,
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontSize: '14px',
                    textAlign: 'left',
                    fontWeight: 500,
                  }}
                >
                  Employee Reports
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={{
          backgroundColor: COLORS.white,
          padding: '24px',
          borderRadius: '8px',
          border: `1px solid ${COLORS.border}`,
        }}>
          {/* Search and Actions */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.text }}>
              Report Name or Category
            </label>
            <input
              type="text"
              placeholder="Type for hints..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: `1px solid ${COLORS.border}`,
                borderRadius: '6px',
                fontFamily: TYPOGRAPHY.fontFamily,
                fontSize: '14px',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginBottom: '24px' }}>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedReports([]);
              }}
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
              Reset
            </button>
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
            {selectedReports.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                style={{
                  padding: '10px 24px',
                  backgroundColor: COLORS.danger,
                  color: COLORS.white,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontFamily: TYPOGRAPHY.fontFamily,
                }}
              >
                Delete Selected ({selectedReports.length})
              </button>
            )}
          </div>

          {/* Records Count */}
          <div style={{ marginBottom: '16px', color: COLORS.textLight, fontFamily: TYPOGRAPHY.fontFamily }}>
            ({filteredReports.length}) Records Found
          </div>

          {/* Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: COLORS.lightBg }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: `2px solid ${COLORS.border}` }}>
                  <input
                    type="checkbox"
                    checked={selectedReports.length === filteredReports.length && filteredReports.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: `2px solid ${COLORS.border}`, fontFamily: TYPOGRAPHY.fontFamily }}>
                  Name
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: `2px solid ${COLORS.border}`, fontFamily: TYPOGRAPHY.fontFamily }}>
                  Category
                </th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: `2px solid ${COLORS.border}`, fontFamily: TYPOGRAPHY.fontFamily }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  <td style={{ padding: '12px' }}>
                    <input
                      type="checkbox"
                      checked={selectedReports.includes(report.id)}
                      onChange={(e) => handleSelectReport(report.id, e.target.checked)}
                    />
                  </td>
                  <td style={{ padding: '12px', fontFamily: TYPOGRAPHY.fontFamily }}>
                    <div>{report.name}</div>
                    <div style={{ fontSize: '12px', color: COLORS.textLight }}>{report.description}</div>
                  </td>
                  <td style={{ padding: '12px', fontFamily: TYPOGRAPHY.fontFamily }}>
                    <span style={{
                      padding: '4px 12px',
                      backgroundColor: COLORS.lightBg,
                      color: COLORS.primary,
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 500,
                    }}>
                      {report.category}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleEdit(report)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '18px',
                        marginRight: '8px',
                        color: '#ff9800',
                      }}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(report.id)}
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
                      onClick={() => handleRunReport(report)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '18px',
                        color: COLORS.primary,
                      }}
                      title="Run Report"
                    >
                      📄
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredReports.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: COLORS.textLight,
              fontFamily: TYPOGRAPHY.fontFamily,
            }}>
              No records found
            </div>
          )}
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
                {editingReport ? 'Edit Report' : 'Add Report'}
              </h2>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  color: COLORS.text,
                  fontWeight: 500,
                }}>
                  Report Name *
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
                  placeholder="Enter report name"
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
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '6px',
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  color: COLORS.text,
                  fontWeight: 500,
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
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                  }}
                  placeholder="Enter report description"
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
    </ProtectedRoute>
  );
};

export default EmployeeReports;
