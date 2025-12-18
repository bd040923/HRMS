/**
 * Arithwise HRM General Information Page
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
  green: '#76c043',
  red: '#dc3545',
};

const TYPOGRAPHY = {
  fontFamily: "'Segoe UI', Arial, sans-serif",
  textImportant: { fontSize: '16px' },
  textNote: { fontSize: '14px' },
};

const GeneralInformation: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: 'arithwise_hrms',
    registrationNumber: '1234',
    taxId: '5678',
    phone: '0123456789',
    fax: '9101',
    email: 'info@orangehrm.com',
    addressStreet1: '538 Teal Plaza',
    addressStreet2: 'Mysore',
    city: 'Secaucus',
    stateProvince: 'NJ',
    zipPostalCode: '51217',
    country: 'United States',
    numberOfEmployees: '122',
    notes: 'HRM Software',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    // Here you would save to backend
    setIsEditing(false);
    // Show success message
    alert('Organization information saved successfully!');
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  return (
    <ProtectedRoute requiredPermission="manage_departments">
      <AdminLayout title="General Information" breadcrumbs={['Admin', 'Organization']}>
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
            padding: '24px',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: `1px solid ${COLORS.border}`,
            }}>
              <h2 style={{
                color: COLORS.primary,
                fontSize: '1.25rem',
                fontFamily: TYPOGRAPHY.fontFamily,
                fontWeight: 500,
                margin: 0,
              }}>
                General Information
              </h2>
              {!isEditing && (
                <button
                  onClick={handleEdit}
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
              )}
            </div>

            {/* Form */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Organization Name */}
              <div style={{ gridColumn: '1' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontSize: TYPOGRAPHY.textNote.fontSize,
                  color: COLORS.textLight,
                }}>
                  Organization Name*
                </label>
                <input
                  type="text"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '4px',
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontSize: TYPOGRAPHY.textImportant.fontSize,
                    backgroundColor: isEditing ? COLORS.white : '#f0f0f5',
                  }}
                />
              </div>

              {/* Number of Employees */}
              <div style={{ gridColumn: '2' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontSize: TYPOGRAPHY.textNote.fontSize,
                  color: COLORS.textLight,
                }}>
                  Number of Employees
                </label>
                <input
                  type="text"
                  name="numberOfEmployees"
                  value={formData.numberOfEmployees}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '4px',
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontSize: TYPOGRAPHY.textImportant.fontSize,
                    backgroundColor: isEditing ? COLORS.white : '#f0f0f5',
                  }}
                />
              </div>

              {/* Registration Number */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontSize: TYPOGRAPHY.textNote.fontSize,
                  color: COLORS.textLight,
                }}>
                  Registration Number
                </label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '4px',
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontSize: TYPOGRAPHY.textImportant.fontSize,
                    backgroundColor: isEditing ? COLORS.white : '#f0f0f5',
                  }}
                />
              </div>

              {/* Tax ID */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontSize: TYPOGRAPHY.textNote.fontSize,
                  color: COLORS.textLight,
                }}>
                  Tax ID
                </label>
                <input
                  type="text"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '4px',
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontSize: TYPOGRAPHY.textImportant.fontSize,
                    backgroundColor: isEditing ? COLORS.white : '#f0f0f5',
                  }}
                />
              </div>

              {/* Phone */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontSize: TYPOGRAPHY.textNote.fontSize,
                  color: COLORS.textLight,
                }}>
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '4px',
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontSize: TYPOGRAPHY.textImportant.fontSize,
                    backgroundColor: isEditing ? COLORS.white : '#f0f0f5',
                  }}
                />
              </div>

              {/* Fax */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontSize: TYPOGRAPHY.textNote.fontSize,
                  color: COLORS.textLight,
                }}>
                  Fax
                </label>
                <input
                  type="text"
                  name="fax"
                  value={formData.fax}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '4px',
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontSize: TYPOGRAPHY.textImportant.fontSize,
                    backgroundColor: isEditing ? COLORS.white : '#f0f0f5',
                  }}
                />
              </div>

              {/* Email */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontSize: TYPOGRAPHY.textNote.fontSize,
                  color: COLORS.textLight,
                }}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '4px',
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontSize: TYPOGRAPHY.textImportant.fontSize,
                    backgroundColor: isEditing ? COLORS.white : '#f0f0f5',
                  }}
                />
              </div>

              {/* Address Street 1 */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontSize: TYPOGRAPHY.textNote.fontSize,
                  color: COLORS.textLight,
                }}>
                  Address Street 1
                </label>
                <input
                  type="text"
                  name="addressStreet1"
                  value={formData.addressStreet1}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '4px',
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontSize: TYPOGRAPHY.textImportant.fontSize,
                    backgroundColor: isEditing ? COLORS.white : '#f0f0f5',
                  }}
                />
              </div>

              {/* Address Street 2 */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontSize: TYPOGRAPHY.textNote.fontSize,
                  color: COLORS.textLight,
                }}>
                  Address Street 2
                </label>
                <input
                  type="text"
                  name="addressStreet2"
                  value={formData.addressStreet2}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '4px',
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontSize: TYPOGRAPHY.textImportant.fontSize,
                    backgroundColor: isEditing ? COLORS.white : '#f0f0f5',
                  }}
                />
              </div>

              {/* City */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontSize: TYPOGRAPHY.textNote.fontSize,
                  color: COLORS.textLight,
                }}>
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '4px',
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontSize: TYPOGRAPHY.textImportant.fontSize,
                    backgroundColor: isEditing ? COLORS.white : '#f0f0f5',
                  }}
                />
              </div>

              {/* State/Province */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontSize: TYPOGRAPHY.textNote.fontSize,
                  color: COLORS.textLight,
                }}>
                  State/Province
                </label>
                <input
                  type="text"
                  name="stateProvince"
                  value={formData.stateProvince}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '4px',
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontSize: TYPOGRAPHY.textImportant.fontSize,
                    backgroundColor: isEditing ? COLORS.white : '#f0f0f5',
                  }}
                />
              </div>

              {/* Zip/Postal Code */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontSize: TYPOGRAPHY.textNote.fontSize,
                  color: COLORS.textLight,
                }}>
                  Zip/Postal Code
                </label>
                <input
                  type="text"
                  name="zipPostalCode"
                  value={formData.zipPostalCode}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '4px',
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontSize: TYPOGRAPHY.textImportant.fontSize,
                    backgroundColor: isEditing ? COLORS.white : '#f0f0f5',
                  }}
                />
              </div>

              {/* Country */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontSize: TYPOGRAPHY.textNote.fontSize,
                  color: COLORS.textLight,
                }}>
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '4px',
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontSize: TYPOGRAPHY.textImportant.fontSize,
                    backgroundColor: isEditing ? COLORS.white : '#f0f0f5',
                  }}
                />
              </div>

              {/* Notes */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontSize: TYPOGRAPHY.textNote.fontSize,
                  color: COLORS.textLight,
                }}>
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '4px',
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontSize: TYPOGRAPHY.textImportant.fontSize,
                    backgroundColor: isEditing ? COLORS.white : '#f0f0f5',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>

            {/* Required note */}
            <div style={{
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: `1px solid ${COLORS.border}`,
              color: COLORS.textLight,
              fontSize: TYPOGRAPHY.textNote.fontSize,
              fontFamily: TYPOGRAPHY.fontFamily,
            }}>
              * Required
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                marginTop: '24px',
              }}>
                <button
                  onClick={() => setIsEditing(false)}
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
            )}
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default GeneralInformation;

