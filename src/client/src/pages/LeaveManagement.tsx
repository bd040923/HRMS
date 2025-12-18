/**
 * arithwise_hrms Leave Management System
 * Copyright (C) 2024 Arithwise Inc.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
                      'leaveReport' | 'myLeaveReport' |
                      'leavePeriod' | 'leaveTypes' | 'workWeek' | 'holidays';

// Mock data for leave types
const mockLeaveTypes = [
  'CAN - Bereavement', 'CAN - FMLA', 'CAN - Maternity', 'CAN - Personal', 'CAN - Vacation',
  'James Butler', 'Sick Leave [Deleted]', 'US - Bereavement', 'US - FMLA', 'US - Maternity', 'US - Personal', 'US - Vacation'
];

// Mock data for holidays
const mockHolidays = [
  { name: "New Year's Day", date: '2025-01-01', fullDay: true, repeatsAnnually: true },
  { name: "St. Patrick's Day (Canada)", date: '2025-16-03', fullDay: true, repeatsAnnually: true },
  { name: "St. George's Day (Canada)", date: '2025-20-04', fullDay: true, repeatsAnnually: true },
  { name: 'Victoria Day (Canada)', date: '2025-18-05', fullDay: true, repeatsAnnually: true },
  { name: 'National Aboriginal Day (Canada)', date: '2025-21-06', fullDay: true, repeatsAnnually: true },
  { name: 'June Day (Canada)', date: '2025-22-06', fullDay: true, repeatsAnnually: true },
];

const LeaveManagement: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<ActiveSection>('apply');
  const [entitlementsOpen, setEntitlementsOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [configureOpen, setConfigureOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [generateFor, setGenerateFor] = useState<'leaveType' | 'employee'>('leaveType');
  
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

      <div ref={reportsRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setReportsOpen(!reportsOpen)}
          style={{
            padding: '12px 24px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: ['leaveReport', 'myLeaveReport'].includes(activeSection) ? COLORS.activeTab : 'transparent',
            color: ['leaveReport', 'myLeaveReport'].includes(activeSection) ? COLORS.white : COLORS.textLight,
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '15px',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          Reports ▼
        </button>
        {reportsOpen && (
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
            minWidth: '280px',
          }}>
            {[
              { label: 'Leave Entitlements and Usage Report', value: 'leaveReport' as ActiveSection },
              { label: 'My Leave Entitlements and Usage Report', value: 'myLeaveReport' as ActiveSection },
            ].map(item => (
              <button
                key={item.value}
                onClick={() => {
                  setActiveSection(item.value);
                  setReportsOpen(false);
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
    </div>
  );

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
      <p style={{
        fontFamily: TYPOGRAPHY.fontFamily,
        color: COLORS.textLight,
        fontSize: '15px',
        margin: 0,
      }}>
        No Leave Types with Leave Balance
      </p>
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
            <option>-- Select --</option>
            <option>US - Personal</option>
            <option>US - Bereavement</option>
            <option>US - FMLA</option>
            <option>US - Vacation</option>
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
        marginBottom: '16px',
      }}>
        No Records Found
      </p>

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
              {['Date', 'Employee Name', 'Leave Type', 'Leave Balance (Days)', 'Number of Days', 'Status', 'Comments', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: COLORS.text, borderBottom: `1px solid ${COLORS.border}` }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        </table>
      </div>
    </div>
  );

  const renderLeaveReport = () => (
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
          <select style={{
            width: '100%',
            padding: '10px',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '6px',
            fontFamily: TYPOGRAPHY.fontFamily,
            backgroundColor: COLORS.white,
            boxSizing: 'border-box',
          }}>
            <option>CAN - Bereavement</option>
            <option>US - Personal</option>
            <option>US - FMLA</option>
            <option>US - Vacation</option>
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
            <option>2025-01-01 - 2025-31-12</option>
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
          Generate
        </button>
      </div>
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
      
      <div style={{ marginBottom: '20px', maxWidth: '300px' }}>
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
          <option>2025-01-01 - 2025-31-12</option>
        </select>
      </div>

      <div style={{ marginBottom: '16px', fontSize: '12px', color: COLORS.textLight, fontFamily: TYPOGRAPHY.fontFamily }}>
        * Required
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
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
          Generate
        </button>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <button style={{
          padding: '6px 12px',
          border: `1px solid ${COLORS.border}`,
          backgroundColor: COLORS.white,
          cursor: 'pointer',
          fontSize: '16px',
        }}>
          ⛶
        </button>
      </div>

      <p style={{
        fontFamily: TYPOGRAPHY.fontFamily,
        color: COLORS.textLight,
        fontSize: '15px',
        marginBottom: '16px',
      }}>
        (12) Records Found
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
            {mockLeaveTypes.slice(0, 12).map((type, idx) => (
              <tr key={idx} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{type}</td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>0.00</td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>0.00</td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>0.00</td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>0.00</td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>0.00</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
        <button style={{
          padding: '8px 20px',
          borderRadius: '6px',
          border: 'none',
          backgroundColor: COLORS.success,
          color: COLORS.white,
          fontFamily: TYPOGRAPHY.fontFamily,
          cursor: 'pointer',
          fontSize: '14px',
        }}>
          + Add
        </button>
      </div>

      <p style={{
        fontFamily: TYPOGRAPHY.fontFamily,
        color: COLORS.textLight,
        fontSize: '15px',
        marginBottom: '16px',
      }}>
        (11) Records Found
      </p>

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
                    setSelectedItems(mockLeaveTypes.map((_, i) => i));
                  } else {
                    setSelectedItems([]);
                  }
                }} />
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: COLORS.text, borderBottom: `1px solid ${COLORS.border}` }}>
                Name
              </th>
              <th style={{ padding: '12px', textAlign: 'right', fontSize: '13px', color: COLORS.text, borderBottom: `1px solid ${COLORS.border}` }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {mockLeaveTypes.map((type, idx) => (
              <tr key={idx} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                <td style={{ padding: '12px' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedItems.includes(idx)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems([...selectedItems, idx]);
                      } else {
                        setSelectedItems(selectedItems.filter(i => i !== idx));
                      }
                    }}
                  />
                </td>
                <td style={{ padding: '12px', fontSize: '14px', color: type.includes('[Deleted]') ? COLORS.textLight : COLORS.primary, fontStyle: type.includes('[Deleted]') ? 'italic' : 'normal' }}>
                  {type}
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '8px', fontSize: '16px', color: COLORS.textLight }}>
                    🗑️
                  </button>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: COLORS.textLight }}>
                    ✏️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
      
      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, idx) => (
        <div key={day} style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '14px',
            color: COLORS.text,
          }}>
            {day}*
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
            <option>{idx < 5 ? 'Full Day' : 'Non-working Day'}</option>
            <option>Full Day</option>
            <option>Half Day</option>
            <option>Non-working Day</option>
          </select>
        </div>
      ))}

      <div style={{ marginBottom: '24px', fontSize: '12px', color: COLORS.textLight, fontFamily: TYPOGRAPHY.fontFamily }}>
        * Required
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
        <button style={{
          padding: '8px 20px',
          borderRadius: '6px',
          border: 'none',
          backgroundColor: COLORS.success,
          color: COLORS.white,
          fontFamily: TYPOGRAPHY.fontFamily,
          cursor: 'pointer',
          fontSize: '14px',
        }}>
          + Add
        </button>
      </div>

      <p style={{
        fontFamily: TYPOGRAPHY.fontFamily,
        color: COLORS.textLight,
        fontSize: '15px',
        marginBottom: '16px',
      }}>
        ({mockHolidays.length + 11}) Records Found
      </p>

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
            {mockHolidays.map((holiday, idx) => (
              <tr key={idx} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                <td style={{ padding: '12px' }}>
                  <input type="checkbox" />
                </td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{holiday.name}</td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{holiday.date}</td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{holiday.fullDay ? 'Full Day' : 'Half Day'}</td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{holiday.repeatsAnnually ? 'Yes' : 'No'}</td>
                <td style={{ padding: '12px', textAlign: 'left' }}>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '8px', fontSize: '16px', color: COLORS.textLight }}>
                    🗑️
                  </button>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: COLORS.textLight }}>
                    ✏️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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

      <p style={{
        fontFamily: TYPOGRAPHY.fontFamily,
        color: COLORS.textLight,
        fontSize: '15px',
        marginBottom: '16px',
      }}>
        No Records Found
      </p>

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
              {['Date', 'Employee Name', 'Leave Type', 'Leave Balance (Days)', 'Number of Days', 'Status', 'Comments', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: COLORS.text, borderBottom: `1px solid ${COLORS.border}` }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        </table>
      </div>
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
            <option>-- Select --</option>
            <option>US - Personal</option>
            <option>US - FMLA</option>
            <option>US - Vacation</option>
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
            <option>2025-01-01 - 2025-31-12</option>
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
            <option>2025-01-01 - 2025-31-12</option>
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
            <option>2025-01-01 - 2025-31-12</option>
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
        }}>
          + Add
        </button>
        <div style={{
          fontFamily: TYPOGRAPHY.fontFamily,
          color: COLORS.textLight,
          fontSize: '15px',
        }}>
          Total 0.00 Day(s)
        </div>
      </div>

      <p style={{
        fontFamily: TYPOGRAPHY.fontFamily,
        color: COLORS.textLight,
        fontSize: '15px',
        marginBottom: '16px',
      }}>
        No Records Found
      </p>

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
              {['Leave Type', 'Entitlement Type', 'Valid From', 'Valid To', 'Days', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: COLORS.text, borderBottom: `1px solid ${COLORS.border}` }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        </table>
      </div>
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
