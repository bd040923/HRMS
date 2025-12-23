import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

const COLORS = {
  primary: '#78176b',
  primaryHover: '#590a4f',
  lightBg: '#faf3ff',
  lightBgAlt: '#fffafe',
  white: '#ffffff',
  text: '#333333',
  textLight: '#666666',
  border: '#e0e0e0',
  accent: '#78176b',
};

const TYPOGRAPHY = {
  fontFamily: "'Segoe UI', Arial, sans-serif",
  heading: { fontSize: '2rem', fontWeight: 500 },
  textImportant: { fontSize: '16px' },
  textNote: { fontSize: '14px' },
};

const employmentStatuses = [
  'Freelance',
  'Full-Time Contract',
  'Full-Time Permanent',
  'Full-Time Probation',
  'Part-Time Contract',
  'Part-Time Internship',
];

const subUnits = ['Arithwise HRM', 'Administration', 'Engineering', 'Development', 'Quality Assurance'];
const includeOptions = ['Current Employees Only', 'Current and Past Employees', 'Past Employees Only'];
const configurationOptions = ['Optional Fields', 'Custom Fields', 'Data Import', 'Reporting Methods', 'Termination Reasons'];
const reportRows = ['All Employee Sub Unit Hierarchy Report', 'Employee Contact Info Report', 'Employee Job Details', 'PIM Sample Report'];

interface EmployeeRecord {
  id: number;
  employee_id: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  job_title?: string | null;
  employment_status?: string | null;
  sub_unit?: string | null;
  supervisor_name?: string | null;
  status?: string | null;
  hire_date?: string | null;
  full_name?: string;
}

interface EmployeeFilters {
  employeeId: string;
  employeeName: string;
  jobTitle: string;
  employmentStatus: string;
  subUnit: string;
  supervisor: string;
  include: string;
}

interface EmployeeFormState {
  employeeId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  jobTitle: string;
  employmentStatus: string;
  subUnit: string;
  supervisorName: string;
  email: string;
  phone: string;
  hireDate: string;
  status: string;
}

const defaultFilters: EmployeeFilters = {
  employeeId: '',
  employeeName: '',
  jobTitle: '',
  employmentStatus: '',
  subUnit: '',
  supervisor: '',
  include: 'Current Employees Only',
};

const defaultForm: EmployeeFormState = {
  employeeId: '',
  firstName: '',
  middleName: '',
  lastName: '',
  jobTitle: '',
  employmentStatus: 'Full-Time Permanent',
  subUnit: '',
  supervisorName: '',
  email: '',
  phone: '',
  hireDate: '',
  status: 'active',
};

const Employees: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const isAdminUser = isAdmin();
  const [activeTab, setActiveTab] = useState<'configuration' | 'list' | 'add' | 'reports'>('add');
  const [filters, setFilters] = useState<EmployeeFilters>({ ...defaultFilters });
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [jobTitleOptions, setJobTitleOptions] = useState<string[]>([]);
  const [employeeForm, setEmployeeForm] = useState<EmployeeFormState>({ ...defaultForm });
  const [editingEmployee, setEditingEmployee] = useState<EmployeeRecord | null>(null);
  const [loginDetails, setLoginDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadJobTitles();
    void fetchEmployees(defaultFilters);
  }, []);

  const tabs = useMemo(() => {
    const base = [
      { key: 'configuration', label: 'Configuration', menuKey: 'configMenu', items: configurationOptions },
      { key: 'list', label: 'Employee List' },
      { key: 'add', label: 'Add Employee' },
      { key: 'reports', label: 'Reports', menuKey: 'reportsMenu', items: ['PIM Reports', 'Employee Reports'] },
    ] as const;
    return isAdminUser ? base : base.filter(t => t.key === 'add');
  }, [isAdminUser]);

  useEffect(() => {
    if (!isAdminUser && activeTab !== 'add') {
      setActiveTab('add');
    }
    if (isAdminUser && !tabs.some(t => t.key === activeTab)) {
      setActiveTab('add');
    }
  }, [isAdminUser, activeTab, tabs]);

  const formattedEmployees = useMemo(
    () =>
      employees.map((emp) => ({
        ...emp,
        fullName: [emp.first_name, emp.middle_name, emp.last_name].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim(),
      })),
    [employees]
  );

  const supervisorOptions = useMemo(
    () => formattedEmployees.filter((emp) => emp.status === 'active').map((emp) => emp.fullName || emp.employee_id),
    [formattedEmployees]
  );

  const loadJobTitles = async () => {
    try {
      const data = await apiService.getJobTitles();
      const titles = Array.isArray(data) ? data.map((item: any) => item?.title).filter(Boolean) : [];
      setJobTitleOptions(titles.length ? titles : ['Account Assistant', 'Automation Tester', 'Content Specialist']);
    } catch {
      setJobTitleOptions(['Account Assistant', 'Automation Tester', 'Content Specialist']);
    }
  };

  const fetchEmployees = async (payload: EmployeeFilters = filters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getEmployeeDirectory(payload);
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || 'Unable to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof EmployeeFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => void fetchEmployees(filters);

  const resetFilters = () => {
    const reset = { ...defaultFilters };
    setFilters(reset);
    void fetchEmployees(reset);
  };

  const openAddForm = () => {
    setEmployeeForm({ ...defaultForm });
    setEditingEmployee(null);
    setLoginDetails(false);
    setError(null);
    setActiveTab('add');
  };

  const handleEdit = (employee: EmployeeRecord) => {
    setEditingEmployee(employee);
    setEmployeeForm({
      employeeId: employee.employee_id,
      firstName: employee.first_name,
      middleName: employee.middle_name || '',
      lastName: employee.last_name,
      jobTitle: employee.job_title || '',
      employmentStatus: employee.employment_status || '',
      subUnit: employee.sub_unit || '',
      supervisorName: employee.supervisor_name || '',
      email: employee.email || '',
      phone: employee.phone || '',
      hireDate: employee.hire_date ? employee.hire_date.split('T')[0] : '',
      status: employee.status || 'active',
    });
    setLoginDetails(false);
    setError(null);
    setActiveTab('add');
  };

  const handleDelete = async (employee: EmployeeRecord) => {
    if (!window.confirm(`Delete ${employee.full_name || employee.first_name}?`)) {
      return;
    }
    try {
      await apiService.deleteEmployee(employee.id);
      await fetchEmployees();
    } catch (err: any) {
      setError(err?.message || 'Unable to delete employee');
    }
  };

  const handleFormChange = (key: keyof EmployeeFormState, value: string) => {
    setEmployeeForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveEmployee = async () => {
    if (!employeeForm.employeeId.trim() || !employeeForm.firstName.trim() || !employeeForm.lastName.trim()) {
      setError('Employee ID, First Name and Last Name are required.');
      return;
    }

    const payload = {
      employeeId: employeeForm.employeeId.trim(),
      firstName: employeeForm.firstName.trim(),
      middleName: employeeForm.middleName.trim(),
      lastName: employeeForm.lastName.trim(),
      email: employeeForm.email.trim() || undefined,
      phone: employeeForm.phone.trim() || undefined,
      jobTitle: employeeForm.jobTitle.trim() || undefined,
      employmentStatus: employeeForm.employmentStatus || undefined,
      subUnit: employeeForm.subUnit || undefined,
      supervisorName: employeeForm.supervisorName.trim() || undefined,
      status: employeeForm.status,
      hireDate: employeeForm.hireDate || undefined,
    };

    try {
      setIsSaving(true);
      if (editingEmployee) {
        await apiService.updateEmployee(editingEmployee.id, payload);
      } else {
        await apiService.createEmployee(payload);
      }
      setEmployeeForm({ ...defaultForm });
      setEditingEmployee(null);
      setActiveTab('list');
      await fetchEmployees();
    } catch (err: any) {
      setError(err?.message || 'Unable to save employee');
    } finally {
      setIsSaving(false);
    }
  };

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
      {(() => {
        const { isAdmin } = useAuth();
        const tabDefs = [
          { key: 'configuration', label: 'Configuration', menuKey: 'configMenu', items: configurationOptions },
          { key: 'list', label: 'Employee List' },
          { key: 'add', label: 'Add Employee' },
          { key: 'reports', label: 'Reports', menuKey: 'reportsMenu', items: ['PIM Reports', 'Employee Reports'] },
        ] as const;
        const filteredTabs = isAdmin ? tabDefs : tabDefs.filter(t => t.key === 'add');
        return (
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {filteredTabs.map((tab) => {
              const isActive = activeTab === tab.key;
              const isMenuOpen = activeTab === tab.key && !!tab.menuKey;
              return (
                <div key={tab.key} style={{ position: 'relative' }}>
                  <button
                    onClick={() => {
                      if (tab.menuKey) {
                        setActiveTab(isActive ? 'list' : tab.key);
                      } else {
                        setActiveTab(tab.key);
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
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {tab.label}
                    {tab.menuKey && <span style={{ fontSize: '10px' }}>▼</span>}
                  </button>
                  {isMenuOpen && tab.items && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '44px',
                        left: 0,
                        backgroundColor: COLORS.white,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        zIndex: 10,
                        minWidth: '180px',
                      }}
                    >
                      {tab.items.map((item) => (
                        <div
                          key={item}
                          onClick={() => {
                            if (tab.key === 'reports') {
                              if (item === 'PIM Reports') {
                                navigate('/reports/pim');
                              } else if (item === 'Employee Reports') {
                                navigate('/reports/employee');
                              }
                            }
                            setActiveTab('list');
                          }}
                          style={{
                            padding: '10px 12px',
                            cursor: 'pointer',
                            fontFamily: TYPOGRAPHY.fontFamily,
                            fontSize: TYPOGRAPHY.text.fontSize,
                            color: COLORS.text,
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = COLORS.lightBg; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = COLORS.white; }}
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
        );
      })()}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, fontWeight: 600, margin: 0, color: COLORS.text }}>
          Employee Information
        </h3>
        {error && activeTab === 'list' && (
          <div style={{ backgroundColor: '#fdecea', color: '#b71c1c', borderRadius: '6px', padding: '8px 12px', fontFamily: TYPOGRAPHY.fontFamily }}>{error}</div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: TYPOGRAPHY.textNote.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, color: COLORS.text }}>Employee Name</label>
          <input
            type="text"
            value={filters.employeeName}
            onChange={(e) => handleFilterChange('employeeName', e.target.value)}
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
            Employee ID
          </label>
          <input
            type="text"
            value={filters.employeeId}
            onChange={(e) => handleFilterChange('employeeId', e.target.value)}
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
            Employment Status
          </label>
          <select
            value={filters.employmentStatus}
            onChange={(e) => handleFilterChange('employmentStatus', e.target.value)}
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
            {employmentStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
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
            Include
          </label>
          <select
            value={filters.include}
            onChange={(e) => handleFilterChange('include', e.target.value)}
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
            {includeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
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
            Supervisor Name
          </label>
          <input
            type="text"
            value={filters.supervisor}
            onChange={(e) => handleFilterChange('supervisor', e.target.value)}
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
            Job Title
          </label>
          <select
            value={filters.jobTitle}
            onChange={(e) => handleFilterChange('jobTitle', e.target.value)}
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
            {jobTitleOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
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
            Sub Unit
          </label>
          <select
            value={filters.subUnit}
            onChange={(e) => handleFilterChange('subUnit', e.target.value)}
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
            {subUnits.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button
          onClick={resetFilters}
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
          onClick={handleSearch}
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
            onClick={openAddForm}
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
            ({employees.length}) Records Found
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
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: '16px', textAlign: 'center', color: COLORS.textLight }}>
                    Loading employees...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '16px', textAlign: 'center', color: COLORS.textLight }}>
                    No employee records found.
                  </td>
                </tr>
              ) : (
                formattedEmployees.map((emp) => (
                  <tr
                    key={emp.id}
                    style={{
                      borderBottom: `1px solid ${COLORS.border}`,
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.lightBg)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '12px 16px' }}>{emp.employee_id}</td>
                    <td style={{ padding: '12px 16px' }}>{emp.fullName}</td>
                    <td style={{ padding: '12px 16px' }}>{emp.last_name}</td>
                    <td style={{ padding: '12px 16px' }}>{emp.job_title || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>{emp.employment_status || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>{emp.sub_unit || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>{emp.supervisor_name || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleEdit(emp)}
                          style={{
                            border: 'none',
                            background: 'none',
                            fontSize: '18px',
                            cursor: 'pointer',
                            color: COLORS.primary,
                          }}
                          title="Edit employee"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(emp)}
                          style={{
                            border: 'none',
                            background: 'none',
                            fontSize: '18px',
                            cursor: 'pointer',
                            color: '#dc3545',
                          }}
                          title="Delete employee"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3
          style={{
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: TYPOGRAPHY.textImportant.fontSize,
            fontWeight: 600,
            margin: '0',
            color: COLORS.text,
          }}
        >
          {editingEmployee ? 'Edit Employee' : 'Add Employee'}
        </h3>
        {error && (
          <div style={{ backgroundColor: '#fdecea', color: '#b71c1c', borderRadius: '6px', padding: '8px 12px', fontFamily: TYPOGRAPHY.fontFamily }}>{error}</div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ flexShrink: 0, textAlign: 'center' }}>
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
              margin: '0 auto',
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
          <div
            style={{
              marginTop: '12px',
              fontFamily: TYPOGRAPHY.fontFamily,
              fontSize: TYPOGRAPHY.textNote.fontSize,
              color: COLORS.textLight,
              lineHeight: 1.4,
            }}
          >
            Accepts jpg, png, gif up to 1MB. Recommended
            <br />
            dimensions: 200px × 200px
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: TYPOGRAPHY.textNote.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, color: COLORS.text }}>First Name*</label>
              <input
                type="text"
                value={employeeForm.firstName}
                onChange={(e) => handleFormChange('firstName', e.target.value)}
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
              <label style={{ fontSize: TYPOGRAPHY.textNote.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, color: COLORS.text }}>Middle Name</label>
              <input
                type="text"
                value={employeeForm.middleName}
                onChange={(e) => handleFormChange('middleName', e.target.value)}
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
              <label style={{ fontSize: TYPOGRAPHY.textNote.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, color: COLORS.text }}>Last Name*</label>
              <input
                type="text"
                value={employeeForm.lastName}
                onChange={(e) => handleFormChange('lastName', e.target.value)}
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
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: TYPOGRAPHY.textNote.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, color: COLORS.text }}>Employee ID*</label>
              <input
                type="text"
                value={employeeForm.employeeId}
                onChange={(e) => handleFormChange('employeeId', e.target.value)}
                readOnly={!!editingEmployee}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '8px',
                  fontSize: TYPOGRAPHY.textImportant.fontSize,
                  fontFamily: TYPOGRAPHY.fontFamily,
                  boxSizing: 'border-box',
                  backgroundColor: editingEmployee ? COLORS.lightBg : COLORS.white,
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: TYPOGRAPHY.textNote.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, color: COLORS.text }}>Email</label>
              <input
                type="email"
                value={employeeForm.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
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
              <label style={{ fontSize: TYPOGRAPHY.textNote.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, color: COLORS.text }}>Phone</label>
              <input
                type="tel"
                value={employeeForm.phone}
                onChange={(e) => handleFormChange('phone', e.target.value)}
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
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: TYPOGRAPHY.textNote.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, color: COLORS.text }}>Job Title</label>
              <select
                value={employeeForm.jobTitle}
                onChange={(e) => handleFormChange('jobTitle', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '8px',
                  fontSize: TYPOGRAPHY.textImportant.fontSize,
                  fontFamily: TYPOGRAPHY.fontFamily,
                  boxSizing: 'border-box',
                  backgroundColor: COLORS.white,
                }}
              >
                <option value="">-- Select --</option>
                {jobTitleOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: TYPOGRAPHY.textNote.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, color: COLORS.text }}>Employment Status</label>
              <select
                value={employeeForm.employmentStatus}
                onChange={(e) => handleFormChange('employmentStatus', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '8px',
                  fontSize: TYPOGRAPHY.textImportant.fontSize,
                  fontFamily: TYPOGRAPHY.fontFamily,
                  boxSizing: 'border-box',
                  backgroundColor: COLORS.white,
                }}
              >
                <option value="">-- Select --</option>
                {employmentStatuses.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: TYPOGRAPHY.textNote.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, color: COLORS.text }}>Sub Unit</label>
              <select
                value={employeeForm.subUnit}
                onChange={(e) => handleFormChange('subUnit', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '8px',
                  fontSize: TYPOGRAPHY.textImportant.fontSize,
                  fontFamily: TYPOGRAPHY.fontFamily,
                  boxSizing: 'border-box',
                  backgroundColor: COLORS.white,
                }}
              >
                <option value="">-- Select --</option>
                {subUnits.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: TYPOGRAPHY.textNote.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, color: COLORS.text }}>Supervisor Name</label>
              <select
                value={employeeForm.supervisorName}
                onChange={(e) => handleFormChange('supervisorName', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '8px',
                  fontSize: TYPOGRAPHY.textImportant.fontSize,
                  fontFamily: TYPOGRAPHY.fontFamily,
                  boxSizing: 'border-box',
                  backgroundColor: COLORS.white,
                }}
              >
                <option value="">-- Select --</option>
                {supervisorOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: TYPOGRAPHY.textNote.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, color: COLORS.text }}>Hire Date</label>
              <input
                type="date"
                value={employeeForm.hireDate}
                onChange={(e) => handleFormChange('hireDate', e.target.value)}
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
              <label style={{ fontSize: TYPOGRAPHY.textNote.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, color: COLORS.text }}>Status</label>
              <select
                value={employeeForm.status}
                onChange={(e) => handleFormChange('status', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '8px',
                  fontSize: TYPOGRAPHY.textImportant.fontSize,
                  fontFamily: TYPOGRAPHY.fontFamily,
                  boxSizing: 'border-box',
                  backgroundColor: COLORS.white,
                }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
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
        </div>
      </div>
      <p
        style={{
          fontSize: TYPOGRAPHY.textNote.fontSize,
          fontFamily: TYPOGRAPHY.fontFamily,
          color: COLORS.textLight,
          margin: '0 0 20px 0',
          alignSelf: 'flex-start',
        }}
      >
        * Required
      </p>

      {loginDetails && (
        <div
          style={{
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: `1px solid ${COLORS.border}`,
          }}
        >
          <h4
            style={{
              fontFamily: TYPOGRAPHY.fontFamily,
              fontSize: TYPOGRAPHY.textImportant.fontSize,
              fontWeight: 600,
              margin: '0 0 12px',
              color: COLORS.text,
            }}
          >
            Login Details
          </h4>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: TYPOGRAPHY.textNote.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, color: COLORS.text }}>Username</label>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: TYPOGRAPHY.textNote.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, color: COLORS.text }}>Password</label>
              <input
                type="password"
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
              <label style={{ fontSize: TYPOGRAPHY.textNote.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, color: COLORS.text }}>Confirm Password</label>
              <input
                type="password"
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
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
        <button
          onClick={() => {
            setEmployeeForm({ ...defaultForm });
            setEditingEmployee(null);
            setLoginDetails(false);
            setError(null);
            setActiveTab('list');
          }}
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
          onClick={handleSaveEmployee}
          disabled={isSaving}
          style={{
            padding: '10px 24px',
            borderRadius: '24px',
            border: 'none',
            backgroundColor: isSaving ? COLORS.textLight : COLORS.accent,
            color: COLORS.white,
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: TYPOGRAPHY.textImportant.fontSize,
            cursor: isSaving ? 'not-allowed' : 'pointer',
          }}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
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
          + Add
        </button>
      </div>

      <div
        style={{
          fontFamily: TYPOGRAPHY.fontFamily,
          fontSize: TYPOGRAPHY.textImportant.fontSize,
          color: COLORS.textLight,
          marginBottom: '16px',
        }}
      >
        ({reportRows.length}) Records Found
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
                  padding: '12px 16px',
                  fontSize: TYPOGRAPHY.textImportant.fontSize,
                  color: COLORS.text,
                }}
              >
                <input type="checkbox" style={{ marginRight: '8px' }} />
                Name
              </th>
              <th
                style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  fontSize: TYPOGRAPHY.textImportant.fontSize,
                  color: COLORS.text,
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {reportRows.map((report, idx) => (
              <tr
                key={idx}
                style={{
                  borderBottom: `1px solid ${COLORS.border}`,
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.lightBg)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <td style={{ padding: '12px 16px' }}>
                  <input type="checkbox" style={{ marginRight: '8px' }} />
                  {report}
                </td>
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
                    <button
                      style={{
                        border: 'none',
                        background: 'none',
                        fontSize: '18px',
                        cursor: 'pointer',
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
        PIM
      </h1>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const isMenuOpen = activeTab === tab.key && !!tab.menuKey;
          return (
            <div key={tab.key} style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  if (tab.menuKey) {
                    setActiveTab(isActive ? 'add' : tab.key);
                  } else {
                    setActiveTab(tab.key);
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {tab.label}
                {tab.menuKey && <span style={{ fontSize: '10px' }}>▼</span>}
              </button>
              {isMenuOpen && tab.items && (
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
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent event bubbling
                        if (tab.key === 'reports') {
                          if (item === 'PIM Reports') {
                            navigate('/reports/pim');
                          } else if (item === 'Employee Reports') {
                            navigate('/reports/employee');
                          }
                          // Close the dropdown after navigation
                          setActiveTab('add');
                        } else {
                          setActiveTab(tab.key);
                        }
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = COLORS.lightBg;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = COLORS.white;
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
            color: COLORS.textLight,
            fontSize: TYPOGRAPHY.textImportant.fontSize,
          }}
        >
          This tab is a placeholder. The detailed functionality for Configuration can be added next.
        </div>
      )}
    </div>
  );
};

export default Employees;


