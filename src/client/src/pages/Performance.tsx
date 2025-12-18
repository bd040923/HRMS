/**
 * arithwise_hrms Performance Management
 * Copyright (C) 2024 Arithwise Inc.
 */

import React, { useState } from 'react';

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

type PerformanceSection = 'kpis' | 'trackers' | 'manageReviews' | 'myReviews' | 'employeeReviews' | 'myTrackers' | 'employeeTrackers';

interface KPI {
  id: number;
  indicator: string;
  jobTitle: string;
  minRate: number;
  maxRate: number;
  isDefault: boolean;
}

interface Tracker {
  id: number;
  employee: string;
  tracker: string;
  addedDate: string;
  modifiedDate?: string;
}

interface Review {
  id: number;
  employee: string;
  jobTitle: string;
  reviewPeriod: string;
  dueDate: string;
  reviewer: string;
  reviewStatus: string;
}

const Performance: React.FC = () => {
  const [activeSection, setActiveSection] = useState<PerformanceSection>('kpis');
  const [configureDropdownOpen, setConfigureDropdownOpen] = useState(false);
  const [manageReviewsDropdownOpen, setManageReviewsDropdownOpen] = useState(false);
  const [selectedKPIs, setSelectedKPIs] = useState<number[]>([]);
  const [selectedTrackers, setSelectedTrackers] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock Data
  const kpis: KPI[] = [
    { id: 1, indicator: 'Assess information to develop strategies', jobTitle: 'Payroll Administrator', minRate: 0, maxRate: 100, isDefault: false },
    { id: 2, indicator: 'Authored Tests', jobTitle: 'QA Lead', minRate: 0, maxRate: 100, isDefault: false },
    { id: 3, indicator: 'Average Service Fulfillment Time', jobTitle: 'Database Administrator', minRate: 0, maxRate: 100, isDefault: false },
    { id: 4, indicator: 'Capacity Planning', jobTitle: 'Database Administrator', minRate: 0, maxRate: 100, isDefault: false },
    { id: 5, indicator: 'Collect the quantitative information required', jobTitle: 'HR Associate', minRate: 0, maxRate: 100, isDefault: false },
    { id: 6, indicator: 'Creation and maintenance of documentation for all customer and internal networks', jobTitle: 'Network Administrator', minRate: 0, maxRate: 100, isDefault: false },
  ];

  const trackers: Tracker[] = [
    { id: 1, employee: 'Sai Brown', tracker: 'Tracker for paul', addedDate: '2022-04-08' },
  ];

  const manageReviews: Review[] = [
    { id: 1, employee: 'firstName210 lastName724', jobTitle: 'Automation Tester', reviewPeriod: '2025-01-01 - 2025-29-12', dueDate: '2025-30-12', reviewer: 'Ranga Akunuri', reviewStatus: 'Inactive' },
  ];

  const myReviews = [
    { id: 1, jobTitle: 'HR Manager', subUnit: 'Human Resources', reviewPeriod: '2022-01-07 - 2022-30-12', dueDate: '2022-31-12', selfEvalStatus: 'Activated', reviewStatus: 'Activated' },
  ];

  const myTrackers = [
    { id: 1, tracker: 'Tracker for paul', addedDate: '2022-04-08', modifiedDate: '' },
  ];

  const employeeTrackers = [
    { id: 1, employeeName: 'Sai Brown', trackers: 'Tracker for paul', addedDate: '2022-04-08', modifiedDate: '' },
  ];

  const toggleKPISelection = (id: number) => {
    setSelectedKPIs(prev =>
      prev.includes(id) ? prev.filter(kpiId => kpiId !== id) : [...prev, id]
    );
  };

  const toggleTrackerSelection = (id: number) => {
    setSelectedTrackers(prev =>
      prev.includes(id) ? prev.filter(trackerId => trackerId !== id) : [...prev, trackerId]
    );
  };

  const renderKPIs = () => (
    <div style={{ padding: '24px', backgroundColor: COLORS.white, borderRadius: '8px', border: `1px solid ${COLORS.border}` }}>
      <h2 style={{ marginTop: 0, marginBottom: '24px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '18px', fontWeight: 600 }}>
        Key Performance Indicators for Job Title
      </h2>

      <div style={{ backgroundColor: COLORS.lightBg, padding: '24px', borderRadius: '8px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
              Job Title
            </label>
            <select style={{ width: '100%', maxWidth: '400px', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, backgroundColor: COLORS.white, boxSizing: 'border-box' }}>
              <option>-- Select --</option>
              <option>Payroll Administrator</option>
              <option>QA Lead</option>
              <option>Database Administrator</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button style={{
            padding: '10px 32px',
            borderRadius: '6px',
            border: `1px solid ${COLORS.success}`,
            backgroundColor: COLORS.white,
            color: COLORS.success,
            fontFamily: TYPOGRAPHY.fontFamily,
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: 500,
          }}>
            Reset
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
            Search
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <button style={{
          padding: '10px 24px',
          borderRadius: '20px',
          border: 'none',
          backgroundColor: COLORS.success,
          color: COLORS.white,
          fontFamily: TYPOGRAPHY.fontFamily,
          cursor: 'pointer',
          fontSize: '15px',
          fontWeight: 500,
        }}>
          + Add
        </button>
      </div>

      <p style={{ marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight }}>
        ({kpis.length}) Records Found
      </p>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: TYPOGRAPHY.fontFamily }}>
          <thead>
            <tr style={{ backgroundColor: COLORS.tableBg }}>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', borderBottom: `1px solid ${COLORS.border}` }}>
                <input type="checkbox" onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedKPIs(kpis.map(k => k.id));
                  } else {
                    setSelectedKPIs([]);
                  }
                }} />
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', borderBottom: `1px solid ${COLORS.border}`, color: COLORS.primary }}>
                Key Performance Indicator ↕
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', borderBottom: `1px solid ${COLORS.border}`, color: COLORS.primary }}>
                Job Title ↕
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', borderBottom: `1px solid ${COLORS.border}`, color: COLORS.primary }}>
                Min Rate
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', borderBottom: `1px solid ${COLORS.border}`, color: COLORS.primary }}>
                Max Rate
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', borderBottom: `1px solid ${COLORS.border}`, color: COLORS.primary }}>
                Is Default
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', borderBottom: `1px solid ${COLORS.border}`, color: COLORS.primary }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {kpis.map((kpi) => (
              <tr key={kpi.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                <td style={{ padding: '12px' }}>
                  <input
                    type="checkbox"
                    checked={selectedKPIs.includes(kpi.id)}
                    onChange={() => toggleKPISelection(kpi.id)}
                  />
                </td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{kpi.indicator}</td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.primary }}>{kpi.jobTitle}</td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{kpi.minRate}</td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{kpi.maxRate}</td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{kpi.isDefault ? 'Yes' : ''}</td>
                <td style={{ padding: '12px' }}>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '8px', color: COLORS.primary }}>✏️</button>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.primary }}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTrackers = () => (
    <div style={{ padding: '24px', backgroundColor: COLORS.white, borderRadius: '8px', border: `1px solid ${COLORS.border}` }}>
      <h2 style={{ marginTop: 0, marginBottom: '24px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '18px', fontWeight: 600 }}>
        Performance Trackers
      </h2>

      <div style={{ backgroundColor: COLORS.lightBg, padding: '24px', borderRadius: '8px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
              Employee Name
            </label>
            <input
              type="text"
              placeholder="Type for hints..."
              style={{ width: '100%', maxWidth: '400px', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button style={{
            padding: '10px 32px',
            borderRadius: '6px',
            border: `1px solid ${COLORS.success}`,
            backgroundColor: COLORS.white,
            color: COLORS.success,
            fontFamily: TYPOGRAPHY.fontFamily,
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: 500,
          }}>
            Reset
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
            Search
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <button style={{
          padding: '10px 24px',
          borderRadius: '20px',
          border: 'none',
          backgroundColor: COLORS.success,
          color: COLORS.white,
          fontFamily: TYPOGRAPHY.fontFamily,
          cursor: 'pointer',
          fontSize: '15px',
          fontWeight: 500,
        }}>
          + Add
        </button>
      </div>

      <p style={{ marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight }}>
        ({trackers.length}) Record Found
      </p>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: TYPOGRAPHY.fontFamily }}>
          <thead>
            <tr style={{ backgroundColor: COLORS.tableBg }}>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', borderBottom: `1px solid ${COLORS.border}` }}>
                <input type="checkbox" />
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', borderBottom: `1px solid ${COLORS.border}`, color: COLORS.primary }}>
                Employee ↕
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', borderBottom: `1px solid ${COLORS.border}`, color: COLORS.primary }}>
                Tracker ↕
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', borderBottom: `1px solid ${COLORS.border}`, color: COLORS.primary }}>
                Added Date ↕
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', borderBottom: `1px solid ${COLORS.border}`, color: COLORS.primary }}>
                Modified Date ↕
              </th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', borderBottom: `1px solid ${COLORS.border}`, color: COLORS.primary }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {trackers.map((tracker) => (
              <tr key={tracker.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                <td style={{ padding: '12px' }}>
                  <input
                    type="checkbox"
                    checked={selectedTrackers.includes(tracker.id)}
                    onChange={() => toggleTrackerSelection(tracker.id)}
                  />
                </td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{tracker.employee}</td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{tracker.tracker}</td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{tracker.addedDate}</td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{tracker.modifiedDate || ''}</td>
                <td style={{ padding: '12px' }}>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '8px', color: COLORS.primary }}>🗑️</button>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.primary }}>✏️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderManageReviews = () => (
    <div style={{ padding: '24px', backgroundColor: COLORS.white, borderRadius: '8px', border: `1px solid ${COLORS.border}` }}>
      <h2 style={{ marginTop: 0, marginBottom: '24px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '18px', fontWeight: 600 }}>
        Manage Performance Reviews
      </h2>

      <div style={{ backgroundColor: COLORS.lightBg, padding: '24px', borderRadius: '8px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
              Employee Name
            </label>
            <input type="text" placeholder="Type for hints..." style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
              Job Title
            </label>
            <select style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, backgroundColor: COLORS.white, boxSizing: 'border-box' }}>
              <option>-- Select --</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
              Review Status
            </label>
            <select style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, backgroundColor: COLORS.white, boxSizing: 'border-box' }}>
              <option>-- Select --</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
              Include
            </label>
            <select style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, backgroundColor: COLORS.white, boxSizing: 'border-box' }}>
              <option>Current Employees Only</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
              Reviewer
            </label>
            <input type="text" placeholder="Type for hints..." style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
              From Date
            </label>
            <input type="date" defaultValue="2025-01-01" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
              To Date
            </label>
            <input type="date" defaultValue="2025-31-12" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button style={{
            padding: '10px 32px',
            borderRadius: '6px',
            border: `1px solid ${COLORS.success}`,
            backgroundColor: COLORS.white,
            color: COLORS.success,
            fontFamily: TYPOGRAPHY.fontFamily,
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: 500,
          }}>
            Reset
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
            Search
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <button style={{
          padding: '10px 24px',
          borderRadius: '20px',
          border: 'none',
          backgroundColor: COLORS.success,
          color: COLORS.white,
          fontFamily: TYPOGRAPHY.fontFamily,
          cursor: 'pointer',
          fontSize: '15px',
          fontWeight: 500,
        }}>
          + Add
        </button>
      </div>

      <p style={{ marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight }}>
        ({manageReviews.length}) Record Found
      </p>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: TYPOGRAPHY.fontFamily }}>
          <thead>
            <tr style={{ backgroundColor: COLORS.tableBg }}>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', borderBottom: `1px solid ${COLORS.border}` }}>
                <input type="checkbox" />
              </th>
              {['Employee ↕', 'Job Title ↕', 'Review Period ↕', 'Due Date ↕', 'Reviewer ↕', 'Review Status ↕', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '13px', borderBottom: `1px solid ${COLORS.border}`, color: COLORS.primary }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {manageReviews.map((review) => (
              <tr key={review.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                <td style={{ padding: '12px' }}><input type="checkbox" /></td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{review.employee}</td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{review.jobTitle}</td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{review.reviewPeriod}</td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{review.dueDate}</td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{review.reviewer}</td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{review.reviewStatus}</td>
                <td style={{ padding: '12px' }}>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '8px', color: COLORS.primary }}>🗑️</button>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.primary }}>✏️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMyReviews = () => (
    <div style={{ padding: '24px', backgroundColor: COLORS.white, borderRadius: '8px', border: `1px solid ${COLORS.border}` }}>
      <h2 style={{ marginTop: 0, marginBottom: '24px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '18px', fontWeight: 600 }}>
        My Reviews
      </h2>

      <p style={{ marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight }}>
        ({myReviews.length}) Record Found
      </p>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: TYPOGRAPHY.fontFamily }}>
          <thead>
            <tr style={{ backgroundColor: COLORS.tableBg }}>
              {['Job Title', 'Sub Unit', 'Review Period ↕', 'Due Date ↕', 'Self Evaluation Status ↕', 'Review Status ↕', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '13px', borderBottom: `1px solid ${COLORS.border}`, color: COLORS.primary }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {myReviews.map((review) => (
              <tr key={review.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{review.jobTitle}</td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{review.subUnit}</td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{review.reviewPeriod}</td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{review.dueDate}</td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{review.selfEvalStatus}</td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.primary }}>{review.reviewStatus}</td>
                <td style={{ padding: '12px' }}>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.primary }}>📄</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderEmployeeReviews = () => (
    <div style={{ padding: '24px', backgroundColor: COLORS.white, borderRadius: '8px', border: `1px solid ${COLORS.border}` }}>
      <h2 style={{ marginTop: 0, marginBottom: '24px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '18px', fontWeight: 600 }}>
        Employee Reviews
      </h2>

      <div style={{ backgroundColor: COLORS.lightBg, padding: '24px', borderRadius: '8px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
              Employee Name
            </label>
            <input type="text" placeholder="Type for hints..." style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
              Job Title
            </label>
            <select style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, backgroundColor: COLORS.white, boxSizing: 'border-box' }}>
              <option>-- Select --</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
              Sub Unit
            </label>
            <select style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, backgroundColor: COLORS.white, boxSizing: 'border-box' }}>
              <option>-- Select --</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
              Include
            </label>
            <select style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, backgroundColor: COLORS.white, boxSizing: 'border-box' }}>
              <option>Current Employees Only</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
              Review Status
            </label>
            <select style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, backgroundColor: COLORS.white, boxSizing: 'border-box' }}>
              <option>-- Select --</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
              From Date
            </label>
            <input type="date" defaultValue="2025-01-01" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
              To Date
            </label>
            <input type="date" defaultValue="2025-31-12" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button style={{
            padding: '10px 32px',
            borderRadius: '6px',
            border: `1px solid ${COLORS.success}`,
            backgroundColor: COLORS.white,
            color: COLORS.success,
            fontFamily: TYPOGRAPHY.fontFamily,
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: 500,
          }}>
            Reset
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
            Search
          </button>
        </div>
      </div>

      <p style={{ marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight }}>
        No Records Found
      </p>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: TYPOGRAPHY.fontFamily }}>
          <thead>
            <tr style={{ backgroundColor: COLORS.tableBg }}>
              {['Employee ↕', 'Job Title', 'Sub Unit', 'Review Period ↕', 'Due Date ↕', 'Review Status ↕', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '13px', borderBottom: `1px solid ${COLORS.border}`, color: COLORS.primary }}>{h}</th>
              ))}
            </tr>
          </thead>
        </table>
      </div>
    </div>
  );

  const renderMyTrackers = () => (
    <div style={{ padding: '24px', backgroundColor: COLORS.white, borderRadius: '8px', border: `1px solid ${COLORS.border}` }}>
      <h2 style={{ marginTop: 0, marginBottom: '24px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '18px', fontWeight: 600 }}>
        My Performance Trackers
      </h2>

      <p style={{ marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight }}>
        ({myTrackers.length}) Record Found
      </p>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: TYPOGRAPHY.fontFamily }}>
          <thead>
            <tr style={{ backgroundColor: COLORS.tableBg }}>
              {['Tracker ↕', 'Added Date ↕', 'Modified Date ↕', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '13px', borderBottom: `1px solid ${COLORS.border}`, color: COLORS.primary }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {myTrackers.map((tracker) => (
              <tr key={tracker.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{tracker.tracker}</td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{tracker.addedDate}</td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{tracker.modifiedDate || ''}</td>
                <td style={{ padding: '12px' }}>
                  <button style={{
                    padding: '6px 16px',
                    border: `1px solid ${COLORS.border}`,
                    backgroundColor: COLORS.white,
                    color: COLORS.text,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontSize: '13px',
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

  const renderEmployeeTrackers = () => (
    <div style={{ padding: '24px', backgroundColor: COLORS.white, borderRadius: '8px', border: `1px solid ${COLORS.border}` }}>
      <h2 style={{ marginTop: 0, marginBottom: '24px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '18px', fontWeight: 600 }}>
        Employee Performance Trackers
      </h2>

      <div style={{ backgroundColor: COLORS.lightBg, padding: '24px', borderRadius: '8px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
              Employee Name
            </label>
            <input type="text" placeholder="Type for hints..." style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
              Include
            </label>
            <select style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, backgroundColor: COLORS.white, boxSizing: 'border-box' }}>
              <option>Current Employees Only</option>
              <option>Current and Past Employees</option>
              <option>Past Employees Only</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button style={{
            padding: '10px 32px',
            borderRadius: '6px',
            border: `1px solid ${COLORS.success}`,
            backgroundColor: COLORS.white,
            color: COLORS.success,
            fontFamily: TYPOGRAPHY.fontFamily,
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: 500,
          }}>
            Reset
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
            Search
          </button>
        </div>
      </div>

      <p style={{ marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight }}>
        ({employeeTrackers.length}) Record Found
      </p>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: TYPOGRAPHY.fontFamily }}>
          <thead>
            <tr style={{ backgroundColor: COLORS.tableBg }}>
              {['Employee Name ↕', 'Trackers ↕', 'Added Date ↕', 'Modified Date ↕', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '13px', borderBottom: `1px solid ${COLORS.border}`, color: COLORS.primary }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employeeTrackers.map((tracker) => (
              <tr key={tracker.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{tracker.employeeName}</td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{tracker.trackers}</td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{tracker.addedDate}</td>
                <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>{tracker.modifiedDate || ''}</td>
                <td style={{ padding: '12px' }}>
                  <button style={{
                    padding: '6px 16px',
                    border: `1px solid ${COLORS.border}`,
                    backgroundColor: COLORS.white,
                    color: COLORS.text,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontFamily: TYPOGRAPHY.fontFamily,
                    fontSize: '13px',
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

  const renderContent = () => {
    switch (activeSection) {
      case 'kpis': return renderKPIs();
      case 'trackers': return renderTrackers();
      case 'manageReviews': return renderManageReviews();
      case 'myReviews': return renderMyReviews();
      case 'employeeReviews': return renderEmployeeReviews();
      case 'myTrackers': return renderMyTrackers();
      case 'employeeTrackers': return renderEmployeeTrackers();
      default: return renderKPIs();
    }
  };

  return (
    <div style={{ padding: '24px', minHeight: '100vh', backgroundColor: COLORS.lightBg }}>
      <div style={{ marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontFamily: TYPOGRAPHY.fontFamily, fontSize: '24px', fontWeight: 600 }}>
        Performance Management
      </h1>
      
        {/* Configure Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setConfigureDropdownOpen(!configureDropdownOpen);
              setManageReviewsDropdownOpen(false);
            }}
            style={{
              padding: '10px 20px',
              borderRadius: '6px',
              border: `1px solid ${COLORS.border}`,
              backgroundColor: (activeSection === 'kpis' || activeSection === 'trackers') ? COLORS.primary : COLORS.white,
              color: (activeSection === 'kpis' || activeSection === 'trackers') ? COLORS.white : COLORS.primary,
              fontFamily: TYPOGRAPHY.fontFamily,
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            Configure ▼
          </button>
          {configureDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '4px',
              backgroundColor: COLORS.white,
              border: `1px solid ${COLORS.border}`,
              borderRadius: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              zIndex: 1000,
              minWidth: '150px',
            }}>
              <button
                onClick={() => { setActiveSection('kpis'); setConfigureDropdownOpen(false); }}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontSize: '14px',
                  color: COLORS.text,
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.lightBg}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                KPIs
              </button>
              <button
                onClick={() => { setActiveSection('trackers'); setConfigureDropdownOpen(false); }}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontSize: '14px',
                  color: COLORS.text,
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.lightBg}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Trackers
              </button>
            </div>
          )}
        </div>

        {/* Manage Reviews Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setManageReviewsDropdownOpen(!manageReviewsDropdownOpen);
              setConfigureDropdownOpen(false);
            }}
            style={{
              padding: '10px 20px',
              borderRadius: '6px',
              border: `1px solid ${COLORS.border}`,
              backgroundColor: (activeSection === 'manageReviews' || activeSection === 'myReviews' || activeSection === 'employeeReviews') ? COLORS.primary : COLORS.white,
              color: (activeSection === 'manageReviews' || activeSection === 'myReviews' || activeSection === 'employeeReviews') ? COLORS.white : COLORS.primary,
              fontFamily: TYPOGRAPHY.fontFamily,
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            Manage Reviews ▼
          </button>
          {manageReviewsDropdownOpen && (
      <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '4px',
              backgroundColor: COLORS.white,
              border: `1px solid ${COLORS.border}`,
              borderRadius: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              zIndex: 1000,
              minWidth: '180px',
            }}>
              <button
                onClick={() => { setActiveSection('manageReviews'); setManageReviewsDropdownOpen(false); }}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontSize: '14px',
                  color: COLORS.text,
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.lightBg}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Manage Reviews
              </button>
              <button
                onClick={() => { setActiveSection('myReviews'); setManageReviewsDropdownOpen(false); }}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontSize: '14px',
                  color: COLORS.text,
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.lightBg}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                My Reviews
              </button>
              <button
                onClick={() => { setActiveSection('employeeReviews'); setManageReviewsDropdownOpen(false); }}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontSize: '14px',
                  color: COLORS.text,
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.lightBg}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Employee Reviews
              </button>
            </div>
          )}
        </div>

        {/* Direct Links */}
        <button
          onClick={() => setActiveSection('myTrackers')}
          style={{
            padding: '10px 20px',
            borderRadius: '6px',
            border: `1px solid ${COLORS.border}`,
            backgroundColor: activeSection === 'myTrackers' ? COLORS.primary : COLORS.white,
            color: activeSection === 'myTrackers' ? COLORS.white : COLORS.primary,
            fontFamily: TYPOGRAPHY.fontFamily,
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          My Trackers
        </button>

        <button
          onClick={() => setActiveSection('employeeTrackers')}
          style={{
            padding: '10px 20px',
            borderRadius: '6px',
            border: `1px solid ${COLORS.border}`,
            backgroundColor: activeSection === 'employeeTrackers' ? COLORS.primary : COLORS.white,
            color: activeSection === 'employeeTrackers' ? COLORS.white : COLORS.primary,
            fontFamily: TYPOGRAPHY.fontFamily,
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          Employee Trackers
        </button>
      </div>

      {renderContent()}
    </div>
  );
};

export default Performance;
