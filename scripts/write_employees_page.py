from pathlib import Path

content = """import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  accent: '#28a745',
};

const TYPOGRAPHY = {
  fontFamily: \"'Segoe UI', Arial, sans-serif\",
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
  const [activeTab, setActiveTab] = useState<'configuration' | 'list' | 'add' | 'reports'>('list');
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

  const formattedEmployees = useMemo(
    () =>
      employees.map((emp) => ({
        ...emp,
        fullName: [emp.first_name, emp.middle_name, emp.last_name].filter(Boolean).join(' ').replace(/\\s+/g, ' ').trim(),
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
          <label style={{ fontSize: TYPOGRAPHY.textNote fontSize? (truncated)
"""  # noqa: E501

Path('src/client/src/pages/Employees.tsx').write_text(content)

