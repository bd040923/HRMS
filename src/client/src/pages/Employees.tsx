/**
 * Arithwise HRM Employee List with KYC Details
 * Copyright (C) 2024 Arithwise Inc.
 * Admin-only view showing employee basic info + KYC document details
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import BackToDashboard from '../components/BackToDashboard';

const COLORS = {
  primary: '#78176b',
  primaryHover: '#590a4f',
  lightBg: '#f9f9f9',
  white: '#ffffff',
  text: '#333333',
  textLight: '#666666',
  border: '#e0e0e0',
  success: '#28a745',
  warning: '#ffc107',
  danger: '#dc3545',
  info: '#17a2b8',
};

const TYPOGRAPHY = {
  fontFamily: "'Segoe UI', Arial, sans-serif",
  heading: { fontSize: '2rem', fontWeight: 500 },
  textImportant: { fontSize: '16px' },
  textNote: { fontSize: '14px' },
};

interface KycDocument {
  id: number;
  employee_id: number;
  document_type: string;
  file_name: string | null;
  file_url: string | null;
  upload_status: string | null;
  verification_status: string | null;
  uploaded_at: string | null;
  submitted_at: string | null;
  masked_number: string | null;
  rejection_reason: string | null;
  verified_at: string | null;
  verified_by: number | null;
}

interface EmployeeWithKyc {
  id: number;
  employee_id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  full_name: string;
  office_email: string | null;
  primary_phone: string | null;
  alternate_phone: string | null;
  personal_email: string | null;
  residential_address: string | null;
  status: string;
  kyc: {
    aadhaar: KycDocument | null;
    pan: KycDocument | null;
    bank: KycDocument | null;
    overallStatus: string;
  };
}

const Employees: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [employees, setEmployees] = useState<EmployeeWithKyc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedEmployee, setExpandedEmployee] = useState<number | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<{ kycId: number; documentType: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Redirect non-admin users
  useEffect(() => {
    if (!isAdmin()) {
      navigate('/dashboard');
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin()) {
      loadEmployees();
    }
  }, [isAdmin]);

  const loadEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getEmployeesWithKyc();
      if (response.success && response.employees) {
        setEmployees(response.employees);
      } else {
        setError('Failed to load employees');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveKyc = async (kycId: number) => {
    try {
      await apiService.verifyKyc(kycId, 'APPROVED');
      await loadEmployees();
    } catch (err: any) {
      alert(err.message || 'Failed to approve KYC');
    }
  };

  const handleRejectKyc = async () => {
    if (!showRejectModal || !rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    try {
      await apiService.verifyKyc(showRejectModal.kycId, 'REJECTED', rejectionReason);
      setShowRejectModal(null);
      setRejectionReason('');
      await loadEmployees();
    } catch (err: any) {
      alert(err.message || 'Failed to reject KYC');
    }
  };

  const maskNumber = (number: string | null | undefined): string => {
    if (!number) return 'N/A';
    if (number.length <= 4) return number;
    return '****' + number.slice(-4);
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return null;
    const statusLower = status.toLowerCase();
    let bgColor = COLORS.textLight;
    let textColor = COLORS.white;
    
    if (statusLower === 'approved') {
      bgColor = COLORS.success;
    } else if (statusLower === 'pending' || statusLower === 'submitted') {
      bgColor = COLORS.warning;
      textColor = COLORS.text;
    } else if (statusLower === 'rejected') {
      bgColor = COLORS.danger;
    } else if (statusLower === 'uploaded') {
      bgColor = COLORS.info;
    }
    
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 600,
        backgroundColor: bgColor,
        color: textColor,
      }}>
        {status}
      </span>
    );
  };

  const renderKycDocument = (doc: KycDocument | null, docType: string, docLabel: string) => {
    if (!doc) {
      return (
        <div style={{ padding: '12px', backgroundColor: COLORS.lightBg, borderRadius: '6px' }}>
          <div style={{ fontWeight: 600, marginBottom: '8px', color: COLORS.text }}>{docLabel}</div>
          <div style={{ color: COLORS.textLight, fontSize: '14px' }}>Not uploaded</div>
        </div>
      );
    }

    return (
      <div style={{ padding: '12px', backgroundColor: COLORS.lightBg, borderRadius: '6px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ fontWeight: 600, color: COLORS.text }}>{docLabel}</div>
          {getStatusBadge(doc.verification_status || doc.upload_status)}
        </div>
        
        {doc.masked_number && (
          <div style={{ marginBottom: '8px', fontSize: '14px', color: COLORS.text }}>
            <strong>Number:</strong> {maskNumber(doc.masked_number)}
          </div>
        )}
        
        {doc.file_name && (
          <div style={{ marginBottom: '8px', fontSize: '14px', color: COLORS.text }}>
            <strong>File:</strong> {doc.file_name}
            {doc.file_url && (
              <a 
                href={`http://localhost:3001${doc.file_url}`} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ marginLeft: '8px', color: COLORS.primary, textDecoration: 'none' }}
              >
                (View/Download)
              </a>
            )}
          </div>
        )}
        
        {doc.rejection_reason && (
          <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#fee', borderRadius: '4px', fontSize: '14px', color: COLORS.danger }}>
            <strong>Rejection Reason:</strong> {doc.rejection_reason}
          </div>
        )}
        
        {doc.verification_status === 'PENDING' && (
          <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handleApproveKyc(doc.id)}
              style={{
                padding: '6px 12px',
                backgroundColor: COLORS.success,
                color: COLORS.white,
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              Approve
            </button>
            <button
              onClick={() => setShowRejectModal({ kycId: doc.id, documentType: docLabel })}
              style={{
                padding: '6px 12px',
                backgroundColor: COLORS.danger,
                color: COLORS.white,
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              Reject
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderEmployeeCard = (employee: EmployeeWithKyc) => {
    const isExpanded = expandedEmployee === employee.id;
    
    return (
      <div
        key={employee.id}
        style={{
          backgroundColor: COLORS.white,
          borderRadius: '8px',
          border: `1px solid ${COLORS.border}`,
          marginBottom: '16px',
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        }}
      >
        {/* Employee Header - Always Visible */}
        <div
          onClick={() => setExpandedEmployee(isExpanded ? null : employee.id)}
          style={{
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            backgroundColor: isExpanded ? COLORS.lightBg : COLORS.white,
            transition: 'background-color 0.2s',
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: COLORS.text }}>
                {employee.full_name}
              </h3>
              {getStatusBadge(employee.kyc.overallStatus)}
            </div>
            <div style={{ fontSize: '14px', color: COLORS.textLight }}>
              <span style={{ marginRight: '16px' }}>ID: {employee.employee_id}</span>
              {employee.office_email && <span>Email: {employee.office_email}</span>}
            </div>
          </div>
          <div style={{ fontSize: '20px', color: COLORS.textLight }}>
            {isExpanded ? '▼' : '▶'}
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div style={{ padding: '20px', borderTop: `1px solid ${COLORS.border}` }}>
            {/* Basic Information */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600, color: COLORS.text }}>
                Basic Information
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: COLORS.textLight, marginBottom: '4px' }}>First Name</div>
                  <div style={{ fontSize: '14px', color: COLORS.text, fontWeight: 500 }}>{employee.first_name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: COLORS.textLight, marginBottom: '4px' }}>Last Name</div>
                  <div style={{ fontSize: '14px', color: COLORS.text, fontWeight: 500 }}>{employee.last_name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: COLORS.textLight, marginBottom: '4px' }}>Residential Address</div>
                  <div style={{ fontSize: '14px', color: COLORS.text }}>{employee.residential_address || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: COLORS.textLight, marginBottom: '4px' }}>Primary Phone</div>
                  <div style={{ fontSize: '14px', color: COLORS.text }}>{employee.primary_phone || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: COLORS.textLight, marginBottom: '4px' }}>Alternate Phone</div>
                  <div style={{ fontSize: '14px', color: COLORS.text }}>{employee.alternate_phone || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: COLORS.textLight, marginBottom: '4px' }}>Personal Email</div>
                  <div style={{ fontSize: '14px', color: COLORS.text }}>{employee.personal_email || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: COLORS.textLight, marginBottom: '4px' }}>Office Email</div>
                  <div style={{ fontSize: '14px', color: COLORS.text }}>{employee.office_email || 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* KYC Documents */}
            <div>
              <h4 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600, color: COLORS.text }}>
                KYC Documents
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {renderKycDocument(employee.kyc.aadhaar, 'aadhaar', 'Aadhaar Card')}
                {renderKycDocument(employee.kyc.pan, 'pan', 'PAN Card')}
                {renderKycDocument(employee.kyc.bank, 'bank', 'Banking Proof')}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!isAdmin()) {
    return null;
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: '100%', margin: '0', backgroundColor: COLORS.lightBg, minHeight: 'calc(100vh - 80px)' }}>
      <div style={{ marginBottom: '16px' }}>
        <BackToDashboard />
      </div>

      <h1 style={{ color: COLORS.text, marginBottom: '24px', marginTop: 0, fontSize: TYPOGRAPHY.heading.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: TYPOGRAPHY.heading.fontWeight }}>
        Employee Records
      </h1>

      {error && (
        <div style={{
          backgroundColor: '#fee',
          color: COLORS.danger,
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '16px',
          fontFamily: TYPOGRAPHY.fontFamily,
        }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight }}>
          Loading employees...
        </div>
      ) : employees.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight }}>
          No employees found
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '16px', fontSize: '14px', color: COLORS.textLight, fontFamily: TYPOGRAPHY.fontFamily }}>
            ({employees.length}) Employees Found
          </div>
          {employees.map(renderEmployeeCard)}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
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
        }} onClick={() => {
          setShowRejectModal(null);
          setRejectionReason('');
        }}>
          <div style={{
            backgroundColor: COLORS.white,
            padding: '24px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px',
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 600, color: COLORS.text }}>
              Reject {showRejectModal.documentType}
            </h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: COLORS.text }}>
                Rejection Reason <span style={{ color: COLORS.danger }}>*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '10px',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  boxSizing: 'border-box',
                  resize: 'vertical',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectionReason('');
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: COLORS.textLight,
                  color: COLORS.white,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRejectKyc}
                disabled={!rejectionReason.trim()}
                style={{
                  padding: '10px 20px',
                  backgroundColor: !rejectionReason.trim() ? '#ccc' : COLORS.danger,
                  color: COLORS.white,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: !rejectionReason.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
