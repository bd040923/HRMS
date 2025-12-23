/**
 * Arithwise HRM Recruitment Module
 * Copyright (C) 2024 Arithwise Inc.
 */

import React, { useState, useEffect } from 'react';
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
  accent: '#78176b', // Using primary purple instead of green
};

const TYPOGRAPHY = {
  fontFamily: "'Segoe UI', Arial, sans-serif",
  heading: { fontSize: '2rem', fontWeight: 500 },
  textImportant: { fontSize: '16px' },
  textNote: { fontSize: '14px' },
};

interface JobTitle {
  id: number;
  title: string;
  description?: string;
  status: string;
}

interface Vacancy {
  id: number;
  vacancy: string;
  job_title: string;
  job_title_id: number;
  hiring_manager?: string;
  hiring_manager_id?: number;
  status: string;
}

interface Candidate {
  id: number;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email?: string;
  contact_number?: string;
  keywords?: string;
  date_of_application: string;
  status: string;
  method_of_application: string;
  vacancy?: string;
  hiring_manager?: string;
}

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
}

const Recruitment: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'candidates' | 'vacancies'>('candidates');
  
  // Data states
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states - Candidates
  const [candidateFilters, setCandidateFilters] = useState({
    jobTitle: '',
    vacancy: '',
    hiringManager: '',
    status: '',
    candidateName: '',
    keywords: '',
    dateFrom: '',
    dateTo: '',
    methodOfApplication: '',
  });
  
  // Filter states - Vacancies
  const [vacancyFilters, setVacancyFilters] = useState({
    jobTitle: '',
    vacancy: '',
    hiringManager: '',
    status: '',
  });
  
  // Modal states
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [showVacancyModal, setShowVacancyModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [editingVacancy, setEditingVacancy] = useState<Vacancy | null>(null);
  
  // Form states
  const [candidateForm, setCandidateForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    keywords: '',
    dateOfApplication: new Date().toISOString().split('T')[0],
    status: 'Application Initiated',
    methodOfApplication: 'Manual',
    vacancyIds: [] as number[],
  });
  
  const [vacancyForm, setVacancyForm] = useState({
    name: '',
    jobTitleId: '',
    hiringManagerId: '',
    description: '',
    numberOfPositions: 1,
    status: 'active',
    publishedDate: new Date().toISOString().split('T')[0],
    closingDate: '',
  });

  // Load initial data
  useEffect(() => {
    loadJobTitles();
    loadEmployees();
    if (activeTab === 'candidates') {
      loadCandidates();
    } else {
      loadVacancies();
    }
  }, [activeTab]);

  const loadJobTitles = async () => {
    try {
      const data = await apiService.getJobTitles();
      setJobTitles(data.filter((jt: JobTitle) => jt.status === 'active'));
    } catch (err: any) {
      setError(err.message || 'Failed to load job titles');
    }
  };

  const loadEmployees = async () => {
    try {
      const data = await apiService.getEmployees();
      setEmployees(data);
    } catch (err: any) {
      console.error('Failed to load employees:', err);
    }
  };

  const loadCandidates = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: any = {};
      if (candidateFilters.jobTitle) filters.jobTitle = candidateFilters.jobTitle;
      if (candidateFilters.vacancy) filters.vacancy = candidateFilters.vacancy;
      if (candidateFilters.hiringManager) filters.hiringManager = candidateFilters.hiringManager;
      if (candidateFilters.status) filters.status = candidateFilters.status;
      if (candidateFilters.candidateName) filters.candidateName = candidateFilters.candidateName;
      if (candidateFilters.keywords) filters.keywords = candidateFilters.keywords;
      if (candidateFilters.dateFrom) filters.dateFrom = candidateFilters.dateFrom;
      if (candidateFilters.dateTo) filters.dateTo = candidateFilters.dateTo;
      if (candidateFilters.methodOfApplication) filters.methodOfApplication = candidateFilters.methodOfApplication;
      
      const data = await apiService.getCandidates(filters);
      setCandidates(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const loadVacancies = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: any = {};
      if (vacancyFilters.jobTitle) filters.jobTitle = vacancyFilters.jobTitle;
      if (vacancyFilters.vacancy) filters.vacancy = vacancyFilters.vacancy;
      if (vacancyFilters.hiringManager) filters.hiringManager = vacancyFilters.hiringManager;
      if (vacancyFilters.status) filters.status = vacancyFilters.status;
      
      const data = await apiService.getVacancies(filters);
      setVacancies(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load vacancies');
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateSearch = () => {
    loadCandidates();
  };

  const handleCandidateReset = () => {
    setCandidateFilters({
      jobTitle: '',
      vacancy: '',
      hiringManager: '',
      status: '',
      candidateName: '',
      keywords: '',
      dateFrom: '',
      dateTo: '',
      methodOfApplication: '',
    });
    setTimeout(() => loadCandidates(), 100);
  };

  const handleVacancySearch = () => {
    loadVacancies();
  };

  const handleVacancyReset = () => {
    setVacancyFilters({
      jobTitle: '',
      vacancy: '',
      hiringManager: '',
      status: '',
    });
    setTimeout(() => loadVacancies(), 100);
  };

  const handleAddCandidate = () => {
    setEditingCandidate(null);
    setCandidateForm({
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      contactNumber: '',
      keywords: '',
      dateOfApplication: new Date().toISOString().split('T')[0],
      status: 'Application Initiated',
      methodOfApplication: 'Manual',
      vacancyIds: [],
    });
    setShowCandidateModal(true);
  };

  const handleEditCandidate = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setCandidateForm({
      firstName: candidate.first_name,
      middleName: candidate.middle_name || '',
      lastName: candidate.last_name,
      email: candidate.email || '',
      contactNumber: candidate.contact_number || '',
      keywords: candidate.keywords || '',
      dateOfApplication: candidate.date_of_application,
      status: candidate.status,
      methodOfApplication: candidate.method_of_application,
      vacancyIds: [],
    });
    setShowCandidateModal(true);
  };

  const handleSaveCandidate = async () => {
    try {
      if (editingCandidate) {
        await apiService.updateCandidate(editingCandidate.id, {
          firstName: candidateForm.firstName,
          middleName: candidateForm.middleName,
          lastName: candidateForm.lastName,
          email: candidateForm.email,
          contactNumber: candidateForm.contactNumber,
          keywords: candidateForm.keywords,
          dateOfApplication: candidateForm.dateOfApplication,
          status: candidateForm.status,
          methodOfApplication: candidateForm.methodOfApplication,
        });
      } else {
        await apiService.createCandidate({
          firstName: candidateForm.firstName,
          middleName: candidateForm.middleName,
          lastName: candidateForm.lastName,
          email: candidateForm.email,
          contactNumber: candidateForm.contactNumber,
          keywords: candidateForm.keywords,
          dateOfApplication: candidateForm.dateOfApplication,
          status: candidateForm.status,
          methodOfApplication: candidateForm.methodOfApplication,
          vacancyIds: candidateForm.vacancyIds,
        });
      }
      setShowCandidateModal(false);
      loadCandidates();
    } catch (err: any) {
      setError(err.message || 'Failed to save candidate');
    }
  };

  const handleDeleteCandidate = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      try {
        await apiService.deleteCandidate(id);
        loadCandidates();
      } catch (err: any) {
        setError(err.message || 'Failed to delete candidate');
      }
    }
  };

  const handleAddVacancy = () => {
    setEditingVacancy(null);
    setVacancyForm({
      name: '',
      jobTitleId: '',
      hiringManagerId: '',
      description: '',
      numberOfPositions: 1,
      status: 'active',
      publishedDate: new Date().toISOString().split('T')[0],
      closingDate: '',
    });
    setShowVacancyModal(true);
  };

  const handleEditVacancy = (vacancy: Vacancy) => {
    setEditingVacancy(vacancy);
    setVacancyForm({
      name: vacancy.vacancy,
      jobTitleId: vacancy.job_title_id.toString(),
      hiringManagerId: vacancy.hiring_manager_id?.toString() || '',
      description: '',
      numberOfPositions: 1,
      status: vacancy.status,
      publishedDate: new Date().toISOString().split('T')[0],
      closingDate: '',
    });
    setShowVacancyModal(true);
  };

  const handleSaveVacancy = async () => {
    try {
      if (editingVacancy) {
        await apiService.updateVacancy(editingVacancy.id, {
          name: vacancyForm.name,
          jobTitleId: parseInt(vacancyForm.jobTitleId),
          hiringManagerId: vacancyForm.hiringManagerId ? parseInt(vacancyForm.hiringManagerId) : undefined,
          description: vacancyForm.description,
          numberOfPositions: vacancyForm.numberOfPositions,
          status: vacancyForm.status,
          publishedDate: vacancyForm.publishedDate,
          closingDate: vacancyForm.closingDate || undefined,
        });
      } else {
        await apiService.createVacancy({
          name: vacancyForm.name,
          jobTitleId: parseInt(vacancyForm.jobTitleId),
          hiringManagerId: vacancyForm.hiringManagerId ? parseInt(vacancyForm.hiringManagerId) : undefined,
          description: vacancyForm.description,
          numberOfPositions: vacancyForm.numberOfPositions,
          status: vacancyForm.status,
          publishedDate: vacancyForm.publishedDate,
          closingDate: vacancyForm.closingDate || undefined,
        });
      }
      setShowVacancyModal(false);
      loadVacancies();
    } catch (err: any) {
      setError(err.message || 'Failed to save vacancy');
    }
  };

  const handleDeleteVacancy = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this vacancy?')) {
      try {
        await apiService.deleteVacancy(id);
        loadVacancies();
      } catch (err: any) {
        setError(err.message || 'Failed to delete vacancy');
      }
    }
  };

  const getCandidateFullName = (candidate: Candidate) => {
    return `${candidate.first_name} ${candidate.middle_name ? candidate.middle_name + ' ' : ''}${candidate.last_name}`;
  };

  const renderCandidates = () => (
    <>
      {error && (
        <div style={{
          backgroundColor: '#fee',
          color: '#c33',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '16px',
          fontFamily: TYPOGRAPHY.fontFamily,
        }}>
          {error}
        </div>
      )}
      
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
            <label style={{ fontSize: TYPOGRAPHY.textNote.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, color: COLORS.text }}>
              Job Title
            </label>
            <select
              value={candidateFilters.jobTitle}
              onChange={(e) => setCandidateFilters({ ...candidateFilters, jobTitle: e.target.value })}
              style={{ padding: '10px 14px', borderRadius: '8px', border: `1px solid ${COLORS.border}`, fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, backgroundColor: COLORS.white }}
            >
              <option value="">-- Select --</option>
              {jobTitles.map((jt) => (
                <option key={jt.id} value={jt.title}>{jt.title}</option>
              ))}
            </select>
          </div>

          {/* Vacancy */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: TYPOGRAPHY.textNote.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, color: COLORS.text }}>
              Vacancy
            </label>
            <input
              type="text"
              value={candidateFilters.vacancy}
              onChange={(e) => setCandidateFilters({ ...candidateFilters, vacancy: e.target.value })}
              placeholder="Type for hints..."
              style={{ padding: '10px 14px', borderRadius: '8px', border: `1px solid ${COLORS.border}`, fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }}
            />
          </div>

          {/* Hiring Manager */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: TYPOGRAPHY.textNote.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, color: COLORS.text }}>
              Hiring Manager
            </label>
            <input
              type="text"
              value={candidateFilters.hiringManager}
              onChange={(e) => setCandidateFilters({ ...candidateFilters, hiringManager: e.target.value })}
              placeholder="Type for hints..."
              style={{ padding: '10px 14px', borderRadius: '8px', border: `1px solid ${COLORS.border}`, fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }}
            />
          </div>

          {/* Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: TYPOGRAPHY.textNote.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, color: COLORS.text }}>
              Status
            </label>
            <select
              value={candidateFilters.status}
              onChange={(e) => setCandidateFilters({ ...candidateFilters, status: e.target.value })}
              style={{ padding: '10px 14px', borderRadius: '8px', border: `1px solid ${COLORS.border}`, fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, backgroundColor: COLORS.white }}
            >
              <option value="">-- Select --</option>
              <option value="Application Initiated">Application Initiated</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Candidate Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gridColumn: 'span 2', gap: '6px' }}>
            <label style={{ fontSize: TYPOGRAPHY.textNote.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, color: COLORS.text }}>
              Candidate Name
            </label>
            <input
              type="text"
              value={candidateFilters.candidateName}
              onChange={(e) => setCandidateFilters({ ...candidateFilters, candidateName: e.target.value })}
              placeholder="Type for hints..."
              style={{ padding: '10px 14px', borderRadius: '8px', border: `1px solid ${COLORS.border}`, fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }}
            />
          </div>

          {/* Keywords */}
          <div style={{ display: 'flex', flexDirection: 'column', gridColumn: 'span 2', gap: '6px' }}>
            <label style={{ fontSize: TYPOGRAPHY.textNote.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, color: COLORS.text }}>
              Keywords
            </label>
            <input
              type="text"
              value={candidateFilters.keywords}
              onChange={(e) => setCandidateFilters({ ...candidateFilters, keywords: e.target.value })}
              placeholder="Enter comma separated words..."
              style={{ padding: '10px 14px', borderRadius: '8px', border: `1px solid ${COLORS.border}`, fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }}
            />
          </div>

          {/* Date of Application */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: TYPOGRAPHY.textNote.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, color: COLORS.text }}>
              Date of Application (From)
            </label>
            <input
              type="date"
              value={candidateFilters.dateFrom}
              onChange={(e) => setCandidateFilters({ ...candidateFilters, dateFrom: e.target.value })}
              style={{ padding: '10px 14px', borderRadius: '8px', border: `1px solid ${COLORS.border}`, fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: TYPOGRAPHY.textNote.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, color: COLORS.text }}>
              Date of Application (To)
            </label>
            <input
              type="date"
              value={candidateFilters.dateTo}
              onChange={(e) => setCandidateFilters({ ...candidateFilters, dateTo: e.target.value })}
              style={{ padding: '10px 14px', borderRadius: '8px', border: `1px solid ${COLORS.border}`, fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }}
            />
          </div>

          {/* Method of Application */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: TYPOGRAPHY.textNote.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, color: COLORS.text }}>
              Method of Application
            </label>
            <select
              value={candidateFilters.methodOfApplication}
              onChange={(e) => setCandidateFilters({ ...candidateFilters, methodOfApplication: e.target.value })}
              style={{ padding: '10px 14px', borderRadius: '8px', border: `1px solid ${COLORS.border}`, fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, backgroundColor: COLORS.white }}
            >
              <option value="">-- Select --</option>
              <option value="Manual">Manual</option>
              <option value="Online">Online</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button onClick={handleCandidateReset} style={{ padding: '10px 24px', borderRadius: '24px', border: `1px solid ${COLORS.accent}`, backgroundColor: COLORS.white, color: COLORS.accent, fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, cursor: 'pointer' }}>
            Reset
          </button>
          <button onClick={handleCandidateSearch} style={{ padding: '10px 24px', borderRadius: '24px', border: 'none', backgroundColor: COLORS.accent, color: COLORS.white, fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, cursor: 'pointer' }}>
            Search
          </button>
        </div>
      </div>

      {/* Results table */}
      <div style={{ backgroundColor: COLORS.white, borderRadius: '12px', border: `1px solid ${COLORS.border}`, padding: '20px 24px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <button onClick={handleAddCandidate} style={{ padding: '10px 22px', borderRadius: '24px', border: 'none', backgroundColor: COLORS.accent, color: COLORS.white, fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, cursor: 'pointer' }}>
            + Add
          </button>
          <div style={{ fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, color: COLORS.textLight }}>
            ({candidates.length}) Records Found
          </div>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight }}>
            Loading...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: TYPOGRAPHY.fontFamily }}>
              <thead>
                <tr style={{ backgroundColor: COLORS.lightBg, borderBottom: `2px solid ${COLORS.border}` }}>
                  {['Vacancy', 'Candidate', 'Hiring Manager', 'Date of Application', 'Status', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: TYPOGRAPHY.textImportant.fontSize, color: COLORS.text }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {candidates.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: COLORS.textLight }}>
                      No candidates found
                    </td>
                  </tr>
                ) : (
                  candidates.map((candidate) => (
                    <tr key={candidate.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                      <td style={{ padding: '10px 14px' }}>{candidate.vacancy || 'N/A'}</td>
                      <td style={{ padding: '10px 14px' }}>{getCandidateFullName(candidate)}</td>
                      <td style={{ padding: '10px 14px' }}>{candidate.hiring_manager || 'N/A'}</td>
                      <td style={{ padding: '10px 14px' }}>{candidate.date_of_application}</td>
                      <td style={{ padding: '10px 14px' }}>{candidate.status}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <button onClick={() => handleEditCandidate(candidate)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', marginRight: '8px', color: COLORS.primary }} title="Edit">
                          ✏️
                        </button>
                        <button onClick={() => handleDeleteCandidate(candidate.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', color: COLORS.textLight }} title="Delete">
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Candidate Modal */}
      {showCandidateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowCandidateModal(false)}>
          <div style={{ backgroundColor: COLORS.white, padding: '32px', borderRadius: '8px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ color: COLORS.primary, fontSize: '20px', fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, marginTop: 0, marginBottom: '24px' }}>
              {editingCandidate ? 'Edit Candidate' : 'Add Candidate'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, color: COLORS.text }}>First Name *</label>
                  <input type="text" value={candidateForm.firstName} onChange={(e) => setCandidateForm({ ...candidateForm, firstName: e.target.value })} required style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, color: COLORS.text }}>Middle Name</label>
                  <input type="text" value={candidateForm.middleName} onChange={(e) => setCandidateForm({ ...candidateForm, middleName: e.target.value })} style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, color: COLORS.text }}>Last Name *</label>
                  <input type="text" value={candidateForm.lastName} onChange={(e) => setCandidateForm({ ...candidateForm, lastName: e.target.value })} required style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, color: COLORS.text }}>Email</label>
                  <input type="email" value={candidateForm.email} onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })} style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, color: COLORS.text }}>Contact Number</label>
                  <input type="text" value={candidateForm.contactNumber} onChange={(e) => setCandidateForm({ ...candidateForm, contactNumber: e.target.value })} style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, color: COLORS.text }}>Keywords</label>
                <input type="text" value={candidateForm.keywords} onChange={(e) => setCandidateForm({ ...candidateForm, keywords: e.target.value })} placeholder="Comma separated words" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, color: COLORS.text }}>Date of Application</label>
                  <input type="date" value={candidateForm.dateOfApplication} onChange={(e) => setCandidateForm({ ...candidateForm, dateOfApplication: e.target.value })} style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, color: COLORS.text }}>Status</label>
                  <select value={candidateForm.status} onChange={(e) => setCandidateForm({ ...candidateForm, status: e.target.value })} style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }}>
                    <option value="Application Initiated">Application Initiated</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Interview Scheduled">Interview Scheduled</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, color: COLORS.text }}>Method of Application</label>
                  <select value={candidateForm.methodOfApplication} onChange={(e) => setCandidateForm({ ...candidateForm, methodOfApplication: e.target.value })} style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }}>
                    <option value="Manual">Manual</option>
                    <option value="Online">Online</option>
                  </select>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button onClick={() => setShowCandidateModal(false)} style={{ padding: '10px 20px', backgroundColor: COLORS.textLight, color: COLORS.white, border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500 }}>
                Cancel
              </button>
              <button onClick={handleSaveCandidate} disabled={!candidateForm.firstName || !candidateForm.lastName} style={{ padding: '10px 20px', backgroundColor: (!candidateForm.firstName || !candidateForm.lastName) ? '#999' : COLORS.primary, color: COLORS.white, border: 'none', borderRadius: '6px', cursor: (!candidateForm.firstName || !candidateForm.lastName) ? 'not-allowed' : 'pointer', fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500 }}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  const renderVacancies = () => (
    <>
      {error && (
        <div style={{ backgroundColor: '#fee', color: '#c33', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily }}>
          {error}
        </div>
      )}
      
      {/* Filters */}
      <div style={{ backgroundColor: COLORS.white, borderRadius: '12px', border: `1px solid ${COLORS.border}`, padding: '24px', marginBottom: '24px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
        <h3 style={{ margin: '0 0 16px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, fontWeight: 600, color: COLORS.text }}>
          Vacancies
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: TYPOGRAPHY.textNote.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, color: COLORS.text }}>Job Title</label>
            <select value={vacancyFilters.jobTitle} onChange={(e) => setVacancyFilters({ ...vacancyFilters, jobTitle: e.target.value })} style={{ padding: '10px 14px', borderRadius: '8px', border: `1px solid ${COLORS.border}`, fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, backgroundColor: COLORS.white }}>
              <option value="">-- Select --</option>
              {jobTitles.map((jt) => (
                <option key={jt.id} value={jt.title}>{jt.title}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: TYPOGRAPHY.textNote.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, color: COLORS.text }}>Vacancy</label>
            <input type="text" value={vacancyFilters.vacancy} onChange={(e) => setVacancyFilters({ ...vacancyFilters, vacancy: e.target.value })} placeholder="Type for hints..." style={{ padding: '10px 14px', borderRadius: '8px', border: `1px solid ${COLORS.border}`, fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: TYPOGRAPHY.textNote.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, color: COLORS.text }}>Hiring Manager</label>
            <input type="text" value={vacancyFilters.hiringManager} onChange={(e) => setVacancyFilters({ ...vacancyFilters, hiringManager: e.target.value })} placeholder="Type for hints..." style={{ padding: '10px 14px', borderRadius: '8px', border: `1px solid ${COLORS.border}`, fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: TYPOGRAPHY.textNote.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, color: COLORS.text }}>Status</label>
            <select value={vacancyFilters.status} onChange={(e) => setVacancyFilters({ ...vacancyFilters, status: e.target.value })} style={{ padding: '10px 14px', borderRadius: '8px', border: `1px solid ${COLORS.border}`, fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, backgroundColor: COLORS.white }}>
              <option value="">-- Select --</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button onClick={handleVacancyReset} style={{ padding: '10px 24px', borderRadius: '24px', border: `1px solid ${COLORS.accent}`, backgroundColor: COLORS.white, color: COLORS.accent, fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, cursor: 'pointer' }}>
            Reset
          </button>
          <button onClick={handleVacancySearch} style={{ padding: '10px 24px', borderRadius: '24px', border: 'none', backgroundColor: COLORS.accent, color: COLORS.white, fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, cursor: 'pointer' }}>
            Search
          </button>
        </div>
      </div>

      {/* Vacancy table */}
      <div style={{ backgroundColor: COLORS.white, borderRadius: '12px', border: `1px solid ${COLORS.border}`, padding: '20px 24px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <button onClick={handleAddVacancy} style={{ padding: '10px 22px', borderRadius: '24px', border: 'none', backgroundColor: COLORS.accent, color: COLORS.white, fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, cursor: 'pointer' }}>
            + Add
          </button>
          <div style={{ fontFamily: TYPOGRAPHY.fontFamily, fontSize: TYPOGRAPHY.textImportant.fontSize, color: COLORS.textLight }}>
            ({vacancies.length}) Records Found
          </div>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight }}>
            Loading...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: TYPOGRAPHY.fontFamily }}>
              <thead>
                <tr style={{ backgroundColor: COLORS.lightBg, borderBottom: `2px solid ${COLORS.border}` }}>
                  {['Vacancy', 'Job Title', 'Hiring Manager', 'Status', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: TYPOGRAPHY.textImportant.fontSize, color: COLORS.text }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vacancies.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: COLORS.textLight }}>
                      No vacancies found
                    </td>
                  </tr>
                ) : (
                  vacancies.map((vacancy) => (
                    <tr key={vacancy.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                      <td style={{ padding: '10px 14px' }}>{vacancy.vacancy}</td>
                      <td style={{ padding: '10px 14px' }}>{vacancy.job_title}</td>
                      <td style={{ padding: '10px 14px' }}>{vacancy.hiring_manager || '(Deleted)'}</td>
                      <td style={{ padding: '10px 14px' }}>{vacancy.status.charAt(0).toUpperCase() + vacancy.status.slice(1)}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <button onClick={() => handleEditVacancy(vacancy)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', marginRight: '8px', color: COLORS.primary }} title="Edit">
                          ✏️
                        </button>
                        <button onClick={() => handleDeleteVacancy(vacancy.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', color: COLORS.textLight }} title="Delete">
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Vacancy Modal */}
      {showVacancyModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowVacancyModal(false)}>
          <div style={{ backgroundColor: COLORS.white, padding: '32px', borderRadius: '8px', width: '90%', maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ color: COLORS.primary, fontSize: '20px', fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, marginTop: 0, marginBottom: '24px' }}>
              {editingVacancy ? 'Edit Vacancy' : 'Add Vacancy'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, color: COLORS.text }}>Vacancy Name *</label>
                <input type="text" value={vacancyForm.name} onChange={(e) => setVacancyForm({ ...vacancyForm, name: e.target.value })} required style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, color: COLORS.text }}>Job Title *</label>
                <select value={vacancyForm.jobTitleId} onChange={(e) => setVacancyForm({ ...vacancyForm, jobTitleId: e.target.value })} required style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }}>
                  <option value="">-- Select --</option>
                  {jobTitles.map((jt) => (
                    <option key={jt.id} value={jt.id}>{jt.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, color: COLORS.text }}>Hiring Manager</label>
                <select value={vacancyForm.hiringManagerId} onChange={(e) => setVacancyForm({ ...vacancyForm, hiringManagerId: e.target.value })} style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }}>
                  <option value="">-- Select --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, color: COLORS.text }}>Status</label>
                  <select value={vacancyForm.status} onChange={(e) => setVacancyForm({ ...vacancyForm, status: e.target.value })} style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }}>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500, color: COLORS.text }}>Number of Positions</label>
                  <input type="number" value={vacancyForm.numberOfPositions} onChange={(e) => setVacancyForm({ ...vacancyForm, numberOfPositions: parseInt(e.target.value) })} min="1" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button onClick={() => setShowVacancyModal(false)} style={{ padding: '10px 20px', backgroundColor: COLORS.textLight, color: COLORS.white, border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500 }}>
                Cancel
              </button>
              <button onClick={handleSaveVacancy} disabled={!vacancyForm.name || !vacancyForm.jobTitleId} style={{ padding: '10px 20px', backgroundColor: (!vacancyForm.name || !vacancyForm.jobTitleId) ? '#999' : COLORS.primary, color: COLORS.white, border: 'none', borderRadius: '6px', cursor: (!vacancyForm.name || !vacancyForm.jobTitleId) ? 'not-allowed' : 'pointer', fontSize: TYPOGRAPHY.textImportant.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 500 }}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div style={{ padding: '24px 32px', maxWidth: '100%', margin: '0', backgroundColor: COLORS.lightBg, minHeight: 'calc(100vh - 80px)' }}>
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

      <h1 style={{ color: COLORS.primary, marginBottom: '16px', marginTop: 0, fontSize: TYPOGRAPHY.heading.fontSize, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: TYPOGRAPHY.heading.fontWeight }}>
        Onboarding
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
