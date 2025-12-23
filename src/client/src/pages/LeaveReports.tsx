import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

const COLORS = {
  primary: '#78176b',
  success: '#78176b',
  danger: '#dc3545',
  warning: '#ffc107',
  text: '#222',
  textLight: '#666',
  border: '#ddd',
  white: '#fff',
  lightBg: '#f9f9f9',
  tableBg: '#f5f5f5'
};

const TYPOGRAPHY = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
};

const LeaveReports: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin()) {
      fetchEmployees();
    } else if (user) {
      // For regular users, get their employee ID
      fetchUserEmployee();
    }
  }, [user, isAdmin]);

  const fetchEmployees = async () => {
    try {
      const data = await apiService.getEmployees();
      setEmployees(data || []);
    } catch (err: any) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchUserEmployee = async () => {
    try {
      const data = await apiService.getEmployees();
      const userEmp = data?.find((e: any) => e.user_id === user?.id);
      if (userEmp) {
        setSelectedEmployeeId(userEmp.id);
      }
    } catch (err: any) {
      console.error('Error fetching user employee:', err);
    }
  };

  const generateReport = async () => {
    if (!selectedEmployeeId) {
      alert('Please select an employee');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getEmployeeLeaveReport(selectedEmployeeId, selectedYear);
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Failed to generate report');
      console.error('Error generating report:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateAllReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getAllLeaveReports(selectedYear);
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Failed to generate reports');
      console.error('Error generating reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    window.print();
  };

  const renderReport = () => {
    if (!report) return null;

    if (report.reports) {
      // All employees report
      return (
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.text, marginBottom: '16px' }}>
            All Employees Leave Report - {selectedYear}
          </h3>
          {report.reports.map((empReport: any) => (
            <div key={empReport.employee_id} style={{ 
              marginBottom: '32px', 
              padding: '20px', 
              backgroundColor: COLORS.white, 
              borderRadius: '8px',
              border: `1px solid ${COLORS.border}`
            }}>
              <h4 style={{ fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.text, marginBottom: '12px' }}>
                {empReport.employee_name} ({empReport.email})
              </h4>
              {empReport.leave_summary ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: TYPOGRAPHY.fontFamily }}>
                  <thead>
                    <tr style={{ backgroundColor: COLORS.tableBg }}>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: `2px solid ${COLORS.border}` }}>Leave Type</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: `2px solid ${COLORS.border}` }}>Entitlement</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: `2px solid ${COLORS.border}` }}>Used</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: `2px solid ${COLORS.border}` }}>Balance</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: `2px solid ${COLORS.border}` }}>Monthly Breakdown</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: `2px solid ${COLORS.border}` }}>Violations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {empReport.leave_summary.map((item: any, idx: number) => (
                      <tr key={idx} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                        <td style={{ padding: '12px' }}>{item.leave_type_name}</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>{item.total_entitlement}</td>
                        <td style={{ padding: '12px', textAlign: 'right', color: item.used_days > item.total_entitlement ? COLORS.danger : COLORS.text }}>
                          {item.used_days}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: item.balance_days < 0 ? COLORS.danger : COLORS.text }}>
                          {item.balance_days}
                        </td>
                        <td style={{ padding: '12px' }}>
                          {item.monthly_breakdown && item.monthly_breakdown.length > 0 ? (
                            <div style={{ fontSize: '12px' }}>
                              {item.monthly_breakdown.map((m: any, i: number) => (
                                <span key={i} style={{ marginRight: '8px' }}>
                                  {m.month_name}: {m.days} days
                                </span>
                              ))}
                            </div>
                          ) : '-'}
                        </td>
                        <td style={{ padding: '12px' }}>
                          {item.violations && item.violations.length > 0 ? (
                            <div style={{ fontSize: '12px', color: COLORS.danger }}>
                              {item.violations.map((v: any, i: number) => (
                                <div key={i}>⚠️ {v.message || v.type}</div>
                              ))}
                            </div>
                          ) : '✓ No violations'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: COLORS.textLight }}>No leave data available</p>
              )}
            </div>
          ))}
        </div>
      );
    } else {
      // Single employee report
      return (
        <div style={{ marginTop: '24px', padding: '24px', backgroundColor: COLORS.white, borderRadius: '8px', border: `1px solid ${COLORS.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.text, margin: 0 }}>
              Leave Report - {selectedYear}
            </h3>
            <button
              onClick={exportToPDF}
              style={{
                padding: '8px 16px',
                backgroundColor: COLORS.primary,
                color: COLORS.white,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: TYPOGRAPHY.fontFamily
              }}
            >
              Export PDF
            </button>
          </div>

          {report.leave_summary && report.leave_summary.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: TYPOGRAPHY.fontFamily }}>
              <thead>
                <tr style={{ backgroundColor: COLORS.tableBg }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: `2px solid ${COLORS.border}` }}>Leave Type</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: `2px solid ${COLORS.border}` }}>Entitlement</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: `2px solid ${COLORS.border}` }}>Used</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: `2px solid ${COLORS.border}` }}>Balance</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: `2px solid ${COLORS.border}` }}>Monthly Breakdown</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: `2px solid ${COLORS.border}` }}>Violations</th>
                </tr>
              </thead>
              <tbody>
                {report.leave_summary.map((item: any, idx: number) => (
                  <tr key={idx} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{item.leave_type_name}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>{item.total_entitlement} days</td>
                    <td style={{ padding: '12px', textAlign: 'right', color: item.used_days > item.total_entitlement ? COLORS.danger : COLORS.text }}>
                      {item.used_days} days
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: item.balance_days < 0 ? COLORS.danger : COLORS.success }}>
                      {item.balance_days} days
                    </td>
                    <td style={{ padding: '12px' }}>
                      {item.monthly_breakdown && item.monthly_breakdown.length > 0 ? (
                        <div style={{ fontSize: '12px' }}>
                          {item.monthly_breakdown.map((m: any, i: number) => (
                            <div key={i} style={{ marginBottom: '4px' }}>
                              <strong>{m.month_name.trim()}:</strong> {m.days} days
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: COLORS.textLight }}>No leaves taken</span>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {item.violations && item.violations.length > 0 ? (
                        <div style={{ fontSize: '12px' }}>
                          {item.violations.map((v: any, i: number) => (
                            <div key={i} style={{ color: COLORS.danger, marginBottom: '4px' }}>
                              ⚠️ {v.message || v.type}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: COLORS.success }}>✓ No violations</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: COLORS.textLight }}>No leave data available for this employee</p>
          )}

          <div style={{ marginTop: '24px', padding: '16px', backgroundColor: COLORS.lightBg, borderRadius: '6px', fontSize: '13px' }}>
            <h4 style={{ fontFamily: TYPOGRAPHY.fontFamily, marginTop: 0, marginBottom: '8px' }}>Business Rules:</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', color: COLORS.textLight }}>
              <li>Casual Leave: Maximum 8 days per year, maximum 2 days per month</li>
              <li>Earned Leave: Maximum 12 days per year</li>
              <li>Leaves cannot be taken continuously (must have gaps between leave periods)</li>
            </ul>
          </div>
        </div>
      );
    }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: COLORS.lightBg, minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.text, marginBottom: '24px' }}>
          Leave Reports
        </h1>

        <div style={{ 
          backgroundColor: COLORS.white, 
          borderRadius: '8px', 
          padding: '24px', 
          marginBottom: '24px',
          border: `1px solid ${COLORS.border}`
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: isAdmin() ? '1fr 1fr 1fr' : '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            {isAdmin() && (
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.text }}>
                  Select Employee
                </label>
                <select
                  value={selectedEmployeeId || ''}
                  onChange={(e) => setSelectedEmployeeId(e.target.value ? parseInt(e.target.value) : null)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '6px',
                    fontFamily: TYPOGRAPHY.fontFamily
                  }}
                >
                  <option value="">-- Select Employee --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name} ({emp.email})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.text }}>
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '6px',
                  fontFamily: TYPOGRAPHY.fontFamily
                }}
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
              <button
                onClick={generateReport}
                disabled={!selectedEmployeeId || loading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: selectedEmployeeId ? COLORS.primary : COLORS.border,
                  color: COLORS.white,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: selectedEmployeeId ? 'pointer' : 'not-allowed',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  flex: 1
                }}
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </button>
              {isAdmin() && (
                <button
                  onClick={generateAllReports}
                  disabled={loading}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: COLORS.success,
                    color: COLORS.white,
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontFamily: TYPOGRAPHY.fontFamily
                  }}
                >
                  All Employees
                </button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div style={{ 
            padding: '12px', 
            backgroundColor: '#f8d7da', 
            color: COLORS.danger, 
            borderRadius: '6px', 
            marginBottom: '16px',
            fontFamily: TYPOGRAPHY.fontFamily
          }}>
            {error}
          </div>
        )}

        {report && renderReport()}
      </div>
    </div>
  );
};

export default LeaveReports;

