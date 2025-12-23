/**
 * arithwise_hrms Time & Attendance System
 * Copyright (C) 2024 Arithwise Inc.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const COLORS = {
  // Strict color palette
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
  // Legacy colors (for status indicators using opacity)
  success: '#76C044',
  danger: '#dc3545',
};

const TYPOGRAPHY = {
  fontFamily: "'Segoe UI', Arial, sans-serif",
};

type TimesheetSection = 'myTimesheets' | 'employeeTimesheets';
type AttendanceSection = 'myRecords' | 'punchIn' | 'employeeRecords' | 'configuration';
type ReportSection = 'projectReport' | 'employeeReport' | 'attendanceSummary';
type ProjectSection = 'projects';

// Mock data removed - using real database data

// Hours Input Cell Component
interface HoursInputCellProps {
  initialHours: number;
  onSave: (hours: number) => void;
  formatHours: (hours: number) => string;
  parseHours: (str: string) => number;
}

const HoursInputCell: React.FC<HoursInputCellProps> = ({ initialHours, onSave, formatHours, parseHours }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(formatHours(initialHours));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(formatHours(initialHours));
  }, [initialHours, formatHours]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Allow typing numbers, decimal point, and colon
    value = value.replace(/[^0-9:.]/g, '');
    setInputValue(value);
  };

  const handleBlur = async () => {
    const hours = parseHours(inputValue);
    if (!isNaN(hours) && hours >= 0 && hours <= 24) {
      // Format to HH:MM before saving
      const formatted = formatHours(hours);
      setInputValue(formatted);
      // Save the hours
      await onSave(hours);
    } else {
      setInputValue(formatHours(initialHours));
    }
    setIsEditing(false);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const hours = parseHours(inputValue);
      if (!isNaN(hours) && hours >= 0 && hours <= 24) {
        const formatted = formatHours(hours);
        setInputValue(formatted);
        await onSave(hours);
      } else {
        setInputValue(formatHours(initialHours));
      }
      setIsEditing(false);
    } else if (e.key === 'Escape') {
      setInputValue(formatHours(initialHours));
      setIsEditing(false);
    }
  };

  if (!isEditing) {
    return (
      <div
        onClick={() => setIsEditing(true)}
        style={{
          padding: '8px',
          cursor: 'pointer',
          minWidth: '60px',
          textAlign: 'center',
          fontSize: '14px',
          color: COLORS.text,
          border: `1px solid transparent`,
          borderRadius: '4px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = COLORS.lightBg;
          e.currentTarget.style.borderColor = COLORS.border;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.borderColor = 'transparent';
        }}
      >
        {formatHours(initialHours)}
      </div>
    );
  }

  return (
    <input
      ref={inputRef}
      type="text"
      value={inputValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder="HH:MM"
      style={{
        width: '100%',
        padding: '8px',
        border: `1px solid ${COLORS.primary}`,
        borderRadius: '4px',
        fontSize: '14px',
        fontFamily: TYPOGRAPHY.fontFamily,
        textAlign: 'center',
        outline: 'none',
        boxSizing: 'border-box',
      }}
    />
  );
};

const TimePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const isAdminUser = isAdmin();
  const [activeDropdown, setActiveDropdown] = useState<'timesheets' | 'attendance' | 'reports' | 'projects'>('timesheets');
  const [timesheetSection, setTimesheetSection] = useState<TimesheetSection>('myTimesheets');
  const [attendanceSection, setAttendanceSection] = useState<AttendanceSection>('myRecords');
  const [reportSection, setReportSection] = useState<ReportSection>('projectReport');
  const [projectSection, setProjectSection] = useState<ProjectSection>('projects');
  const [timesheetsOpen, setTimesheetsOpen] = useState(false);
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  
  // Data states
  const [timesheets, setTimesheets] = useState<any[]>([]);
  const [currentTimesheet, setCurrentTimesheet] = useState<any>(null);
  const [timesheetPeriod, setTimesheetPeriod] = useState({ start: '', end: '' });
  const [projects, setProjects] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [timesheetEntries, setTimesheetEntries] = useState<any[]>([]);
  const [isEditingTimesheet, setIsEditingTimesheet] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Punch In/Out states
  const [punchInForm, setPunchInForm] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().slice(0, 5);
    return { date: today, time: now, note: '' };
  });
  const [currentPunchIn, setCurrentPunchIn] = useState<any>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [attendanceFilterDate, setAttendanceFilterDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  
  // Project Info states
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [customerForm, setCustomerForm] = useState({ name: '', description: '' });
  const [projectForm, setProjectForm] = useState({ name: '', description: '', project_admin_id: '' });
  const [projectFilters, setProjectFilters] = useState({ project: '', admin: '' });
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [showProjectSelectModal, setShowProjectSelectModal] = useState(false);
  
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

  // Reset dropdown if user is not admin
  useEffect(() => {
    if (!isAdminUser && activeDropdown === 'reports') {
      setActiveDropdown('timesheets');
    }
  }, [isAdminUser, activeDropdown]);

  // Fetch employee ID
  useEffect(() => {
    const fetchEmployeeId = async () => {
      if (!user?.id) return;
      try {
        const employee = await apiService.request<any>(`/employees/by-user/${user.id}`);
        if (employee?.id) {
          setEmployeeId(employee.id);
        }
      } catch (err) {
        console.error('Error fetching employee ID:', err);
      }
    };
    fetchEmployeeId();
  }, [user]);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        console.log('Fetching projects for timesheet dropdown...');
        const data = await apiService.request<any[]>('/projects');
        console.log('Projects loaded:', data?.length || 0, 'projects');
        setProjects(data || []);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setProjects([]);
      }
    };
    fetchProjects();
  }, []);

  // Fetch customers, projects, and employees for Project Info section
  useEffect(() => {
    const fetchData = async () => {
      if (activeDropdown !== 'projects') return;
      try {
        const [projectsData, employeesData] = await Promise.all([
          apiService.request<any[]>('/projects').catch(() => []),
          apiService.request<any[]>('/employees').catch(() => [])
        ]);
        setAllProjects(projectsData || []);
        setEmployees(employeesData || []);
      } catch (err) {
        console.error('Error fetching project info data:', err);
      }
    };
    fetchData();
  }, [activeDropdown, projectSection]);

  // Helper: format date in local time (no UTC shift)
  const formatDateLocal = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  // Parse YYYY-MM-DD as local date (avoid UTC parsing of ISO-only strings)
  const parseDateLocal = (s: string) => {
    if (!s) return new Date();
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  };

  // Initialize timesheet period (current week)
  useEffect(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday
    const monday = new Date(today.setDate(diff));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    setTimesheetPeriod({
      start: formatDateLocal(monday),
      end: formatDateLocal(sunday)
    });
  }, []);

  // Fetch timesheet for current period
  useEffect(() => {
    const fetchTimesheet = async () => {
      if (!employeeId || !timesheetPeriod.start || !timesheetPeriod.end) return;
      if (activeDropdown !== 'timesheets' || timesheetSection !== 'myTimesheets') return;
      
      setLoading(true);
      try {
        const data = await apiService.getTimesheets({ 
          employee_id: employeeId, 
          start_date: timesheetPeriod.start,
          end_date: timesheetPeriod.end 
        });
        if (data.length > 0) {
          const timesheet = data[0];
          setCurrentTimesheet(timesheet);
          setIsEditingTimesheet(timesheet.status === 'draft' || timesheet.status === 'rejected');
          // Fetch timesheet entries
          const entries = await apiService.getTimesheetEntries(timesheet.id);
          setTimesheetEntries((entries || []).map((e: any) => ({
            ...e,
            entry_date: e?.entry_date ? String(e.entry_date).slice(0, 10) : '',
            hours: Number(e?.hours || 0)
          })));
        } else {
          setCurrentTimesheet(null);
          setTimesheetEntries([]);
          setIsEditingTimesheet(true);
        }
      } catch (err) {
        console.error('Error fetching timesheet:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTimesheet();
  }, [employeeId, timesheetPeriod, activeDropdown, timesheetSection]);

  // Fetch current punch in status
  useEffect(() => {
    const fetchCurrentPunchIn = async () => {
      if (!employeeId) return;
      if (activeDropdown !== 'attendance' || attendanceSection !== 'punchIn') return;
      
      try {
        const today = new Date().toISOString().split('T')[0];
        const records = await apiService.getAttendanceRecords({ employee_id: employeeId, date: today });
        const activeRecord = records.find((r: any) => r.status === 'punched_in' && !r.punch_out_date);
        setCurrentPunchIn(activeRecord || null);
      } catch (err) {
        console.error('Error fetching punch in status:', err);
      }
    };
    fetchCurrentPunchIn();
  }, [employeeId, activeDropdown, attendanceSection]);

  const renderNav = () => (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
      {/* Timesheets Dropdown */}
      <div ref={timesheetsRef} style={{ position: 'relative' }}>
        {(() => {
          const timesheetOptions = [
            { label: 'My Timesheets', value: 'myTimesheets' as TimesheetSection },
            ...(isAdmin() ? [{ label: 'Employee Timesheets', value: 'employeeTimesheets' as TimesheetSection }] : []),
          ];
          const hasMultiple = timesheetOptions.length > 1;
          
          return (
            <button
              onClick={() => {
                if (hasMultiple) {
                  setTimesheetsOpen(!timesheetsOpen);
                } else {
                  setActiveDropdown('timesheets');
                  setTimesheetSection('myTimesheets');
                }
              }}
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
              Timesheets{hasMultiple ? ' ▼' : ''}
            </button>
          );
        })()}
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
              ...(isAdmin() ? [{ label: 'Employee Timesheets', value: 'employeeTimesheets' as TimesheetSection }] : []),
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
        {(() => {
          const attendanceOptions = [
            { label: 'My Records', value: 'myRecords' as AttendanceSection },
            { label: 'Punch In/Out', value: 'punchIn' as AttendanceSection },
            ...(isAdmin() ? [
              { label: 'Employee Records', value: 'employeeRecords' as AttendanceSection },
              { label: 'Configuration', value: 'configuration' as AttendanceSection },
            ] : []),
          ];
          const hasMultiple = attendanceOptions.length > 1;
          
          return (
            <button
              onClick={() => {
                if (hasMultiple) {
                  setAttendanceOpen(!attendanceOpen);
                } else {
                  setActiveDropdown('attendance');
                  setAttendanceSection('myRecords');
                }
              }}
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
              Attendance{hasMultiple ? ' ▼' : ''}
            </button>
          );
        })()}
        {attendanceOpen && [
          { label: 'My Records', value: 'myRecords' as AttendanceSection },
          { label: 'Punch In/Out', value: 'punchIn' as AttendanceSection },
          ...(isAdmin() ? [
            { label: 'Employee Records', value: 'employeeRecords' as AttendanceSection },
            { label: 'Configuration', value: 'configuration' as AttendanceSection },
          ] : []),
        ].length > 1 && (
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
              ...(isAdmin() ? [
                { label: 'Employee Records', value: 'employeeRecords' as AttendanceSection },
                { label: 'Configuration', value: 'configuration' as AttendanceSection },
              ] : []),
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

      {/* Reports Dropdown (admin only) */}
      {isAdminUser && (
        <div ref={reportsRef} style={{ position: 'relative' }}>
          {(() => {
            const reportOptions = [
              { label: 'Project Report', value: 'projectReport' as ReportSection },
              { label: 'Employee Report', value: 'employeeReport' as ReportSection },
              { label: 'Attendance Total Summary Report', value: 'attendanceSummary' as ReportSection },
            ];
            const hasMultiple = reportOptions.length > 1;
            
            return (
              <button
                onClick={() => {
                  if (hasMultiple) {
                    setReportsOpen(!reportsOpen);
                  } else {
                    setActiveDropdown('reports');
                    setReportSection('projectReport');
                  }
                }}
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
                Reports{hasMultiple ? ' ▼' : ''}
              </button>
            );
          })()}
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
      )}

      {/* Project Info Dropdown */}
      <div ref={projectsRef} style={{ position: 'relative' }}>
        {(() => {
          const projectOptions = [
            { label: 'Projects', value: 'projects' as ProjectSection },
          ];
          const hasMultiple = projectOptions.length > 1;
          
          return (
            <button
              onClick={() => {
                if (hasMultiple) {
                  setProjectsOpen(!projectsOpen);
                } else {
                  setActiveDropdown('projects');
                  setProjectSection('projects');
                }
              }}
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
              Project Info{hasMultiple ? ' ▼' : ''}
            </button>
          );
        })()}
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

  const renderMyRecords = () => {
    const formatDateTime = (date: string, time: string) => {
      if (!date || !time) return '';
      const d = new Date(`${date}T${time}`);
      return d.toLocaleString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZoneName: 'short'
      });
    };

    const handleViewRecords = async () => {
      if (!employeeId) {
        alert('Employee record not found. Please contact administrator.');
        return;
      }
      if (!attendanceFilterDate) {
        alert('Please select a date');
        return;
      }
      
      try {
        setLoading(true);
        const records = await apiService.getAttendanceRecords({ 
          employee_id: employeeId, 
          date: attendanceFilterDate 
        });
        setAttendanceRecords(records || []);
      } catch (err: any) {
        alert(`Failed to fetch records: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    const handleDelete = async (id: number) => {
      if (!confirm('Are you sure you want to delete this attendance record?')) return;
      
      try {
        await apiService.deleteAttendanceRecord(id);
        alert('Record deleted successfully');
        // Refresh records
        await handleViewRecords();
      } catch (err: any) {
        alert(`Failed to delete record: ${err.message || 'Unknown error'}`);
      }
    };

    const totalDuration = attendanceRecords.reduce((sum, record) => {
      return sum + (Number(record.duration_hours) || 0);
    }, 0);

    return (
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
            value={attendanceFilterDate}
            onChange={(e) => setAttendanceFilterDate(e.target.value)}
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
          <button
            onClick={handleViewRecords}
            disabled={loading}
            style={{
              padding: '10px 32px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: COLORS.primary,
              color: COLORS.white,
              fontFamily: TYPOGRAPHY.fontFamily,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '15px',
              fontWeight: 500,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Loading...' : 'View'}
          </button>
        </div>

        {attendanceRecords.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px', fontSize: '15px', color: COLORS.text, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500 }}>
            Total Duration (Hours): {totalDuration.toFixed(2)}
          </div>
        )}

        <p style={{
          fontFamily: TYPOGRAPHY.fontFamily,
          color: COLORS.textLight,
          fontSize: '15px',
          marginBottom: '16px',
        }}>
          ({attendanceRecords.length}) Records Found
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
              {attendanceRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: COLORS.textLight, fontFamily: TYPOGRAPHY.fontFamily }}>
                    No records found. Click "View" to load records for the selected date.
                  </td>
                </tr>
              ) : (
                attendanceRecords.map((record) => (
                  <tr key={record.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <td style={{ padding: '12px' }}>
                      <input type="checkbox" />
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>
                      {formatDateTime(record.punch_in_date, record.punch_in_time)}
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>
                      {record.punch_in_note || '-'}
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>
                      {record.punch_out_date && record.punch_out_time 
                        ? formatDateTime(record.punch_out_date, record.punch_out_time)
                        : '-'}
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>
                      {record.punch_out_note || '-'}
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>
                      {(Number(record.duration_hours) || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'left' }}>
                      <button
                        onClick={() => handleDelete(record.id)}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          cursor: 'pointer', 
                          marginRight: '8px', 
                          fontSize: '16px', 
                          color: COLORS.textLight,
                          padding: '4px 8px',
                        }}
                        title="Delete"
                      >
                        🗑️
                      </button>
                      <button
                        onClick={() => {
                          alert('Edit functionality coming soon. For now, please delete and create a new record.');
                        }}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          cursor: 'pointer', 
                          fontSize: '16px', 
                          color: COLORS.textLight,
                          padding: '4px 8px',
                        }}
                        title="Edit"
                      >
                        ✏️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderPunchIn = () => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().slice(0, 5);
    
    const handlePunchIn = async () => {
      if (!employeeId) {
        alert('Employee record not found. Please contact administrator.');
        return;
      }
      if (!punchInForm.date || !punchInForm.time) {
        alert('Please fill in Date and Time');
        return;
      }
      
      try {
        await apiService.punchIn({
          employee_id: employeeId,
          punch_in_date: punchInForm.date,
          punch_in_time: punchInForm.time,
          punch_in_note: punchInForm.note || undefined
        });
        alert('Punched in successfully!');
        setPunchInForm({ date: '', time: '', note: '' });
        // Refresh current punch in status
        const records = await apiService.getAttendanceRecords({ employee_id: employeeId, date: punchInForm.date });
        const activeRecord = records.find((r: any) => r.status === 'punched_in' && !r.punch_out_date);
        setCurrentPunchIn(activeRecord || null);
      } catch (err: any) {
        alert(`Failed to punch in: ${err.message || 'Unknown error'}`);
      }
    };
    
    const handlePunchOut = async () => {
      if (!currentPunchIn) return;
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toTimeString().slice(0, 5);
      
      try {
        await apiService.punchOut(currentPunchIn.id, {
          punch_out_date: today,
          punch_out_time: now,
          punch_out_note: punchInForm.note || undefined
        });
        alert('Punched out successfully!');
        setPunchInForm({ date: '', time: '', note: '' });
        setCurrentPunchIn(null);
      } catch (err: any) {
        alert(`Failed to punch out: ${err.message || 'Unknown error'}`);
      }
    };
    
    return (
      <div style={{
        backgroundColor: COLORS.cardBg,
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
          {currentPunchIn ? 'Punch Out' : 'Punch In'}
        </h2>
        
        {currentPunchIn && (
          <div style={{
            padding: '16px',
            backgroundColor: COLORS.cardBgSecondary,
            borderRadius: '6px',
            marginBottom: '20px',
            border: `1px solid ${COLORS.primary}`,
          }}>
            <div style={{ fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.text, marginBottom: '8px' }}>
              <strong>Currently Punched In:</strong>
            </div>
            <div style={{ fontFamily: TYPOGRAPHY.fontFamily, fontSize: '13px', color: COLORS.textLight }}>
              Date: {new Date(currentPunchIn.punch_in_date).toLocaleDateString()}<br/>
              Time: {currentPunchIn.punch_in_time}
              {currentPunchIn.punch_in_note && <><br/>Note: {currentPunchIn.punch_in_note}</>}
            </div>
          </div>
        )}
        
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
              value={punchInForm.date || today}
              onChange={(e) => setPunchInForm({ ...punchInForm, date: e.target.value })}
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
              value={punchInForm.time || now}
              onChange={(e) => setPunchInForm({ ...punchInForm, time: e.target.value })}
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
            value={punchInForm.note}
            onChange={(e) => setPunchInForm({ ...punchInForm, note: e.target.value })}
            rows={4}
            style={{
              width: '100%',
              padding: '10px',
              border: `1px solid ${COLORS.border}`,
              borderRadius: '6px',
              fontFamily: TYPOGRAPHY.fontFamily,
              backgroundColor: COLORS.white,
              color: COLORS.text,
              boxSizing: 'border-box',
              resize: 'vertical',
            }}
          />
        </div>

        <div style={{ marginBottom: '24px', fontSize: '12px', color: COLORS.textLight, fontFamily: TYPOGRAPHY.fontFamily }}>
          * Required
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {currentPunchIn ? (
            <button
              onClick={handlePunchOut}
              style={{
                padding: '10px 32px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: COLORS.primary,
                color: COLORS.white,
                fontFamily: TYPOGRAPHY.fontFamily,
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: 500,
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.primaryHover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.primary}
            >
              Out
            </button>
          ) : (
            <button
              onClick={handlePunchIn}
              style={{
                padding: '10px 32px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: COLORS.primary,
                color: COLORS.white,
                fontFamily: TYPOGRAPHY.fontFamily,
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: 500,
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.primaryHover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.primary}
            >
              In
            </button>
          )}
        </div>
      </div>
    );
  };

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
          backgroundColor: COLORS.primary,
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
          backgroundColor: COLORS.primary,
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
          backgroundColor: COLORS.primary,
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
          backgroundColor: COLORS.primary,
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
          backgroundColor: COLORS.primary,
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

  const renderProjects = () => {
    const handleAdd = () => {
      if (!isAdminUser) return;
      setEditingProject(null);
      setProjectForm({ name: '', description: '', project_admin_id: '' });
      setShowProjectModal(true);
    };

    const handleEdit = (project: any) => {
      if (!isAdminUser) return;
      setEditingProject(project);
      setProjectForm({
        name: project.name || '',
        description: project.description || '',
        project_admin_id: project.project_admin_id || ''
      });
      setShowProjectModal(true);
    };

    const handleDelete = async (id: number) => {
      if (!isAdminUser) return;
      if (!confirm('Are you sure you want to delete this project?')) return;
      try {
        await apiService.deleteProject(id);
        const updated = await apiService.getProjects();
        setAllProjects(updated || []);
      } catch (err: any) {
        alert(`Failed to delete: ${err.message}`);
      }
    };

    const handleSave = async () => {
      if (!projectForm.name.trim()) {
        alert('Project name is required');
        return;
      }
      try {
        if (editingProject) {
          await apiService.updateProject(editingProject.id, {
            name: projectForm.name,
            description: projectForm.description,
            project_admin_id: projectForm.project_admin_id ? parseInt(projectForm.project_admin_id) : undefined,
            status: 'active'
          });
        } else {
          await apiService.createProject({
            name: projectForm.name,
            description: projectForm.description,
            project_admin_id: projectForm.project_admin_id ? parseInt(projectForm.project_admin_id) : undefined
          });
        }
        setShowProjectModal(false);
        // Refresh both project lists
        const [updatedProjects, updatedTimesheetProjects] = await Promise.all([
          apiService.getProjects(),
          apiService.request<any[]>('/projects')
        ]);
        setAllProjects(updatedProjects || []);
        setProjects(updatedTimesheetProjects || []); // Also update timesheet dropdown
        alert('Project saved successfully!');
      } catch (err: any) {
        console.error('Error saving project:', err);
        alert(`Failed to save: ${err.message || 'Unknown error'}`);
      }
    };

    const handleReset = () => {
      setProjectFilters({ project: '', admin: '' });
    };

    const handleSearch = () => {
      // Filtering is already handled by filteredProjects
    };

    const filteredProjects = allProjects.filter(p => {
      if (!projectFilters.project && !projectFilters.admin) return true;
      const matchesProject = !projectFilters.project || p.name.toLowerCase().includes(projectFilters.project.toLowerCase());
      const adminName = p.project_admin_name || '';
      const matchesAdmin = !projectFilters.admin || adminName.toLowerCase().includes(projectFilters.admin.toLowerCase());
      return matchesProject && matchesAdmin;
    });

    return (
      <>
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
                Project
              </label>
              <input
                type="text"
                placeholder="Type for hints..."
                value={projectFilters.project}
                onChange={(e) => setProjectFilters({ ...projectFilters, project: e.target.value })}
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
                value={projectFilters.admin}
                onChange={(e) => setProjectFilters({ ...projectFilters, admin: e.target.value })}
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
            <button
              onClick={handleReset}
              style={{
                padding: '10px 24px',
                borderRadius: '6px',
                border: `1px solid ${COLORS.primary}`,
                backgroundColor: 'transparent',
                color: COLORS.primary,
                fontFamily: TYPOGRAPHY.fontFamily,
                cursor: 'pointer',
              }}>
              Reset
            </button>
            <button
              onClick={handleSearch}
              style={{
                padding: '10px 24px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: COLORS.primary,
                color: COLORS.white,
                fontFamily: TYPOGRAPHY.fontFamily,
                cursor: 'pointer',
              }}>
              Search
            </button>
          </div>

          <div style={{ marginBottom: '16px' }}>
            {isAdminUser && (
              <button
                onClick={handleAdd}
                style={{
                  padding: '8px 20px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: COLORS.primary,
                  color: COLORS.white,
                  fontFamily: TYPOGRAPHY.fontFamily,
                  cursor: 'pointer',
                  fontSize: '14px',
                }}>
                + Add
              </button>
            )}
          </div>

          <p style={{
            fontFamily: TYPOGRAPHY.fontFamily,
            color: COLORS.textLight,
            fontSize: '15px',
            marginBottom: '16px',
          }}>
            ({filteredProjects.length}) Records Found
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: TYPOGRAPHY.fontFamily,
            }}>
              <thead>
                <tr style={{ backgroundColor: COLORS.tableBg }}>
                  {isAdminUser && (
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: COLORS.text, borderBottom: `1px solid ${COLORS.border}` }}>
                      <input type="checkbox" />
                    </th>
                  )}
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
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={isAdminUser ? 4 : 3} style={{ padding: '40px', textAlign: 'center', color: COLORS.textLight }}>
                      No projects found.
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((project) => {
                    return (
                      <tr key={project.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                        {isAdminUser && (
                          <td style={{ padding: '12px' }}>
                            <input type="checkbox" />
                          </td>
                        )}
                        <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{project.name}</td>
                        <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{project.project_admin_name || '-'}</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          {isAdminUser ? (
                            <>
                              <button
                                onClick={() => handleDelete(project.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '8px', fontSize: '16px', color: COLORS.textLight }}>
                                🗑️
                              </button>
                              <button
                                onClick={() => handleEdit(project)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: COLORS.textLight }}>
                                ✏️
                              </button>
                            </>
                          ) : (
                            <span style={{ color: COLORS.textLight, fontFamily: TYPOGRAPHY.fontFamily, fontSize: '13px' }}>View only</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showProjectModal && (
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
          }} onClick={() => setShowProjectModal(false)}>
            <div style={{
              backgroundColor: COLORS.white,
              borderRadius: '8px',
              padding: '24px',
              width: '500px',
              maxWidth: '90%',
            }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ marginTop: 0, marginBottom: '20px', fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.text }}>
                {editingProject ? 'Edit Project' : 'Add Project'}
              </h3>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.text }}>
                  Project Name*
                </label>
                <input
                  type="text"
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
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
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.text }}>
                  Description
                </label>
                <textarea
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
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
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.text }}>
                  Project Admin
                </label>
                <select
                  value={projectForm.project_admin_id}
                  onChange={(e) => setProjectForm({ ...projectForm, project_admin_id: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '6px',
                    fontFamily: TYPOGRAPHY.fontFamily,
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="">Select Admin (Optional)</option>
                  {employees && employees.length > 0 ? (
                    employees.map(e => (
                      <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>
                    ))
                  ) : (
                    <option value="" disabled>No employees available</option>
                  )}
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  onClick={() => setShowProjectModal(false)}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '6px',
                    border: `1px solid ${COLORS.border}`,
                    backgroundColor: COLORS.white,
                    color: COLORS.text,
                    fontFamily: TYPOGRAPHY.fontFamily,
                    cursor: 'pointer',
                  }}>
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: COLORS.primary,
                    color: COLORS.white,
                    fontFamily: TYPOGRAPHY.fontFamily,
                    cursor: 'pointer',
                  }}>
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  const renderMyTimesheets = () => {
    const formatDate = (date: Date) => formatDateLocal(date);
    const formatDateDisplay = (date: Date) => date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const formatHours = (hours: number) => {
      const h = Math.floor(hours);
      const m = Math.round((hours - h) * 60);
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };
    const parseHours = (timeStr: string) => {
      // Handle both "HH:MM" format and decimal format (e.g., "8.5")
      if (timeStr.includes(':')) {
        const [h, m] = timeStr.split(':').map(Number);
        const hours = (h || 0) + (m || 0) / 60;
        // Clamp to 0-24 range
        return Math.max(0, Math.min(24, hours));
      } else {
        // Decimal format
        const hours = parseFloat(timeStr) || 0;
        // Clamp to 0-24 range
        return Math.max(0, Math.min(24, hours));
      }
    };
    
    const getWeekDates = (startDate: Date) => {
      const dates: Date[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        dates.push(date);
      }
      return dates;
    };
    
    const weekDates = timesheetPeriod.start ? getWeekDates(parseDateLocal(timesheetPeriod.start)) : [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const navigateWeek = (direction: 'prev' | 'next') => {
      if (!timesheetPeriod.start) return;
      const current = parseDateLocal(timesheetPeriod.start);
      current.setDate(current.getDate() + (direction === 'next' ? 7 : -7));
      const dayOfWeek = current.getDay();
      const diff = current.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const monday = new Date(current.setDate(diff));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      setTimesheetPeriod({ start: formatDate(monday), end: formatDate(sunday) });
    };
    
    const handleSaveEntry = async (projectId: number | null, activityId: number | null, date: Date, hours: number) => {
      if (!currentTimesheet || !employeeId) {
        console.error('Missing timesheet or employee ID');
        return;
      }
      if (!projectId) {
        alert('Please select a project');
        return;
      }
      
      // Validate and clamp hours to 0-24 range
      let hoursValue = typeof hours === 'number' ? hours : parseFloat(String(hours)) || 0;
      if (isNaN(hoursValue)) {
        hoursValue = 0;
      }
      hoursValue = Math.max(0, Math.min(24, hoursValue));
      
      try {
        console.log('Saving entry:', { projectId, activityId, date: formatDate(date), hours: hoursValue });
        await apiService.saveTimesheetEntry(currentTimesheet.id, {
          project_id: projectId,
          activity_id: activityId || undefined,
          entry_date: formatDateLocal(date),
          hours: hoursValue
        });
        console.log('Entry saved successfully');
        // Refresh entries
        const entries = await apiService.getTimesheetEntries(currentTimesheet.id);
        setTimesheetEntries((entries || []).map((e: any) => ({
          ...e,
          entry_date: e?.entry_date ? String(e.entry_date).slice(0, 10) : '',
          hours: Number(e?.hours || 0)
        })));
      } catch (err: any) {
        console.error('Save entry error:', err);
        alert(`Failed to save entry: ${err.message || 'Unknown error'}`);
      }
    };
    
    const handleSaveAll = async () => {
      // Refresh entries to ensure all changes are saved
      if (currentTimesheet) {
        try {
          const entries = await apiService.getTimesheetEntries(currentTimesheet.id);
          setTimesheetEntries((entries || []).map((e: any) => ({
            ...e,
            entry_date: e?.entry_date ? String(e.entry_date).slice(0, 10) : '',
            hours: Number(e?.hours || 0)
          })));
          // Keep editing enabled for draft timesheets so user can continue filling all days
          setIsEditingTimesheet(true);
          alert('Timesheet saved successfully');
        } catch (err: any) {
          console.error('Save all error:', err);
          alert(`Failed to save: ${err.message || 'Unknown error'}`);
        }
      }
    };
    
    const handleSubmit = async () => {
      if (!currentTimesheet || !employeeId) {
        alert('Timesheet not found');
        return;
      }
      
      // Get reporting manager (for now, use employee's manager_id or admin)
      try {
        const employee = await apiService.request<any>(`/employees/${employeeId}`);
        const managerId = employee?.manager_id || employee?.id; // Fallback to self if no manager
        if (!managerId) {
          alert('Reporting manager not found. Please contact administrator.');
          return;
        }
        
        await apiService.submitTimesheet(currentTimesheet.id, managerId);
        alert('Timesheet submitted successfully!');
        // Refresh timesheet
        const timesheets = await apiService.getTimesheets({ 
          employee_id: employeeId, 
          start_date: timesheetPeriod.start,
          end_date: timesheetPeriod.end 
        });
        if (timesheets.length > 0) {
          setCurrentTimesheet(timesheets[0]);
          setIsEditingTimesheet(false);
        }
      } catch (err: any) {
        alert(`Failed to submit timesheet: ${err.message || 'Unknown error'}`);
      }
    };
    
    // Group entries by project and activity
    const groupedEntries: { [key: string]: any } = {};
    // Normalize dates to YYYY-MM-DD to avoid timezone shifts (UTC vs local)
    const normalizeDate = (d: string) => (d ? d.slice(0, 10) : '');

    timesheetEntries.forEach((entry: any) => {
      const key = `${entry.project_id || 'none'}_${entry.activity_id || 'none'}`;
      if (!groupedEntries[key]) {
        groupedEntries[key] = {
          project_id: entry.project_id,
          activity_id: entry.activity_id,
          project_name: entry.project_name || 'No Project',
          activity_name: entry.activity_name || 'No Activity',
          entries: {}
        };
      }
      const normalizedDate = normalizeDate(entry.entry_date);
      groupedEntries[key].entries[normalizedDate] = {
        ...entry,
        entry_date: normalizedDate
      };
    });
    
    // Calculate totals
    const dayTotals: { [date: string]: number } = {};
    weekDates.forEach(date => {
      const dateStr = formatDate(date);
      dayTotals[dateStr] = timesheetEntries
        .filter((e: any) => normalizeDate(e.entry_date) === dateStr)
        .reduce((sum: number, e: any) => sum + Number(e.hours || 0), 0);
    });
    const rowTotals: { [key: string]: number } = {};
    Object.keys(groupedEntries).forEach(key => {
      rowTotals[key] = weekDates.reduce((sum, date) => {
        const entry = groupedEntries[key].entries[formatDate(date)];
        return sum + Number(entry?.hours || 0);
      }, 0);
    });
    const grandTotal = Object.values(rowTotals).reduce((sum, total) => sum + total, 0);
    
    return (
    <div style={{
      backgroundColor: COLORS.cardBg,
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
          <span style={{ fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.primary, fontSize: '14px', fontWeight: 500 }}>
            Timesheet Period
          </span>
          <button
            onClick={() => navigateWeek('prev')}
            style={{
              padding: '8px 12px',
              border: `1px solid ${COLORS.border}`,
              backgroundColor: COLORS.white,
              cursor: 'pointer',
              borderRadius: '4px',
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
          >
            ◀
          </button>
          <span style={{ fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.text, fontSize: '14px', minWidth: '200px', textAlign: 'center', fontWeight: 500 }}>
            {timesheetPeriod.start && timesheetPeriod.end 
              ? `${formatDateDisplay(new Date(timesheetPeriod.start))} to ${formatDateDisplay(new Date(timesheetPeriod.end))}`
              : 'Select Period'}
          </span>
          <button
            onClick={() => navigateWeek('next')}
            style={{
              padding: '8px 12px',
              border: `1px solid ${COLORS.border}`,
              backgroundColor: COLORS.white,
              cursor: 'pointer',
              borderRadius: '4px',
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
          >
            ▶
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: COLORS.text, fontFamily: TYPOGRAPHY.fontFamily }}>
          Loading timesheet...
        </div>
      ) : (
        <>
          {!currentTimesheet && timesheetPeriod.start && (
            <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: COLORS.cardBgSecondary, borderRadius: '6px', border: `1px solid ${COLORS.border}` }}>
              <button
                onClick={async () => {
                  if (!employeeId || !timesheetPeriod.start || !timesheetPeriod.end) return;
                  try {
                    const timesheet = await apiService.createTimesheet({
                      employee_id: employeeId,
                      start_date: timesheetPeriod.start,
                      end_date: timesheetPeriod.end
                    });
                    setCurrentTimesheet(timesheet);
                    setIsEditingTimesheet(true);
                    setTimesheetEntries([]);
                  } catch (err: any) {
                    alert(`Failed to create timesheet: ${err.message || 'Unknown error'}`);
                  }
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: COLORS.primary,
                  color: COLORS.white,
                  fontFamily: TYPOGRAPHY.fontFamily,
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                + Create Timesheet for This Period
              </button>
            </div>
          )}
          
          {currentTimesheet && (
            <>
              <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    if (!projects || projects.length === 0) {
                      alert('No projects available. Create projects in Project Info section first.');
                      return;
                    }
                    setShowProjectSelectModal(true);
                  }}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '6px',
                    border: `1px solid ${COLORS.primary}`,
                    backgroundColor: COLORS.primary,
                    color: COLORS.white,
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.primaryHover}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.primary}
                >
                  + Add Project/Activity
                </button>
                {projects && projects.length > 0 && (
                  <span style={{ fontSize: '12px', color: COLORS.textLight, fontFamily: TYPOGRAPHY.fontFamily }}>
                    ({projects.length} projects available)
                  </span>
                )}
              </div>

              {/* Project Selection Modal */}
              {showProjectSelectModal && (
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
                }} onClick={() => setShowProjectSelectModal(false)}>
                  <div style={{
                    backgroundColor: COLORS.white,
                    borderRadius: '8px',
                    padding: '24px',
                    width: '500px',
                    maxWidth: '90%',
                    maxHeight: '80vh',
                    overflowY: 'auto',
                  }} onClick={(e) => e.stopPropagation()}>
                    <h3 style={{ marginTop: 0, marginBottom: '20px', fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.text }}>
                      Select Project to Add
                    </h3>
                    <div style={{ marginBottom: '20px' }}>
                      {projects && projects.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {projects.filter(p => !p.status || p.status === 'active').map(project => (
                            <button
                              key={project.id}
                              onClick={async () => {
                                if (!currentTimesheet || weekDates.length === 0) {
                                  alert('Timesheet not ready');
                                  setShowProjectSelectModal(false);
                                  return;
                                }
                                
                                try {
                                  // Get activities for this project
                                  let activityId: number | null = null;
                                  try {
                                    const activities = await apiService.getActivities(project.id);
                                    if (activities && activities.length > 0) {
                                      activityId = activities[0].id;
                                    }
                                  } catch (activityErr: any) {
                                    console.log('No activities found for project');
                                  }
                                  
                                  // Create entry for first day of week
                                  await handleSaveEntry(project.id, activityId, weekDates[0], 0);
                                  setShowProjectSelectModal(false);
                                } catch (err: any) {
                                  console.error('Error adding project:', err);
                                  alert(`Failed to add project: ${err.message || 'Unknown error'}`);
                                }
                              }}
                              style={{
                                padding: '12px 16px',
                                borderRadius: '6px',
                                border: `1px solid ${COLORS.border}`,
                                backgroundColor: COLORS.white,
                                color: COLORS.text,
                                fontFamily: TYPOGRAPHY.fontFamily,
                                fontSize: '14px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.2s',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = COLORS.lightBg;
                                e.currentTarget.style.borderColor = COLORS.primary;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = COLORS.white;
                                e.currentTarget.style.borderColor = COLORS.border;
                              }}
                            >
                              {project.name}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p style={{ color: COLORS.textLight, fontFamily: TYPOGRAPHY.fontFamily }}>
                          No projects available. Create projects in Project Info section first.
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setShowProjectSelectModal(false)}
                        style={{
                          padding: '10px 24px',
                          borderRadius: '6px',
                          border: `1px solid ${COLORS.border}`,
                          backgroundColor: COLORS.white,
                          color: COLORS.text,
                          fontFamily: TYPOGRAPHY.fontFamily,
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontFamily: TYPOGRAPHY.fontFamily,
                }}>
                  <thead>
                    <tr style={{ backgroundColor: COLORS.tableBg }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: COLORS.text, border: `1px solid ${COLORS.border}` }}>
                        Project
                      </th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: COLORS.text, border: `1px solid ${COLORS.border}` }}>
                        Activity
                      </th>
                      {weekDates.map((date, idx) => (
                        <th key={idx} style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: COLORS.text, border: `1px solid ${COLORS.border}` }}>
                          <div>{date.getDate()}</div>
                          <div style={{ fontSize: '11px', fontWeight: 'normal' }}>{dayNames[date.getDay()]}</div>
                        </th>
                      ))}
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: COLORS.text, border: `1px solid ${COLORS.border}`, backgroundColor: COLORS.primary, color: COLORS.white }}>
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(groupedEntries).length === 0 ? (
                      <tr>
                        <td colSpan={10} style={{ padding: '40px', textAlign: 'center', color: COLORS.textLight, fontFamily: TYPOGRAPHY.fontFamily }}>
                          No entries yet. Add a project/activity to start logging hours.
                        </td>
                      </tr>
                    ) : (
                      Object.keys(groupedEntries).map(key => {
                        const group = groupedEntries[key];
                        const handleDeleteProject = async (e: React.MouseEvent) => {
                          e.stopPropagation();
                          e.preventDefault();
                          if (!confirm(`Are you sure you want to remove "${group.project_name}" from this timesheet? All hours for this project will be deleted.`)) {
                            return;
                          }
                          try {
                            console.log('=== DELETE PROJECT ===');
                            console.log('Project:', group.project_name, 'ID:', group.project_id);
                            console.log('Activity ID:', group.activity_id);
                            console.log('Timesheet ID:', currentTimesheet!.id);
                            
                            // Get all entries to delete - log full entry details
                            const entriesToDelete = Object.values(group.entries) as any[];
                            console.log('=== ENTRIES TO DELETE ===');
                            console.log('Count:', entriesToDelete.length);
                            console.log('Full entries:', JSON.stringify(entriesToDelete, null, 2));
                            
                            if (entriesToDelete.length === 0) {
                              alert('No entries found to delete');
                              return;
                            }
                            
                            // Verify entry IDs before deletion
                            const validEntries = entriesToDelete.filter((entry: any) => {
                              const hasId = entry && entry.id && !isNaN(parseInt(entry.id));
                              if (!hasId) {
                                console.error('Invalid entry (missing or invalid ID):', entry);
                              }
                              return hasId;
                            });
                            
                            if (validEntries.length === 0) {
                              alert('No valid entries found to delete. Check console for details.');
                              return;
                            }
                            
                            console.log(`Found ${validEntries.length} valid entries to delete`);
                            
                            // Delete entries one by one - more reliable
                            let deletedCount = 0;
                            let failedCount = 0;
                            const deletedIds: number[] = [];
                            
                            for (const entry of validEntries) {
                              const entryId = parseInt(entry.id);
                              try {
                                console.log(`Deleting entry ID: ${entryId} (Project: ${entry.project_id}, Date: ${entry.entry_date})`);
                                const result = await apiService.deleteTimesheetEntry(entryId);
                                console.log(`Delete result for ${entryId}:`, result);
                                deletedCount++;
                                deletedIds.push(entryId);
                                
                                // Small delay between deletions
                                await new Promise(resolve => setTimeout(resolve, 50));
                              } catch (err: any) {
                                console.error(`Failed to delete entry ${entryId}:`, err);
                                failedCount++;
                              }
                            }
                            
                            console.log(`=== DELETION SUMMARY ===`);
                            console.log(`Deleted: ${deletedCount}, Failed: ${failedCount}`);
                            console.log(`Deleted IDs:`, deletedIds);
                            
                            if (failedCount > 0) {
                              alert(`Deleted ${deletedCount} entries, but ${failedCount} failed. Check console.`);
                            }
                            
                            // Wait longer for database commit
                            await new Promise(resolve => setTimeout(resolve, 500));
                            
                            // Force refresh - clear and reload multiple times to ensure
                            setTimesheetEntries([]);
                            await new Promise(resolve => setTimeout(resolve, 100));
                            
                            const freshEntries = await apiService.getTimesheetEntries(currentTimesheet!.id);
                            console.log('=== FRESH ENTRIES AFTER DELETE ===');
                            console.log('Count:', freshEntries?.length || 0);
                            console.log('All entries:', freshEntries?.map((e: any) => ({
                              id: e.id,
                              project_id: e.project_id,
                              project_name: e.project_name,
                              date: e.entry_date
                            })));
                            
                            // Verify - check if any deleted entries still exist
                            const stillExist = (freshEntries || []).filter((e: any) => deletedIds.includes(e.id));
                            if (stillExist.length > 0) {
                              console.error('WARNING: These entries still exist after deletion:', stillExist);
                              alert(`Warning: ${stillExist.length} entries still exist. They may not have been deleted from database.`);
                            }
                            
                            // Filter out entries for this project (extra safety)
                            const filteredEntries = (freshEntries || []).filter((e: any) => {
                              const isDeletedProject = e.project_id === group.project_id && 
                                (group.activity_id === null ? e.activity_id === null : e.activity_id === group.activity_id);
                              if (isDeletedProject) {
                                console.error('CRITICAL: Found entry for deleted project:', {
                                  id: e.id,
                                  project_id: e.project_id,
                                  activity_id: e.activity_id,
                                  date: e.entry_date
                                });
                              }
                              return !isDeletedProject;
                            });
                            
                            console.log('Filtered entries count:', filteredEntries.length);
                            
                            // Double-check: query backend directly to verify deletion
                            try {
                              const verifyEntries = await apiService.getTimesheetEntries(currentTimesheet!.id);
                              const verifyFiltered = (verifyEntries || []).filter((e: any) => {
                                return !(e.project_id === group.project_id && 
                                  (group.activity_id === null ? e.activity_id === null : e.activity_id === group.activity_id));
                              });
                              
                              if (verifyFiltered.length !== filteredEntries.length) {
                                console.error('Mismatch in filtered entries!');
                                console.error('First filter count:', filteredEntries.length);
                                console.error('Verify filter count:', verifyFiltered.length);
                              }
                              
                              setTimesheetEntries(verifyFiltered);
                            } catch (verifyErr: any) {
                              console.error('Error verifying entries:', verifyErr);
                              setTimesheetEntries(filteredEntries);
                            }
                            
                            if (failedCount === 0 && stillExist.length === 0) {
                              // Final verification - wait a bit more and check again
                              setTimeout(async () => {
                                try {
                                  const finalCheck = await apiService.getTimesheetEntries(currentTimesheet!.id);
                                  const finalFiltered = (finalCheck || []).filter((e: any) => {
                                    return !(e.project_id === group.project_id && 
                                      (group.activity_id === null ? e.activity_id === null : e.activity_id === group.activity_id));
                                  });
                                  
                                  if (finalFiltered.length !== filteredEntries.length) {
                                    console.error('Entries reappeared after deletion!');
                                    setTimesheetEntries(finalFiltered);
                                  }
                                } catch (err) {
                                  console.error('Final check error:', err);
                                }
                              }, 1000);
                              
                              alert('Project removed successfully');
                            } else if (stillExist.length > 0) {
                              alert(`Project removal incomplete. ${stillExist.length} entries still exist. Please check database.`);
                            }
                          } catch (err: any) {
                            console.error('Delete project error:', err);
                            alert(`Failed to remove project: ${err.message || 'Unknown error'}`);
                          }
                        };
                        
                        return (
                          <tr key={key}>
                            <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text, border: `1px solid ${COLORS.border}`, position: 'relative' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>{group.project_name}</span>
                                {isEditingTimesheet && currentTimesheet.status === 'draft' && (
                                  <button
                                    onClick={(e) => handleDeleteProject(e)}
                                    type="button"
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      cursor: 'pointer',
                                      fontSize: '16px',
                                      color: COLORS.danger,
                                      padding: '4px 8px',
                                      borderRadius: '4px',
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = COLORS.lightBg;
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                    title="Remove project from timesheet"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            </td>
                            <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text, border: `1px solid ${COLORS.border}` }}>
                              {group.activity_name}
                            </td>
                            {weekDates.map((date, idx) => {
                              const dateStr = formatDate(date);
                              const entry = group.entries[dateStr];
                              const hours = entry ? Number(entry.hours || 0) : 0;
                              return (
                                <td key={idx} style={{ padding: '8px', textAlign: 'center', border: `1px solid ${COLORS.border}` }}>
                                  {isEditingTimesheet && currentTimesheet.status === 'draft' ? (
                                    <HoursInputCell
                                      initialHours={hours}
                                      onSave={(newHours) => handleSaveEntry(group.project_id, group.activity_id, date, newHours)}
                                      formatHours={formatHours}
                                      parseHours={parseHours}
                                    />
                                  ) : (
                                    <span style={{ fontSize: '14px', color: COLORS.text }}>
                                      {formatHours(hours)}
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                            <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: COLORS.primary, border: `1px solid ${COLORS.border}`, backgroundColor: COLORS.tableBg, fontWeight: 600 }}>
                              {formatHours(rowTotals[key] || 0)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                    <tr style={{ backgroundColor: COLORS.cardBgSecondary }}>
                      <td colSpan={2} style={{ padding: '12px', fontSize: '14px', color: COLORS.text, border: `1px solid ${COLORS.border}`, fontWeight: 600 }}>
                        Total
                      </td>
                      {weekDates.map((date, idx) => {
                        const dateStr = formatDate(date);
                        return (
                          <td key={idx} style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: COLORS.primary, border: `1px solid ${COLORS.border}`, fontWeight: 600 }}>
                            {formatHours(dayTotals[dateStr] || 0)}
                          </td>
                        );
                      })}
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: COLORS.primary, border: `1px solid ${COLORS.border}`, backgroundColor: COLORS.primary, color: COLORS.white, fontWeight: 600 }}>
                        {formatHours(grandTotal)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.textLight }}>
                  Status: <span style={{ 
                    color: currentTimesheet.status === 'submitted' ? COLORS.primary : 
                           currentTimesheet.status === 'approved' ? COLORS.primary : 
                           currentTimesheet.status === 'rejected' ? COLORS.danger : COLORS.text,
                    fontWeight: 600 
                  }}>
                    {currentTimesheet.status === 'draft' ? 'Not Submitted' : 
                     currentTimesheet.status === 'submitted' ? 'Submitted' :
                     currentTimesheet.status === 'approved' ? 'Approved' :
                     currentTimesheet.status === 'rejected' ? 'Rejected' : currentTimesheet.status}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {currentTimesheet.status === 'draft' && (
                    <>
                      {!isEditingTimesheet ? (
                        <button
                          onClick={() => setIsEditingTimesheet(true)}
                          style={{
                            padding: '10px 32px',
                            borderRadius: '6px',
                            border: `1px solid ${COLORS.primary}`,
                            backgroundColor: 'transparent',
                            color: COLORS.primary,
                            fontFamily: TYPOGRAPHY.fontFamily,
                            cursor: 'pointer',
                            fontSize: '15px',
                            fontWeight: 500,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = COLORS.primaryHover;
                            e.currentTarget.style.color = COLORS.white;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = COLORS.primary;
                          }}
                        >
                          Edit
                        </button>
                      ) : (
                        <button
                          onClick={handleSaveAll}
                          style={{
                            padding: '10px 32px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: COLORS.primary,
                            color: COLORS.white,
                            fontFamily: TYPOGRAPHY.fontFamily,
                            cursor: 'pointer',
                            fontSize: '15px',
                            fontWeight: 500,
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.primaryHover}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.primary}
                        >
                          Save
                        </button>
                      )}
                    </>
                  )}
                  {currentTimesheet.status === 'draft' && (
                    <button
                      onClick={handleSubmit}
                      style={{
                        padding: '10px 32px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: COLORS.primary,
                        color: COLORS.white,
                        fontFamily: TYPOGRAPHY.fontFamily,
                        cursor: 'pointer',
                        fontSize: '15px',
                        fontWeight: 500,
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.primaryHover}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.primary}
                    >
                      Submit
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
    );
  };

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
            backgroundColor: COLORS.primary,
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
          case 'employeeTimesheets': 
            if (!isAdmin()) {
              setTimesheetSection('myTimesheets');
              return renderMyTimesheets();
            }
            return renderEmployeeTimesheets();
        }
        break;
      
      case 'attendance':
        switch (attendanceSection) {
          case 'myRecords': return renderMyRecords();
          case 'punchIn': return renderPunchIn();
          case 'employeeRecords': 
            if (!isAdmin()) {
              setAttendanceSection('myRecords');
              return renderMyRecords();
            }
            return renderEmployeeRecords();
          case 'configuration': 
            if (!isAdmin()) {
              setAttendanceSection('myRecords');
              return renderMyRecords();
            }
            return renderConfiguration();
        }
        break;
      
      case 'reports':
        switch (reportSection) {
          case 'projectReport': return renderProjectReport();
          case 'employeeReport': 
            if (!isAdmin()) {
              setReportSection('projectReport');
              return renderProjectReport();
            }
            return renderEmployeeReport();
          case 'attendanceSummary': return renderAttendanceSummary();
        }
        break;
      
      case 'projects':
        return renderProjects();
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
