/**
 * arithwise_hrms Time & Attendance System
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
};

const TYPOGRAPHY = {
  fontFamily: "'Segoe UI', Arial, sans-serif",
};

type TimesheetSection = 'myTimesheets' | 'employeeTimesheets';
type AttendanceSection = 'myRecords' | 'punchIn' | 'employeeRecords' | 'configuration';
type ReportSection = 'projectReport' | 'employeeReport' | 'attendanceSummary';
type ProjectSection = 'customers' | 'projects';

// Mock data
const mockAttendanceRecords = [
  { punchIn: '2025-18-12 02:41 PM GMT +05:00', punchInNote: 'Hello There', punchOut: '', punchOutNote: '', duration: '0.00' },
  { punchIn: '2025-18-12 02:31 PM GMT +05:30', punchInNote: '', punchOut: '2025-18-12 02:32 PM GMT +05:00', punchOutNote: 'Hello There', duration: '0.52' },
  { punchIn: '2025-18-12 01:19 PM GMT +05:00', punchInNote: 'Hello There', punchOut: '2025-18-12 02:31 PM GMT +05:30', punchOutNote: '', duration: '0.70' },
];

const mockCustomers = [
  { name: 'ACME Ltd', description: 'Leading apparel manufacturing chain.' },
  { name: 'Apache Software Foundation', description: 'non-profit corporation to support Apache software projects' },
  { name: 'Caldwell', description: 'Close our not thought manager customer continue. Focus tree look really seem. Himself here style. Could notice building popular can draw by outsi de. Fly chair father reality perform no.' },
  { name: 'Cochran', description: 'Two attack really take fail defense sometimes. Else find fine speech walk. Anyone benefit apply face. Month surface morning seek spend small bow.' },
  { name: 'FreeWave Technologies, Inc.', description: 'Its wireless data radios are utilized in industrial, government and defense, scientific, and commercial applications' },
  { name: 'Fresh Books Software Ltd', description: '' },
  { name: 'Global Corp and Co', description: 'Global Corp introduces itself as a leading manufacturer and exporter of a large number of products catering to high precision equipment, Scientific Laboratory Equipments & Institutional Health Care Products.' },
  { name: 'Gonzalez', description: 'Herself most send itself. Mention reflect traditional themselves pull government offer. Away political officer admit player American board.' },
  { name: 'Internal', description: '' },
  { name: 'Miller', description: 'Two attack really take fail defense sometimes. Else find fine speech walk. Anyone benefit apply face. Month surface morning seek spend small bow.' },
  { name: 'The Coca-Cola Company', description: 'Multinational beverage corporation and manufacturer' },
  { name: 'The Priceline Group', description: 'American-based provider of travel and related online services to consumers' },
];

const mockProjects = [
  { customerName: 'ACME Ltd', project: 'ACME Ltd', projectAdmin: '' },
  { customerName: 'Apache Software Foundation', project: 'ASF - Phase 1', projectAdmin: '' },
  { customerName: 'The Coca-Cola Company', project: 'Cola - Phase 1', projectAdmin: '' },
  { customerName: 'Fresh Books Software Ltd', project: 'Fresh Books Software Ltd - Phase I', projectAdmin: '' },
  { customerName: 'FreeWave Technologies, Inc.', project: 'FWT - Phase 1', projectAdmin: '' },
  { customerName: 'Internal', project: 'General HR Tasks', projectAdmin: 'Venkateswara Ki' },
  { customerName: 'Global Corp and Co', project: 'Global Software phase - 1', projectAdmin: '' },
  { customerName: 'Global Corp and Co', project: 'Global Software phase - 2', projectAdmin: '' },
  { customerName: 'Gonzalez', project: 'Marriage Project', projectAdmin: '' },
  { customerName: 'The Priceline Group', project: 'Priceline Group - Phase 1', projectAdmin: 'Venkateswara Ki' },
  { customerName: 'Internal', project: 'Recruitment', projectAdmin: 'Venkateswara Ki' },
  { customerName: 'Miller', project: 'Repayment Project', projectAdmin: '' },
  { customerName: 'Internal', project: 'Training and Development', projectAdmin: 'Venkateswara Ki' },
  { customerName: 'Escobar', project: 'While Project', projectAdmin: '' },
];

const TimePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState<'timesheets' | 'attendance' | 'reports' | 'projects'>('timesheets');
  const [timesheetSection, setTimesheetSection] = useState<TimesheetSection>('myTimesheets');
  const [attendanceSection, setAttendanceSection] = useState<AttendanceSection>('myRecords');
  const [reportSection, setReportSection] = useState<ReportSection>('projectReport');
  const [projectSection, setProjectSection] = useState<ProjectSection>('customers');
  const [timesheetsOpen, setTimesheetsOpen] = useState(false);
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  
  const timesheetsRef = useRef<HTMLDivElement>(null);
  const attendanceRef = useRef<HTMLDivElement>(null);
  const reportsRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (timesheetsRef.current && !timesheetsRef.current.contains(event.target as Node)) {
        setTimesheetsOpen(false);
      }
      if (attendanceRef.current && !attendanceRef.current.contains(event.target as Node)) {
        setAttendanceOpen(false);
      }
      if (reportsRef.current && !reportsRef.current.contains(event.target as Node)) {
        setReportsOpen(false);
      }
      if (projectsRef.current && !projectsRef.current.contains(event.target as Node)) {
        setProjectsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderNav = () => (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
      {/* Timesheets Dropdown */}
      <div ref={timesheetsRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setTimesheetsOpen(!timesheetsOpen)}
          style={{
            padding: '12px 24px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeDropdown === 'timesheets' ? COLORS.primary : 'transparent',
            color: activeDropdown === 'timesheets' ? COLORS.white : COLORS.textLight,
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '15px',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          Timesheets ▼
        </button>
        {timesheetsOpen && (
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
              { label: 'My Timesheets', value: 'myTimesheets' as TimesheetSection },
              { label: 'Employee Timesheets', value: 'employeeTimesheets' as TimesheetSection },
            ].map(item => (
              <button
                key={item.value}
                onClick={() => {
                  setActiveDropdown('timesheets');
                  setTimesheetSection(item.value);
                  setTimesheetsOpen(false);
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

      {/* Attendance Dropdown */}
      <div ref={attendanceRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setAttendanceOpen(!attendanceOpen)}
          style={{
            padding: '12px 24px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeDropdown === 'attendance' ? COLORS.primary : 'transparent',
            color: activeDropdown === 'attendance' ? COLORS.white : COLORS.textLight,
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '15px',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          Attendance ▼
        </button>
        {attendanceOpen && (
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
              { label: 'My Records', value: 'myRecords' as AttendanceSection },
              { label: 'Punch In/Out', value: 'punchIn' as AttendanceSection },
              { label: 'Employee Records', value: 'employeeRecords' as AttendanceSection },
              { label: 'Configuration', value: 'configuration' as AttendanceSection },
            ].map(item => (
              <button
                key={item.value}
                onClick={() => {
                  setActiveDropdown('attendance');
                  setAttendanceSection(item.value);
                  setAttendanceOpen(false);
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

      {/* Reports Dropdown */}
      <div ref={reportsRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setReportsOpen(!reportsOpen)}
          style={{
            padding: '12px 24px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeDropdown === 'reports' ? COLORS.primary : 'transparent',
            color: activeDropdown === 'reports' ? COLORS.white : COLORS.textLight,
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
            minWidth: '250px',
          }}>
            {[
              { label: 'Project Report', value: 'projectReport' as ReportSection },
              { label: 'Employee Report', value: 'employeeReport' as ReportSection },
              { label: 'Attendance Total Summary Report', value: 'attendanceSummary' as ReportSection },
            ].map(item => (
              <button
                key={item.value}
                onClick={() => {
                  setActiveDropdown('reports');
                  setReportSection(item.value);
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

      {/* Project Info Dropdown */}
      <div ref={projectsRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setProjectsOpen(!projectsOpen)}
          style={{
            padding: '12px 24px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeDropdown === 'projects' ? COLORS.primary : 'transparent',
            color: activeDropdown === 'projects' ? COLORS.white : COLORS.textLight,
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '15px',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          Project Info ▼
        </button>
        {projectsOpen && (
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
              { label: 'Customers', value: 'customers' as ProjectSection },
              { label: 'Projects', value: 'projects' as ProjectSection },
            ].map(item => (
              <button
                key={item.value}
                onClick={() => {
                  setActiveDropdown('projects');
                  setProjectSection(item.value);
                  setProjectsOpen(false);
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
    </div>
  );

  const renderMyRecords = () => (
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
        My Attendance Records
      </h2>
      
      <div style={{ marginBottom: '20px', maxWidth: '300px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          fontFamily: TYPOGRAPHY.fontFamily,
          fontSize: '14px',
          color: COLORS.text,
        }}>
          Date*
        </label>
        <input
          type="date"
          defaultValue="2025-18-12"
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
          View
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px', fontSize: '15px', color: COLORS.textLight, fontFamily: TYPOGRAPHY.fontFamily }}>
        Total Duration (Hours): 1.22
      </div>

      <p style={{
        fontFamily: TYPOGRAPHY.fontFamily,
        color: COLORS.textLight,
        fontSize: '15px',
        marginBottom: '16px',
      }}>
        (3) Records Found
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
              {['Punch In', 'Punch In Note', 'Punch Out', 'Punch Out Note', 'Duration (Hours)', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: COLORS.text, borderBottom: `1px solid ${COLORS.border}` }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockAttendanceRecords.map((record, idx) => (
              <tr key={idx} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                <td style={{ padding: '12px' }}>
                  <input type="checkbox" />
                </td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{record.punchIn}</td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{record.punchInNote}</td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{record.punchOut}</td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{record.punchOutNote}</td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{record.duration}</td>
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

  const renderPunchIn = () => (
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
        Punch In
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
            Date*
          </label>
          <input
            type="date"
            defaultValue="2025-18-12"
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
            Time*
          </label>
          <input
            type="time"
            defaultValue="03:14"
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
          Note
        </label>
        <textarea
          placeholder="Type here"
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
          In
        </button>
      </div>
    </div>
  );

  const renderEmployeeRecords = () => (
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
        Employee Attendance Records
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '20px' }}>
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
            Date*
          </label>
          <input
            type="date"
            defaultValue="2025-18-12"
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
          View
        </button>
      </div>

      <p style={{
        fontFamily: TYPOGRAPHY.fontFamily,
        color: COLORS.textLight,
        fontSize: '15px',
        marginBottom: '16px',
      }}>
        (219) Records Found
      </p>

      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontFamily: TYPOGRAPHY.fontFamily,
        }}>
          <thead>
            <tr style={{ backgroundColor: COLORS.tableBg }}>
              {['Employee Name', 'Total Duration (Hours)', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: COLORS.text, borderBottom: `1px solid ${COLORS.border}` }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {['Test12 .last1234', 'ABDCo 0102', 'yyesjgjkb1 90jxmd', 'a2 a2', 'Mona Ahmed', 'Ranga Akunuri', 'sedfy ali', 'basmala aljdeed', 'basmala aljdeed', 'tasnem alotza'].map((name, idx) => (
              <tr key={idx} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.primary }}>{name}</td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>0.00</td>
                <td style={{ padding: '12px' }}>
                  <button style={{
                    padding: '6px 16px',
                    border: `1px solid ${COLORS.border}`,
                    backgroundColor: COLORS.white,
                    color: COLORS.primary,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontSize: '14px',
                  }}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderConfiguration = () => (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: '8px',
      border: `1px solid ${COLORS.border}`,
      padding: '32px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      maxWidth: '900px',
    }}>
      <h2 style={{
        marginTop: 0,
        marginBottom: '24px',
        fontFamily: TYPOGRAPHY.fontFamily,
        color: COLORS.text,
        fontSize: '18px',
        fontWeight: 600,
      }}>
        Attendance Configuration
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
        {[
          'Employee can change current time when punching in/out',
          'Employee can edit/delete own attendance records',
          'Supervisor can add/edit/delete attendance records of subordinates',
        ].map((label, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{
              fontFamily: TYPOGRAPHY.fontFamily,
              fontSize: '14px',
              color: COLORS.text,
            }}>
              {label}
            </span>
            <label style={{
              position: 'relative',
              display: 'inline-block',
              width: '50px',
              height: '24px',
            }}>
              <input type="checkbox" defaultChecked style={{ display: 'none' }} />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: '#FF8C00',
                borderRadius: '24px',
                transition: '0.4s',
              }}>
                <span style={{
                  position: 'absolute',
                  content: '""',
                  height: '18px',
                  width: '18px',
                  left: '29px',
                  bottom: '3px',
                  backgroundColor: COLORS.white,
                  borderRadius: '50%',
                  transition: '0.4s',
                }}></span>
              </span>
            </label>
          </div>
        ))}
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
          Save
        </button>
      </div>
    </div>
  );

  const renderProjectReport = () => (
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
          Project Report
        </h2>
        <button style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '18px',
          color: COLORS.textLight,
        }}>
          ▲
        </button>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          fontFamily: TYPOGRAPHY.fontFamily,
          fontSize: '14px',
          color: COLORS.primary,
        }}>
          Project Name*
        </label>
        <input
          type="text"
          placeholder="Type for hints..."
          style={{
            width: '100%',
            maxWidth: '700px',
            padding: '10px',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '6px',
            fontFamily: TYPOGRAPHY.fontFamily,
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          fontFamily: TYPOGRAPHY.fontFamily,
          fontSize: '14px',
          color: COLORS.primary,
        }}>
          Project Date Range
        </label>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="date"
            placeholder="From"
            style={{
              padding: '10px',
              border: `1px solid ${COLORS.border}`,
              borderRadius: '6px',
              fontFamily: TYPOGRAPHY.fontFamily,
              boxSizing: 'border-box',
              minWidth: '180px',
            }}
          />
          <input
            type="date"
            placeholder="To"
            style={{
              padding: '10px',
              border: `1px solid ${COLORS.border}`,
              borderRadius: '6px',
              fontFamily: TYPOGRAPHY.fontFamily,
              boxSizing: 'border-box',
              minWidth: '180px',
            }}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '16px' }}>
            <span style={{ fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
              Only Include Approved Timesheets
            </span>
            <input type="checkbox" style={{ width: '40px', height: '20px' }} />
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
          View
        </button>
      </div>
    </div>
  );

  const renderEmployeeReport = () => (
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
          Employee Report
        </h2>
        <button style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '18px',
          color: COLORS.textLight,
        }}>
          ▲
        </button>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          fontFamily: TYPOGRAPHY.fontFamily,
          fontSize: '14px',
          color: COLORS.primary,
        }}>
          Employee Name*
        </label>
        <input
          type="text"
          placeholder="Type for hints..."
          style={{
            width: '100%',
            maxWidth: '700px',
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
            color: COLORS.primary,
          }}>
            Project Name
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
            color: COLORS.primary,
          }}>
            Activity Name
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

      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          fontFamily: TYPOGRAPHY.fontFamily,
          fontSize: '14px',
          color: COLORS.primary,
        }}>
          Project Date Range
        </label>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="date"
            placeholder="From"
            style={{
              padding: '10px',
              border: `1px solid ${COLORS.border}`,
              borderRadius: '6px',
              fontFamily: TYPOGRAPHY.fontFamily,
              boxSizing: 'border-box',
              minWidth: '180px',
            }}
          />
          <input
            type="date"
            placeholder="To"
            style={{
              padding: '10px',
              border: `1px solid ${COLORS.border}`,
              borderRadius: '6px',
              fontFamily: TYPOGRAPHY.fontFamily,
              boxSizing: 'border-box',
              minWidth: '180px',
            }}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '16px' }}>
            <span style={{ fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
              Only Include Approved Timesheets
            </span>
            <input type="checkbox" style={{ width: '40px', height: '20px' }} />
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
          View
        </button>
      </div>
    </div>
  );

  const renderAttendanceSummary = () => (
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
          Attendance Total Summary Report
        </h2>
        <button style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '18px',
          color: COLORS.textLight,
        }}>
          ▲
        </button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '14px',
            color: COLORS.primary,
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
            color: COLORS.primary,
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
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '14px',
            color: COLORS.primary,
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '14px',
            color: COLORS.primary,
          }}>
            Employment Status
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
            color: COLORS.primary,
          }}>
            Date Range
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <input
              type="date"
              placeholder="From"
              style={{
                width: '100%',
                padding: '10px',
                border: `1px solid ${COLORS.border}`,
                borderRadius: '6px',
                fontFamily: TYPOGRAPHY.fontFamily,
                boxSizing: 'border-box',
              }}
            />
            <input
              type="date"
              placeholder="To"
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
          View
        </button>
      </div>
    </div>
  );

  const renderCustomers = () => (
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
          Customers
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
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: COLORS.text, borderBottom: `1px solid ${COLORS.border}` }}>
                <input type="checkbox" />
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: COLORS.text, borderBottom: `1px solid ${COLORS.border}` }}>
                Name ⇅
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: COLORS.text, borderBottom: `1px solid ${COLORS.border}` }}>
                Description
              </th>
              <th style={{ padding: '12px', textAlign: 'right', fontSize: '13px', color: COLORS.text, borderBottom: `1px solid ${COLORS.border}` }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {mockCustomers.map((customer, idx) => (
              <tr key={idx} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                <td style={{ padding: '12px' }}>
                  <input type="checkbox" />
                </td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.primary }}>{customer.name}</td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{customer.description}</td>
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

  const renderProjects = () => (
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
        Projects
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '14px',
            color: COLORS.text,
          }}>
            Customer Name
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
            Project
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
            Project Admin
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
        (14) Records Found
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
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: COLORS.text, borderBottom: `1px solid ${COLORS.border}` }}>
                Customer Name ⇅
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: COLORS.text, borderBottom: `1px solid ${COLORS.border}` }}>
                Project ⇅
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: COLORS.text, borderBottom: `1px solid ${COLORS.border}` }}>
                Project Admins
              </th>
              <th style={{ padding: '12px', textAlign: 'right', fontSize: '13px', color: COLORS.text, borderBottom: `1px solid ${COLORS.border}` }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {mockProjects.map((project, idx) => (
              <tr key={idx} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                <td style={{ padding: '12px' }}>
                  <input type="checkbox" />
                </td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{project.customerName}</td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{project.project}</td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{project.projectAdmin}</td>
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

  const renderMyTimesheets = () => (
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
          My Timesheet
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.primary, fontSize: '14px' }}>
            Timesheet Period
          </span>
          <button style={{
            padding: '8px',
            border: `1px solid ${COLORS.border}`,
            backgroundColor: COLORS.white,
            cursor: 'pointer',
            borderRadius: '4px',
          }}>
            ◀
          </button>
          <span style={{ fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.text, fontSize: '14px', minWidth: '200px', textAlign: 'center' }}>
            2025-15-12 to 2025-21-12
          </span>
          <button style={{
            padding: '4px 8px',
            border: `1px solid ${COLORS.border}`,
            backgroundColor: COLORS.white,
            cursor: 'pointer',
            borderRadius: '4px',
          }}>
            📅
          </button>
          <button style={{
            padding: '8px',
            border: `1px solid ${COLORS.border}`,
            backgroundColor: COLORS.white,
            cursor: 'pointer',
            borderRadius: '4px',
          }}>
            ▶
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontFamily: TYPOGRAPHY.fontFamily,
        }}>
          <thead>
            <tr style={{ backgroundColor: COLORS.lightBg }}>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: COLORS.text, border: `1px solid ${COLORS.border}` }}>
                Project
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: COLORS.text, border: `1px solid ${COLORS.border}` }}>
                Activity
              </th>
              <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: COLORS.text, border: `1px solid ${COLORS.border}` }}>
                <div>15</div>
                <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Mon</div>
              </th>
              <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: COLORS.text, border: `1px solid ${COLORS.border}` }}>
                <div>16</div>
                <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Tue</div>
              </th>
              <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: COLORS.text, border: `1px solid ${COLORS.border}` }}>
                <div>17</div>
                <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Wed</div>
              </th>
              <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: COLORS.text, border: `1px solid ${COLORS.border}` }}>
                <div>18</div>
                <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Thu</div>
              </th>
              <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: COLORS.text, border: `1px solid ${COLORS.border}` }}>
                <div>19</div>
                <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Fri</div>
              </th>
              <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: COLORS.text, border: `1px solid ${COLORS.border}` }}>
                <div>20</div>
                <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Sat</div>
              </th>
              <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: COLORS.text, border: `1px solid ${COLORS.border}` }}>
                <div>21</div>
                <div style={{ fontSize: '11px', fontWeight: 'normal' }}>Sun</div>
              </th>
              <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: COLORS.text, border: `1px solid ${COLORS.border}`, backgroundColor: COLORS.tableBg }}>
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text, border: `1px solid ${COLORS.border}` }}>
                Escobar - While Project
              </td>
              <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text, border: `1px solid ${COLORS.border}` }}>
                Terri
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: COLORS.text, border: `1px solid ${COLORS.border}` }}>
                08:00
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: COLORS.text, border: `1px solid ${COLORS.border}` }}>
                08:00
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: COLORS.text, border: `1px solid ${COLORS.border}` }}>
                08:00
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: COLORS.text, border: `1px solid ${COLORS.border}` }}>
                08:00
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: COLORS.text, border: `1px solid ${COLORS.border}` }}>
                08:00
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: COLORS.text, border: `1px solid ${COLORS.border}` }}>
                08:00
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: COLORS.text, border: `1px solid ${COLORS.border}` }}>
                08:00
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: COLORS.text, border: `1px solid ${COLORS.border}`, backgroundColor: COLORS.tableBg, fontWeight: 600 }}>
                56:00
              </td>
            </tr>
            <tr style={{ backgroundColor: COLORS.lightBg }}>
              <td colSpan={2} style={{ padding: '12px', fontSize: '14px', color: COLORS.text, border: `1px solid ${COLORS.border}`, fontWeight: 600 }}>
                Total
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: COLORS.text, border: `1px solid ${COLORS.border}`, fontWeight: 600 }}>
                08:00
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: COLORS.text, border: `1px solid ${COLORS.border}`, fontWeight: 600 }}>
                08:00
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: COLORS.text, border: `1px solid ${COLORS.border}`, fontWeight: 600 }}>
                08:00
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: COLORS.text, border: `1px solid ${COLORS.border}`, fontWeight: 600 }}>
                08:00
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: COLORS.text, border: `1px solid ${COLORS.border}`, fontWeight: 600 }}>
                08:00
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: COLORS.text, border: `1px solid ${COLORS.border}`, fontWeight: 600 }}>
                08:00
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: COLORS.text, border: `1px solid ${COLORS.border}`, fontWeight: 600 }}>
                08:00
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: COLORS.text, border: `1px solid ${COLORS.border}`, backgroundColor: COLORS.tableBg, fontWeight: 600 }}>
                56:00
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.textLight }}>
          Status: <span style={{ color: COLORS.text }}>Not Submitted</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{
            padding: '10px 32px',
            borderRadius: '6px',
            border: `1px solid ${COLORS.success}`,
            backgroundColor: 'transparent',
            color: COLORS.success,
            fontFamily: TYPOGRAPHY.fontFamily,
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: 500,
          }}>
            Edit
          </button>
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
            Submit
          </button>
        </div>
      </div>
    </div>
  );

  const renderEmployeeTimesheets = () => (
    <div style={{
      backgroundColor: COLORS.white,
      borderRadius: '8px',
      border: `1px solid ${COLORS.border}`,
      padding: '32px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          marginTop: 0,
          marginBottom: '24px',
          fontFamily: TYPOGRAPHY.fontFamily,
          color: COLORS.text,
          fontSize: '18px',
          fontWeight: 600,
        }}>
          Select Employee
        </h2>
        
        <div style={{ marginBottom: '20px', maxWidth: '700px' }}>
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
            View
          </button>
        </div>
      </div>

      <div>
        <h2 style={{
          marginTop: 0,
          marginBottom: '24px',
          fontFamily: TYPOGRAPHY.fontFamily,
          color: COLORS.text,
          fontSize: '18px',
          fontWeight: 600,
        }}>
          Timesheets Pending Action
        </h2>

        <p style={{
          fontFamily: TYPOGRAPHY.fontFamily,
          color: COLORS.textLight,
          fontSize: '15px',
          marginBottom: '16px',
        }}>
          (7) Records Found
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: TYPOGRAPHY.fontFamily,
          }}>
            <thead>
              <tr style={{ backgroundColor: COLORS.tableBg }}>
                {['Employee Name', 'Timesheet Period', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: COLORS.text, borderBottom: `1px solid ${COLORS.border}` }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'basmala juma aljdeed', period: '2025-15-12 - 2025-21-12' },
                { name: 'Russel Hamilton', period: '2025-15-12 - 2025-21-12' },
                { name: 'Sagar hag hgfkag', period: '2025-15-12 - 2025-21-12' },
                { name: 'Marcus Monster Rashford', period: '2025-15-12 - 2025-21-12' },
                { name: 'Madhumita k K', period: '2023-16-01 - 2023-22-01' },
                { name: 'Madhumita k K', period: '2022-15-08 - 2022-21-08' },
                { name: 'Madhumita k K', period: '2020-14-09 - 2020-20-09' },
              ].map((record, idx) => (
                <tr key={idx} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  <td style={{ padding: '12px', fontSize: '14px', color: COLORS.primary }}>{record.name}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{record.period}</td>
                  <td style={{ padding: '12px' }}>
                    <button style={{
                      padding: '6px 16px',
                      border: `1px solid ${COLORS.border}`,
                      backgroundColor: COLORS.white,
                      color: COLORS.primary,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontFamily: TYPOGRAPHY.fontFamily,
                      fontSize: '14px',
                    }}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    // Render based on which dropdown is active
    switch (activeDropdown) {
      case 'timesheets':
        switch (timesheetSection) {
          case 'myTimesheets': return renderMyTimesheets();
          case 'employeeTimesheets': return renderEmployeeTimesheets();
        }
        break;
      
      case 'attendance':
        switch (attendanceSection) {
          case 'myRecords': return renderMyRecords();
          case 'punchIn': return renderPunchIn();
          case 'employeeRecords': return renderEmployeeRecords();
          case 'configuration': return renderConfiguration();
        }
        break;
      
      case 'reports':
        switch (reportSection) {
          case 'projectReport': return renderProjectReport();
          case 'employeeReport': return renderEmployeeReport();
          case 'attendanceSummary': return renderAttendanceSummary();
        }
        break;
      
      case 'projects':
        switch (projectSection) {
          case 'customers': return renderCustomers();
          case 'projects': return renderProjects();
        }
        break;
    }
    
    return renderMyTimesheets();
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

export default TimePage;
