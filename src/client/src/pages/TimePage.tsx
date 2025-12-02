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

const pendingTimesheets = [
  { employeeName: 'Anita Silva', period: '01-12-2025 - 07-12-2025' },
  { employeeName: 'Martin Thomas', period: '01-12-2025 - 07-12-2025' },
  { employeeName: 'Demo User', period: '01-12-2025 - 07-12-2025' },
];

const TimePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'timesheets' | 'attendance' | 'reports' | 'projects'>('timesheets');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [timesheetMode, setTimesheetMode] = useState<'my' | 'employee'>('employee');

  const toggleMenu = (key: string) => {
    setOpenMenu((prev) => (prev === key ? null : key));
  };

  const renderEmployeeTimesheets = () => (
    <>
      {/* Select Employee */}
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
            margin: '0 0 16px',
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: TYPOGRAPHY.textImportant.fontSize,
            fontWeight: 600,
            color: COLORS.text,
          }}
        >
          Select Employee
        </h3>
        <div style={{ marginBottom: '12px' }}>
          <label
            style={{
              fontFamily: TYPOGRAPHY.fontFamily,
              fontSize: TYPOGRAPHY.textNote.fontSize,
              fontWeight: 500,
              color: COLORS.text,
            }}
          >
            Employee Name*
          </label>
          <input
            type="text"
            placeholder="Type for hints..."
            style={{
              width: '100%',
              marginTop: '6px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: `1px solid ${COLORS.border}`,
              fontFamily: TYPOGRAPHY.fontFamily,
              fontSize: TYPOGRAPHY.textImportant.fontSize,
              boxSizing: 'border-box',
            }}
          />
        </div>
        <div
          style={{
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: TYPOGRAPHY.textNote.fontSize,
            color: COLORS.textLight,
            marginBottom: '16px',
          }}
        >
          * Required
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
            View
          </button>
        </div>
      </div>

      {/* Pending Action table */}
      <div
        style={{
          backgroundColor: COLORS.white,
          borderRadius: '12px',
          border: `1px solid ${COLORS.border}`,
          padding: '20px 24px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
        }}
      >
        <h3
          style={{
            margin: '0 0 10px',
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: TYPOGRAPHY.textImportant.fontSize,
            fontWeight: 600,
            color: COLORS.text,
          }}
        >
          Timesheets Pending Action
        </h3>
        <div
          style={{
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: TYPOGRAPHY.textNote.fontSize,
            color: COLORS.textLight,
            marginBottom: '12px',
          }}
        >
          ({pendingTimesheets.length}) Records Found
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
                <th
                  style={{
                    textAlign: 'left',
                    padding: '10px 14px',
                    fontSize: TYPOGRAPHY.textImportant.fontSize,
                    color: COLORS.text,
                  }}
                >
                  Employee Name
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '10px 14px',
                    fontSize: TYPOGRAPHY.textImportant.fontSize,
                    color: COLORS.text,
                  }}
                >
                  Timesheet Period
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '10px 14px',
                    fontSize: TYPOGRAPHY.textImportant.fontSize,
                    color: COLORS.text,
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {pendingTimesheets.map((row, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: `1px solid ${COLORS.border}`,
                  }}
                >
                  <td style={{ padding: '10px 14px' }}>{row.employeeName}</td>
                  <td style={{ padding: '10px 14px' }}>{row.period}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <button
                      style={{
                        padding: '8px 18px',
                        borderRadius: '24px',
                        border: 'none',
                        backgroundColor: COLORS.accent,
                        color: COLORS.white,
                        fontFamily: TYPOGRAPHY.fontFamily,
                        fontSize: TYPOGRAPHY.textNote.fontSize,
                        cursor: 'pointer',
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const renderMyTimesheet = () => (
    <div
      style={{
        backgroundColor: COLORS.white,
        borderRadius: '12px',
        border: `1px solid ${COLORS.border}`,
        padding: '24px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          fontFamily: TYPOGRAPHY.fontFamily,
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: TYPOGRAPHY.textImportant.fontSize,
            fontWeight: 600,
            color: COLORS.text,
          }}
        >
          My Timesheet
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: `1px solid ${COLORS.border}`,
              backgroundColor: COLORS.white,
              cursor: 'pointer',
            }}
          >
            ‹
          </button>
          <input
            type="text"
            value="2025-01-12 to 2025-01-12"
            readOnly
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: `1px solid ${COLORS.border}`,
              fontFamily: TYPOGRAPHY.fontFamily,
              fontSize: TYPOGRAPHY.textImportant.fontSize,
              width: '220px',
            }}
          />
          <button
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: `1px solid ${COLORS.border}`,
              backgroundColor: COLORS.white,
              cursor: 'pointer',
            }}
          >
            ›
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
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
                borderBottom: `1px solid ${COLORS.border}`,
              }}
            >
              <th style={{ padding: '10px 14px', textAlign: 'left' }}>Project</th>
              <th style={{ padding: '10px 14px', textAlign: 'left' }}>Activity</th>
              {[1, 2, 3, 4, 5, 6, 7].map((d, idx) => {
                const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                return (
                  <th key={d} style={{ padding: '10px 14px', textAlign: 'center' }}>
                    <div style={{ fontSize: TYPOGRAPHY.textImportant.fontSize }}>{d}</div>
                    <div
                      style={{
                        fontSize: TYPOGRAPHY.textNote.fontSize,
                        color: COLORS.textLight,
                      }}
                    >
                      {dayNames[idx]}
                    </div>
                  </th>
                );
              })}
              <th style={{ padding: '10px 14px', textAlign: 'center' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={9} style={{ padding: '16px', textAlign: 'center', color: COLORS.textLight }}>
                No Records Found
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: TYPOGRAPHY.fontFamily,
        }}
      >
        <div style={{ fontSize: TYPOGRAPHY.textNote.fontSize, color: COLORS.text }}>
          <strong>Status:</strong> Not Submitted
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            style={{
              padding: '8px 22px',
              borderRadius: '24px',
              border: `1px solid ${COLORS.accent}`,
              backgroundColor: COLORS.white,
              color: COLORS.accent,
              fontFamily: TYPOGRAPHY.fontFamily,
              fontSize: TYPOGRAPHY.textImportant.fontSize,
              cursor: 'pointer',
            }}
          >
            Edit
          </button>
          <button
            style={{
              padding: '8px 22px',
              borderRadius: '24px',
              border: 'none',
              backgroundColor: COLORS.accent,
              color: COLORS.white,
              fontFamily: TYPOGRAPHY.fontFamily,
              fontSize: TYPOGRAPHY.textImportant.fontSize,
              cursor: 'pointer',
            }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
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

      <h1
        style={{
          color: COLORS.primary,
          marginBottom: '16px',
          marginTop: 0,
          fontSize: TYPOGRAPHY.heading.fontSize,
          fontFamily: TYPOGRAPHY.fontFamily,
          fontWeight: TYPOGRAPHY.heading.fontWeight,
        }}
      >
        Time / Timesheets
      </h1>

      {/* Top tab row with dropdowns */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {([
          { key: 'timesheets', label: 'Timesheets', menuKey: 'timesheetsMenu', items: ['My Timesheets', 'Employee Timesheets'] },
          {
            key: 'attendance',
            label: 'Attendance',
            menuKey: 'attendanceMenu',
            items: ['My Records', 'Punch In/Out', 'Employee Records', 'Configuration'],
          },
          {
            key: 'reports',
            label: 'Reports',
            menuKey: 'reportsMenu',
            items: ['Project Reports', 'Employee Reports', 'Attendance Summary'],
          },
          {
            key: 'projects',
            label: 'Project Info',
            menuKey: 'projectsMenu',
            items: ['Customers', 'Projects'],
          },
        ] as const).map((tab) => {
          const isActive = activeTab === tab.key;
          const isOpen = openMenu === tab.menuKey;
          return (
            <div key={tab.key} style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setActiveTab(tab.key);
                  toggleMenu(tab.menuKey);
                }}
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {tab.label}
                <span style={{ fontSize: '10px' }}>▼</span>
              </button>
              {isOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '44px',
                    left: 0,
                    backgroundColor: COLORS.white,
                    borderRadius: '8px',
                    border: `1px solid ${COLORS.border}`,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    padding: '8px 0',
                    minWidth: '200px',
                    zIndex: 10,
                  }}
                >
                  {tab.items.map((item) => (
                    <div
                      key={item}
                      style={{
                        padding: '8px 14px',
                        fontFamily: TYPOGRAPHY.fontFamily,
                        fontSize: TYPOGRAPHY.textImportant.fontSize,
                        color: COLORS.text,
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        if (tab.key === 'timesheets') {
                          setTimesheetMode(item === 'My Timesheets' ? 'my' : 'employee');
                        }
                        setOpenMenu(null);
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {activeTab === 'timesheets' ? (
        timesheetMode === 'my' ? renderMyTimesheet() : renderEmployeeTimesheets()
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
          This tab is a placeholder. The detailed functionality for {activeTab} can be added next.
        </div>
      )}
    </div>
  );
};

export default TimePage;


