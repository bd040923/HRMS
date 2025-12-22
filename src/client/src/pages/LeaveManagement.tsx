/**
 * arithwise_hrms Leave Management System
 * Copyright (C) 2024 Arithwise Inc.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const COLORS = {
  primary: '#78176b',
  success: '#76C044',
  white: '#ffffff',
  text: '#333333',
  textLight: '#666666',
  border: '#e0e0e0',
  lightBg: '#f8f9fa',
  tableBg: '#f7f7f7',
  activeTab: '#78176b',
};

const TYPOGRAPHY = {
  fontFamily: "'Segoe UI', Arial, sans-serif",
};

type ActiveSection = 'apply' | 'myLeave' | 'leaveList' | 'assignLeave' | 
                      'addEntitlements' | 'employeeEntitlements' | 'myEntitlements' |
                      'myLeaveReport' |
                      'leavePeriod' | 'leaveTypes' | 'workWeek' | 'holidays';

const LeaveManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [activeSection, setActiveSection] = useState<ActiveSection>('apply');
  const [entitlementsOpen, setEntitlementsOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [configureOpen, setConfigureOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [generateFor, setGenerateFor] = useState<'leaveType' | 'employee'>('leaveType');
  const [reportFilters, setReportFilters] = useState({
    leaveTypeId: '',
    leavePeriod: '',
    location: '',
    subUnit: '',
    jobTitle: '',
    includePast: false,
    month: '',
    year: new Date().getFullYear().toString()
  });
  const [reportData, setReportData] = useState<any[]>([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [myReportData, setMyReportData] = useState<any>(null);
  
  // Data states
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form states for Apply Leave
  const [applyForm, setApplyForm] = useState({
    leaveTypeId: '',
    fromDate: '',
    toDate: '',
    comments: ''
  });

  // Form states for Leave Types
  const [showLeaveTypeModal, setShowLeaveTypeModal] = useState(false);
  const [editingLeaveType, setEditingLeaveType] = useState<any | null>(null);
  const [leaveTypeForm, setLeaveTypeForm] = useState({
    name: '',
    description: '',
    entitlement_days: '',
    is_paid: true
  });
  // Leave entitlements (user-facing)
  const [myEntitlements, setMyEntitlements] = useState<any[]>([]);
  const [currentEmployeeId, setCurrentEmployeeId] = useState<number | null>(null);

  // Form states for Holidays
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<any | null>(null);
  const [holidayForm, setHolidayForm] = useState({
    name: '',
    date: '',
    full_day: true,
    repeats_annually: true
  });
  
  const entitlementsRef = useRef<HTMLDivElement>(null);
  const reportsRef = useRef<HTMLDivElement>(null);
  const configureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (entitlementsRef.current && !entitlementsRef.current.contains(event.target as Node)) {
        setEntitlementsOpen(false);
      }
      if (reportsRef.current && !reportsRef.current.contains(event.target as Node)) {
        setReportsOpen(false);
      }
      if (configureRef.current && !configureRef.current.contains(event.target as Node)) {
        setConfigureOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch data on mount and when activeSection changes
  useEffect(() => {
    fetchData();
  }, [activeSection]);

  const ensureEmployeeId = async (): Promise<number | null> => {
    if (currentEmployeeId) return currentEmployeeId;
    if (!user?.id) return null;
    try {
      const emp = await apiService.getEmployeeByUserId(user.id);
      if (emp?.id) {
        setCurrentEmployeeId(emp.id);
        return emp.id;
      }
    } catch (err) {
      console.error('Error fetching employee by user:', err);
    }
    return null;
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Always fetch leave types and holidays
      // Backend already filters to only return CL and EL
      const [typesData, holidaysData] = await Promise.all([
        apiService.getLeaveTypes(),
        apiService.getHolidays()
      ]);
      setLeaveTypes(typesData || []);
      setHolidays(holidaysData || []);

      // Fetch work week if viewing Work Week section
      if (activeSection === 'workWeek') {
        try {
          const workWeekData = await apiService.getWorkWeek();
          if (workWeekData) {
            setWorkWeek({
              monday: workWeekData.monday !== false,
              tuesday: workWeekData.tuesday !== false,
              wednesday: workWeekData.wednesday !== false,
              thursday: workWeekData.thursday !== false,
              friday: workWeekData.friday !== false,
              saturday: workWeekData.saturday === true,
              sunday: workWeekData.sunday === true
            });
            setWorkWeekId(workWeekData.id || null);
          }
        } catch (err) {
          console.error('Error fetching work week:', err);
        }
      }

      // Fetch leave requests if viewing My Leave or Leave List
      if (activeSection === 'myLeave' || activeSection === 'leaveList') {
        // For admin: show all leave requests when viewing Leave List
        // For regular users or admin viewing My Leave: show only their own requests
        if (isAdmin() && activeSection === 'leaveList') {
          // Admin viewing Leave List - show all
          const requestsData = await apiService.getLeaveRequests();
          setLeaveRequests(requestsData || []);
        } else {
          // Regular user or admin viewing My Leave - filter by user_id
          // The backend will automatically get employee_id from user_id
          const requestsData = await apiService.getLeaveRequests(user?.id ? { user_id: user.id } as any : undefined);
          setLeaveRequests(requestsData || []);
        }
      }

      // Fetch my entitlements when user views their entitlements
      if (activeSection === 'myEntitlements') {
        const empId = await ensureEmployeeId();
        if (empId) {
          const entData = await apiService.getLeaveEntitlements({ employee_id: empId });
          setMyEntitlements(entData || []);
        } else {
          setMyEntitlements([]);
        }
      }
    } catch (err: any) {
      console.error('Error fetching leave data:', err);
      setError(err.message || 'Failed to fetch leave data');
    } finally {
      setLoading(false);
    }
  };

  const renderNav = () => (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
      <button
        onClick={() => setActiveSection('apply')}
        style={{
          padding: '12px 24px',
          borderRadius: '6px',
          border: 'none',
          backgroundColor: activeSection === 'apply' ? COLORS.activeTab : 'transparent',
          color: activeSection === 'apply' ? COLORS.white : COLORS.textLight,
          fontFamily: TYPOGRAPHY.fontFamily,
          fontSize: '15px',
          cursor: 'pointer',
          fontWeight: 500,
        }}
      >
        Apply
      </button>

      <button
        onClick={() => setActiveSection('myLeave')}
        style={{
          padding: '12px 24px',
          borderRadius: '6px',
          border: 'none',
          backgroundColor: activeSection === 'myLeave' ? COLORS.activeTab : 'transparent',
          color: activeSection === 'myLeave' ? COLORS.white : COLORS.textLight,
          fontFamily: TYPOGRAPHY.fontFamily,
          fontSize: '15px',
          cursor: 'pointer',
          fontWeight: 500,
        }}
      >
        My Leave
      </button>

      <div ref={entitlementsRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setEntitlementsOpen(!entitlementsOpen)}
          style={{
            padding: '12px 24px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: ['addEntitlements', 'employeeEntitlements', 'myEntitlements'].includes(activeSection) ? COLORS.activeTab : 'transparent',
            color: ['addEntitlements', 'employeeEntitlements', 'myEntitlements'].includes(activeSection) ? COLORS.white : COLORS.textLight,
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '15px',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          Entitlements ▼
        </button>
        {entitlementsOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '4px',
          backgroundColor: COLORS.white,
          border: `1px solid ${COLORS.border}`,
            borderRadius: '6px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            zIndex: 100,
            minWidth: '200px',
          }}>
            {[
              { label: 'Add Entitlements', value: 'addEntitlements' as ActiveSection },
              { label: 'Employee Entitlements', value: 'employeeEntitlements' as ActiveSection },
              { label: 'My Entitlements', value: 'myEntitlements' as ActiveSection },
            ].map(item => (
              <button
                key={item.value}
                onClick={() => {
                  setActiveSection(item.value);
                  setEntitlementsOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  color: COLORS.textLight,
                  fontSize: '14px',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.lightBg}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => setActiveSection('myLeaveReport')}
          style={{
          padding: '12px 24px',
          borderRadius: '6px',
          border: 'none',
          backgroundColor: activeSection === 'myLeaveReport' ? COLORS.activeTab : 'transparent',
          color: activeSection === 'myLeaveReport' ? COLORS.white : COLORS.textLight,
            fontFamily: TYPOGRAPHY.fontFamily,
          fontSize: '15px',
          cursor: 'pointer',
          fontWeight: 500,
        }}
      >
        My Report
      </button>

      {isAdmin() && (
        <div ref={configureRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setConfigureOpen(!configureOpen)}
          style={{
              padding: '12px 24px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: ['leavePeriod', 'leaveTypes', 'workWeek', 'holidays'].includes(activeSection) ? COLORS.activeTab : 'transparent',
              color: ['leavePeriod', 'leaveTypes', 'workWeek', 'holidays'].includes(activeSection) ? COLORS.white : COLORS.textLight,
              fontFamily: TYPOGRAPHY.fontFamily,
              fontSize: '15px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Configure ▼
          </button>
        {configureOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '4px',
            backgroundColor: COLORS.white,
            border: `1px solid ${COLORS.border}`,
            borderRadius: '6px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            zIndex: 100,
            minWidth: '180px',
          }}>
            {[
              { label: 'Leave Period', value: 'leavePeriod' as ActiveSection },
              { label: 'Leave Types', value: 'leaveTypes' as ActiveSection },
              { label: 'Work Week', value: 'workWeek' as ActiveSection },
              { label: 'Holidays', value: 'holidays' as ActiveSection },
            ].map(item => (
              <button
                key={item.value}
                onClick={() => {
                  setActiveSection(item.value);
                  setConfigureOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  color: COLORS.textLight,
                  fontSize: '14px',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.lightBg}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
        </div>
      )}

      {isAdmin() && (
        <>
          <button
            onClick={() => setActiveSection('leaveList')}
            style={{
              padding: '12px 24px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeSection === 'leaveList' ? COLORS.activeTab : 'transparent',
              color: activeSection === 'leaveList' ? COLORS.white : COLORS.textLight,
              fontFamily: TYPOGRAPHY.fontFamily,
              fontSize: '15px',
              cursor: 'pointer',
                  fontWeight: 500,
            }}
          >
            Leave List
          </button>

          <button
            onClick={() => setActiveSection('assignLeave')}
            style={{
              padding: '12px 24px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeSection === 'assignLeave' ? COLORS.activeTab : 'transparent',
              color: activeSection === 'assignLeave' ? COLORS.white : COLORS.textLight,
              fontFamily: TYPOGRAPHY.fontFamily,
              fontSize: '15px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Assign Leave
          </button>
        </>
      )}
    </div>
  );

  const handleApplyLeave = async () => {
    if (!applyForm.leaveTypeId || !applyForm.fromDate || !applyForm.toDate) {
      alert('Please fill in all required fields');
      return;
    }

    if (!user?.id) {
      alert('You must be logged in to apply for leave');
      return;
    }

    try {
      // Calculate number of days
      // If from_date = to_date: 1 day
      // If from_date < to_date: (to_date - from_date) days
      // Example: 30 to 31 = 1 day, 24 to 27 = 3 days
      const from = new Date(applyForm.fromDate + 'T00:00:00');
      const to = new Date(applyForm.toDate + 'T00:00:00');
      const diffTime = to.getTime() - from.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      // If same day, it's 1 day. Otherwise, it's the difference in days
      const numberOfDays = diffDays === 0 ? 1 : diffDays;

      console.log('Applying leave with:', {
        user_id: user.id,
        leave_type_id: parseInt(applyForm.leaveTypeId),
        from_date: applyForm.fromDate,
        to_date: applyForm.toDate,
        number_of_days: numberOfDays
      });

      // The backend will automatically get employee_id from user_id
      // If user has no employee record, it will create one automatically
      await apiService.createLeaveRequest({
        user_id: user.id,
        leave_type_id: parseInt(applyForm.leaveTypeId),
        from_date: applyForm.fromDate,
        to_date: applyForm.toDate,
        number_of_days: numberOfDays,
        comments: applyForm.comments || ''
      } as any);

      alert('Leave request submitted successfully!');
      setApplyForm({ leaveTypeId: '', fromDate: '', toDate: '', comments: '' });
      await fetchData();
    } catch (err: any) {
      console.error('Error applying leave:', err);
      const errorMessage = err.message || err.error || 'Unknown error';
      alert(`Failed to apply leave: ${errorMessage}`);
    }
  };

  const renderApplyLeave = () => (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: '8px',
      border: `1px solid ${COLORS.border}`,
      padding: '32px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    }}>
      <h2 style={{
        marginTop: 0,
        marginBottom: '24px',
        fontFamily: TYPOGRAPHY.fontFamily,
                  color: COLORS.text,
        fontSize: '18px',
        fontWeight: 600,
      }}>
        Apply Leave
      </h2>

      {loading ? (
        <p style={{ fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight }}>Loading leave types...</p>
      ) : leaveTypes.length === 0 ? (
        <p style={{
          fontFamily: TYPOGRAPHY.fontFamily,
          color: COLORS.textLight,
          fontSize: '15px',
          margin: 0,
        }}>
          No Leave Types available. Please contact your administrator.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontFamily: TYPOGRAPHY.fontFamily,
              fontSize: '14px',
              color: COLORS.text,
              fontWeight: 500,
            }}>
              Leave Type *
            </label>
            <select
              value={applyForm.leaveTypeId}
              onChange={(e) => setApplyForm({ ...applyForm, leaveTypeId: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                border: `1px solid ${COLORS.border}`,
                borderRadius: '6px',
                fontFamily: TYPOGRAPHY.fontFamily,
                fontSize: '14px',
              }}
            >
              <option value="">Select Leave Type</option>
              {leaveTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name} {type.entitlement_days ? `(${type.entitlement_days} days)` : ''}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontFamily: TYPOGRAPHY.fontFamily,
                fontSize: '14px',
                color: COLORS.text,
                fontWeight: 500,
              }}>
                From Date *
              </label>
              <input
                type="date"
                value={applyForm.fromDate}
                onChange={(e) => setApplyForm({ ...applyForm, fromDate: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '6px',
                  fontFamily: TYPOGRAPHY.fontFamily,
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontFamily: TYPOGRAPHY.fontFamily,
                fontSize: '14px',
                color: COLORS.text,
                fontWeight: 500,
              }}>
                To Date *
              </label>
              <input
                type="date"
                value={applyForm.toDate}
                onChange={(e) => setApplyForm({ ...applyForm, toDate: e.target.value })}
              style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '6px',
                fontFamily: TYPOGRAPHY.fontFamily,
                }}
              />
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontFamily: TYPOGRAPHY.fontFamily,
              fontSize: '14px',
              color: COLORS.text,
                fontWeight: 500,
            }}>
              Comments
            </label>
            <textarea
              value={applyForm.comments}
              onChange={(e) => setApplyForm({ ...applyForm, comments: e.target.value })}
              rows={4}
              style={{
                width: '100%',
                padding: '10px',
                border: `1px solid ${COLORS.border}`,
                borderRadius: '6px',
                fontFamily: TYPOGRAPHY.fontFamily,
                fontSize: '14px',
                resize: 'vertical',
              }}
              placeholder="Enter any additional comments..."
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setApplyForm({ leaveTypeId: '', fromDate: '', toDate: '', comments: '' })}
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
              Reset
            </button>
            <button
              onClick={handleApplyLeave}
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
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderMyLeave = () => (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: '8px',
      border: `1px solid ${COLORS.border}`,
      padding: '32px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    }}>
      <h2 style={{
        marginTop: 0,
        marginBottom: '24px',
        fontFamily: TYPOGRAPHY.fontFamily,
        color: COLORS.text,
        fontSize: '18px',
        fontWeight: 600,
      }}>
        My Leave List
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '14px',
            color: COLORS.text,
          }}>
            From Date
            </label>
          <input
            type="date"
            defaultValue="2025-01-01"
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
            color: COLORS.text,
          }}>
            To Date
          </label>
          <input
            type="date"
            defaultValue="2025-12-31"
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
            color: COLORS.text,
          }}>
            Show Leave with Status*
          </label>
          <select style={{
            width: '100%',
            padding: '10px',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '6px',
            fontFamily: TYPOGRAPHY.fontFamily,
            backgroundColor: COLORS.white,
            boxSizing: 'border-box',
          }}>
            <option>Select</option>
              <option>Rejected</option>
            <option>Cancelled</option>
            <option>Pending Approval</option>
            <option>Scheduled</option>
            <option>Taken</option>
            </select>
        </div>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '14px',
            color: COLORS.text,
          }}>
            Leave Type
          </label>
          <select style={{
            width: '100%',
            padding: '10px',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '6px',
            fontFamily: TYPOGRAPHY.fontFamily,
            backgroundColor: COLORS.white,
            boxSizing: 'border-box',
          }}>
            <option value="">-- Select --</option>
            {leaveTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>
          </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
        {['Rejected', 'Cancelled', 'Pending Approval', 'Scheduled', 'Taken'].map(status => (
          <span key={status} style={{
            padding: '6px 12px',
            backgroundColor: COLORS.lightBg,
            color: COLORS.textLight,
            borderRadius: '16px',
            fontSize: '13px',
            fontFamily: TYPOGRAPHY.fontFamily,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            {status} <span style={{ cursor: 'pointer', fontSize: '10px' }}>✖</span>
          </span>
        ))}
      </div>

      <div style={{ marginBottom: '16px', fontSize: '12px', color: COLORS.textLight, fontFamily: TYPOGRAPHY.fontFamily }}>
        * Required
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginBottom: '24px' }}>
        <button style={{
          padding: '10px 24px',
          borderRadius: '6px',
          border: `1px solid ${COLORS.success}`,
          backgroundColor: 'transparent',
          color: COLORS.success,
          fontFamily: TYPOGRAPHY.fontFamily,
          cursor: 'pointer',
        }}>
          Reset
        </button>
        <button 
          onClick={fetchData}
              style={{
            padding: '10px 24px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: COLORS.success,
            color: COLORS.white,
                fontFamily: TYPOGRAPHY.fontFamily,
            cursor: 'pointer',
          }}
        >
          Search
        </button>
      </div>

      {loading ? (
        <p style={{ fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight }}>Loading leave requests...</p>
      ) : leaveRequests.length === 0 ? (
        <p style={{
          fontFamily: TYPOGRAPHY.fontFamily,
          color: COLORS.textLight,
          fontSize: '15px',
          marginBottom: '16px',
        }}>
          No Records Found
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: TYPOGRAPHY.fontFamily,
          }}>
            <thead>
              <tr style={{ backgroundColor: COLORS.tableBg }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: COLORS.text, borderBottom: `1px solid ${COLORS.border}` }}>
                  <input type="checkbox" />
                </th>
                {['Date', 'Leave Type', 'Number of Days', 'Status', 'Comments'].map((h) => (
                  <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: COLORS.text, borderBottom: `1px solid ${COLORS.border}` }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leaveRequests.map((request) => (
                <tr key={request.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  <td style={{ padding: '12px' }}>
                    <input type="checkbox" />
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px', color: COLORS.text }}>
                    {new Date(request.from_date).toLocaleDateString()} - {new Date(request.to_date).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px', color: COLORS.text }}>
                    {request.leave_type_name || 'N/A'}
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px', color: COLORS.text }}>
                    {request.number_of_days}
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      backgroundColor: 
                        request.status === 'approved' ? '#d4edda' :
                        request.status === 'rejected' ? '#f8d7da' :
                        request.status === 'pending' ? '#fff3cd' :
                        '#e2e3e5',
                      color:
                        request.status === 'approved' ? '#155724' :
                        request.status === 'rejected' ? '#721c24' :
                        request.status === 'pending' ? '#856404' :
                        '#383d41',
                    }}>
                      {request.status || 'pending'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px', color: COLORS.textLight }}>
                    {request.comments || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // Removed renderLeaveReport - using only My Report now
  const _renderLeaveReport = () => (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: '8px',
      border: `1px solid ${COLORS.border}`,
      padding: '32px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    }}>
      <h2 style={{
        marginTop: 0,
        marginBottom: '24px',
        fontFamily: TYPOGRAPHY.fontFamily,
        color: COLORS.text,
        fontSize: '18px',
        fontWeight: 600,
      }}>
        Leave Entitlements and Usage Report
      </h2>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          marginBottom: '12px',
          fontFamily: TYPOGRAPHY.fontFamily,
          fontSize: '14px',
          color: COLORS.text,
        }}>
          Generate For
        </label>
        <div style={{ display: 'flex', gap: '24px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input 
              type="radio" 
              name="generateFor" 
              value="leaveType" 
              checked={generateFor === 'leaveType'}
              onChange={() => setGenerateFor('leaveType')}
            />
            <span style={{ fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.text }}>Leave Type</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input 
              type="radio" 
              name="generateFor" 
              value="employee"
              checked={generateFor === 'employee'}
              onChange={() => setGenerateFor('employee')}
            />
            <span style={{ fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.text }}>Employee</span>
          </label>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '14px',
            color: COLORS.text,
          }}>
              Leave Type
            </label>
            <select
            value={reportFilters.leaveTypeId || ''}
            onChange={(e) => setReportFilters({ ...reportFilters, leaveTypeId: e.target.value })}
              style={{
                width: '100%',
              padding: '10px',
                border: `1px solid ${COLORS.border}`,
              borderRadius: '6px',
                fontFamily: TYPOGRAPHY.fontFamily,
                backgroundColor: COLORS.white,
              boxSizing: 'border-box',
            }}
          >
            <option value="">-- Select --</option>
            {leaveTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
            </select>
          </div>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
                fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '14px',
                color: COLORS.text,
          }}>
            Leave Period*
            </label>
          <select 
            value={reportFilters.leavePeriod}
            onChange={(e) => setReportFilters({ ...reportFilters, leavePeriod: e.target.value })}
              style={{
                width: '100%',
              padding: '10px',
                border: `1px solid ${COLORS.border}`,
              borderRadius: '6px',
                fontFamily: TYPOGRAPHY.fontFamily,
              backgroundColor: COLORS.white,
                boxSizing: 'border-box',
              }}
          >
            <option value="">-- Select --</option>
            {Array.from({ length: 3 }, (_, i) => {
              const year = new Date().getFullYear() - 1 + i;
              return (
                <option key={year} value={`${year}-01-01 - ${year}-12-31`}>
                  {year}-01-01 - {year}-12-31
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '14px',
            color: COLORS.text,
          }}>
            Location
          </label>
          <select style={{
            width: '100%',
            padding: '10px',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '6px',
            fontFamily: TYPOGRAPHY.fontFamily,
            backgroundColor: COLORS.white,
            boxSizing: 'border-box',
          }}>
            <option>-- Select --</option>
          </select>
        </div>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '14px',
            color: COLORS.text,
          }}>
            Sub Unit
          </label>
          <select style={{
            width: '100%',
            padding: '10px',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '6px',
            fontFamily: TYPOGRAPHY.fontFamily,
            backgroundColor: COLORS.white,
            boxSizing: 'border-box',
          }}>
            <option>-- Select --</option>
          </select>
        </div>
          </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '14px',
            color: COLORS.text,
          }}>
            Job Title
          </label>
          <select style={{
            width: '100%',
            padding: '10px',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '6px',
            fontFamily: TYPOGRAPHY.fontFamily,
            backgroundColor: COLORS.white,
            boxSizing: 'border-box',
          }}>
            <option>-- Select --</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', paddingBottom: '10px' }}>
            <input type="checkbox" style={{ width: '40px', height: '20px' }} />
            <span style={{ fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.text, fontSize: '14px' }}>Include Past Employees</span>
          </label>
        </div>
      </div>

      <div style={{ marginBottom: '16px', fontSize: '12px', color: COLORS.textLight, fontFamily: TYPOGRAPHY.fontFamily }}>
        * Required
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          onClick={async () => {
            if (!reportFilters.leavePeriod) {
              alert('Please select Leave Period');
              return;
            }
            setReportLoading(true);
            try {
              const employees = await apiService.request<any[]>('/employees');
              const year = reportFilters.leavePeriod.split('-')[0];
              const reports = await Promise.all(
                employees.map(async (emp: any) => {
                  try {
                    const report = await apiService.getEmployeeLeaveReport(emp.id, parseInt(year));
                    if (generateFor === 'leaveType' && reportFilters.leaveTypeId) {
                      const filtered = report.leave_summary?.filter((item: any) => 
                        item.leave_type_name === leaveTypes.find(lt => lt.id === parseInt(reportFilters.leaveTypeId))?.name
                      );
                      if (filtered && filtered.length > 0) {
                        return { employee: emp, report: { ...report, leave_summary: filtered } };
                      }
                      return null;
                    }
                    return { employee: emp, report };
                  } catch (err) {
                    return null;
                  }
                })
              );
              setReportData(reports.filter(r => r !== null && r.report?.leave_summary?.length > 0));
            } catch (err: any) {
              alert(`Failed to generate report: ${err.message || 'Unknown error'}`);
            } finally {
              setReportLoading(false);
            }
          }}
          disabled={reportLoading}
              style={{
            padding: '10px 32px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: reportLoading ? COLORS.border : COLORS.success,
            color: COLORS.white,
                fontFamily: TYPOGRAPHY.fontFamily,
            cursor: reportLoading ? 'not-allowed' : 'pointer',
            fontSize: '15px',
                fontWeight: 500,
          }}
        >
          {reportLoading ? 'Generating...' : 'Generate'}
        </button>
      </div>

      {reportData.length > 0 && (
        <div style={{ marginTop: '24px', padding: '20px', backgroundColor: COLORS.lightBg, borderRadius: '8px' }}>
          <h3 style={{ fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.text, marginBottom: '16px' }}>
            Report Results ({reportData.length} employees)
          </h3>
          {reportData.map((item: any, idx: number) => (
            <div key={idx} style={{ marginBottom: '20px', padding: '16px', backgroundColor: COLORS.white, borderRadius: '6px' }}>
              <h4 style={{ fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.text, marginBottom: '8px' }}>
                {item.employee?.first_name} {item.employee?.last_name}
              </h4>
              {item.report?.leave_summary && item.report.leave_summary.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: COLORS.tableBg }}>
                      <th style={{ padding: '8px', textAlign: 'left', borderBottom: `1px solid ${COLORS.border}` }}>Leave Type</th>
                      <th style={{ padding: '8px', textAlign: 'right', borderBottom: `1px solid ${COLORS.border}` }}>Entitlement</th>
                      <th style={{ padding: '8px', textAlign: 'right', borderBottom: `1px solid ${COLORS.border}` }}>Used</th>
                      <th style={{ padding: '8px', textAlign: 'right', borderBottom: `1px solid ${COLORS.border}` }}>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.report.leave_summary.map((summary: any, sIdx: number) => (
                      <tr key={sIdx} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                        <td style={{ padding: '8px' }}>{summary.leave_type_name}</td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>{summary.total_entitlement}</td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>{summary.used_days}</td>
                        <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600, color: summary.balance_days < 0 ? COLORS.danger : COLORS.text }}>
                          {summary.balance_days}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: COLORS.textLight, fontSize: '13px' }}>No leave data available</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderMyLeaveReport = () => (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: '8px',
      border: `1px solid ${COLORS.border}`,
      padding: '32px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    }}>
      <h2 style={{
        marginTop: 0,
        marginBottom: '24px',
        fontFamily: TYPOGRAPHY.fontFamily,
        color: COLORS.text,
        fontSize: '18px',
        fontWeight: 600,
      }}>
        My Leave Entitlements and Usage Report
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '14px',
            color: COLORS.text,
          }}>
            Year*
          </label>
          <select
            value={reportFilters.year}
            onChange={(e) => setReportFilters({ ...reportFilters, year: e.target.value })}
            style={{
              width: '100%',
              padding: '10px',
              border: `1px solid ${COLORS.border}`,
              borderRadius: '6px',
              fontFamily: TYPOGRAPHY.fontFamily,
              backgroundColor: COLORS.white,
              boxSizing: 'border-box',
            }}
          >
            <option value="">-- Select --</option>
            {Array.from({ length: 3 }, (_, i) => {
              const year = new Date().getFullYear() - 1 + i;
              return (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '14px',
            color: COLORS.text,
          }}>
            Month*
          </label>
          <select
            value={reportFilters.month}
            onChange={(e) => setReportFilters({ ...reportFilters, month: e.target.value })}
            style={{
              width: '100%',
              padding: '10px',
              border: `1px solid ${COLORS.border}`,
              borderRadius: '6px',
              fontFamily: TYPOGRAPHY.fontFamily,
              backgroundColor: COLORS.white,
              boxSizing: 'border-box',
            }}
          >
            <option value="">-- Select --</option>
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '16px', fontSize: '12px', color: COLORS.textLight, fontFamily: TYPOGRAPHY.fontFamily }}>
        * Required
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
        <button 
          onClick={async () => {
            if (!reportFilters.year || !reportFilters.month) {
              alert('Please select Year and Month');
              return;
            }
            if (!user?.id) {
              alert('You must be logged in');
              return;
            }
            setReportLoading(true);
            try {
              // Get employee ID by user_id using the helper endpoint
              const employee = await apiService.request<any>(`/employees/by-user/${user.id}`);
              if (!employee || !employee.id) {
                alert('Employee record not found. Please contact administrator.');
                setReportLoading(false);
                return;
              }
              
              const year = parseInt(reportFilters.year);
              const month = parseInt(reportFilters.month);
              console.log('📊 Generating report for:', { employeeId: employee.id, year, month });
              const report = await apiService.getEmployeeLeaveReport(employee.id, year, month);
              console.log('📊 Frontend received report:', report);
              
              // Normalize to { leave_summary: [...] } always
              const formattedReport = (() => {
                if (!report) return { leave_summary: [] };
                if (Array.isArray(report)) return { leave_summary: report };
                if (Array.isArray((report as any).leave_summary)) return { leave_summary: (report as any).leave_summary };
                if ((report as any).leave_type_name) return { leave_summary: [report] };
                return { leave_summary: [] };
              })();
              
              console.log('📊 Formatted report:', formattedReport);
              setMyReportData(formattedReport);
            } catch (err: any) {
              if (err.message && err.message.includes('404')) {
                alert('Employee record not found. Please contact administrator to link your account.');
              } else {
                alert(`Failed to generate report: ${err.message || 'Unknown error'}`);
              }
            } finally {
              setReportLoading(false);
            }
          }}
          disabled={reportLoading}
              style={{
            padding: '10px 32px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: reportLoading ? COLORS.border : COLORS.success,
            color: COLORS.white,
                fontFamily: TYPOGRAPHY.fontFamily,
            cursor: reportLoading ? 'not-allowed' : 'pointer',
            fontSize: '15px',
                fontWeight: 500,
          }}
        >
          {reportLoading ? 'Generating...' : 'Generate'}
        </button>
      </div>

      {myReportData && (
        <div style={{ marginTop: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <button 
              onClick={() => window.print()}
              style={{
                padding: '6px 12px',
                border: `1px solid ${COLORS.border}`,
                backgroundColor: COLORS.white,
                cursor: 'pointer',
                fontSize: '16px',
                borderRadius: '4px',
              }}
            >
              ⛶ Export
            </button>
          </div>

          <p style={{
            fontFamily: TYPOGRAPHY.fontFamily,
            color: COLORS.textLight,
            fontSize: '15px',
            marginBottom: '16px',
          }}>
            Monthly Report for {reportFilters.month && ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][parseInt(reportFilters.month) - 1]} {reportFilters.year} - ({(Array.isArray(myReportData.leave_summary) ? myReportData.leave_summary : []).length}) Records Found
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: TYPOGRAPHY.fontFamily,
            }}>
              <thead>
                <tr style={{ backgroundColor: COLORS.tableBg }}>
                  {['Leave Type', 'Leave Entitlements (Days)', 'Leave Pending Approval (Days)', 'Leave Scheduled (Days)', 'Leave Taken (Days)', 'Leave Balance (Days)'].map((h) => (
                    <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: COLORS.text, borderBottom: `1px solid ${COLORS.border}` }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(myReportData.leave_summary) ? myReportData.leave_summary : []).map((summary: any, idx: number) => {
                  const num = (v: any) => {
                    const n = Number(v);
                    return Number.isFinite(n) ? n : 0;
                  };
                  // Use backend-provided monthly data if available, otherwise calculate from leaveRequests
                  const pending = summary.monthly_pending !== undefined 
                    ? summary.monthly_pending 
                    : leaveRequests
                        .filter((lr: any) => {
                          const leaveDate = new Date(lr.from_date);
                          const selectedMonth = parseInt(reportFilters.month);
                          const selectedYear = parseInt(reportFilters.year);
                          const monthStart = new Date(selectedYear, selectedMonth - 1, 1);
                          const monthEnd = new Date(selectedYear, selectedMonth, 0);
                          return lr.leave_type_id === leaveTypes.find(lt => lt.name === summary.leave_type_name)?.id 
                            && lr.status === 'pending'
                            && leaveDate >= monthStart 
                            && leaveDate <= monthEnd;
                        })
                        .reduce((sum: number, lr: any) => sum + (lr.number_of_days || 0), 0);
                  
                  const scheduled = summary.monthly_scheduled !== undefined 
                    ? summary.monthly_scheduled 
                    : leaveRequests
                        .filter((lr: any) => {
                          const leaveDate = new Date(lr.from_date);
                          const selectedMonth = parseInt(reportFilters.month);
                          const selectedYear = parseInt(reportFilters.year);
                          const monthStart = new Date(selectedYear, selectedMonth - 1, 1);
                          const monthEnd = new Date(selectedYear, selectedMonth, 0);
                          return lr.leave_type_id === leaveTypes.find(lt => lt.name === summary.leave_type_name)?.id 
                            && lr.status === 'scheduled'
                            && leaveDate >= monthStart 
                            && leaveDate <= monthEnd;
                        })
                        .reduce((sum: number, lr: any) => sum + (lr.number_of_days || 0), 0);
                  
                  const taken = summary.monthly_taken !== undefined 
                    ? summary.monthly_taken 
                    : leaveRequests
                        .filter((lr: any) => {
                          const leaveDate = new Date(lr.from_date);
                          const selectedMonth = parseInt(reportFilters.month);
                          const selectedYear = parseInt(reportFilters.year);
                          const monthStart = new Date(selectedYear, selectedMonth - 1, 1);
                          const monthEnd = new Date(selectedYear, selectedMonth, 0);
                          return lr.leave_type_id === leaveTypes.find(lt => lt.name === summary.leave_type_name)?.id 
                            && lr.status === 'taken'
                            && leaveDate >= monthStart 
                            && leaveDate <= monthEnd;
                        })
                        .reduce((sum: number, lr: any) => sum + (lr.number_of_days || 0), 0);
                  
                  return (
                    <tr key={idx} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                      <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{summary.leave_type_name}</td>
                      <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{num(summary.total_entitlement).toFixed(2)}</td>
                      <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{num(pending).toFixed(2)}</td>
                      <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{num(scheduled).toFixed(2)}</td>
                      <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{num(taken).toFixed(2)}</td>
                      <td style={{ padding: '12px', fontSize: '14px', fontWeight: 600, color: num(summary.balance_days) < 0 ? COLORS.danger : COLORS.text }}>
                        {num(summary.balance_days).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderLeavePeriod = () => (
    <div style={{
                  backgroundColor: COLORS.white,
      borderRadius: '8px',
      border: `1px solid ${COLORS.border}`,
      padding: '32px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    }}>
      <h2 style={{
        marginTop: 0,
        marginBottom: '24px',
        fontFamily: TYPOGRAPHY.fontFamily,
        color: COLORS.text,
        fontSize: '18px',
        fontWeight: 600,
      }}>
        Leave Period
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '14px',
            color: COLORS.text,
          }}>
            Start Month*
          </label>
          <select style={{
            width: '100%',
            padding: '10px',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '6px',
            fontFamily: TYPOGRAPHY.fontFamily,
            backgroundColor: COLORS.white,
            boxSizing: 'border-box',
          }}>
            <option>January</option>
            {['February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
              <option key={m}>{m}</option>
            ))}
          </select>
            </div>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '14px',
            color: COLORS.text,
          }}>
            Start Date*
          </label>
          <select style={{
            width: '100%',
            padding: '10px',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '6px',
            fontFamily: TYPOGRAPHY.fontFamily,
            backgroundColor: COLORS.white,
            boxSizing: 'border-box',
          }}>
            <option>01</option>
            {Array.from({ length: 30 }, (_, i) => i + 2).map(d => (
              <option key={d}>{String(d).padStart(2, '0')}</option>
            ))}
          </select>
          </div>
        </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '14px',
            color: COLORS.text,
          }}>
            End Date
          </label>
          <div style={{
            padding: '10px',
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '14px',
            color: COLORS.text,
          }}>
            December 31
          </div>
        </div>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '14px',
            color: COLORS.text,
          }}>
            Current Leave Period
          </label>
          <div style={{
            padding: '10px',
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '14px',
            color: COLORS.text,
          }}>
            2025-01-01 to 2025-31-12
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '24px', fontSize: '12px', color: COLORS.textLight, fontFamily: TYPOGRAPHY.fontFamily }}>
          * Required
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button style={{
          padding: '10px 24px',
          borderRadius: '6px',
          border: `1px solid ${COLORS.success}`,
          backgroundColor: 'transparent',
          color: COLORS.success,
          fontFamily: TYPOGRAPHY.fontFamily,
          cursor: 'pointer',
        }}>
          Reset
        </button>
        <button style={{
          padding: '10px 24px',
          borderRadius: '6px',
          border: 'none',
          backgroundColor: COLORS.success,
          color: COLORS.white,
          fontFamily: TYPOGRAPHY.fontFamily,
          cursor: 'pointer',
        }}>
          Save
        </button>
      </div>
    </div>
  );

  const renderLeaveTypes = () => (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: '8px',
      border: `1px solid ${COLORS.border}`,
      padding: '32px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{
          margin: 0,
          fontFamily: TYPOGRAPHY.fontFamily,
          color: COLORS.text,
          fontSize: '18px',
          fontWeight: 600,
        }}>
          Leave Types
        </h2>
          <button
          onClick={() => {
            setEditingLeaveType(null);
            setLeaveTypeForm({ name: '', description: '', entitlement_days: '', is_paid: true });
            setShowLeaveTypeModal(true);
          }}
            style={{
            padding: '8px 20px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: COLORS.success,
            color: COLORS.white,
            fontFamily: TYPOGRAPHY.fontFamily,
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          + Add
        </button>
      </div>

      <p style={{
        fontFamily: TYPOGRAPHY.fontFamily,
        color: COLORS.textLight,
        fontSize: '15px',
        marginBottom: '16px',
      }}>
        ({leaveTypes.length}) Records Found
      </p>

      {loading ? (
        <p style={{ fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight }}>Loading leave types...</p>
      ) : leaveTypes.length === 0 ? (
        <p style={{ fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight }}>No leave types found. Click "+ Add" to create one.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: TYPOGRAPHY.fontFamily,
          }}>
            <thead>
              <tr style={{ backgroundColor: COLORS.tableBg }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: COLORS.text, borderBottom: `1px solid ${COLORS.border}` }}>
                  <input type="checkbox" onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItems(leaveTypes.map(t => t.id));
                    } else {
                      setSelectedItems([]);
                    }
                  }} />
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: COLORS.text, borderBottom: `1px solid ${COLORS.border}` }}>
                  Name
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: COLORS.text, borderBottom: `1px solid ${COLORS.border}` }}>
                  Entitlement Days
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: COLORS.text, borderBottom: `1px solid ${COLORS.border}` }}>
                  Paid/Unpaid
                </th>
                <th style={{ padding: '12px', textAlign: 'right', fontSize: '13px', color: COLORS.text, borderBottom: `1px solid ${COLORS.border}` }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {leaveTypes.map((type) => (
                <tr key={type.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  <td style={{ padding: '12px' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedItems.includes(type.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems([...selectedItems, type.id]);
                        } else {
                          setSelectedItems(selectedItems.filter(i => i !== type.id));
                        }
                      }}
                    />
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: type.status === 'deleted' ? COLORS.textLight : COLORS.primary, fontStyle: type.status === 'deleted' ? 'italic' : 'normal' }}>
                    {type.name}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>
                    {type.entitlement_days || 0}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      backgroundColor: type.is_paid === false ? '#fff3cd' : '#d4edda',
                      color: type.is_paid === false ? '#856404' : '#155724',
                    }}>
                      {type.is_paid === false ? 'Unpaid' : 'Paid'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button 
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to delete this leave type?')) {
                          try {
                            await apiService.deleteLeaveType(type.id);
                            await fetchData();
                          } catch (err: any) {
                            alert(`Failed to delete: ${err.message || 'Unknown error'}`);
                          }
                        }
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '8px', fontSize: '16px', color: COLORS.textLight }}
                    >
                      🗑️
                    </button>
                    <button 
                      onClick={() => {
                        setEditingLeaveType(type);
                        setLeaveTypeForm({
                          name: type.name,
                          description: type.description || '',
                          entitlement_days: String(type.entitlement_days || ''),
                          is_paid: type.is_paid !== false
                        });
                        setShowLeaveTypeModal(true);
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: COLORS.textLight }}
                    >
                      ✏️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Leave Type Modal */}
      {showLeaveTypeModal && (
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
            borderRadius: '8px',
            padding: '24px',
            width: '500px',
            maxWidth: '90%',
          }}>
            <h2 style={{
              color: COLORS.primary,
              fontSize: '1.25rem',
              fontFamily: TYPOGRAPHY.fontFamily,
              marginBottom: '20px',
            }}>
              {editingLeaveType ? 'Edit Leave Type' : 'Add Leave Type'}
            </h2>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.text }}>
                Name *
              </label>
              <input
                type="text"
                value={leaveTypeForm.name}
                onChange={(e) => setLeaveTypeForm({ ...leaveTypeForm, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '4px',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontSize: '14px',
                }}
                placeholder="Enter leave type name"
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.text }}>
                Description
              </label>
              <textarea
                value={leaveTypeForm.description}
                onChange={(e) => setLeaveTypeForm({ ...leaveTypeForm, description: e.target.value })}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '4px',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontSize: '14px',
                  resize: 'vertical',
                }}
                placeholder="Enter description (optional)"
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.text }}>
                Entitlement Days
              </label>
              <input
                type="number"
                value={leaveTypeForm.entitlement_days}
                onChange={(e) => setLeaveTypeForm({ ...leaveTypeForm, entitlement_days: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '4px',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontSize: '14px',
                }}
                placeholder="Number of days (optional)"
                min="0"
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowLeaveTypeModal(false);
                  setEditingLeaveType(null);
                  setLeaveTypeForm({ name: '', description: '', entitlement_days: '', is_paid: true });
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: COLORS.textLight,
                  color: COLORS.white,
                  border: 'none',
                  borderRadius: '4px',
              cursor: 'pointer',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontSize: '14px',
            }}
          >
                Cancel
          </button>
          <button
                onClick={async () => {
                  if (!leaveTypeForm.name.trim()) {
                    alert('Please enter a leave type name');
                    return;
                  }
                  try {
                    const payload = {
                      name: leaveTypeForm.name.trim(),
                      description: leaveTypeForm.description || '',
                      entitlement_days: leaveTypeForm.entitlement_days ? parseInt(leaveTypeForm.entitlement_days) : 0,
                      is_paid: leaveTypeForm.is_paid
                    };
                    if (editingLeaveType) {
                      await apiService.updateLeaveType(editingLeaveType.id, payload);
                    } else {
                      await apiService.createLeaveType(payload);
                    }
                    setShowLeaveTypeModal(false);
                    setEditingLeaveType(null);
                    setLeaveTypeForm({ name: '', description: '', entitlement_days: '', is_paid: true });
                    await fetchData();
                  } catch (err: any) {
                    alert(`Failed to save: ${err.message || 'Unknown error'}`);
                  }
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: COLORS.primary,
                  color: COLORS.white,
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontSize: '14px',
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderWorkWeek = () => (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: '8px',
      border: `1px solid ${COLORS.border}`,
      padding: '32px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      maxWidth: '400px',
    }}>
      <h2 style={{
        marginTop: 0,
        marginBottom: '24px',
        fontFamily: TYPOGRAPHY.fontFamily,
        color: COLORS.text,
        fontSize: '18px',
        fontWeight: 600,
      }}>
        Work Week
      </h2>
      
      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, idx) => {
        const dayKey = day.toLowerCase() as keyof typeof workWeek;
        return (
          <div key={day} style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontFamily: TYPOGRAPHY.fontFamily,
              fontSize: '14px',
              color: COLORS.text,
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={workWeek[dayKey]}
                onChange={(e) => {
                  setWorkWeek({ ...workWeek, [dayKey]: e.target.checked });
                }}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <span>{day}</span>
              {!workWeek[dayKey] && (
                <span style={{ fontSize: '12px', color: COLORS.textLight, fontStyle: 'italic' }}>
                  (Non-working Day - Excluded from calculation)
                </span>
              )}
            </label>
          </div>
        );
      })}

      <div style={{ marginBottom: '24px', padding: '12px', backgroundColor: '#f0f0f0', borderRadius: '6px', fontSize: '12px', color: COLORS.textLight, fontFamily: TYPOGRAPHY.fontFamily }}>
        <strong>Note:</strong> Non-working days (unchecked) are automatically excluded from the 31-day month calculation. Sundays are typically excluded.
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          onClick={async () => {
            try {
              if (workWeekId) {
                await apiService.updateWorkWeek(workWeekId, workWeek);
              } else {
                await apiService.createWorkWeek(workWeek);
              }
              alert('Work week configuration saved successfully!');
              await fetchData();
            } catch (err: any) {
              alert(`Failed to save: ${err.message || 'Unknown error'}`);
            }
          }}
            style={{
              padding: '10px 24px',
            borderRadius: '6px',
              border: 'none',
            backgroundColor: COLORS.success,
              color: COLORS.white,
              fontFamily: TYPOGRAPHY.fontFamily,
              cursor: 'pointer',
            }}
          >
          Save
          </button>
        </div>
      </div>
  );

  const renderHolidays = () => (
    <div style={{
          backgroundColor: COLORS.white,
      borderRadius: '8px',
          border: `1px solid ${COLORS.border}`,
      padding: '32px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    }}>
      <h2 style={{
        marginTop: 0,
        marginBottom: '24px',
        fontFamily: TYPOGRAPHY.fontFamily,
        color: COLORS.text,
        fontSize: '18px',
        fontWeight: 600,
      }}>
        Holidays
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '14px',
            color: COLORS.text,
          }}>
            From
          </label>
          <input
            type="date"
            defaultValue="2025-01-01"
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
            color: COLORS.text,
          }}>
            To
          </label>
          <input
            type="date"
            defaultValue="2025-31-12"
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

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginBottom: '24px' }}>
        <button style={{
          padding: '10px 24px',
          borderRadius: '6px',
          border: `1px solid ${COLORS.success}`,
          backgroundColor: 'transparent',
          color: COLORS.success,
          fontFamily: TYPOGRAPHY.fontFamily,
          cursor: 'pointer',
        }}>
          Reset
        </button>
        <button style={{
          padding: '10px 24px',
          borderRadius: '6px',
          border: 'none',
          backgroundColor: COLORS.success,
          color: COLORS.white,
          fontFamily: TYPOGRAPHY.fontFamily,
          cursor: 'pointer',
        }}>
          Search
        </button>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <button 
          onClick={() => {
            setEditingHoliday(null);
            setHolidayForm({ name: '', date: '', full_day: true, repeats_annually: true });
            setShowHolidayModal(true);
          }}
                style={{
            padding: '8px 20px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: COLORS.success,
            color: COLORS.white,
            fontFamily: TYPOGRAPHY.fontFamily,
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          + Add
        </button>
      </div>

      <p style={{
        fontFamily: TYPOGRAPHY.fontFamily,
        color: COLORS.textLight,
        fontSize: '15px',
        marginBottom: '16px',
      }}>
        ({holidays.length}) Records Found
      </p>

      {loading ? (
        <p style={{ fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight }}>Loading holidays...</p>
      ) : holidays.length === 0 ? (
        <p style={{ fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight }}>No holidays found. Click "+ Add" to create one.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: TYPOGRAPHY.fontFamily,
          }}>
            <thead>
              <tr style={{ backgroundColor: COLORS.tableBg }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: COLORS.text, borderBottom: `1px solid ${COLORS.border}` }}>
                  <input type="checkbox" />
                </th>
                {['Name', 'Date', 'Full Day/ Half Day', 'Repeats Annually', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: COLORS.text, borderBottom: `1px solid ${COLORS.border}` }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {holidays.map((holiday) => (
                <tr key={holiday.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  <td style={{ padding: '12px' }}>
                    <input type="checkbox" />
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{holiday.name}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>
                    {new Date(holiday.date).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>
                    {holiday.full_day ? 'Full Day' : 'Half Day'}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>
                    {holiday.repeats_annually ? 'Yes' : 'No'}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'left' }}>
                    <button 
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to delete this holiday?')) {
                          try {
                            await apiService.deleteHoliday(holiday.id);
                            await fetchData();
                          } catch (err: any) {
                            alert(`Failed to delete: ${err.message || 'Unknown error'}`);
                          }
                        }
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '8px', fontSize: '16px', color: COLORS.textLight }}
                    >
                      🗑️
                    </button>
                    <button 
                      onClick={() => {
                        setEditingHoliday(holiday);
                        setHolidayForm({
                          name: holiday.name,
                          date: holiday.date,
                          full_day: holiday.full_day !== false,
                          repeats_annually: holiday.repeats_annually === true
                        });
                        setShowHolidayModal(true);
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: COLORS.textLight }}
                    >
                      ✏️
                    </button>
                  </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Holiday Modal */}
      {showHolidayModal && (
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
            borderRadius: '8px',
            padding: '24px',
            width: '500px',
            maxWidth: '90%',
          }}>
            <h2 style={{
              color: COLORS.primary,
              fontSize: '1.25rem',
              fontFamily: TYPOGRAPHY.fontFamily,
              marginBottom: '20px',
            }}>
              {editingHoliday ? 'Edit Holiday' : 'Add Holiday'}
            </h2>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.text }}>
                Name *
              </label>
              <input
                type="text"
                value={holidayForm.name}
                onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
      style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '4px',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontSize: '14px',
                }}
                placeholder="Enter holiday name"
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.text }}>
                Date *
              </label>
              <input
                type="date"
                value={holidayForm.date}
                onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '4px',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontSize: '14px',
                }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.text, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={holidayForm.full_day}
                  onChange={(e) => setHolidayForm({ ...holidayForm, full_day: e.target.checked })}
                />
                Full Day
              </label>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.text, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={holidayForm.repeats_annually}
                  onChange={(e) => setHolidayForm({ ...holidayForm, repeats_annually: e.target.checked })}
                />
                Repeats Annually
              </label>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
      <button
                onClick={() => {
                  setShowHolidayModal(false);
                  setEditingHoliday(null);
                  setHolidayForm({ name: '', date: '', full_day: true, repeats_annually: true });
                }}
        style={{
                  padding: '10px 20px',
          backgroundColor: COLORS.textLight,
          color: COLORS.white,
          border: 'none',
                  borderRadius: '4px',
          cursor: 'pointer',
          fontFamily: TYPOGRAPHY.fontFamily,
                  fontSize: '14px',
        }}
      >
                Cancel
      </button>
            <button
                onClick={async () => {
                  if (!holidayForm.name.trim() || !holidayForm.date) {
                    alert('Please fill in all required fields');
                    return;
                  }
                  try {
                    const payload = {
                      name: holidayForm.name.trim(),
                      date: holidayForm.date,
                      full_day: holidayForm.full_day,
                      repeats_annually: holidayForm.repeats_annually
                    };
                    if (editingHoliday) {
                      await apiService.updateHoliday(editingHoliday.id, payload);
                    } else {
                      await apiService.createHoliday(payload);
                    }
                    setShowHolidayModal(false);
                    setEditingHoliday(null);
                    setHolidayForm({ name: '', date: '', full_day: true, repeats_annually: true });
                    await fetchData();
                  } catch (err: any) {
                    alert(`Failed to save: ${err.message || 'Unknown error'}`);
                  }
                }}
              style={{
                  padding: '10px 20px',
                  backgroundColor: COLORS.primary,
                  color: COLORS.white,
                border: 'none',
                  borderRadius: '4px',
                cursor: 'pointer',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontSize: '14px',
              }}
            >
                Save
            </button>
      </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderLeaveList = () => (
    <div style={{
            backgroundColor: COLORS.white,
      borderRadius: '8px',
            border: `1px solid ${COLORS.border}`,
            padding: '32px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    }}>
      <h2 style={{
        marginTop: 0,
        marginBottom: '24px',
            fontFamily: TYPOGRAPHY.fontFamily,
        color: COLORS.text,
        fontSize: '18px',
        fontWeight: 600,
      }}>
        Leave List
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '14px',
            color: COLORS.text,
          }}>
            From Date
          </label>
          <input
            type="date"
            defaultValue="2025-01-01"
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
            color: COLORS.text,
          }}>
            To Date
          </label>
          <input
            type="date"
            defaultValue="2025-31-12"
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
            color: COLORS.text,
          }}>
            Show Leave with Status*
          </label>
          <select style={{
            width: '100%',
            padding: '10px',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '6px',
            fontFamily: TYPOGRAPHY.fontFamily,
            backgroundColor: COLORS.white,
            boxSizing: 'border-box',
          }}>
            <option>-- Select --</option>
            <option>Pending Approval</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </div>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '14px',
            color: COLORS.text,
          }}>
            Leave Type
          </label>
          <select style={{
            width: '100%',
            padding: '10px',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '6px',
            fontFamily: TYPOGRAPHY.fontFamily,
            backgroundColor: COLORS.white,
            boxSizing: 'border-box',
          }}>
            <option>-- Select --</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
        <span style={{
          padding: '6px 12px',
          backgroundColor: COLORS.lightBg,
            color: COLORS.textLight,
          borderRadius: '16px',
          fontSize: '13px',
          fontFamily: TYPOGRAPHY.fontFamily,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          Pending Approval <span style={{ cursor: 'pointer', fontSize: '10px' }}>✖</span>
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '14px',
            color: COLORS.text,
          }}>
            Employee Name
          </label>
          <input
            type="text"
            placeholder="Type for hints..."
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
            color: COLORS.text,
          }}>
            Sub Unit
          </label>
          <select style={{
            width: '100%',
            padding: '10px',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '6px',
            fontFamily: TYPOGRAPHY.fontFamily,
            backgroundColor: COLORS.white,
            boxSizing: 'border-box',
          }}>
            <option>-- Select --</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', paddingBottom: '10px' }}>
            <input type="checkbox" style={{ width: '40px', height: '20px' }} />
            <span style={{ fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.text, fontSize: '14px' }}>Include Past Employees</span>
          </label>
        </div>
      </div>

      <div style={{ marginBottom: '16px', fontSize: '12px', color: COLORS.textLight, fontFamily: TYPOGRAPHY.fontFamily }}>
        * Required
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginBottom: '24px' }}>
        <button style={{
          padding: '10px 24px',
          borderRadius: '6px',
          border: `1px solid ${COLORS.success}`,
          backgroundColor: 'transparent',
          color: COLORS.success,
          fontFamily: TYPOGRAPHY.fontFamily,
          cursor: 'pointer',
        }}>
          Reset
        </button>
        <button style={{
          padding: '10px 24px',
          borderRadius: '6px',
          border: 'none',
          backgroundColor: COLORS.success,
          color: COLORS.white,
          fontFamily: TYPOGRAPHY.fontFamily,
          cursor: 'pointer',
        }}>
          Search
        </button>
      </div>

      {loading ? (
        <p style={{ fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight }}>Loading leave requests...</p>
      ) : leaveRequests.length === 0 ? (
        <p style={{
          fontFamily: TYPOGRAPHY.fontFamily,
          color: COLORS.textLight,
          fontSize: '15px',
          marginBottom: '16px',
        }}>
          No Records Found
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: TYPOGRAPHY.fontFamily,
          }}>
            <thead>
              <tr style={{ backgroundColor: COLORS.tableBg }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: COLORS.text, borderBottom: `1px solid ${COLORS.border}` }}>
                  <input type="checkbox" />
                </th>
                {['Date', 'Employee Name', 'Leave Type', 'Days', 'Status', 'Working Days (Base)', 'Unpaid Leave', 'Payable Days', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: COLORS.text, borderBottom: `1px solid ${COLORS.border}` }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leaveRequests.map((request) => (
                <tr key={request.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  <td style={{ padding: '12px' }}>
                    <input type="checkbox" />
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px', color: COLORS.text }}>
                    {new Date(request.from_date).toLocaleDateString()} - {new Date(request.to_date).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px', color: COLORS.text }}>
                    {request.employee_name || 'N/A'}
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px', color: COLORS.text }}>
                    <span style={{ 
                      color: request.is_paid === false ? '#d32f2f' : COLORS.text,
                      fontWeight: request.is_paid === false ? 600 : 'normal'
                    }}>
                      {request.leave_type_name || 'N/A'}
                      {request.is_paid === false && ' (Unpaid)'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px', color: COLORS.text }}>
                    {request.number_of_days}
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      backgroundColor: 
                        request.status === 'approved' ? '#d4edda' :
                        request.status === 'rejected' ? '#f8d7da' :
                        request.status === 'pending' ? '#fff3cd' :
                        '#e2e3e5',
                      color:
                        request.status === 'approved' ? '#155724' :
                        request.status === 'rejected' ? '#721c24' :
                        request.status === 'pending' ? '#856404' :
                        '#383d41',
                    }}>
                      {request.status || 'pending'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px', color: COLORS.text }}>
                    {request.working_days !== undefined ? (
                      <div>
                        <div>{request.working_days} days</div>
                        <div style={{ fontSize: '11px', color: COLORS.textLight }}>
                          ({request.total_days} total - {request.off_days || 0} off - {request.holidays || 0} holidays)
                        </div>
                      </div>
                    ) : '-'}
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px', color: request.unpaid_leave_days > 0 ? '#d32f2f' : COLORS.text, fontWeight: request.unpaid_leave_days > 0 ? 600 : 'normal' }}>
                    {request.unpaid_leave_days !== undefined ? `${request.unpaid_leave_days} days` : '-'}
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px', color: COLORS.primary, fontWeight: 600 }}>
                    {request.payable_days !== undefined ? `${request.payable_days.toFixed(2)} days` : '-'}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'left' }}>
                    <button 
                      onClick={async () => {
                        if (window.confirm('Approve this leave request?')) {
                          try {
                            await apiService.updateLeaveRequest(request.id, { status: 'approved' });
                            await fetchData();
                          } catch (err: any) {
                            alert(`Failed to approve: ${err.message || 'Unknown error'}`);
                          }
                        }
                      }}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer', 
                        marginRight: '8px', 
                        fontSize: '12px', 
                        color: COLORS.success,
                        textDecoration: 'underline'
                      }}
                    >
                      Approve
                    </button>
                    <button 
                      onClick={async () => {
                        if (window.confirm('Reject this leave request?')) {
                          try {
                            await apiService.updateLeaveRequest(request.id, { status: 'rejected' });
                            await fetchData();
                          } catch (err: any) {
                            alert(`Failed to reject: ${err.message || 'Unknown error'}`);
                          }
                        }
                      }}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer', 
                        fontSize: '12px', 
                        color: '#d32f2f',
                        textDecoration: 'underline'
                      }}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderAssignLeave = () => (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: '8px',
      border: `1px solid ${COLORS.border}`,
      padding: '32px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      maxWidth: '800px',
    }}>
      <h2 style={{
        marginTop: 0,
        marginBottom: '24px',
        fontFamily: TYPOGRAPHY.fontFamily,
        color: COLORS.text,
        fontSize: '18px',
        fontWeight: 600,
      }}>
        Assign Leave
      </h2>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          fontFamily: TYPOGRAPHY.fontFamily,
          fontSize: '14px',
          color: COLORS.text,
        }}>
          Employee Name*
        </label>
        <input
          type="text"
          placeholder="Type for hints..."
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '14px',
            color: COLORS.text,
          }}>
            Leave Type*
          </label>
          <select style={{
            width: '100%',
            padding: '10px',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '6px',
            fontFamily: TYPOGRAPHY.fontFamily,
            backgroundColor: COLORS.white,
            boxSizing: 'border-box',
          }}>
            <option>-- Select --</option>
          </select>
        </div>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '14px',
            color: COLORS.text,
          }}>
            Leave Balance
          </label>
          <div style={{
            padding: '10px',
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '14px',
            color: COLORS.text,
          }}>
            0.00 Day(s)
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '14px',
            color: COLORS.text,
          }}>
            From Date*
          </label>
          <input
            type="date"
            placeholder="yyyy-dd-mm"
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
            color: COLORS.text,
          }}>
            To Date*
          </label>
          <input
            type="date"
            placeholder="yyyy-dd-mm"
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

      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          fontFamily: TYPOGRAPHY.fontFamily,
          fontSize: '14px',
          color: COLORS.text,
        }}>
          Comments
        </label>
        <textarea
          rows={4}
          style={{
            width: '100%',
            padding: '10px',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '6px',
            fontFamily: TYPOGRAPHY.fontFamily,
            boxSizing: 'border-box',
            resize: 'vertical',
          }}
        />
      </div>

      <div style={{ marginBottom: '24px', fontSize: '12px', color: COLORS.textLight, fontFamily: TYPOGRAPHY.fontFamily }}>
        * Required
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button style={{
          padding: '10px 32px',
          borderRadius: '6px',
          border: 'none',
          backgroundColor: COLORS.success,
          color: COLORS.white,
          fontFamily: TYPOGRAPHY.fontFamily,
          cursor: 'pointer',
          fontSize: '15px',
          fontWeight: 500,
        }}>
          Assign
        </button>
      </div>
    </div>
  );

  const renderAddEntitlements = () => (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: '8px',
      border: `1px solid ${COLORS.border}`,
      padding: '32px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    }}>
      <h2 style={{
        marginTop: 0,
        marginBottom: '24px',
        fontFamily: TYPOGRAPHY.fontFamily,
        color: COLORS.text,
        fontSize: '18px',
        fontWeight: 600,
      }}>
        Add Leave Entitlement
      </h2>
      
      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          marginBottom: '12px',
          fontFamily: TYPOGRAPHY.fontFamily,
          fontSize: '14px',
          color: COLORS.text,
        }}>
          Add to
        </label>
        <div style={{ display: 'flex', gap: '24px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="radio" name="addTo" value="individual" defaultChecked />
            <span style={{ fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.text }}>Individual Employee</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="radio" name="addTo" value="multiple" />
            <span style={{ fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.text }}>Multiple Employees</span>
          </label>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '14px',
            color: COLORS.text,
          }}>
            Employee Name*
          </label>
          <input
            type="text"
            placeholder="Type for hints..."
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
            color: COLORS.text,
          }}>
            Leave Type*
          </label>
          <select style={{
            width: '100%',
            padding: '10px',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '6px',
            fontFamily: TYPOGRAPHY.fontFamily,
            backgroundColor: COLORS.white,
            boxSizing: 'border-box',
          }}>
            <option value="">-- Select --</option>
            {leaveTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '14px',
            color: COLORS.text,
          }}>
            Leave Period*
          </label>
          <select style={{
            width: '100%',
            padding: '10px',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '6px',
            fontFamily: TYPOGRAPHY.fontFamily,
            backgroundColor: COLORS.white,
            boxSizing: 'border-box',
          }}>
            <option>{new Date().getFullYear()}-01-01 - {new Date().getFullYear()}-12-31</option>
          </select>
        </div>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '14px',
            color: COLORS.text,
          }}>
            Entitlement*
          </label>
          <input
            type="number"
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

      <div style={{ marginBottom: '24px', fontSize: '12px', color: COLORS.textLight, fontFamily: TYPOGRAPHY.fontFamily }}>
        * Required
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button style={{
          padding: '10px 24px',
          borderRadius: '6px',
          border: `1px solid ${COLORS.border}`,
          backgroundColor: 'transparent',
          color: COLORS.text,
          fontFamily: TYPOGRAPHY.fontFamily,
          cursor: 'pointer',
        }}>
          Cancel
        </button>
        <button style={{
          padding: '10px 24px',
          borderRadius: '6px',
          border: 'none',
          backgroundColor: COLORS.success,
          color: COLORS.white,
          fontFamily: TYPOGRAPHY.fontFamily,
          cursor: 'pointer',
        }}>
          Save
        </button>
      </div>
    </div>
  );

  const renderEmployeeEntitlements = () => (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: '8px',
      border: `1px solid ${COLORS.border}`,
      padding: '32px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    }}>
      <h2 style={{
        marginTop: 0,
        marginBottom: '24px',
        fontFamily: TYPOGRAPHY.fontFamily,
        color: COLORS.text,
        fontSize: '18px',
        fontWeight: 600,
      }}>
        Leave Entitlements
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '14px',
            color: COLORS.text,
          }}>
            Employee Name*
          </label>
          <input
            type="text"
            placeholder="Type for hints..."
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
            color: COLORS.text,
          }}>
            Leave Type
          </label>
          <select style={{
            width: '100%',
            padding: '10px',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '6px',
            fontFamily: TYPOGRAPHY.fontFamily,
            backgroundColor: COLORS.white,
            boxSizing: 'border-box',
          }}>
            <option>-- Select --</option>
          </select>
        </div>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '14px',
            color: COLORS.text,
          }}>
            Leave Period
          </label>
          <select style={{
            width: '100%',
            padding: '10px',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '6px',
            fontFamily: TYPOGRAPHY.fontFamily,
            backgroundColor: COLORS.white,
            boxSizing: 'border-box',
          }}>
            <option value="">-- Select --</option>
            {Array.from({ length: 3 }, (_, i) => {
              const year = new Date().getFullYear() - 1 + i;
              return (
                <option key={year} value={`${year}-01-01 - ${year}-12-31`}>
                  {year}-01-01 - {year}-12-31
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '16px', fontSize: '12px', color: COLORS.textLight, fontFamily: TYPOGRAPHY.fontFamily }}>
        * Required
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
        <button style={{
          padding: '10px 24px',
          borderRadius: '6px',
          border: 'none',
          backgroundColor: COLORS.success,
          color: COLORS.white,
          fontFamily: TYPOGRAPHY.fontFamily,
          cursor: 'pointer',
        }}>
          Search
        </button>
      </div>

      <p style={{
        fontFamily: TYPOGRAPHY.fontFamily,
        color: COLORS.textLight,
        fontSize: '15px',
      }}>
        No Records Found
      </p>
    </div>
  );

  const renderMyEntitlements = () => (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: '8px',
      border: `1px solid ${COLORS.border}`,
      padding: '32px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    }}>
      <h2 style={{
        marginTop: 0,
        marginBottom: '24px',
        fontFamily: TYPOGRAPHY.fontFamily,
        color: COLORS.text,
        fontSize: '18px',
        fontWeight: 600,
      }}>
        My Leave Entitlements
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '14px',
            color: COLORS.text,
          }}>
            Leave Type
          </label>
          <select style={{
            width: '100%',
            padding: '10px',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '6px',
            fontFamily: TYPOGRAPHY.fontFamily,
            backgroundColor: COLORS.white,
            boxSizing: 'border-box',
          }}>
            <option>-- Select --</option>
          </select>
        </div>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '14px',
            color: COLORS.text,
          }}>
            Leave Period
          </label>
          <select style={{
            width: '100%',
            padding: '10px',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '6px',
            fontFamily: TYPOGRAPHY.fontFamily,
            backgroundColor: COLORS.white,
            boxSizing: 'border-box',
          }}>
            <option value="">-- Select --</option>
            {Array.from({ length: 3 }, (_, i) => {
              const year = new Date().getFullYear() - 1 + i;
              return (
                <option key={year} value={`${year}-01-01 - ${year}-12-31`}>
                  {year}-01-01 - {year}-12-31
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button style={{
          padding: '8px 20px',
          borderRadius: '6px',
          border: 'none',
          backgroundColor: COLORS.success,
          color: COLORS.white,
          fontFamily: TYPOGRAPHY.fontFamily,
          cursor: 'pointer',
          fontSize: '14px',
        }}
          onClick={async () => {
            // For end users, add entitlement only for themselves using defaults
            const empId = await ensureEmployeeId();
            if (!empId) {
              alert('Employee record not found. Please contact administrator.');
              return;
            }
            try {
              // Minimal UX: prompt for leave type and days
              const leaveTypeId = window.prompt('Enter Leave Type ID (from dropdown above):');
              const entitlementDays = window.prompt('Enter entitlement days:');
              const parsedType = leaveTypeId ? parseInt(leaveTypeId, 10) : NaN;
              const parsedDays = entitlementDays ? parseFloat(entitlementDays) : NaN;
              if (!parsedType || isNaN(parsedType) || isNaN(parsedDays)) {
                alert('Please enter valid leave type ID and entitlement days.');
                return;
              }
              const periodStart = `${new Date().getFullYear()}-01-01`;
              const periodEnd = `${new Date().getFullYear()}-12-31`;
              await apiService.createLeaveEntitlement({
                employee_id: empId,
                leave_type_id: parsedType,
                entitlement_days: parsedDays,
                leave_period_start: periodStart,
                leave_period_end: periodEnd,
              });
              const entData = await apiService.getLeaveEntitlements({ employee_id: empId });
              setMyEntitlements(entData || []);
              alert('Entitlement added');
            } catch (err: any) {
              alert(`Failed to add entitlement: ${err.message || 'Unknown error'}`);
            }
          }}
        >
          + Add (self)
        </button>
        <div style={{
          fontFamily: TYPOGRAPHY.fontFamily,
          color: COLORS.textLight,
          fontSize: '15px',
        }}>
          Total {myEntitlements.reduce((sum, e) => sum + (Number(e.entitlement_days) || 0), 0).toFixed(2)} Day(s)
        </div>
      </div>

      {myEntitlements.length === 0 ? (
        <p style={{
          fontFamily: TYPOGRAPHY.fontFamily,
          color: COLORS.textLight,
          fontSize: '15px',
          marginBottom: '16px',
        }}>
          No Records Found
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: TYPOGRAPHY.fontFamily,
          }}>
            <thead>
              <tr style={{ backgroundColor: COLORS.tableBg }}>
                {['Leave Type', 'Entitlement Days', 'Used Days', 'Balance Days', 'Valid From', 'Valid To'].map((h) => (
                  <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: COLORS.text, borderBottom: `1px solid ${COLORS.border}` }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {myEntitlements.map((ent, idx) => {
                const used = Number(ent.used_days) || 0;
                const total = Number(ent.entitlement_days) || 0;
                const balance = total - used;
                return (
                  <tr key={idx} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{ent.leave_type_name || ent.leave_type_id}</td>
                    <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{total.toFixed(2)}</td>
                    <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{used.toFixed(2)}</td>
                    <td style={{ padding: '12px', fontSize: '14px', fontWeight: 600, color: balance < 0 ? COLORS.danger : COLORS.text }}>
                      {balance.toFixed(2)}
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{ent.leave_period_start?.slice(0, 10) || '-'}</td>
                    <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{ent.leave_period_end?.slice(0, 10) || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'apply':
        return renderApplyLeave();
      case 'myLeave':
        return renderMyLeave();
      case 'addEntitlements':
        return renderAddEntitlements();
      case 'employeeEntitlements':
        return renderEmployeeEntitlements();
      case 'myEntitlements':
        return renderMyEntitlements();
      case 'leaveReport':
        return renderLeaveReport();
      case 'myLeaveReport':
        return renderMyLeaveReport();
      case 'leavePeriod':
        return renderLeavePeriod();
      case 'leaveTypes':
        return renderLeaveTypes();
      case 'workWeek':
        return renderWorkWeek();
      case 'holidays':
        return renderHolidays();
      case 'leaveList':
        return renderLeaveList();
      case 'assignLeave':
        return renderAssignLeave();
      default:
        return <div>Select a section</div>;
    }
  };

  return (
    <div style={{
      padding: '24px',
      backgroundColor: COLORS.lightBg,
      minHeight: '100vh',
    }}>
      {renderNav()}
      {renderContent()}
    </div>
  );
};

export default LeaveManagement;
