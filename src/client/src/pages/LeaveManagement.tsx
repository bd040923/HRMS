/**
 * arithwise_hrms Leave Management System
 * Copyright (C) 2024 Arithwise Inc.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const COLORS = {
  // Strict color palette for Leave Portal
  primary: '#78176b',        // Primary brand color
  primaryHover: '#590a4f',   // Hover/active/emphasis
  lightBg: '#f9f9f9',        // Page background
  cardBg: '#faf3ff',         // Primary card background
  cardBgSecondary: '#fffafe', // Secondary card background
  white: '#ffffff',
  text: '#222',              // All text
  textLight: '#666666',
  border: '#e0e0e0',
  tableBg: '#f7f7f7',
  activeTab: '#78176b',
  // Legacy colors (for other sections)
  success: '#78176b',
  danger: '#dc3545',
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
  const [myLeaveRequests, setMyLeaveRequests] = useState<any[]>([]);
  const [filteredLeaveRequests, setFilteredLeaveRequests] = useState<any[]>([]);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [tableFilters, setTableFilters] = useState({
    status: '',
    leaveType: '',
    dateFrom: '',
    dateTo: ''
  });
  const [yearType, setYearType] = useState<'calendar' | 'financial'>('calendar');
  
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
  const [allMyEntitlements, setAllMyEntitlements] = useState<any[]>([]); // Store all data for filtering
  const [entitlementFilters, setEntitlementFilters] = useState({ leaveTypeId: '', leavePeriod: '' });
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
          try {
            // Get current year for report
            const currentYear = new Date().getFullYear();
            // Get comprehensive leave report which includes balances for all leave types
            const reportData = await apiService.getEmployeeLeaveReport(empId, currentYear);
            if (reportData && reportData.leave_summary && Array.isArray(reportData.leave_summary)) {
              // Transform report data to entitlement format for display
              const entitlementsData = reportData.leave_summary.map((item: any) => ({
                id: item.leave_type_name, // Use name as ID for display
                leave_type_name: item.leave_type_name,
                entitlement_days: parseFloat(item.total_entitlement || 0),
                used_days: parseFloat(item.used_days || 0),
                balance_days: parseFloat(item.balance_days || 0),
                leave_period_start: `${currentYear}-01-01`,
                leave_period_end: `${currentYear}-12-31`
              }));
              setAllMyEntitlements(entitlementsData);
              setMyEntitlements(entitlementsData);
            } else {
              // Fallback: Get entitlements and merge with leave types to show all
              const [entData, typesData] = await Promise.all([
                apiService.getLeaveEntitlements({ employee_id: empId }),
                apiService.getLeaveTypes()
              ]);
              
              // Create a map of entitlements by leave_type_id
              const entMap = new Map();
              (entData || []).forEach((ent: any) => {
                entMap.set(ent.leave_type_id, ent);
              });
              
              // Show all leave types with their balances
              const allEntitlements = (typesData || []).map((type: any) => {
                const ent = entMap.get(type.id);
                return {
                  id: type.id,
                  leave_type_id: type.id,
                  leave_type_name: type.name,
                  entitlement_days: parseFloat(ent?.entitlement_days || type.entitlement_days || 0),
                  used_days: parseFloat(ent?.used_days || 0),
                  balance_days: parseFloat(ent?.balance_days || (ent?.entitlement_days || type.entitlement_days || 0)),
                  leave_period_start: ent?.leave_period_start || `${currentYear}-01-01`,
                  leave_period_end: ent?.leave_period_end || `${currentYear}-12-31`
                };
              });
              setAllMyEntitlements(allEntitlements);
              setMyEntitlements(allEntitlements);
            }
            } catch (err) {
            console.error('Error fetching leave report:', err);
            // Fallback to direct entitlements
            const empIdFallback = await ensureEmployeeId();
            if (empIdFallback) {
              const currentYear = new Date().getFullYear();
              const [entData, typesData] = await Promise.all([
                apiService.getLeaveEntitlements({ employee_id: empIdFallback }),
                apiService.getLeaveTypes()
              ]);
              
              // Create a map of entitlements by leave_type_id
              const entMap = new Map();
              (entData || []).forEach((ent: any) => {
                entMap.set(ent.leave_type_id, ent);
              });
              
              // Show all leave types with their balances
              const allEntitlements = (typesData || []).map((type: any) => {
                const ent = entMap.get(type.id);
                return {
                  id: type.id,
                  leave_type_id: type.id,
                  leave_type_name: type.name,
                  entitlement_days: parseFloat(ent?.entitlement_days || type.entitlement_days || 0),
                  used_days: parseFloat(ent?.used_days || 0),
                  balance_days: parseFloat(ent?.balance_days || (ent?.entitlement_days || type.entitlement_days || 0)),
                  leave_period_start: ent?.leave_period_start || `${currentYear}-01-01`,
                  leave_period_end: ent?.leave_period_end || `${currentYear}-12-31`
                };
              });
              setAllMyEntitlements(allEntitlements);
              setMyEntitlements(allEntitlements);
            } else {
              setAllMyEntitlements([]);
              setMyEntitlements([]);
            }
          }
        } else {
          setAllMyEntitlements([]);
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

      {/* Entitlements section - Admin only */}
      {isAdmin() && (
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
      )}

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
      // Calculate number of days (inclusive of both start and end dates)
      // Example: 7 to 9 = 3 days (7, 8, 9), 24 to 27 = 4 days (24, 25, 26, 27)
      const from = new Date(applyForm.fromDate + 'T00:00:00');
      const to = new Date(applyForm.toDate + 'T00:00:00');
      const diffTime = to.getTime() - from.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      // Add 1 because both start and end dates are inclusive
      // Same day: (0) + 1 = 1 day
      // Different days: (to - from) + 1 = inclusive count
      const numberOfDays = diffDays + 1;

      console.log('Applying leave with:', {
        user_id: user.id,
        leave_type_id: parseInt(applyForm.leaveTypeId),
        from_date: applyForm.fromDate,
        to_date: applyForm.toDate,
        number_of_days: numberOfDays
      });

      // The backend will automatically get employee_id from user_id
      // If user has no employee record, it will create one automatically
      const response = await apiService.createLeaveRequest({
        user_id: user.id,
        leave_type_id: parseInt(applyForm.leaveTypeId),
        from_date: applyForm.fromDate,
        to_date: applyForm.toDate,
        number_of_days: numberOfDays,
        comments: applyForm.comments || ''
      } as any);

      // Check if leave was auto-converted to unpaid
      if (response && response.auto_converted) {
        alert(`Leave request submitted successfully!\n\n⚠️ Note: ${response.conversion_warning || 'Your annual casual leave limit was exceeded. This leave has been converted to Unpaid Leave.'}`);
      } else {
        alert('Leave request submitted successfully!');
      }
      
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

  // Helper function to fetch report data
  const fetchReportData = async (year: string, month: string) => {
    if (!year || !month || !user?.id) return;
    
    setReportLoading(true);
    try {
      const employee = await apiService.request<any>(`/employees/by-user/${user.id}`);
      if (!employee || !employee.id) {
        alert('Employee record not found. Please contact administrator.');
        setReportLoading(false);
        return;
      }
      
      const yearNum = parseInt(year);
      const monthNum = parseInt(month);
      const report = await apiService.getEmployeeLeaveReport(employee.id, yearNum, monthNum);
      
      const formattedReport = (() => {
        if (!report) return { leave_summary: [] };
        if (Array.isArray(report)) return { leave_summary: report };
        if (Array.isArray((report as any).leave_summary)) return { leave_summary: (report as any).leave_summary };
        if ((report as any).leave_type_name) return { leave_summary: [report] };
        return { leave_summary: [] };
      })();
      
      setMyReportData(formattedReport);
      
      const requests = await apiService.getLeaveRequests(user?.id ? { user_id: user.id } as any : undefined);
      setMyLeaveRequests(requests || []);
      setFilteredLeaveRequests(requests || []);
      
      setCalendarMonth(monthNum - 1);
      setCalendarYear(yearNum);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Error fetching report:', err);
      if (err.message && err.message.includes('404')) {
        alert('Employee record not found. Please contact administrator to link your account.');
      } else {
        alert(`Failed to generate report: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setReportLoading(false);
    }
  };

  // Auto-refresh when filters change
  useEffect(() => {
    if (reportFilters.year && reportFilters.month && activeSection === 'myLeaveReport') {
      const timeoutId = setTimeout(() => {
        fetchReportData(reportFilters.year, reportFilters.month);
      }, 500); // Debounce 500ms
      return () => clearTimeout(timeoutId);
    }
  }, [reportFilters.year, reportFilters.month, activeSection]);

  // Filter leave requests based on table filters
  useEffect(() => {
    let filtered = [...myLeaveRequests];
    
    if (tableFilters.status) {
      filtered = filtered.filter(r => r.status === tableFilters.status);
    }
    if (tableFilters.leaveType) {
      filtered = filtered.filter(r => r.leave_type_id === parseInt(tableFilters.leaveType));
    }
    if (tableFilters.dateFrom) {
      const fromDate = new Date(tableFilters.dateFrom);
      filtered = filtered.filter(r => new Date(r.from_date) >= fromDate);
    }
    if (tableFilters.dateTo) {
      const toDate = new Date(tableFilters.dateTo);
      filtered = filtered.filter(r => new Date(r.to_date) <= toDate);
    }
    
    setFilteredLeaveRequests(filtered);
  }, [myLeaveRequests, tableFilters]);


  const renderMyLeaveReport = () => {
    const today = new Date();
    const todayStr = today.toDateString();
    
    return (
    <div style={{
      backgroundColor: COLORS.lightBg,
      minHeight: '100vh',
      padding: '24px',
    }}>
      <div style={{
        backgroundColor: COLORS.cardBg,
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
        
        {/* Filters Section with Auto-refresh */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
          gap: '16px', 
          marginBottom: '16px',
          backgroundColor: COLORS.cardBgSecondary,
          padding: '16px',
          borderRadius: '6px',
        }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontFamily: TYPOGRAPHY.fontFamily,
              fontSize: '14px',
              color: COLORS.text,
              fontWeight: 500,
            }}>
              Year Type
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setYearType('calendar')}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '6px',
                  backgroundColor: yearType === 'calendar' ? COLORS.primary : COLORS.white,
                  color: yearType === 'calendar' ? COLORS.white : COLORS.text,
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Calendar
              </button>
              <button
                onClick={() => setYearType('financial')}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '6px',
                  backgroundColor: yearType === 'financial' ? COLORS.primary : COLORS.white,
                  color: yearType === 'financial' ? COLORS.white : COLORS.text,
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Financial
              </button>
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
              Year*
            </label>
            <select
              value={reportFilters.year}
              onChange={(e) => {
                setReportFilters({ ...reportFilters, year: e.target.value });
                if (e.target.value && reportFilters.month) {
                  fetchReportData(e.target.value, reportFilters.month);
                }
              }}
              style={{
                width: '100%',
                padding: '10px',
                border: `1px solid ${COLORS.border}`,
                borderRadius: '6px',
                fontFamily: TYPOGRAPHY.fontFamily,
                backgroundColor: COLORS.white,
                color: COLORS.text,
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
              fontWeight: 500,
            }}>
              Month*
            </label>
            <select
              value={reportFilters.month}
              onChange={(e) => {
                setReportFilters({ ...reportFilters, month: e.target.value });
                if (reportFilters.year && e.target.value) {
                  fetchReportData(reportFilters.year, e.target.value);
                }
              }}
              style={{
                width: '100%',
                padding: '10px',
                border: `1px solid ${COLORS.border}`,
                borderRadius: '6px',
                fontFamily: TYPOGRAPHY.fontFamily,
                backgroundColor: COLORS.white,
                color: COLORS.text,
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

        {/* Last Updated Timestamp */}
        {lastUpdated && (
          <div style={{ 
            marginBottom: '16px', 
            fontSize: '12px', 
            color: COLORS.textLight, 
            fontFamily: TYPOGRAPHY.fontFamily,
            fontStyle: 'italic',
          }}>
            Last Updated: {lastUpdated.toLocaleString()}
          </div>
        )}

        {reportLoading && (
          <div style={{
            padding: '20px',
            textAlign: 'center',
            color: COLORS.text,
            fontFamily: TYPOGRAPHY.fontFamily,
          }}>
            Loading report data...
          </div>
        )}

      {myReportData && (
        <div style={{ marginTop: '24px' }}>
          {/* Header with Export Dropdown */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{
              margin: 0,
              fontFamily: TYPOGRAPHY.fontFamily,
              color: COLORS.text,
              fontSize: '20px',
              fontWeight: 600,
            }}>
              Leave Portal - {reportFilters.month && ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][parseInt(reportFilters.month) - 1]} {reportFilters.year}
            </h3>
            <button 
              onClick={() => {
                // Generate PDF by creating a printable HTML document
                const monthName = reportFilters.month ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][parseInt(reportFilters.month) - 1] : '';
                const year = reportFilters.year || '';
                
                // Create HTML content for PDF
                let htmlContent = `
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <meta charset="UTF-8">
                    <title>Leave Report - ${monthName} ${year}</title>
                    <style>
                      @media print {
                        @page { margin: 1cm; }
                        body { margin: 0; padding: 20px; }
                      }
                      body {
                        font-family: 'Segoe UI', Arial, sans-serif;
                        color: #222;
                        padding: 20px;
                        background: #fff;
                      }
                      h1 { color: #78176b; margin-bottom: 20px; }
                      h2 { color: #222; margin-top: 30px; margin-bottom: 15px; }
                      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                      th, td { padding: 10px; text-align: left; border: 1px solid #e0e0e0; }
                      th { background: #f7f7f7; font-weight: 600; }
                      .card { background: #faf3ff; padding: 15px; margin: 10px 0; border-radius: 6px; border: 1px solid #e0e0e0; }
                      .card-title { font-size: 14px; color: #666; margin-bottom: 8px; }
                      .card-value { font-size: 20px; font-weight: 600; color: #78176b; }
                    </style>
                  </head>
                  <body>
                    <h1>Leave Portal Report - ${monthName} ${year}</h1>
                    <h2>Leave Summary</h2>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px;">
                `;
                
                // Add leave summary cards
                if (Array.isArray(myReportData.leave_summary)) {
                  myReportData.leave_summary.forEach((summary: any) => {
                    const used = Number(summary.used_days || 0);
                    const total = Number(summary.total_entitlement || 0);
                    const available = Number(summary.balance_days || 0);
                    htmlContent += `
                      <div class="card">
                        <div class="card-title">${summary.leave_type_name}</div>
                        <div class="card-value">${used.toFixed(0)} | ${total.toFixed(0)} | ${available.toFixed(0)}</div>
                        <div style="font-size: 11px; color: #666; margin-top: 4px;">Used | Total | Available</div>
                      </div>
                    `;
                  });
                }
                
                htmlContent += `
                    </div>
                    <h2>Leave Requests</h2>
                    <table>
                      <thead>
                        <tr>
                          <th>Request Date</th>
                          <th>Leave Type</th>
                          <th>Period</th>
                          <th>Status</th>
                          <th>Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                `;
                
                // Add leave requests table
                filteredLeaveRequests.forEach((request: any) => {
                  const leaveTypeName = leaveTypes.find(lt => lt.id === request.leave_type_id)?.name || 'Unknown';
                  const requestDate = new Date(request.created_at || request.from_date);
                  const fromDate = new Date(request.from_date);
                  const toDate = new Date(request.to_date);
                  const remarks = request.comments || request.manager_comments || '-';
                  const statusLabels: { [key: string]: string } = {
                    'approved': 'Approved',
                    'taken': 'Taken',
                    'pending': 'Pending',
                    'scheduled': 'Scheduled',
                    'rejected': 'Rejected',
                  };
                  
                  htmlContent += `
                    <tr>
                      <td>${requestDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                      <td>${leaveTypeName}</td>
                      <td>${fromDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}${fromDate.toDateString() !== toDate.toDateString() ? ` - ${toDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}` : ''}</td>
                      <td>${statusLabels[request.status] || request.status}</td>
                      <td>${remarks}</td>
                    </tr>
                  `;
                });
                
                htmlContent += `
                      </tbody>
                    </table>
                    <div style="margin-top: 30px; font-size: 12px; color: #666;">
                      Generated on: ${new Date().toLocaleString()}
                    </div>
                  </body>
                  </html>
                `;
                
                // Create blob and download as HTML file (can be opened and saved as PDF)
                const blob = new Blob([htmlContent], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `Leave_Report_${monthName}_${year}.html`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              }}
              style={{
                padding: '8px 16px',
                border: `1px solid ${COLORS.border}`,
                backgroundColor: COLORS.white,
                cursor: 'pointer',
                fontSize: '14px',
                borderRadius: '6px',
                fontFamily: TYPOGRAPHY.fontFamily,
                color: COLORS.text,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.primary;
                e.currentTarget.style.color = COLORS.white;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.white;
                e.currentTarget.style.color = COLORS.text;
              }}
            >
              📄 Export PDF
            </button>
          </div>

          {/* Leave Summary Cards - Used | Total | Available Format */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
            gap: '16px', 
            marginBottom: '24px' 
          }}>
            {(Array.isArray(myReportData.leave_summary) ? myReportData.leave_summary : []).map((summary: any, idx: number) => {
              const num = (v: any) => {
                const n = Number(v);
                return Number.isFinite(n) ? n : 0;
              };
              const used = num(summary.used_days || 0);
              const total = num(summary.total_entitlement || 0);
              const available = num(summary.balance_days || 0);
              const isLowBalance = available < (total * 0.2); // Less than 20% remaining
              
              return (
                <div 
                  key={idx} 
                  style={{
                    backgroundColor: COLORS.cardBg,
                    border: `1px solid ${isLowBalance ? COLORS.primary : COLORS.border}`,
                    borderRadius: '8px',
                    padding: '20px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    position: 'relative',
                  }}
                  title={`${summary.leave_type_name}: Leave policy information. Reset/Carry forward rules apply.`}
                >
                  <div style={{
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontSize: '13px',
                    color: COLORS.textLight,
                    marginBottom: '12px',
                    fontWeight: 500,
                  }}>
                    {summary.leave_type_name}
                  </div>
                  <div style={{
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontSize: '20px',
                    fontWeight: 600,
                    color: COLORS.text,
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '8px',
                  }}>
                    <span style={{ color: COLORS.primary }}>{used.toFixed(0)}</span>
                    <span style={{ color: COLORS.textLight }}>|</span>
                    <span style={{ color: COLORS.text }}>{total.toFixed(0)}</span>
                    <span style={{ color: COLORS.textLight }}>|</span>
                    <span style={{ 
                      color: COLORS.primary,
                      fontWeight: 700,
                    }}>{available.toFixed(0)}</span>
                  </div>
                  <div style={{
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontSize: '11px',
                    color: COLORS.textLight,
                    marginTop: '4px',
                  }}>
                    Used | Total | Available
                  </div>
                  {isLowBalance && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: COLORS.primary,
                      opacity: 0.6,
                    }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Main Content Grid: Calendar and Leave Requests Table */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1.5fr', 
            gap: '24px',
            marginBottom: '24px'
          }}>
            {/* Leave Calendar */}
            <div style={{
              backgroundColor: COLORS.cardBg,
              border: `1px solid ${COLORS.border}`,
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{
                  margin: 0,
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontSize: '16px',
                  fontWeight: 600,
                  color: COLORS.text,
                }}>
                  Leave Calendar
                </h4>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    onClick={() => {
                      if (calendarMonth === 0) {
                        setCalendarMonth(11);
                        setCalendarYear(calendarYear - 1);
                      } else {
                        setCalendarMonth(calendarMonth - 1);
                      }
                    }}
                    style={{
                      border: `1px solid ${COLORS.border}`,
                      backgroundColor: COLORS.white,
                      cursor: 'pointer',
                      padding: '6px 10px',
                      borderRadius: '4px',
                      fontSize: '14px',
                      color: COLORS.text,
                      fontFamily: TYPOGRAPHY.fontFamily,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = COLORS.primaryHover;
                      e.currentTarget.style.color = COLORS.white;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = COLORS.white;
                      e.currentTarget.style.color = COLORS.text;
                    }}
                  >
                    ←
                  </button>
                  <span style={{ fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.text, minWidth: '140px', textAlign: 'center', fontWeight: 500 }}>
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][calendarMonth]} {calendarYear}
                  </span>
                  <button
                    onClick={() => {
                      if (calendarMonth === 11) {
                        setCalendarMonth(0);
                        setCalendarYear(calendarYear + 1);
                      } else {
                        setCalendarMonth(calendarMonth + 1);
                      }
                    }}
                    style={{
                      border: `1px solid ${COLORS.border}`,
                      backgroundColor: COLORS.white,
                      cursor: 'pointer',
                      padding: '6px 10px',
                      borderRadius: '4px',
                      fontSize: '14px',
                      color: COLORS.text,
                      fontFamily: TYPOGRAPHY.fontFamily,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = COLORS.primaryHover;
                      e.currentTarget.style.color = COLORS.white;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = COLORS.white;
                      e.currentTarget.style.color = COLORS.text;
                    }}
                  >
                    →
                  </button>
                </div>
              </div>
              
              {/* Calendar Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '12px' }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} style={{
                    padding: '8px',
                    textAlign: 'center',
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontSize: '12px',
                    fontWeight: 600,
                    color: COLORS.textLight,
                  }}>
                    {day}
                  </div>
                ))}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {(() => {
                  const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
                  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
                  const days: JSX.Element[] = [];
                  
                  // Empty cells for days before month starts
                  for (let i = 0; i < firstDay; i++) {
                    days.push(<div key={`empty-${i}`} style={{ padding: '8px' }} />);
                  }
                  
                  // Days of the month
                  for (let day = 1; day <= daysInMonth; day++) {
                    const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const date = new Date(calendarYear, calendarMonth, day);
                    const isToday = date.toDateString() === todayStr;
                    const isSelected = selectedCalendarDate && date.toDateString() === selectedCalendarDate.toDateString();
                    
                    // Check if this date is in any leave request
                    const leaveOnThisDate = myLeaveRequests.find((lr: any) => {
                      const fromDate = new Date(lr.from_date);
                      const toDate = new Date(lr.to_date);
                      return date >= fromDate && date <= toDate;
                    });
                    
                    // Check if it's a holiday
                    const isHoliday = holidays.some((h: any) => {
                      const holidayDate = new Date(h.date);
                      return holidayDate.toDateString() === date.toDateString();
                    });
                    
                    // Determine styling based on status (using opacity and borders, not colors)
                    let bgOpacity = 1;
                    let borderWidth = 1;
                    let borderColor = COLORS.border;
                    let bgColor = COLORS.white;
                    
                    if (isSelected) {
                      bgColor = COLORS.primary;
                      borderColor = COLORS.primary;
                      borderWidth = 2;
                    } else if (isToday) {
                      borderColor = COLORS.primary;
                      borderWidth = 2;
                    } else if (leaveOnThisDate) {
                      if (leaveOnThisDate.status === 'approved' || leaveOnThisDate.status === 'taken') {
                        bgColor = COLORS.cardBg;
                        borderColor = COLORS.primary;
                        borderWidth = 2;
                        bgOpacity = 0.3;
                      } else if (leaveOnThisDate.status === 'pending') {
                        bgColor = COLORS.cardBg;
                        borderColor = COLORS.primary;
                        borderWidth = 1.5;
                        bgOpacity = 0.2;
                      } else if (leaveOnThisDate.status === 'scheduled') {
                        bgColor = COLORS.cardBgSecondary;
                        borderColor = COLORS.primary;
                        borderWidth = 1.5;
                        bgOpacity = 0.25;
                      }
                    } else if (isHoliday) {
                      bgColor = COLORS.cardBgSecondary;
                      borderColor = COLORS.border;
                      borderWidth = 1;
                    }
                    
                    const leaveTypeName = leaveOnThisDate ? leaveTypes.find(lt => lt.id === leaveOnThisDate.leave_type_id)?.name || 'Unknown' : '';
                    const statusLabel = leaveOnThisDate ? (leaveOnThisDate.status === 'approved' ? 'Approved' : leaveOnThisDate.status === 'pending' ? 'Pending' : leaveOnThisDate.status === 'scheduled' ? 'Scheduled' : leaveOnThisDate.status) : '';
                    const tooltipText = leaveOnThisDate 
                      ? `${leaveTypeName} - ${statusLabel}` 
                      : isHoliday 
                        ? 'Holiday' 
                        : '';
                    
                    days.push(
                      <div
                        key={day}
                        onClick={() => setSelectedCalendarDate(date)}
                        style={{
                          padding: '8px',
                          textAlign: 'center',
                          fontFamily: TYPOGRAPHY.fontFamily,
                          fontSize: '12px',
                          backgroundColor: bgColor,
                          border: `${borderWidth}px solid ${borderColor}`,
                          borderRadius: '4px',
                          color: isSelected ? COLORS.white : COLORS.text,
                          cursor: 'pointer',
                          minHeight: '36px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: bgOpacity,
                          transition: 'all 0.2s',
                        }}
                        title={tooltipText}
                        onMouseEnter={(e) => {
                          if (!isSelected && !isToday) {
                            e.currentTarget.style.backgroundColor = COLORS.primaryHover;
                            e.currentTarget.style.color = COLORS.white;
                            e.currentTarget.style.opacity = '1';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected && !isToday) {
                            e.currentTarget.style.backgroundColor = bgColor;
                            e.currentTarget.style.color = COLORS.text;
                            e.currentTarget.style.opacity = String(bgOpacity);
                          }
                        }}
                      >
                        {day}
                      </div>
                    );
                  }
                  
                  return days;
                })()}
              </div>
              
              {/* Legend - Using icons and opacity instead of colors */}
              <div style={{ marginTop: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ 
                    width: '16px', 
                    height: '16px', 
                    backgroundColor: COLORS.cardBg, 
                    border: `2px solid ${COLORS.primary}`,
                    borderRadius: '2px',
                    opacity: 0.3,
                  }} />
                  <span style={{ fontFamily: TYPOGRAPHY.fontFamily, fontSize: '12px', color: COLORS.text }}>✓ Approved Leave</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ 
                    width: '16px', 
                    height: '16px', 
                    backgroundColor: COLORS.cardBg, 
                    border: `1.5px solid ${COLORS.primary}`,
                    borderRadius: '2px',
                    opacity: 0.2,
                  }} />
                  <span style={{ fontFamily: TYPOGRAPHY.fontFamily, fontSize: '12px', color: COLORS.text }}>⏳ Pending Request</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ 
                    width: '16px', 
                    height: '16px', 
                    backgroundColor: COLORS.cardBgSecondary, 
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '2px',
                  }} />
                  <span style={{ fontFamily: TYPOGRAPHY.fontFamily, fontSize: '12px', color: COLORS.text }}>📅 Holidays</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ 
                    width: '16px', 
                    height: '16px', 
                    backgroundColor: COLORS.white, 
                    border: `2px solid ${COLORS.primary}`,
                    borderRadius: '2px',
                  }} />
                  <span style={{ fontFamily: TYPOGRAPHY.fontFamily, fontSize: '12px', color: COLORS.text }}>📍 Today</span>
                </div>
              </div>
            </div>

            {/* My Leave Requests Table with Filters */}
            <div style={{
              backgroundColor: COLORS.cardBg,
              border: `1px solid ${COLORS.border}`,
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{
                  margin: 0,
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontSize: '16px',
                  fontWeight: 600,
                  color: COLORS.text,
                }}>
                  My Leave Requests
                </h4>
              </div>
              
              {/* Table Filters */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '12px', 
                marginBottom: '16px',
                padding: '12px',
                backgroundColor: COLORS.cardBgSecondary,
                borderRadius: '6px',
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontSize: '12px',
                    color: COLORS.text,
                  }}>
                    Status
                  </label>
                  <select
                    value={tableFilters.status}
                    onChange={(e) => setTableFilters({ ...tableFilters, status: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: '4px',
                      fontFamily: TYPOGRAPHY.fontFamily,
                      backgroundColor: COLORS.white,
                      fontSize: '12px',
                      color: COLORS.text,
                    }}
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="taken">Taken</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontSize: '12px',
                    color: COLORS.text,
                  }}>
                    Leave Type
                  </label>
                  <select
                    value={tableFilters.leaveType}
                    onChange={(e) => setTableFilters({ ...tableFilters, leaveType: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: '4px',
                      fontFamily: TYPOGRAPHY.fontFamily,
                      backgroundColor: COLORS.white,
                      fontSize: '12px',
                      color: COLORS.text,
                    }}
                  >
                    <option value="">All Types</option>
                    {leaveTypes.map(lt => (
                      <option key={lt.id} value={lt.id.toString()}>{lt.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontSize: '12px',
                    color: COLORS.text,
                  }}>
                    From Date
                  </label>
                  <input
                    type="date"
                    value={tableFilters.dateFrom}
                    onChange={(e) => setTableFilters({ ...tableFilters, dateFrom: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: '4px',
                      fontFamily: TYPOGRAPHY.fontFamily,
                      backgroundColor: COLORS.white,
                      fontSize: '12px',
                      color: COLORS.text,
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontSize: '12px',
                    color: COLORS.text,
                  }}>
                    To Date
                  </label>
                  <input
                    type="date"
                    value={tableFilters.dateTo}
                    onChange={(e) => setTableFilters({ ...tableFilters, dateTo: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: '4px',
                      fontFamily: TYPOGRAPHY.fontFamily,
                      backgroundColor: COLORS.white,
                      fontSize: '12px',
                      color: COLORS.text,
                    }}
                  />
                </div>
              </div>
              
              {filteredLeaveRequests.length === 0 ? (
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  color: COLORS.textLight,
                  fontSize: '14px',
                }}>
                  No leave requests found
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontFamily: TYPOGRAPHY.fontFamily,
                  }}>
                    <thead>
                      <tr style={{ backgroundColor: COLORS.tableBg, borderBottom: `2px solid ${COLORS.border}` }}>
                        {['Request Date', 'Leave Type', 'Period', 'Status', 'Manager\'s Remarks', 'Actions'].map((h) => (
                          <th key={h} style={{
                            padding: '10px',
                            textAlign: 'left',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: COLORS.text,
                          }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeaveRequests
                        .sort((a: any, b: any) => new Date(b.created_at || b.from_date).getTime() - new Date(a.created_at || a.from_date).getTime())
                        .map((request: any, idx: number) => {
                          const statusLabels: { [key: string]: string } = {
                            'approved': 'Approved',
                            'taken': 'Taken',
                            'pending': 'Pending',
                            'scheduled': 'Scheduled',
                            'rejected': 'Rejected',
                          };
                          const statusIcons: { [key: string]: string } = {
                            'approved': '✓',
                            'taken': '✓',
                            'pending': '⏳',
                            'scheduled': '📅',
                            'rejected': '✗',
                          };
                          const leaveTypeName = leaveTypes.find(lt => lt.id === request.leave_type_id)?.name || 'Unknown';
                          const requestDate = new Date(request.created_at || request.from_date);
                          const fromDate = new Date(request.from_date);
                          const toDate = new Date(request.to_date);
                          const remarks = request.comments || request.manager_comments || '-';
                          const isPending = request.status === 'pending';
                          
                          // Status badge styling using opacity and borders
                          const statusOpacity = request.status === 'approved' || request.status === 'taken' ? 0.3 : 
                                               request.status === 'pending' ? 0.2 : 0.25;
                          const statusBorderWidth = request.status === 'approved' || request.status === 'taken' ? 2 : 1.5;
                          
                          return (
                            <tr key={idx} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                              <td style={{ padding: '10px', fontSize: '12px', color: COLORS.text }}>
                                {requestDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                              </td>
                              <td style={{ padding: '10px', fontSize: '12px', color: COLORS.text }}>
                                {leaveTypeName}
                              </td>
                              <td style={{ padding: '10px', fontSize: '12px', color: COLORS.text }}>
                                {fromDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                {fromDate.toDateString() !== toDate.toDateString() && ` - ${toDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}`}
                              </td>
                              <td style={{ padding: '10px' }}>
                                <span style={{
                                  padding: '4px 10px',
                                  borderRadius: '12px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  backgroundColor: COLORS.cardBg,
                                  border: `${statusBorderWidth}px solid ${COLORS.primary}`,
                                  color: COLORS.text,
                                  fontFamily: TYPOGRAPHY.fontFamily,
                                  opacity: statusOpacity,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}>
                                  <span>{statusIcons[request.status] || ''}</span>
                                  {statusLabels[request.status] || request.status}
                                </span>
                              </td>
                              <td style={{ padding: '10px', fontSize: '12px', color: COLORS.textLight, maxWidth: '200px' }}>
                                <span 
                                  title={remarks.length > 30 ? remarks : ''}
                                  style={{
                                    display: 'block',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {remarks.length > 30 ? `${remarks.substring(0, 30)}...` : remarks}
                                </span>
                              </td>
                              <td style={{ padding: '10px' }}>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button
                                    onClick={() => {
                                      alert(`Leave Details:\nType: ${leaveTypeName}\nPeriod: ${fromDate.toLocaleDateString()} - ${toDate.toLocaleDateString()}\nStatus: ${statusLabels[request.status]}\nRemarks: ${remarks}`);
                                    }}
                                    style={{
                                      padding: '4px 8px',
                                      border: `1px solid ${COLORS.border}`,
                                      backgroundColor: COLORS.white,
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '11px',
                                      color: COLORS.text,
                                      fontFamily: TYPOGRAPHY.fontFamily,
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = COLORS.primary;
                                      e.currentTarget.style.color = COLORS.white;
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = COLORS.white;
                                      e.currentTarget.style.color = COLORS.text;
                                    }}
                                    title="View Details"
                                  >
                                    👁️
                                  </button>
                                  {isPending && (
                                    <>
                                      <button
                                        onClick={() => {
                                          // TODO: Implement edit functionality
                                          alert('Edit functionality coming soon');
                                        }}
                                        style={{
                                          padding: '4px 8px',
                                          border: `1px solid ${COLORS.border}`,
                                          backgroundColor: COLORS.white,
                                          borderRadius: '4px',
                                          cursor: 'pointer',
                                          fontSize: '11px',
                                          color: COLORS.text,
                                          fontFamily: TYPOGRAPHY.fontFamily,
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.backgroundColor = COLORS.primary;
                                          e.currentTarget.style.color = COLORS.white;
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.backgroundColor = COLORS.white;
                                          e.currentTarget.style.color = COLORS.text;
                                        }}
                                        title="Edit"
                                      >
                                        ✏️
                                      </button>
                                      <button
                                        onClick={async () => {
                                          if (window.confirm('Are you sure you want to cancel this leave request?')) {
                                            try {
                                              await apiService.updateLeaveRequest(request.id, { status: 'cancelled' });
                                              await fetchData();
                                              alert('Leave request cancelled');
                                            } catch (err: any) {
                                              alert(`Failed to cancel: ${err.message}`);
                                            }
                                          }
                                        }}
                                        style={{
                                          padding: '4px 8px',
                                          border: `1px solid ${COLORS.border}`,
                                          backgroundColor: COLORS.white,
                                          borderRadius: '4px',
                                          cursor: 'pointer',
                                          fontSize: '11px',
                                          color: COLORS.text,
                                          fontFamily: TYPOGRAPHY.fontFamily,
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.backgroundColor = COLORS.primaryHover;
                                          e.currentTarget.style.color = COLORS.white;
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.backgroundColor = COLORS.white;
                                          e.currentTarget.style.color = COLORS.text;
                                        }}
                                        title="Cancel"
                                      >
                                        ✗
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
    );
  };

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
        My Leave Entitlements & Available Balance
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
          <select 
            value={entitlementFilters.leaveTypeId}
            onChange={(e) => {
              const newFilters = { ...entitlementFilters, leaveTypeId: e.target.value };
              setEntitlementFilters(newFilters);
              // Filter entitlements
              let filtered = allMyEntitlements;
              if (newFilters.leaveTypeId) {
                const selectedType = leaveTypes.find(t => t.id === parseInt(newFilters.leaveTypeId));
                if (selectedType) {
                  filtered = filtered.filter((ent: any) => 
                    ent.leave_type_name === selectedType.name || ent.leave_type_id === selectedType.id
                  );
                }
              }
              if (newFilters.leavePeriod) {
                const [start, end] = newFilters.leavePeriod.split(' - ');
                filtered = filtered.filter((ent: any) => {
                  const entStart = ent.leave_period_start?.slice(0, 10) || '';
                  const entEnd = ent.leave_period_end?.slice(0, 10) || '';
                  return entStart === start && entEnd === end;
                });
              }
              setMyEntitlements(filtered);
            }}
            style={{
            width: '100%',
            padding: '10px',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '6px',
            fontFamily: TYPOGRAPHY.fontFamily,
            backgroundColor: COLORS.white,
            boxSizing: 'border-box',
          }}>
            <option value="">-- All Leave Types --</option>
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
            Leave Period
          </label>
          <select 
            value={entitlementFilters.leavePeriod}
            onChange={(e) => {
              const newFilters = { ...entitlementFilters, leavePeriod: e.target.value };
              setEntitlementFilters(newFilters);
              // Filter entitlements
              let filtered = allMyEntitlements;
              if (newFilters.leaveTypeId) {
                const selectedType = leaveTypes.find(t => t.id === parseInt(newFilters.leaveTypeId));
                if (selectedType) {
                  filtered = filtered.filter((ent: any) => 
                    ent.leave_type_name === selectedType.name || ent.leave_type_id === selectedType.id
                  );
                }
              }
              if (newFilters.leavePeriod) {
                const [start, end] = newFilters.leavePeriod.split(' - ');
                filtered = filtered.filter((ent: any) => {
                  const entStart = ent.leave_period_start?.slice(0, 10) || '';
                  const entEnd = ent.leave_period_end?.slice(0, 10) || '';
                  return entStart === start && entEnd === end;
                });
              }
              setMyEntitlements(filtered);
            }}
            style={{
            width: '100%',
            padding: '10px',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '6px',
            fontFamily: TYPOGRAPHY.fontFamily,
            backgroundColor: COLORS.white,
            boxSizing: 'border-box',
          }}>
            <option value="">-- All Periods --</option>
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
              alert('Entitlement added successfully! Refreshing data...');
              // Refresh data
              await fetchData();
            } catch (err: any) {
              alert(`Failed to add entitlement: ${err.message || 'Unknown error'}`);
            }
          }}
        >
          + Add (self)
        </button>
        <div style={{
          fontFamily: TYPOGRAPHY.fontFamily,
          color: COLORS.text,
          fontSize: '15px',
          fontWeight: 500,
        }}>
          Total Available: {myEntitlements.reduce((sum, e) => {
            const balance = Number(e.balance_days) !== undefined ? Number(e.balance_days) : (Number(e.entitlement_days || 0) - Number(e.used_days || 0));
            return sum + Math.max(0, balance);
          }, 0).toFixed(1)} Days
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
                {['Leave Type', 'Total Entitlement', 'Used Days', 'Available to Take', 'Valid Period'].map((h) => (
                  <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: COLORS.text, borderBottom: `1px solid ${COLORS.border}`, fontWeight: 600 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {myEntitlements.map((ent, idx) => {
                const used = Number(ent.used_days || ent.balance_days ? (Number(ent.entitlement_days) - Number(ent.balance_days)) : 0) || 0;
                const total = Number(ent.entitlement_days) || 0;
                const balance = Number(ent.balance_days) !== undefined ? Number(ent.balance_days) : (total - used);
                const periodStart = ent.leave_period_start?.slice(0, 10) || `${new Date().getFullYear()}-01-01`;
                const periodEnd = ent.leave_period_end?.slice(0, 10) || `${new Date().getFullYear()}-12-31`;
                return (
                  <tr key={idx} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <td style={{ padding: '12px', fontSize: '14px', color: COLORS.primary, fontWeight: 500 }}>
                      {ent.leave_type_name || 'Unknown'}
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>
                      {total.toFixed(1)} days
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>
                      {used.toFixed(1)} days
                    </td>
                    <td style={{ 
                      padding: '12px', 
                      fontSize: '14px', 
                      fontWeight: 600, 
                      color: balance < 0 ? COLORS.danger : (balance > 0 ? COLORS.success : COLORS.text)
                    }}>
                      {balance.toFixed(1)} days
                      {balance < 0 && <span style={{ fontSize: '11px', color: COLORS.danger, marginLeft: '8px' }}>(Exceeded)</span>}
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: COLORS.textLight }}>
                      {periodStart} to {periodEnd}
                    </td>
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
