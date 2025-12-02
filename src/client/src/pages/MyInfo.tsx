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

const SECTION_LABELS = [
  'Personal Details',
  'Contact Details',
  'Emergency Contacts',
  'Dependents',
  'Immigration',
  'Job',
  'Salary',
  'Report-to',
  'Qualifications',
  'Memberships',
];

const MyInfo: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>('Personal Details');

  const renderSectionTitle = () => activeSection;

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
        My Info
      </h1>

      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Left profile + menu */}
        <div
          style={{
            width: '260px',
            backgroundColor: COLORS.white,
            borderRadius: '12px',
            border: `1px solid ${COLORS.border}`,
            padding: '20px 18px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                backgroundColor: COLORS.lightBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px',
                color: COLORS.primary,
                marginBottom: '10px',
              }}
            >
              👤
            </div>
            <div
              style={{
                fontFamily: TYPOGRAPHY.fontFamily,
                fontSize: TYPOGRAPHY.textImportant.fontSize,
                fontWeight: 600,
                color: COLORS.text,
              }}
            >
              Demo User
            </div>
            <div
              style={{
                fontFamily: TYPOGRAPHY.fontFamily,
                fontSize: TYPOGRAPHY.textNote.fontSize,
                color: COLORS.textLight,
              }}
            >
              Employee
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: '12px' }}>
            {SECTION_LABELS.map((label) => {
              const isActive = activeSection === label;
              return (
                <button
                  key={label}
                  onClick={() => setActiveSection(label)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    marginBottom: '4px',
                    backgroundColor: isActive ? COLORS.primary : 'transparent',
                    color: isActive ? COLORS.white : COLORS.text,
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontSize: TYPOGRAPHY.textNote.fontSize,
                    cursor: 'pointer',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right content */}
        <div
          style={{
            flex: 1,
            backgroundColor: COLORS.white,
            borderRadius: '12px',
            border: `1px solid ${COLORS.border}`,
            padding: '20px 24px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: '16px',
              fontFamily: TYPOGRAPHY.fontFamily,
              fontSize: TYPOGRAPHY.textImportant.fontSize,
              fontWeight: 600,
              color: COLORS.text,
            }}
          >
            {renderSectionTitle()}
          </h2>

          {/* Simple personal details grid as placeholder */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px 16px',
              marginBottom: '20px',
            }}
          >
            {['First Name', 'Middle Name', 'Last Name', 'Employee ID', 'Other ID', 'License Number'].map(
              (label) => (
                <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
                      padding: '8px 12px',
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: '6px',
                      fontSize: TYPOGRAPHY.textImportant.fontSize,
                      fontFamily: TYPOGRAPHY.fontFamily,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              ),
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyInfo;


