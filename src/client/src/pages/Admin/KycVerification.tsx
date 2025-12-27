/**
 * Arithwise HRM KYC Verification Page (Admin Only)
 * Copyright (C) 2024 Arithwise Inc.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import AdminLayout from './AdminLayout';
import { apiService } from '../../services/api';

const COLORS = {
  primary: '#78176b',
  primaryHover: '#590a4f',
  lightBg: '#f9f9f9',
  lightBgAlt: '#f9f9f9',
  white: '#ffffff',
  text: '#333333',
  textLight: '#666666',
  border: '#e0e0e0',
  success: '#28a745',
  danger: '#dc3545',
};

const TYPOGRAPHY = {
  fontFamily: "'Segoe UI', Arial, sans-serif",
  textImportant: { fontSize: '16px' },
  textNote: { fontSize: '14px' },
};

interface KycDocument {
  id: number;
  employee_id: number;
  document_type: string;
  file_url: string;
  file_name: string;
  uploaded_at: string;
  verification_status: string;
  employee_name: string;
  employee_email: string;
  employee_code?: string;
}

const KycVerification: React.FC = () => {
  const { isAdmin } = useAuth();
  const [documents, setDocuments] = useState<KycDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<number | null>(null);
  const [rejectModal, setRejectModal] = useState<{ show: boolean; docId: number | null }>({ show: false, docId: null });
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadPendingKyc();
  }, []);

  const loadPendingKyc = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getPendingKyc();
      if (response.success && response.documents) {
        setDocuments(response.documents);
      } else {
        setDocuments([]);
      }
    } catch (err: any) {
      console.error('Error loading pending KYC:', err);
      setError(err.message || 'Failed to load pending KYC documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (docId: number) => {
    try {
      setVerifyingId(docId);
      await apiService.verifyKyc(docId, 'APPROVED');
      await loadPendingKyc();
    } catch (err: any) {
      setError(err.message || 'Failed to approve document');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal.docId || !rejectionReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    try {
      setVerifyingId(rejectModal.docId);
      await apiService.verifyKyc(rejectModal.docId, 'REJECTED', rejectionReason.trim());
      setRejectModal({ show: false, docId: null });
      setRejectionReason('');
      await loadPendingKyc();
    } catch (err: any) {
      setError(err.message || 'Failed to reject document');
    } finally {
      setVerifyingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout title="KYC Verification" breadcrumbs={['Admin', 'KYC Verification']}>
        <div style={{
          backgroundColor: COLORS.white,
          borderRadius: '8px',
          border: `1px solid ${COLORS.border}`,
          padding: '24px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <h2 style={{
              margin: 0,
              fontSize: '20px',
              fontFamily: TYPOGRAPHY.fontFamily,
              fontWeight: 600,
              color: COLORS.text
            }}>
              KYC Documents
            </h2>
            <button
              onClick={loadPendingKyc}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: `1px solid ${COLORS.border}`,
                backgroundColor: COLORS.white,
                color: COLORS.text,
                fontFamily: TYPOGRAPHY.fontFamily,
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Refresh
            </button>
          </div>

          {error && (
            <div style={{
              padding: '12px',
              backgroundColor: '#fdecea',
              color: COLORS.danger,
              borderRadius: '6px',
              marginBottom: '16px',
              fontFamily: TYPOGRAPHY.fontFamily,
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          {loading ? (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: COLORS.textLight,
              fontFamily: TYPOGRAPHY.fontFamily
            }}>
              Loading...
            </div>
          ) : documents.length === 0 ? (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: COLORS.textLight,
              fontFamily: TYPOGRAPHY.fontFamily
            }}>
              No KYC documents found
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontFamily: TYPOGRAPHY.fontFamily
              }}>
                <thead>
                  <tr style={{
                    backgroundColor: COLORS.lightBg,
                    borderBottom: `2px solid ${COLORS.border}`
                  }}>
                    <th style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: COLORS.text
                    }}>Employee</th>
                    <th style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: COLORS.text
                    }}>Document Type</th>
                    <th style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: COLORS.text
                    }}>File</th>
                    <th style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: COLORS.text
                    }}>Uploaded</th>
                    <th style={{
                      padding: '12px',
                      textAlign: 'center',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: COLORS.text
                    }}>Status</th>
                    <th style={{
                      padding: '12px',
                      textAlign: 'center',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: COLORS.text
                    }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id} style={{
                      borderBottom: `1px solid ${COLORS.border}`
                    }}>
                      <td style={{ padding: '12px' }}>
                        <div>
                          <div style={{
                            fontWeight: 500,
                            color: COLORS.text,
                            fontSize: '14px'
                          }}>
                            {doc.employee_name}
                          </div>
                          <div style={{
                            color: COLORS.textLight,
                            fontSize: '12px',
                            marginTop: '4px'
                          }}>
                            {doc.employee_code || doc.employee_email}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: COLORS.lightBg,
                          color: COLORS.primary,
                          fontSize: '12px',
                          fontWeight: 500
                        }}>
                          {doc.document_type}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: COLORS.primary,
                            textDecoration: 'none',
                            fontSize: '14px',
                            fontFamily: TYPOGRAPHY.fontFamily
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                          onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                        >
                          {doc.file_name || 'View Document'}
                        </a>
                      </td>
                      <td style={{ padding: '12px', color: COLORS.textLight, fontSize: '13px' }}>
                        {formatDate(doc.uploaded_at)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {doc.verification_status === 'APPROVED' ? (
                          <span style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            backgroundColor: '#e6f4ea',
                            color: '#1b7a3d',
                            fontSize: '12px',
                            fontWeight: 600,
                            fontFamily: TYPOGRAPHY.fontFamily
                          }}>
                            ✓ Approved
                          </span>
                        ) : doc.verification_status === 'REJECTED' ? (
                          <span style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            backgroundColor: '#fdecea',
                            color: '#c0392b',
                            fontSize: '12px',
                            fontWeight: 600,
                            fontFamily: TYPOGRAPHY.fontFamily
                          }}>
                            ✗ Rejected
                          </span>
                        ) : (
                          <span style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            backgroundColor: '#ede7f6',
                            color: COLORS.primary,
                            fontSize: '12px',
                            fontWeight: 600,
                            fontFamily: TYPOGRAPHY.fontFamily
                          }}>
                            ⏳ Pending
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {doc.verification_status === 'PENDING' ? (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              onClick={() => handleApprove(doc.id)}
                              disabled={verifyingId === doc.id}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: verifyingId === doc.id ? COLORS.border : COLORS.success,
                                color: COLORS.white,
                                fontFamily: TYPOGRAPHY.fontFamily,
                                fontSize: '13px',
                                cursor: verifyingId === doc.id ? 'not-allowed' : 'pointer',
                                fontWeight: 500
                              }}
                            >
                              {verifyingId === doc.id ? 'Processing...' : '✓ Approve'}
                            </button>
                            <button
                              onClick={() => setRejectModal({ show: true, docId: doc.id })}
                              disabled={verifyingId === doc.id}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: verifyingId === doc.id ? COLORS.border : COLORS.danger,
                                color: COLORS.white,
                                fontFamily: TYPOGRAPHY.fontFamily,
                                fontSize: '13px',
                                cursor: verifyingId === doc.id ? 'not-allowed' : 'pointer',
                                fontWeight: 500
                              }}
                            >
                              ✗ Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{
                            color: COLORS.textLight,
                            fontSize: '12px',
                            fontFamily: TYPOGRAPHY.fontFamily,
                            fontStyle: 'italic'
                          }}>
                            No actions available
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Reject Modal */}
        {rejectModal.show && (
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
          }}>
            <div style={{
              backgroundColor: COLORS.white,
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}>
              <h3 style={{
                margin: '0 0 16px 0',
                fontSize: '18px',
                fontFamily: TYPOGRAPHY.fontFamily,
                fontWeight: 600,
                color: COLORS.text
              }}>
                Reject Document
              </h3>
              <p style={{
                margin: '0 0 16px 0',
                fontSize: '14px',
                color: COLORS.textLight,
                fontFamily: TYPOGRAPHY.fontFamily
              }}>
                Please provide a reason for rejection. This will be shown to the employee.
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '12px',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '6px',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontSize: '14px',
                  resize: 'vertical',
                  marginBottom: '16px'
                }}
              />
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => {
                    setRejectModal({ show: false, docId: null });
                    setRejectionReason('');
                  }}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '6px',
                    border: `1px solid ${COLORS.border}`,
                    backgroundColor: COLORS.white,
                    color: COLORS.text,
                    fontFamily: TYPOGRAPHY.fontFamily,
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectionReason.trim() || verifyingId !== null}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: (!rejectionReason.trim() || verifyingId !== null) ? COLORS.border : COLORS.danger,
                    color: COLORS.white,
                    fontFamily: TYPOGRAPHY.fontFamily,
                    cursor: (!rejectionReason.trim() || verifyingId !== null) ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 500
                  }}
                >
                  {verifyingId !== null ? 'Processing...' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default KycVerification;

