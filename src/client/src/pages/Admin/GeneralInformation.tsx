/**
 * Arithwise HRM General Information Page
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
  green: '#78176b', // Using primary purple instead of green
  red: '#dc3545',
};

const TYPOGRAPHY = {
  fontFamily: "'Segoe UI', Arial, sans-serif",
  textImportant: { fontSize: '16px' },
  textNote: { fontSize: '14px' },
};

const GeneralInformation: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    organizationName: '',
    registrationNumber: '',
    taxId: '',
    phone: '',
    fax: '',
    email: '',
    addressStreet1: '',
    addressStreet2: '',
    city: '',
    stateProvince: '',
    zipPostalCode: '',
    country: '',
    numberOfEmployees: '',
    notes: '',
  });

  // Fetch organization data on component mount
  useEffect(() => {
    fetchOrganizationInfo();
  }, []);

  const fetchOrganizationInfo = async () => {
    try {
      setLoading(true);
      const data = await apiService.getOrganizationGeneralInfo();
      
      // Check if data is valid
      if (!data || typeof data !== 'object') {
        console.warn('Invalid response from API:', data);
        return; // Keep default empty form
      }
      
      setFormData({
        organizationName: data.name || '',
        registrationNumber: data.registration_number || '',
        taxId: data.tax_id || '',
        phone: data.phone || '',
        fax: data.fax || '',
        email: data.email || '',
        addressStreet1: data.street1 || '',
        addressStreet2: data.street2 || '',
        city: data.city || '',
        stateProvince: data.province || '',
        zipPostalCode: data.zip_code || '',
        country: data.country || '',
        numberOfEmployees: data.number_of_employees?.toString() || '',
        notes: data.note || '',
      });
    } catch (error: any) {
      console.error('Error fetching organization info:', error);
      // Only show alert if it's a real error, not just empty data
      if (error?.status !== 200 && error?.message) {
        alert(`Failed to load organization information: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    if (!formData.organizationName.trim()) {
      alert('Organization name is required');
      return;
    }

    try {
      const result = await apiService.updateOrganizationGeneralInfo({
        name: formData.organizationName,
        registration_number: formData.registrationNumber || undefined,
        tax_id: formData.taxId || undefined,
        phone: formData.phone || undefined,
        fax: formData.fax || undefined,
        email: formData.email || undefined,
        street1: formData.addressStreet1 || undefined,
        street2: formData.addressStreet2 || undefined,
        city: formData.city || undefined,
        province: formData.stateProvince || undefined,
        zip_code: formData.zipPostalCode || undefined,
        country: formData.country || undefined,
        note: formData.notes || undefined,
        number_of_employees: formData.numberOfEmployees ? parseInt(formData.numberOfEmployees) : undefined,
      });
      
      // Verify result is valid
      if (result && typeof result === 'object') {
        console.log('✅ Organization info saved:', result);
        setIsEditing(false);
        alert('Organization information saved successfully!');
        // Optionally refresh the data
        fetchOrganizationInfo();
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('❌ Error saving organization info:', error);
      const errorMessage = error?.message || error?.error || 'Unknown error occurred';
      alert(`Failed to save organization information: ${errorMessage}`);
    }
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
              {loading && (
                <span style={{ color: COLORS.textLight, fontSize: TYPOGRAPHY.textNote.fontSize }}>
                  Loading...
                </span>
              )}
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

