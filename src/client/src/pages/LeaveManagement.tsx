import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const COLORS = {
  primary: '#78176b',
  primaryHover: '#590a4f',
  lightBg: '#faf3ff',
  lightBgAlt: '#fffafe',
  white: '#ffffff',
  text: '#333333',
  textLight: '#666666',
  border: '#e0e0e0',
  accent: '#28a745',
};

const TYPOGRAPHY = {
  fontFamily: "'Segoe UI', Arial, sans-serif",
  heading: { fontSize: '2rem', fontWeight: 500 },
  textImportant: { fontSize: '16px' },
  textNote: { fontSize: '14px' },
};

const leaveRows = [
  {
    date: '2025-01-05',
    employeeName: 'Anita Silva',
    leaveType: 'Annual Leave',
    balance: 10,
    days: 2,
    status: 'Pending Approval',
    comments: 'Family event',
  },
];

const LeaveManagement: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'apply' | 'my' | 'entitlements' | 'reports' | 'configure' | 'list' | 'assign'>('list');

  const renderLeaveList = () => (
    <>
      {/* Filters Card */}
      <div
        style={{
          backgroundColor: COLORS.white,
          borderRadius: '12px',
          border: `1px solid ${COLORS.border}`,
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
        }}
      >
        <h3
          style={{
            margin: '0 0 20px',
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: TYPOGRAPHY.textImportant.fontSize,
            fontWeight: 600,
            color: COLORS.text,
          }}
        >
          Leave List
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '20px',
          }}
        >
          {/* From / To date */}
          {['From Date', 'To Date'].map((label, idx) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label
                style={{
                  fontSize: TYPOGRAPHY.textNote.fontSize,
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontWeight: 500,
                  color: COLORS.text,
                }}
              >
                {label}
              </label>
              <input
                type="date"
                defaultValue={idx === 0 ? '2025-01-01' : '2025-12-31'}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '8px',
                  fontSize: TYPOGRAPHY.textImportant.fontSize,
                  fontFamily: TYPOGRAPHY.fontFamily,
                  boxSizing: 'border-box',
                }}
              />
            </div>
          ))}

          {/* Status / Leave type */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              style={{
                fontSize: TYPOGRAPHY.textNote.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                fontWeight: 500,
                color: COLORS.text,
              }}
            >
              Show Leave with Status*
            </label>
            <select
              style={{
                width: '100%',
                padding: '10px 14px',
                border: `1px solid ${COLORS.border}`,
                borderRadius: '8px',
                fontSize: TYPOGRAPHY.textImportant.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                backgroundColor: COLORS.white,
              }}
            >
              <option>-- Select --</option>
              <option>Pending Approval</option>
              <option>Approved</option>
              <option>Rejected</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              style={{
                fontSize: TYPOGRAPHY.textNote.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                fontWeight: 500,
                color: COLORS.text,
              }}
            >
              Leave Type
            </label>
            <select
              style={{
                width: '100%',
                padding: '10px 14px',
                border: `1px solid ${COLORS.border}`,
                borderRadius: '8px',
                fontSize: TYPOGRAPHY.textImportant.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                backgroundColor: COLORS.white,
              }}
            >
              <option>-- Select --</option>
              <option>Annual Leave</option>
              <option>Sick Leave</option>
            </select>
          </div>

          {/* Employee name / Sub unit */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              style={{
                fontSize: TYPOGRAPHY.textNote.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                fontWeight: 500,
                color: COLORS.text,
              }}
            >
              Employee Name
            </label>
            <input
              type="text"
              placeholder="Type for hints..."
              style={{
                width: '100%',
                padding: '10px 14px',
                border: `1px solid ${COLORS.border}`,
                borderRadius: '8px',
                fontSize: TYPOGRAPHY.textImportant.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              style={{
                fontSize: TYPOGRAPHY.textNote.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                fontWeight: 500,
                color: COLORS.text,
              }}
            >
              Sub Unit
            </label>
            <select
              style={{
                width: '100%',
                padding: '10px 14px',
                border: `1px solid ${COLORS.border}`,
                borderRadius: '8px',
                fontSize: TYPOGRAPHY.textImportant.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                backgroundColor: COLORS.white,
              }}
            >
              <option>-- Select --</option>
              <option>Arithwise HRM</option>
              <option>Administration</option>
              <option>Engineering</option>
            </select>
          </div>

          {/* Include past employees toggle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignSelf: 'flex-end' }}>
            <label
              style={{
                fontSize: TYPOGRAPHY.textNote.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                fontWeight: 500,
                color: COLORS.text,
              }}
            >
              Include Past Employees
            </label>
            <div
              style={{
                width: '50px',
                height: '26px',
                borderRadius: '13px',
                backgroundColor: COLORS.border,
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  backgroundColor: COLORS.white,
                  position: 'absolute',
                  top: '2px',
                  left: '2px',
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textNote.fontSize, color: COLORS.textLight, marginBottom: '16px' }}>
          * Required
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            style={{
              padding: '10px 24px',
              borderRadius: '24px',
              border: `1px solid ${COLORS.accent}`,
              backgroundColor: COLORS.white,
              color: COLORS.accent,
              fontFamily: TYPOGRAPHY.fontFamily,
              fontSize: TYPOGRAPHY.textImportant.fontSize,
              cursor: 'pointer',
            }}
          >
            Reset
          </button>
          <button
            style={{
              padding: '10px 24px',
              borderRadius: '24px',
              border: 'none',
              backgroundColor: COLORS.accent,
              color: COLORS.white,
              fontFamily: TYPOGRAPHY.fontFamily,
              fontSize: TYPOGRAPHY.textImportant.fontSize,
              cursor: 'pointer',
            }}
          >
            Search
          </button>
        </div>
      </div>

      {/* Results table */}
      <div
        style={{
          backgroundColor: COLORS.white,
          borderRadius: '12px',
          border: `1px solid ${COLORS.border}`,
          padding: '20px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, color: COLORS.textLight, marginBottom: '12px' }}>
          {leaveRows.length === 0 ? 'No Records Found' : `(${leaveRows.length}) Records Found`}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: TYPOGRAPHY.fontFamily,
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: COLORS.lightBg,
                  borderBottom: `2px solid ${COLORS.border}`,
                }}
              >
                {['Date', 'Employee Name', 'Leave Type', 'Leave Balance (Days)', 'Number of Days', 'Status', 'Comments', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: TYPOGRAPHY.textImportant.fontSize, color: COLORS.text }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leaveRows.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '16px', textAlign: 'center', color: COLORS.textLight }}>
                    No Records Found
                  </td>
                </tr>
              ) : (
                leaveRows.map((row, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: `1px solid ${COLORS.border}`,
                    }}
                  >
                    <td style={{ padding: '10px 14px' }}>{row.date}</td>
                    <td style={{ padding: '10px 14px' }}>{row.employeeName}</td>
                    <td style={{ padding: '10px 14px' }}>{row.leaveType}</td>
                    <td style={{ padding: '10px 14px' }}>{row.balance}</td>
                    <td style={{ padding: '10px 14px' }}>{row.days}</td>
                    <td style={{ padding: '10px 14px' }}>{row.status}</td>
                    <td style={{ padding: '10px 14px' }}>{row.comments}</td>
                    <td style={{ padding: '10px 14px' }}>🗑️</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  return (
    <div
      style={{
        padding: '24px 32px',
        maxWidth: '100%',
        margin: '0',
        backgroundColor: COLORS.lightBg,
        minHeight: 'calc(100vh - 80px)',
      }}
    >
      <button
        onClick={() => navigate('/dashboard')}
        style={{
          padding: '8px 16px',
          backgroundColor: COLORS.textLight,
          color: COLORS.white,
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: TYPOGRAPHY.textNote.fontSize,
          fontFamily: TYPOGRAPHY.fontFamily,
          fontWeight: 500,
          marginBottom: '20px',
        }}
      >
        ← Back to Dashboard
      </button>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['apply', 'my', 'entitlements', 'reports', 'configure', 'list', 'assign'].map((tab) => {
          const labelMap: Record<string, string> = {
            apply: 'Apply',
            my: 'My Leave',
            entitlements: 'Entitlements',
            reports: 'Reports',
            configure: 'Configure',
            list: 'Leave List',
            assign: 'Assign Leave',
          };
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              style={{
                padding: '10px 18px',
                borderRadius: '24px',
                border: 'none',
                backgroundColor: isActive ? COLORS.primary : '#f5f5f5',
                color: isActive ? COLORS.white : COLORS.textLight,
                fontFamily: TYPOGRAPHY.fontFamily,
                fontSize: TYPOGRAPHY.textImportant.fontSize,
                cursor: 'pointer',
                boxShadow: isActive ? '0 2px 6px rgba(0,0,0,0.15)' : 'none',
              }}
            >
              {labelMap[tab]}
            </button>
          );
        })}
      </div>

      {activeTab === 'list' ? (
        renderLeaveList()
      ) : (
        <div
          style={{
            backgroundColor: COLORS.white,
            borderRadius: '12px',
            border: `1px solid ${COLORS.border}`,
            padding: '32px',
            textAlign: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
            fontFamily: TYPOGRAPHY.fontFamily,
            color: COLORS.textLight,
            fontSize: TYPOGRAPHY.textImportant.fontSize,
          }}
        >
          This tab is a placeholder. The detailed functionality can be added next.
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;

