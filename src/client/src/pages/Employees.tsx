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

const jobTitles = [
  'Account Assistant',
  'Automation Tester',
  'Chief Executive Officer',
  'Chief Financial Officer',
  'Chief Technical Officer',
  'Content Specialist',
  'Customer Success Manager',
];

const employmentStatuses = [
  'Freelance',
  'Full-Time Contract',
  'Full-Time Permanent',
  'Full-Time Probation',
  'Part-Time Contract',
  'Part-Time Internship',
];

const subUnits = [
  'Arithwise HRM',
  'Administration',
  'Engineering',
  'Development',
  'Quality Assurance',
];

const includeOptions = [
  'Current Employees Only',
  'Current and Past Employees',
  'Past Employees Only',
];

const configurationOptions = [
  'Optional Fields',
  'Custom Fields',
  'Data Import',
  'Reporting Methods',
  'Termination Reasons',
];

const employeeRows = [
  { id: '001', name: 'Anita Silva', lastName: 'Silva', jobTitle: 'Automation Tester', status: 'Full-Time Permanent', subUnit: 'Engineering', supervisor: 'Alex Mathew' },
  { id: '002', name: 'Brian Costa', lastName: 'Costa', jobTitle: 'Content Specialist', status: 'Part-Time Contract', subUnit: 'Administration', supervisor: 'Sara Dias' },
  { id: '003', name: 'Carla Gomez', lastName: 'Gomez', jobTitle: 'Customer Success Manager', status: 'Full-Time Probation', subUnit: 'Arithwise HRM', supervisor: 'Alex Mathew' },
];

const reportRows = [
  'All Employee Sub Unit Hierarchy Report',
  'Employee Contact Info Report',
  'Employee Job Details',
  'PIM Sample Report',
];

const Employees: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'configuration' | 'list' | 'add' | 'reports'>('list');
  const [showConfigMenu, setShowConfigMenu] = useState(false);
  const [loginDetails, setLoginDetails] = useState(false);

  const renderFilters = () => (
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
          fontFamily: TYPOGRAPHY.fontFamily,
          fontSize: TYPOGRAPHY.textImportant.fontSize,
          fontWeight: 600,
          margin: '0 0 20px',
          color: COLORS.text,
        }}
      >
        Employee Information
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        {[
          { label: 'Employee Name', type: 'text', placeholder: 'Type for hints...' },
          { label: 'Employee ID', type: 'text', placeholder: 'Type for hints...' },
        ].map((field) => (
          <div key={field.label} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              style={{
                fontSize: TYPOGRAPHY.textNote.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                color: COLORS.text,
                fontWeight: 500,
              }}
            >
              {field.label}
            </label>
            <input
              type={field.type}
              placeholder={field.placeholder}
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

        {[
          { label: 'Employment Status', options: employmentStatuses },
          { label: 'Include', options: includeOptions },
        ].map((field) => (
          <div key={field.label} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              style={{
                fontSize: TYPOGRAPHY.textNote.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                color: COLORS.text,
                fontWeight: 500,
              }}
            >
              {field.label}
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
              <option value="">-- Select --</option>
              {field.options.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
        ))}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label
            style={{
              fontSize: TYPOGRAPHY.textNote.fontSize,
              fontFamily: TYPOGRAPHY.fontFamily,
              color: COLORS.text,
              fontWeight: 500,
            }}
          >
            Supervisor Name
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

        {[
          { label: 'Job Title', options: jobTitles },
          { label: 'Sub Unit', options: subUnits },
        ].map((field) => (
          <div key={field.label} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              style={{
                fontSize: TYPOGRAPHY.textNote.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                color: COLORS.text,
                fontWeight: 500,
              }}
            >
              {field.label}
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
              <option value="">-- Select --</option>
              {field.options.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
        ))}
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
  );

  const renderEmployeeList = () => (
    <>
      {renderFilters()}

      <div
        style={{
          backgroundColor: COLORS.white,
          borderRadius: '12px',
          border: `1px solid ${COLORS.border}`,
          padding: '20px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <button
            style={{
              padding: '10px 22px',
              backgroundColor: '#28a745',
              color: COLORS.white,
              border: 'none',
              borderRadius: '24px',
              fontFamily: TYPOGRAPHY.fontFamily,
              fontSize: TYPOGRAPHY.textImportant.fontSize,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            + Add
          </button>
          <div
            style={{
              fontFamily: TYPOGRAPHY.fontFamily,
              fontSize: TYPOGRAPHY.textImportant.fontSize,
              color: COLORS.textLight,
            }}
          >
            ({employeeRows.length}) Records Found
          </div>
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
                {['ID', 'First (& Middle) Name', 'Last Name', 'Job Title', 'Employment Status', 'Sub Unit', 'Supervisor', 'Actions'].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      textAlign: 'left',
                      padding: '12px 16px',
                      fontSize: TYPOGRAPHY.textImportant.fontSize,
                      color: COLORS.text,
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employeeRows.map((emp) => (
                <tr
                  key={emp.id}
                  style={{
                    borderBottom: `1px solid ${COLORS.border}`,
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.lightBg)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '12px 16px' }}>{emp.id}</td>
                  <td style={{ padding: '12px 16px' }}>{emp.name}</td>
                  <td style={{ padding: '12px 16px' }}>{emp.lastName}</td>
                  <td style={{ padding: '12px 16px' }}>{emp.jobTitle}</td>
                  <td style={{ padding: '12px 16px' }}>{emp.status}</td>
                  <td style={{ padding: '12px 16px' }}>{emp.subUnit}</td>
                  <td style={{ padding: '12px 16px' }}>{emp.supervisor}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        style={{
                          border: 'none',
                          background: 'none',
                          fontSize: '18px',
                          cursor: 'pointer',
                          color: COLORS.primary,
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        style={{
                          border: 'none',
                          background: 'none',
                          fontSize: '18px',
                          cursor: 'pointer',
                          color: '#dc3545',
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const renderAddEmployee = () => (
    <div
      style={{
        backgroundColor: COLORS.white,
        borderRadius: '12px',
        border: `1px solid ${COLORS.border}`,
        padding: '24px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
      }}
    >
      <h3
        style={{
          fontFamily: TYPOGRAPHY.fontFamily,
          fontSize: TYPOGRAPHY.textImportant.fontSize,
          fontWeight: 600,
          margin: '0 0 20px',
          color: COLORS.text,
        }}
      >
        Add Employee
      </h3>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div
          style={{
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            backgroundColor: COLORS.lightBg,
            border: `1px dashed ${COLORS.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: '48px', color: COLORS.textLight }}>👤</span>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#ff9800',
              color: COLORS.white,
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            +
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            {['First Name', 'Middle Name', 'Last Name'].map((label) => (
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
                  type="text"
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
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
            <label
              style={{
                fontSize: TYPOGRAPHY.textNote.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                fontWeight: 500,
                color: COLORS.text,
              }}
            >
              Employee ID
            </label>
            <input
              type="text"
              placeholder="0386"
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <span
              style={{
                fontSize: TYPOGRAPHY.textImportant.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                color: COLORS.text,
              }}
            >
              Create Login Details
            </span>
            <div
              onClick={() => setLoginDetails(!loginDetails)}
              style={{
                width: '50px',
                height: '26px',
                borderRadius: '13px',
                backgroundColor: loginDetails ? COLORS.primary : COLORS.border,
                position: 'relative',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
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
                  left: loginDetails ? '26px' : '2px',
                  transition: 'left 0.2s',
                }}
              />
            </div>
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
              Cancel
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
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div
      style={{
        backgroundColor: COLORS.white,
        borderRadius: '12px',
        border: `1px solid ${COLORS.border}`,
        padding: '24px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
      }}
    >
      <div style={{ marginBottom: '20px' }}>
        <label
          style={{
            fontSize: TYPOGRAPHY.textNote.fontSize,
            fontFamily: TYPOGRAPHY.fontFamily,
            fontWeight: 500,
            color: COLORS.text,
          }}
        >
          Report Name
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

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginBottom: '24px' }}>
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <button
          style={{
            padding: '10px 22px',
            backgroundColor: '#28a745',
            color: COLORS.white,
            border: 'none',
            borderRadius: '24px',
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: TYPOGRAPHY.textImportant.fontSize,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          + Add
        </button>
        <div
          style={{
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: TYPOGRAPHY.textImportant.fontSize,
            color: COLORS.textLight,
          }}
        >
          ({reportRows.length}) Records Found
        </div>
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
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reportRows.map((report) => (
              <tr
                key={report}
                style={{
                  borderBottom: `1px solid ${COLORS.border}`,
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.lightBg)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <td style={{ padding: '12px 16px' }}>{report}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      style={{
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        fontSize: '18px',
                        color: COLORS.primary,
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      style={{
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        fontSize: '18px',
                        color: '#dc3545',
                      }}
                    >
                      🗑️
                    </button>
                    <button
                      style={{
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        fontSize: '18px',
                        color: COLORS.textLight,
                      }}
                    >
                      📄
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div
      style={{
        padding: '24px 20px',
        maxWidth: '1400px',
        margin: '0 auto',
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

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px',
          position: 'relative',
        }}
      >
        {['configuration', 'list', 'add', 'reports'].map((tab) => {
          const labelMap: Record<string, string> = {
            configuration: 'Configuration',
            list: 'Employee List',
            add: 'Add Employee',
            reports: 'Reports',
          };
          const isActive = activeTab === tab;
          return (
            <div key={tab} style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  if (tab === 'configuration') {
                    setShowConfigMenu(!showConfigMenu);
                  } else {
                    setShowConfigMenu(false);
                    setActiveTab(tab as typeof activeTab);
                  }
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
                }}
              >
                {labelMap[tab]}
              </button>
              {tab === 'configuration' && showConfigMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: '48px',
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
                  {configurationOptions.map((option) => (
                    <div
                      key={option}
                      style={{
                        padding: '10px 16px',
                        fontFamily: TYPOGRAPHY.fontFamily,
                        fontSize: TYPOGRAPHY.textImportant.fontSize,
                        color: COLORS.text,
                        cursor: 'pointer',
                      }}
                      onClick={() => setShowConfigMenu(false)}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {activeTab === 'list' && renderEmployeeList()}
      {activeTab === 'add' && renderAddEmployee()}
      {activeTab === 'reports' && renderReports()}
      {activeTab === 'configuration' && (
        <div
          style={{
            backgroundColor: COLORS.white,
            borderRadius: '12px',
            border: `1px solid ${COLORS.border}`,
            padding: '32px',
            textAlign: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
            fontFamily: TYPOGRAPHY.fontFamily,
            color: COLORS.text,
            fontSize: TYPOGRAPHY.textImportant.fontSize,
          }}
        >
          Select a configuration option from the dropdown above.
        </div>
      )}
    </div>
  );
};

export default Employees;

