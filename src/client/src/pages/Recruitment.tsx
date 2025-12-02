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
  'Chief Executive Officer',
  'Chief Financial Officer',
  'Chief Technical Officer',
  'Content Specialist',
];

const vacancyNames = [
  'Junior Account Assistant',
  'Payroll Administrator',
  'Sales Representative',
  'Senior QA Lead',
  'Senior Support Specialist',
];

const hiringManagers = ['Rahul Das', 'Rahul Patil', 'Demo User'];

const candidateRows = [
  {
    vacancy: 'Payroll Administrator',
    candidate: 'John Duplicate',
    hiringManager: 'Rahul Patil',
    applied: '2025-02-12',
    status: 'Application Initiated',
  },
  {
    vacancy: 'Junior Account Assistant',
    candidate: 'Jane Smith',
    hiringManager: 'Rahul Das',
    applied: '2025-02-10',
    status: 'Interview Scheduled',
  },
];

const vacancyRows = [
  {
    vacancy: 'Junior Account Assistant',
    jobTitle: 'Account Assistant',
    hiringManager: 'Deleted',
    status: 'Active',
  },
  {
    vacancy: 'Payroll Administrator',
    jobTitle: 'Payroll Administrator',
    hiringManager: 'Demo User',
    status: 'Active',
  },
];

const Recruitment: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'candidates' | 'vacancies'>('candidates');

  const renderCandidates = () => (
    <>
      {/* Filters */}
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
          Candidates
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
            marginBottom: '20px',
          }}
        >
          {/* Job Title */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              style={{
                fontSize: TYPOGRAPHY.textNote.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                fontWeight: 500,
                color: COLORS.text,
              }}
            >
              Job Title
            </label>
            <select
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: `1px solid ${COLORS.border}`,
                fontSize: TYPOGRAPHY.textImportant.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                backgroundColor: COLORS.white,
              }}
            >
              <option>-- Select --</option>
              {jobTitles.map((j) => (
                <option key={j}>{j}</option>
              ))}
            </select>
          </div>

          {/* Vacancy */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              style={{
                fontSize: TYPOGRAPHY.textNote.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                fontWeight: 500,
                color: COLORS.text,
              }}
            >
              Vacancy
            </label>
            <select
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: `1px solid ${COLORS.border}`,
                fontSize: TYPOGRAPHY.textImportant.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                backgroundColor: COLORS.white,
              }}
            >
              <option>-- Select --</option>
              {vacancyNames.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </div>

          {/* Hiring Manager */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              style={{
                fontSize: TYPOGRAPHY.textNote.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                fontWeight: 500,
                color: COLORS.text,
              }}
            >
              Hiring Manager
            </label>
            <select
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: `1px solid ${COLORS.border}`,
                fontSize: TYPOGRAPHY.textImportant.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                backgroundColor: COLORS.white,
              }}
            >
              <option>-- Select --</option>
              {hiringManagers.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              style={{
                fontSize: TYPOGRAPHY.textNote.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                fontWeight: 500,
                color: COLORS.text,
              }}
            >
              Status
            </label>
            <select
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: `1px solid ${COLORS.border}`,
                fontSize: TYPOGRAPHY.textImportant.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                backgroundColor: COLORS.white,
              }}
            >
              <option>-- Select --</option>
              <option>Application Initiated</option>
              <option>Shortlisted</option>
              <option>Rejected</option>
            </select>
          </div>

          {/* Candidate Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gridColumn: 'span 2', gap: '6px' }}>
            <label
              style={{
                fontSize: TYPOGRAPHY.textNote.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                fontWeight: 500,
                color: COLORS.text,
              }}
            >
              Candidate Name
            </label>
            <input
              type="text"
              placeholder="Type for hints..."
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: `1px solid ${COLORS.border}`,
                fontSize: TYPOGRAPHY.textImportant.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Keywords */}
          <div style={{ display: 'flex', flexDirection: 'column', gridColumn: 'span 2', gap: '6px' }}>
            <label
              style={{
                fontSize: TYPOGRAPHY.textNote.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                fontWeight: 500,
                color: COLORS.text,
              }}
            >
              Keywords
            </label>
            <input
              type="text"
              placeholder="Enter comma separated words..."
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: `1px solid ${COLORS.border}`,
                fontSize: TYPOGRAPHY.textImportant.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Date of Application */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              style={{
                fontSize: TYPOGRAPHY.textNote.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                fontWeight: 500,
                color: COLORS.text,
              }}
            >
              Date of Application (From)
            </label>
            <input
              type="date"
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: `1px solid ${COLORS.border}`,
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
              Date of Application (To)
            </label>
            <input
              type="date"
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: `1px solid ${COLORS.border}`,
                fontSize: TYPOGRAPHY.textImportant.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Method of Application */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              style={{
                fontSize: TYPOGRAPHY.textNote.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                fontWeight: 500,
                color: COLORS.text,
              }}
            >
              Method of Application
            </label>
            <select
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: `1px solid ${COLORS.border}`,
                fontSize: TYPOGRAPHY.textImportant.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                backgroundColor: COLORS.white,
              }}
            >
              <option>-- Select --</option>
              <option>Manual</option>
              <option>Online</option>
            </select>
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
          padding: '20px 24px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <button
            style={{
              padding: '10px 22px',
              borderRadius: '24px',
              border: 'none',
              backgroundColor: COLORS.accent,
              color: COLORS.white,
              fontFamily: TYPOGRAPHY.fontFamily,
              fontSize: TYPOGRAPHY.textImportant.fontSize,
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
            ({candidateRows.length}) Records Found
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
                {['Vacancy', 'Candidate', 'Hiring Manager', 'Date of Application', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: TYPOGRAPHY.textImportant.fontSize, color: COLORS.text }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {candidateRows.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  <td style={{ padding: '10px 14px' }}>{row.vacancy}</td>
                  <td style={{ padding: '10px 14px' }}>{row.candidate}</td>
                  <td style={{ padding: '10px 14px' }}>{row.hiringManager}</td>
                  <td style={{ padding: '10px 14px' }}>{row.applied}</td>
                  <td style={{ padding: '10px 14px' }}>{row.status}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <button
                      style={{
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        fontSize: '18px',
                        marginRight: '8px',
                      }}
                    >
                      👁️
                    </button>
                    <button
                      style={{
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        fontSize: '18px',
                        marginRight: '8px',
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
                      }}
                    >
                      🗑️
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

  const renderVacancies = () => (
    <>
      {/* Filters */}
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
          Vacancies
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
            marginBottom: '20px',
          }}
        >
          {/* Job Title */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              style={{
                fontSize: TYPOGRAPHY.textNote.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                fontWeight: 500,
                color: COLORS.text,
              }}
            >
              Job Title
            </label>
            <select
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: `1px solid ${COLORS.border}`,
                fontSize: TYPOGRAPHY.textImportant.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                backgroundColor: COLORS.white,
              }}
            >
              <option>-- Select --</option>
              {jobTitles.map((j) => (
                <option key={j}>{j}</option>
              ))}
            </select>
          </div>

          {/* Vacancy */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              style={{
                fontSize: TYPOGRAPHY.textNote.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                fontWeight: 500,
                color: COLORS.text,
              }}
            >
              Vacancy
            </label>
            <select
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: `1px solid ${COLORS.border}`,
                fontSize: TYPOGRAPHY.textImportant.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                backgroundColor: COLORS.white,
              }}
            >
              <option>-- Select --</option>
              {vacancyNames.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </div>

          {/* Hiring Manager */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              style={{
                fontSize: TYPOGRAPHY.textNote.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                fontWeight: 500,
                color: COLORS.text,
              }}
            >
              Hiring Manager
            </label>
            <select
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: `1px solid ${COLORS.border}`,
                fontSize: TYPOGRAPHY.textImportant.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                backgroundColor: COLORS.white,
              }}
            >
              <option>-- Select --</option>
              {hiringManagers.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              style={{
                fontSize: TYPOGRAPHY.textNote.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                fontWeight: 500,
                color: COLORS.text,
              }}
            >
              Status
            </label>
            <select
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: `1px solid ${COLORS.border}`,
                fontSize: TYPOGRAPHY.textImportant.fontSize,
                fontFamily: TYPOGRAPHY.fontFamily,
                backgroundColor: COLORS.white,
              }}
            >
              <option>-- Select --</option>
              <option>Active</option>
              <option>Closed</option>
            </select>
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

      {/* Vacancy table */}
      <div
        style={{
          backgroundColor: COLORS.white,
          borderRadius: '12px',
          border: `1px solid ${COLORS.border}`,
          padding: '20px 24px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <button
            style={{
              padding: '10px 22px',
              borderRadius: '24px',
              border: 'none',
              backgroundColor: COLORS.accent,
              color: COLORS.white,
              fontFamily: TYPOGRAPHY.fontFamily,
              fontSize: TYPOGRAPHY.textImportant.fontSize,
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
            ({vacancyRows.length}) Records Found
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
                {['Vacancy', 'Job Title', 'Hiring Manager', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: TYPOGRAPHY.textImportant.fontSize, color: COLORS.text }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vacancyRows.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  <td style={{ padding: '10px 14px' }}>{row.vacancy}</td>
                  <td style={{ padding: '10px 14px' }}>{row.jobTitle}</td>
                  <td style={{ padding: '10px 14px' }}>{row.hiringManager}</td>
                  <td style={{ padding: '10px 14px' }}>{row.status}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <button
                      style={{
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        fontSize: '18px',
                        marginRight: '8px',
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
                      }}
                    >
                      🗑️
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
        Recruitment
      </h1>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        {(['candidates', 'vacancies'] as const).map((tabKey) => {
          const isActive = activeTab === tabKey;
          const label = tabKey === 'candidates' ? 'Candidates' : 'Vacancies';
          return (
            <button
              key={tabKey}
              onClick={() => setActiveTab(tabKey)}
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
              {label}
            </button>
          );
        })}
      </div>

      {activeTab === 'candidates' ? renderCandidates() : renderVacancies()}
    </div>
  );
};

export default Recruitment;

