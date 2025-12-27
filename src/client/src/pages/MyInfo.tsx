/**
 * arithwise_hrms My Info Section
 * Copyright (C) 2024 Arithwise Inc.
 */

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BackToDashboard from '../components/BackToDashboard';

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

type InfoTab = 'personal' | 'contact' | 'emergency' | 'job' | 'salary' | 'reportTo' | 'qualifications';

type KycDocKey = 'aadhaar' | 'pan' | 'bank';
type KycStatus = 'Not Uploaded' | 'Uploaded' | 'Pending' | 'Approved' | 'Rejected' | 'Re-upload Required' | 'Under Review';
type KycDoc = {
  key: KycDocKey;
  label: string;
  fileName?: string | null;
  uploadedAt?: string | null;
  submittedAt?: string | null;
  status: KycStatus;
  url?: string | null;
  maskedNumber?: string | null;
  rejectionReason?: string | null;
  isCompleted?: boolean;
};

const MyInfo: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>({
    id: 1,
    name: '',
    title: '',
    employeeId: '',
    department: '',
    email: '',
    phone: '',
    doj: '',
    location: '',
    avatarUrl: '/api/employee/profile/avatar-placeholder'
  });
  const [profileUploading, setProfileUploading] = useState(false);
  const profileInputRef = useRef<HTMLInputElement | null>(null);

  const [kycDocs, setKycDocs] = useState<Record<KycDocKey, KycDoc>>({
    aadhaar: { key: 'aadhaar', label: 'Aadhaar Card', status: 'Not Uploaded' },
    pan: { key: 'pan', label: 'PAN Card', status: 'Not Uploaded' },
    bank: { key: 'bank', label: 'Banking Proof (first page of bank passbook)', status: 'Not Uploaded' },
  });
  const [overallStatus, setOverallStatus] = useState<KycStatus>('Not Uploaded');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submittingDoc, setSubmittingDoc] = useState<KycDocKey | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<InfoTab>('personal');

  const mandatoryKeys: KycDocKey[] = ['aadhaar', 'pan', 'bank'];
  const employeeId = user?.id || profile.id || 1;

  const tabs = [
    { id: 'personal' as InfoTab, label: 'Personal Details' },
    { id: 'contact' as InfoTab, label: 'Contact Details' },
    { id: 'emergency' as InfoTab, label: 'Emergency Contacts' },
    { id: 'job' as InfoTab, label: 'Job' },
    { id: 'salary' as InfoTab, label: 'Salary' },
    { id: 'reportTo' as InfoTab, label: 'Report-to' },
    { id: 'qualifications' as InfoTab, label: 'Education & Skills' },
  ];

  const renderPersonalDetails = () => (
    <div style={{ padding: '32px', backgroundColor: COLORS.white, borderRadius: '8px', border: `1px solid ${COLORS.border}` }}>
      <h2 style={{ marginTop: 0, marginBottom: '24px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '18px', fontWeight: 600 }}>
        Personal Details
      </h2>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
          Employee Full Name*
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <input type="text" placeholder="First Name" defaultValue="akash" style={{ padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily }} />
          <input type="text" placeholder="Middle Name" defaultValue="adpick" style={{ padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily }} />
          <input type="text" placeholder="Last Name" defaultValue="lala" style={{ padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.text }}>
            Employee Id
          </label>
          <input type="text" defaultValue="4322" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.text }}>
            Other Id
          </label>
          <input type="text" defaultValue="4957988" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.text }}>
            Driver's License Number
          </label>
          <input type="text" defaultValue="58768" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.text }}>
            License Expiry Date
          </label>
          <input type="date" defaultValue="2023-18-10" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.text }}>
            Nationality
          </label>
          <select style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, backgroundColor: COLORS.white, boxSizing: 'border-box' }}>
            <option>American</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.text }}>
            Marital Status
          </label>
          <select style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, backgroundColor: COLORS.white, boxSizing: 'border-box' }}>
            <option>Single</option>
            <option>Married</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.text }}>
            Date of Birth
          </label>
          <input type="date" defaultValue="2023-21-10" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.text }}>
            Gender
          </label>
          <div style={{ display: 'flex', gap: '24px', paddingTop: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="radio" name="gender" value="male" defaultChecked style={{ accentColor: COLORS.primary }} />
              <span style={{ fontFamily: TYPOGRAPHY.fontFamily }}>Male</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="radio" name="gender" value="female" />
              <span style={{ fontFamily: TYPOGRAPHY.fontFamily }}>Female</span>
            </label>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '16px', fontSize: '12px', color: COLORS.textLight, fontFamily: TYPOGRAPHY.fontFamily }}>
        * Required
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
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

      <h3 style={{ marginTop: '32px', marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '16px', fontWeight: 600 }}>
        Custom Fields
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.text }}>
            Blood Type
          </label>
          <select style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, backgroundColor: COLORS.white, boxSizing: 'border-box' }}>
            <option>A+</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.text }}>
            Test_Field
          </label>
          <input type="text" defaultValue="445" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
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

      <h3 style={{ marginTop: '32px', marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '16px', fontWeight: 600 }}>
        Attachments
        <button style={{
          marginLeft: '16px',
          padding: '6px 16px',
          border: `1px solid ${COLORS.border}`,
          backgroundColor: COLORS.white,
          color: COLORS.text,
          borderRadius: '6px',
          cursor: 'pointer',
          fontFamily: TYPOGRAPHY.fontFamily,
          fontSize: '14px',
        }}>
          + Add
        </button>
      </h3>

      <p style={{ marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight }}>
        (1) Record Found
      </p>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: TYPOGRAPHY.fontFamily }}>
          <thead>
            <tr style={{ backgroundColor: COLORS.tableBg }}>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', borderBottom: `1px solid ${COLORS.border}` }}>
                <input type="checkbox" />
              </th>
              {['File Name', 'Description', 'Size', 'Type', 'Date Added', 'Added By', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '13px', borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              <td style={{ padding: '12px' }}><input type="checkbox" /></td>
              <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>test.png</td>
              <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>test</td>
              <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>53.16 kB</td>
              <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>image/png</td>
              <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>2024-06-02</td>
              <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>Admin</td>
              <td style={{ padding: '12px' }}>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '8px' }}>✏️</button>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '8px' }}>👁️</button>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>⬇️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderContactDetails = () => (
    <div style={{ padding: '32px', backgroundColor: COLORS.white, borderRadius: '8px', border: `1px solid ${COLORS.border}` }}>
      <h2 style={{ marginTop: 0, marginBottom: '24px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '18px', fontWeight: 600 }}>
        Contact Details
      </h2>

      <h3 style={{ marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '16px', fontWeight: 600 }}>
        Address
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.text }}>
            Street 1
          </label>
          <input type="text" defaultValue="123 Test St" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.text }}>
            Street 2
          </label>
          <input type="text" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.text }}>
            City
          </label>
          <input type="text" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.text }}>
            State/Province
          </label>
          <input type="text" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.text }}>
            Zip/Postal Code
          </label>
          <input type="text" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.text }}>
            Country
          </label>
          <select style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, backgroundColor: COLORS.white, boxSizing: 'border-box' }}>
            <option>-- Select --</option>
          </select>
        </div>
      </div>

      <h3 style={{ marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '16px', fontWeight: 600, marginTop: '32px' }}>
        Telephone
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.text }}>
            Home
          </label>
          <input type="text" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.text }}>
            Mobile
          </label>
          <input type="text" defaultValue="9901234567" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.text }}>
            Work
          </label>
          <input type="text" defaultValue="112-888-7832" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
        </div>
      </div>

      <h3 style={{ marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '16px', fontWeight: 600, marginTop: '32px' }}>
        Email
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.text }}>
            Work Email
          </label>
          <input type="email" defaultValue="test@email.com" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.text }}>
            Other Email
          </label>
          <input type="email" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
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
          Save
      </button>
      </div>

      <h3 style={{ marginTop: '32px', marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '16px', fontWeight: 600 }}>
        Attachments
        <button style={{
          marginLeft: '16px',
          padding: '6px 16px',
          border: `1px solid ${COLORS.border}`,
          backgroundColor: COLORS.white,
          color: COLORS.text,
          borderRadius: '6px',
          cursor: 'pointer',
          fontFamily: TYPOGRAPHY.fontFamily,
          fontSize: '14px',
        }}>
          + Add
        </button>
      </h3>

      <p style={{ marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight }}>
        No Records Found
      </p>
    </div>
  );

  const renderEmergencyContacts = () => (
    <div style={{ padding: '32px', backgroundColor: COLORS.white, borderRadius: '8px', border: `1px solid ${COLORS.border}` }}>
      <h2 style={{ marginTop: 0, marginBottom: '24px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '18px', fontWeight: 600 }}>
        Assigned Emergency Contacts
        <button style={{
          marginLeft: '16px',
          padding: '6px 16px',
          border: `1px solid ${COLORS.border}`,
            backgroundColor: COLORS.white,
          color: COLORS.text,
          borderRadius: '6px',
          cursor: 'pointer',
          fontFamily: TYPOGRAPHY.fontFamily,
          fontSize: '14px',
        }}>
          + Add
        </button>
      </h2>

      <p style={{ marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight }}>
        No Records Found
      </p>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: TYPOGRAPHY.fontFamily }}>
          <thead>
            <tr style={{ backgroundColor: COLORS.tableBg }}>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', borderBottom: `1px solid ${COLORS.border}` }}>
                <input type="checkbox" />
              </th>
              {['Name', 'Relationship', 'Home Telephone', 'Mobile', 'Work Telephone', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '13px', borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
        </table>
      </div>

      <h3 style={{ marginTop: '32px', marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '16px', fontWeight: 600 }}>
        Attachments
        <button style={{
          marginLeft: '16px',
          padding: '6px 16px',
            border: `1px solid ${COLORS.border}`,
          backgroundColor: COLORS.white,
                color: COLORS.text,
          borderRadius: '6px',
          cursor: 'pointer',
          fontFamily: TYPOGRAPHY.fontFamily,
          fontSize: '14px',
        }}>
          + Add
        </button>
      </h3>

      <p style={{ fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight }}>
        No Records Found
      </p>
            </div>
  );

  const renderDependents = () => (
    <div style={{ padding: '32px', backgroundColor: COLORS.white, borderRadius: '8px', border: `1px solid ${COLORS.border}` }}>
      <h2 style={{ marginTop: 0, marginBottom: '24px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '18px', fontWeight: 600 }}>
        Assigned Dependents
        <button style={{
          marginLeft: '16px',
          padding: '6px 16px',
          border: `1px solid ${COLORS.border}`,
          backgroundColor: COLORS.white,
          color: COLORS.text,
          borderRadius: '6px',
          cursor: 'pointer',
                fontFamily: TYPOGRAPHY.fontFamily,
          fontSize: '14px',
        }}>
          + Add
        </button>
      </h2>

      <p style={{ marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight }}>
        No Records Found
      </p>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: TYPOGRAPHY.fontFamily }}>
          <thead>
            <tr style={{ backgroundColor: COLORS.tableBg }}>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', borderBottom: `1px solid ${COLORS.border}` }}>
                <input type="checkbox" />
              </th>
              {['Name', 'Relationship', 'Date of Birth', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '13px', borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
        </table>
            </div>

      <h3 style={{ marginTop: '32px', marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '16px', fontWeight: 600 }}>
        Attachments
        <button style={{
          marginLeft: '16px',
          padding: '6px 16px',
          border: `1px solid ${COLORS.border}`,
          backgroundColor: COLORS.white,
          color: COLORS.text,
          borderRadius: '6px',
          cursor: 'pointer',
                fontFamily: TYPOGRAPHY.fontFamily,
          fontSize: '14px',
        }}>
          + Add
        </button>
      </h3>

      <p style={{ fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight }}>
        No Records Found
      </p>
            </div>
  );

  const renderImmigration = () => (
    <div style={{ padding: '32px', backgroundColor: COLORS.white, borderRadius: '8px', border: `1px solid ${COLORS.border}` }}>
      <h2 style={{ marginTop: 0, marginBottom: '24px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '18px', fontWeight: 600 }}>
        Assigned Immigration Records
        <button style={{
          marginLeft: '16px',
          padding: '6px 16px',
          border: `1px solid ${COLORS.border}`,
          backgroundColor: COLORS.white,
          color: COLORS.text,
          borderRadius: '6px',
          cursor: 'pointer',
          fontFamily: TYPOGRAPHY.fontFamily,
          fontSize: '14px',
        }}>
          + Add
        </button>
      </h2>

      <p style={{ marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight }}>
        (1) Record Found
      </p>

      <div style={{ overflowX: 'auto', marginBottom: '32px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: TYPOGRAPHY.fontFamily }}>
          <thead>
            <tr style={{ backgroundColor: COLORS.tableBg }}>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', borderBottom: `1px solid ${COLORS.border}` }}>
                <input type="checkbox" />
              </th>
              {['Document', 'Number', 'Issued By', 'Issued Date', 'Expiry Date', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '13px', borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              <td style={{ padding: '12px' }}><input type="checkbox" /></td>
              <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>Passport</td>
              <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>34</td>
              <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>Romania</td>
              <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>2019-10-10</td>
              <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>2029-05-10</td>
              <td style={{ padding: '12px' }}>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '8px' }}>🗑️</button>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✏️</button>
              </td>
            </tr>
          </tbody>
        </table>
          </div>

      <h3 style={{ marginTop: '32px', marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '16px', fontWeight: 600 }}>
        Attachments
        <button style={{
          marginLeft: '16px',
          padding: '6px 16px',
          border: `1px solid ${COLORS.border}`,
          backgroundColor: COLORS.white,
          color: COLORS.primary,
                    borderRadius: '6px',
          cursor: 'pointer',
                    fontFamily: TYPOGRAPHY.fontFamily,
          fontSize: '14px',
        }}>
          + Add
                </button>
      </h3>

      <p style={{ marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight }}>
        (1) Record Found
      </p>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: TYPOGRAPHY.fontFamily }}>
          <thead>
            <tr style={{ backgroundColor: COLORS.tableBg }}>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', borderBottom: `1px solid ${COLORS.border}` }}>
                <input type="checkbox" />
              </th>
              {['File Name', 'Description', 'Size', 'Type', 'Date Added', 'Added By', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '13px', borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              <td style={{ padding: '12px' }}><input type="checkbox" /></td>
              <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>Immigration.txt</td>
              <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>sum is simply dummy text of the printing</td>
              <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>74.00 B</td>
              <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>text/plain</td>
              <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>2023-17-07</td>
              <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>Admin</td>
              <td style={{ padding: '12px' }}>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '8px' }}>✏️</button>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '8px' }}>👁️</button>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>⬇️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderJob = () => (
    <div style={{ padding: '32px', backgroundColor: COLORS.white, borderRadius: '8px', border: `1px solid ${COLORS.border}` }}>
      <h2 style={{ marginTop: 0, marginBottom: '24px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '18px', fontWeight: 600 }}>
        Job Details
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.text }}>
            Joined Date
          </label>
          <input type="date" defaultValue="1990-11-10" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box', backgroundColor: COLORS.lightBg }} readOnly />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.text }}>
            Job Title
          </label>
          <input type="text" defaultValue="HR Manager" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box', backgroundColor: COLORS.lightBg }} readOnly />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.text }}>
            Job Specification
          </label>
          <input type="text" defaultValue="Not Defined" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box', backgroundColor: COLORS.lightBg }} readOnly />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.text }}>
            Job Category
          </label>
          <input type="text" defaultValue="Officials and Managers" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box', backgroundColor: COLORS.lightBg }} readOnly />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.text }}>
            Sub Unit
          </label>
          <input type="text" defaultValue="Human Resources" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box', backgroundColor: COLORS.lightBg }} readOnly />
          </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.text }}>
            Location
          </label>
          <input type="text" defaultValue="Texas R&D" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box', backgroundColor: COLORS.lightBg }} readOnly />
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
          Employment Status
        </label>
        <input type="text" defaultValue="Full-Time Permanent" style={{ width: '100%', maxWidth: '400px', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box', backgroundColor: COLORS.lightBg }} readOnly />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input type="checkbox" />
          <span style={{ fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px' }}>Include Employment Contract Details</span>
        </label>
      </div>

      <h3 style={{ marginTop: '32px', marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '16px', fontWeight: 600 }}>
        Attachments
      </h3>

      <p style={{ fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight }}>
        No Records Found
      </p>
    </div>
  );

  const renderSalary = () => (
    <div style={{ padding: '32px', backgroundColor: COLORS.white, borderRadius: '8px', border: `1px solid ${COLORS.border}` }}>
      <h2 style={{ marginTop: 0, marginBottom: '24px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '18px', fontWeight: 600 }}>
        Assigned Salary Components
      </h2>

      <p style={{ marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight }}>
        No Records Found
      </p>

      <div style={{ overflowX: 'auto', marginBottom: '32px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: TYPOGRAPHY.fontFamily }}>
          <thead>
            <tr style={{ backgroundColor: COLORS.tableBg }}>
              {['Salary Component', 'Amount', 'Currency', 'Pay Frequency', 'Direct Deposit Amount'].map((h) => (
                <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '13px', borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
        </table>
      </div>

      <h3 style={{ marginTop: '32px', marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '16px', fontWeight: 600 }}>
        Attachments
      </h3>

      <p style={{ fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight }}>
        No Records Found
      </p>
    </div>
  );

  const renderReportTo = () => (
    <div style={{ padding: '32px', backgroundColor: COLORS.white, borderRadius: '8px', border: `1px solid ${COLORS.border}` }}>
      <h2 style={{ marginTop: 0, marginBottom: '24px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '18px', fontWeight: 600 }}>
        Report to
      </h2>

      <h3 style={{ marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '16px', fontWeight: 600 }}>
        Assigned Supervisors
      </h3>

      <p style={{ marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight }}>
        No Records Found
      </p>

      <div style={{ overflowX: 'auto', marginBottom: '32px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: TYPOGRAPHY.fontFamily }}>
          <thead>
            <tr style={{ backgroundColor: COLORS.tableBg }}>
              {['Name', 'Reporting Method'].map((h) => (
                <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '13px', borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
        </table>
      </div>

      <h3 style={{ marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '16px', fontWeight: 600 }}>
        Assigned Subordinates
      </h3>

      <p style={{ marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight }}>
        (1) Record Found
      </p>

      <div style={{ overflowX: 'auto', marginBottom: '32px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: TYPOGRAPHY.fontFamily }}>
          <thead>
            <tr style={{ backgroundColor: COLORS.tableBg }}>
              {['Name', 'Reporting Method'].map((h) => (
                <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '13px', borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>Sara Tencrady</td>
              <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>Direct</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 style={{ marginTop: '32px', marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '16px', fontWeight: 600 }}>
        Attachments
      </h3>

      <p style={{ fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight }}>
        No Records Found
      </p>
    </div>
  );

  const renderQualifications = () => (
    <div style={{ padding: '32px', backgroundColor: COLORS.white, borderRadius: '8px', border: `1px solid ${COLORS.border}` }}>
      <h2 style={{ marginTop: 0, marginBottom: '24px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '18px', fontWeight: 600 }}>
        Qualifications
      </h2>

      <h3 style={{ marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '16px', fontWeight: 600 }}>
        Work Experience
        <button style={{
          marginLeft: '16px',
          padding: '6px 16px',
          border: `1px solid ${COLORS.border}`,
          backgroundColor: COLORS.white,
          color: COLORS.text,
          borderRadius: '6px',
          cursor: 'pointer',
          fontFamily: TYPOGRAPHY.fontFamily,
          fontSize: '14px',
        }}>
          + Add
        </button>
      </h3>

      <p style={{ marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight }}>
        (0) Record Found
      </p>

      <h3 style={{ marginTop: '32px', marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '16px', fontWeight: 600 }}>
        Education
        <button style={{
          marginLeft: '16px',
          padding: '6px 16px',
          border: `1px solid ${COLORS.border}`,
          backgroundColor: COLORS.white,
          color: COLORS.text,
          borderRadius: '6px',
          cursor: 'pointer',
          fontFamily: TYPOGRAPHY.fontFamily,
          fontSize: '14px',
        }}>
          + Add
        </button>
      </h3>

      <p style={{ marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight }}>
        (0) Record Found
      </p>

      <h3 style={{ marginTop: '32px', marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '16px', fontWeight: 600 }}>
        Skills
        <button style={{
          marginLeft: '16px',
          padding: '6px 16px',
          border: `1px solid ${COLORS.border}`,
          backgroundColor: COLORS.white,
          color: COLORS.text,
          borderRadius: '6px',
          cursor: 'pointer',
          fontFamily: TYPOGRAPHY.fontFamily,
          fontSize: '14px',
        }}>
          + Add
        </button>
      </h3>

      <p style={{ marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight }}>
        No Records Found
      </p>

      <h3 style={{ marginTop: '32px', marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '16px', fontWeight: 600 }}>
        Languages
        <button style={{
          marginLeft: '16px',
          padding: '6px 16px',
          border: `1px solid ${COLORS.border}`,
          backgroundColor: COLORS.white,
          color: COLORS.text,
          borderRadius: '6px',
          cursor: 'pointer',
          fontFamily: TYPOGRAPHY.fontFamily,
          fontSize: '14px',
        }}>
          + Add
        </button>
      </h3>

      <p style={{ marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight }}>
        (0) Record Found
      </p>

      <div style={{ overflowX: 'auto', marginBottom: '32px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: TYPOGRAPHY.fontFamily }}>
          <thead>
            <tr style={{ backgroundColor: COLORS.tableBg }}>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', borderBottom: `1px solid ${COLORS.border}` }}>
                <input type="checkbox" />
              </th>
              {['Language', 'Fluency', 'Competency', 'Comments', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '13px', borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              <td style={{ padding: '12px' }}><input type="checkbox" /></td>
              <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>English</td>
              <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>Speaking</td>
              <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>Written Difficult</td>
              <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}></td>
              <td style={{ padding: '12px' }}>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '8px' }}>🗑️</button>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✏️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 style={{ marginTop: '32px', marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '16px', fontWeight: 600 }}>
        License
        <button style={{
          marginLeft: '16px',
          padding: '6px 16px',
          border: `1px solid ${COLORS.border}`,
          backgroundColor: COLORS.white,
          color: COLORS.text,
          borderRadius: '6px',
          cursor: 'pointer',
          fontFamily: TYPOGRAPHY.fontFamily,
          fontSize: '14px',
        }}>
          + Add
        </button>
      </h3>

      <p style={{ marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight }}>
        No Records Found
      </p>

      <h3 style={{ marginTop: '32px', marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '16px', fontWeight: 600 }}>
        Attachments
        <button style={{
          marginLeft: '16px',
          padding: '6px 16px',
          border: `1px solid ${COLORS.border}`,
            backgroundColor: COLORS.white,
          color: COLORS.text,
          borderRadius: '6px',
          cursor: 'pointer',
          fontFamily: TYPOGRAPHY.fontFamily,
          fontSize: '14px',
        }}>
          + Add
        </button>
      </h3>

      <p style={{ fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight }}>
        No Records Found
      </p>
    </div>
  );

  const renderMemberships = () => (
    <div style={{ padding: '32px', backgroundColor: COLORS.white, borderRadius: '8px', border: `1px solid ${COLORS.border}` }}>
      <h2 style={{ marginTop: 0, marginBottom: '24px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '18px', fontWeight: 600 }}>
        Assigned Memberships
        <button style={{
          marginLeft: '16px',
          padding: '6px 16px',
            border: `1px solid ${COLORS.border}`,
          backgroundColor: COLORS.white,
          color: COLORS.text,
          borderRadius: '6px',
          cursor: 'pointer',
              fontFamily: TYPOGRAPHY.fontFamily,
          fontSize: '14px',
        }}>
          + Add
        </button>
          </h2>

      <p style={{ marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight }}>
        No Records Found
      </p>

      <div style={{ overflowX: 'auto', marginBottom: '32px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: TYPOGRAPHY.fontFamily }}>
          <thead>
            <tr style={{ backgroundColor: COLORS.tableBg }}>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', borderBottom: `1px solid ${COLORS.border}` }}>
                <input type="checkbox" />
              </th>
              {['Membership', 'Subscription Paid By', 'Subscription Amount', 'Currency', 'Subscription Commence Date', 'Subscription Renewal Date', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '13px', borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
        </table>
      </div>

      <h3 style={{ marginTop: '32px', marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '16px', fontWeight: 600 }}>
        Attachments
        <button style={{
          marginLeft: '16px',
          padding: '6px 16px',
                      border: `1px solid ${COLORS.border}`,
          backgroundColor: COLORS.white,
          color: COLORS.primary,
                      borderRadius: '6px',
          cursor: 'pointer',
                      fontFamily: TYPOGRAPHY.fontFamily,
          fontSize: '14px',
        }}>
          + Add
        </button>
      </h3>

      <p style={{ marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight }}>
        (1) Record Found
      </p>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: TYPOGRAPHY.fontFamily }}>
          <thead>
            <tr style={{ backgroundColor: COLORS.tableBg }}>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', borderBottom: `1px solid ${COLORS.border}` }}>
                <input type="checkbox" />
              </th>
              {['File Name', 'Description', 'Size', 'Type', 'Date Added', 'Added By', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '13px', borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              <td style={{ padding: '12px' }}><input type="checkbox" /></td>
              <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>abc.txt</td>
              <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>pic membership</td>
              <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>9.00 B</td>
              <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>text/plain</td>
              <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>2023-17-07</td>
              <td style={{ padding: '12px', fontSize: '14px', color: COLORS.text }}>Admin</td>
              <td style={{ padding: '12px' }}>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '8px' }}>✏️</button>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '8px' }}>👁️</button>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>⬇️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
                </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'personal': return renderPersonalDetails();
      case 'contact': return renderContactDetails();
      case 'emergency': return renderEmergencyContacts();
      case 'dependents': return renderDependents();
      case 'immigration': return renderImmigration();
      case 'job': return renderJob();
      case 'salary': return renderSalary();
      case 'reportTo': return renderReportTo();
      case 'qualifications': return renderQualifications();
      case 'memberships': return renderMemberships();
      default: return renderPersonalDetails();
    }
  };

  const loadProfile = async () => {
    try {
      // Use authenticated endpoint - no employee_id needed, backend uses logged-in user
      const data = await apiService.getEmployeeProfile();
      if (data) {
        setProfile((prev: any) => ({
          ...prev,
          ...data,
          id: data.id || prev.id,
          employeeId: data.employeeId || data.employee_id || prev.employeeId || '',
          name: data.name || prev.name || '',
          email: data.email || prev.email || '',
          department: data.department || prev.department || '',
          phone: data.phone || prev.phone || '',
          doj: data.doj || prev.doj || '',
          location: data.location || prev.location || '',
          avatarUrl: data.avatarUrl || data.avatar_url || prev.avatarUrl || '/api/employee/profile/avatar-placeholder'
        }));
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      // Keep existing profile data on error
    }
  };

  const loadKyc = async () => {
    try {
      console.log('📥 Loading KYC status...');
      // Use new authenticated endpoint - no employee_id needed
      const data = await apiService.getKycStatus();
      console.log('📥 KYC data received:', data);
      
      if (data?.documents) {
        setKycDocs((prev) => {
          const updated = { ...prev };
          Object.keys(prev).forEach((key) => {
            const doc = data.documents[key];
            if (doc && doc.file_name && doc.upload_status === 'UPLOADED') {
              // Document is uploaded - determine status based on verification_status
              let frontendStatus: KycStatus = 'Uploaded';
              const verificationStatus = doc.verification_status || doc.verificationStatus;
              
              if (verificationStatus === 'APPROVED') {
                frontendStatus = 'Approved';
              } else if (verificationStatus === 'REJECTED') {
                frontendStatus = 'Rejected';
              } else if (verificationStatus === 'PENDING') {
                frontendStatus = 'Under Review';
              } else {
                // verification_status is NULL - uploaded but not submitted
                frontendStatus = 'Uploaded';
              }
              
              const submittedAt = doc.submitted_at || doc.submittedAt || null;
              updated[key as KycDocKey] = {
                key: key as KycDocKey,
                label: prev[key as KycDocKey].label,
                fileName: doc.file_name || doc.fileName || null,
                uploadedAt: doc.uploaded_at || doc.uploadedAt || null,
                submittedAt: submittedAt,
                status: frontendStatus,
                url: doc.file_url || doc.url || doc.file_path || null,
                maskedNumber: doc.masked_number || doc.maskedNumber || null,
                rejectionReason: doc.rejection_reason || doc.rejectionReason || null,
                isCompleted: submittedAt !== null && submittedAt !== undefined,
              };
            } else {
              // No document uploaded - show "Not Uploaded"
              updated[key as KycDocKey] = {
                ...prev[key as KycDocKey],
                fileName: null,
                uploadedAt: null,
                submittedAt: null,
                status: 'Not Uploaded' as KycStatus,
                url: null,
                maskedNumber: null,
                rejectionReason: null,
                isCompleted: false,
              };
            }
          });
          return updated;
        });
      }
      
      // Compute overall status from the updated documents
      const updatedDocs = { ...kycDocs };
      Object.keys(data.documents || {}).forEach((key) => {
        const doc = data.documents[key];
        if (doc && doc.file_name && doc.upload_status === 'UPLOADED') {
          const verificationStatus = doc.verification_status || doc.verificationStatus;
          let status: KycStatus = 'Uploaded';
          if (verificationStatus === 'APPROVED') {
            status = 'Approved';
          } else if (verificationStatus === 'REJECTED') {
            status = 'Rejected';
          } else if (verificationStatus === 'PENDING') {
            status = 'Under Review';
          }
          updatedDocs[key as KycDocKey] = {
            ...updatedDocs[key as KycDocKey],
            status
          };
        }
      });
      
      // Compute overall status
      const allUploaded = mandatoryKeys.every(k => updatedDocs[k]?.fileName);
      const allApproved = mandatoryKeys.every(k => updatedDocs[k]?.status === 'Approved');
      const anyRejected = mandatoryKeys.some(k => updatedDocs[k]?.status === 'Rejected');
      const anyUnderReview = mandatoryKeys.some(k => updatedDocs[k]?.status === 'Under Review');
      
      if (!allUploaded) {
        setOverallStatus('Not Uploaded');
      } else if (allApproved) {
        setOverallStatus('Approved');
      } else if (anyRejected) {
        setOverallStatus('Re-upload Required');
      } else if (anyUnderReview) {
        setOverallStatus('Under Review');
      } else {
        setOverallStatus('Uploaded');
      }
    } catch (err: any) {
      console.error('Error loading KYC:', err);
      // Reset to default state on error
      setKycDocs({
        aadhaar: { key: 'aadhaar', label: 'Aadhaar Card', status: 'Not Uploaded' },
        pan: { key: 'pan', label: 'PAN Card', status: 'Not Uploaded' },
        bank: { key: 'bank', label: 'Banking Proof (first page of bank passbook)', status: 'Not Uploaded' },
      });
      setOverallStatus('Not Uploaded');
    }
  };

  useEffect(() => {
    loadProfile();
    loadKyc();
    
    // Auto-refresh KYC status every 30 seconds to get admin updates
    // This will check the current state and refresh if needed
    const kycRefreshInterval = setInterval(() => {
      loadKyc();
    }, 30000); // Refresh every 30 seconds
    
    return () => {
      clearInterval(kycRefreshInterval);
    };
  }, []);

  const validateFile = (file: File, docKey: KycDocKey) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowed.includes(file.type)) {
      throw new Error('Only PDF, JPG, PNG are allowed');
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be under 5MB');
    }
    if (docKey === 'pan') {
      // PAN format: 5 letters + 4 digits + 1 letter
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      const name = file.name.toUpperCase();
      if (!panRegex.test(name.replace(/\.[^/.]+$/, ''))) {
        // If filename is not PAN, still allow but try to pick from user? Keep soft check
      }
    }
  };

  const handleProfileUpload = async (file: File) => {
    try {
      setProfileUploading(true);
      validateFile(file, 'aadhaar'); // size/type check
      const formData = new FormData();
      formData.append('avatar', file);
      // No need to pass employee_id - backend uses authenticated user's employee_id
      const resp = await apiService.updateEmployeeProfile(formData);
      const serverUrl = resp?.employee?.avatar_url || resp?.employee?.avatarUrl || resp?.avatarUrl;
      const objectUrl = URL.createObjectURL(file);
      setProfile((prev: any) => ({ ...prev, avatarUrl: serverUrl || objectUrl }));
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload profile picture');
    } finally {
      setProfileUploading(false);
    }
  };

  const handleKycUpload = async (docKey: KycDocKey, file: File) => {
    try {
      setErrorMsg(null);
      validateFile(file, docKey);
      const formData = new FormData();
      formData.append('documentType', docKey);
      formData.append('file', file);
      // No employee_id needed - backend uses authentication
      console.log(`📤 Uploading ${docKey} document:`, file.name);
      const response = await apiService.uploadKycDocument(formData);
      console.log('✅ Upload response:', response);
      
      // Wait a bit for database to commit, then reload
      setTimeout(async () => {
        await loadKyc();
      }, 300);
    } catch (err: any) {
      console.error('❌ Upload error:', err);
      setErrorMsg(err.message || 'Upload failed');
    }
  };

  const allMandatoryUploaded = mandatoryKeys.every(
    (k) => kycDocs[k]?.fileName
  );
  const completed = mandatoryKeys.filter((k) => kycDocs[k]?.isCompleted).length;
  const uploadedCount = mandatoryKeys.filter((k) => kycDocs[k]?.fileName).length;

  // "Send All for Approval" is enabled only when all sections are completed (submitted)
  const allSectionsCompleted = mandatoryKeys.every((k) => kycDocs[k]?.isCompleted);
  
  const canSubmit =
    allSectionsCompleted &&
    (overallStatus === 'Uploaded' || mandatoryKeys.some(k => kycDocs[k]?.status === 'Uploaded'));

  const handleSubmitDocument = async (docKey: KycDocKey) => {
    const doc = kycDocs[docKey];
    if (!doc.fileName || doc.isCompleted || doc.status === 'Under Review' || doc.status === 'Approved') {
      return;
    }
    
    try {
      setErrorMsg(null);
      setSubmittingDoc(docKey);
      await apiService.submitKycDocument(docKey);
      // Reload KYC data to get updated status from backend
      await loadKyc();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit document');
    } finally {
      setSubmittingDoc(null);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      setErrorMsg(null);
      setSubmitLoading(true);
      // Use new submit endpoint (bulk submit all completed documents)
      await apiService.submitKycForReview();
      // Reload KYC data to get updated status from backend
      await loadKyc();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit');
    } finally {
      setSubmitLoading(false);
    }
  };

  const getBadgeStyle = (status: KycStatus) => {
    const base = {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontFamily: TYPOGRAPHY.fontFamily,
      display: 'inline-block',
    } as React.CSSProperties;
    switch (status) {
      case 'Approved':
        return { ...base, backgroundColor: '#e6f4ea', color: '#1b7a3d' };
      case 'Rejected':
        return { ...base, backgroundColor: '#fdecea', color: '#c0392b' };
      case 'Re-upload Required':
        return { ...base, backgroundColor: '#fff4e5', color: '#b26a00' };
      case 'Under Review':
        return { ...base, backgroundColor: '#ede7f6', color: COLORS.primary };
      case 'Uploaded':
        return { ...base, backgroundColor: '#e3f2fd', color: '#1976d2' };
      case 'Not Uploaded':
        return { ...base, backgroundColor: COLORS.lightBg, color: COLORS.textLight };
      default:
        return { ...base, backgroundColor: COLORS.lightBg, color: COLORS.text };
    }
  };

  const maskAadhaar = (masked?: string) => {
    if (masked) return masked;
    return 'XXXX-XXXX-XXXX';
  };

  const renderKycCard = (doc: KycDoc) => {
    const isCompleted = doc.isCompleted || false;
    const isReadOnly = isCompleted && (doc.status === 'Under Review' || doc.status === 'Approved');
    const canUpload = !isReadOnly || doc.status === 'Rejected';
    const canSubmit = doc.fileName && !isCompleted && doc.status !== 'Under Review' && doc.status !== 'Approved';
    const isSubmitting = submittingDoc === doc.key;
    
    const formatDate = (dateStr: string | null | undefined) => {
      if (!dateStr) return '—';
      try {
        const date = new Date(dateStr);
        return date.toLocaleString('en-GB', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch {
        return dateStr;
      }
    };

    return (
      <div key={doc.key} style={{
        backgroundColor: COLORS.white,
        border: `2px solid ${isCompleted ? COLORS.success : COLORS.border}`,
        borderRadius: '10px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        minHeight: '240px',
        opacity: isReadOnly ? 0.85 : 1,
        boxShadow: '0 4px 10px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.text, fontWeight: 600, fontSize: '15px' }}>
            {doc.label} {mandatoryKeys.includes(doc.key) ? <span style={{ color: COLORS.primary }}>*</span> : null}
          </div>
          {isCompleted && (
            <span style={{
              fontSize: '18px',
              color: COLORS.success,
              fontWeight: 'bold'
            }}>✓</span>
          )}
        </div>
        
        <div style={{ fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight, fontSize: '13px' }}>
          <strong>Status:</strong> {isCompleted ? (
            <span style={{ color: COLORS.success, fontWeight: 600 }}>Completed</span>
          ) : (
            <span style={{ color: COLORS.textLight }}>Not Completed</span>
          )}
        </div>
        
        <div style={{ fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight, fontSize: '13px' }}>
          <strong>File:</strong> {doc.fileName || 'Not uploaded'}
        </div>
        
        {doc.uploadedAt && (
          <div style={{ fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight, fontSize: '13px' }}>
            <strong>Uploaded:</strong> {formatDate(doc.uploadedAt)}
          </div>
        )}
        
        {doc.submittedAt && (
          <div style={{ fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.success, fontSize: '13px', fontWeight: 600 }}>
            <strong>✓ Submitted:</strong> {formatDate(doc.submittedAt)}
          </div>
        )}
        
        <div>
          <span style={getBadgeStyle(doc.status)}>{doc.status}</span>
        </div>
        
        {doc.status === 'Rejected' && doc.rejectionReason && (
          <div style={{
            padding: '8px',
            backgroundColor: '#fff4e5',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#b26a00',
            fontFamily: TYPOGRAPHY.fontFamily
          }}>
            <strong>Reason:</strong> {doc.rejectionReason}
          </div>
        )}
        
        <div style={{ flex: 1 }} />
        
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
          <button
            disabled={!canUpload}
            onClick={() => {
              if (!canUpload) return;
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.pdf,.jpg,.jpeg,.png';
              input.onchange = (e: any) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleKycUpload(doc.key, file);
                }
              };
              input.click();
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: canUpload ? COLORS.primary : COLORS.border,
              color: COLORS.white,
              fontFamily: TYPOGRAPHY.fontFamily,
              cursor: canUpload ? 'pointer' : 'not-allowed',
              fontSize: '13px'
            }}
          >
            {doc.status === 'Rejected' || (doc.fileName && !isCompleted) ? 'Re-upload' : 'Upload'}
          </button>
          
          {canSubmit && (
            <button
              disabled={isSubmitting}
              onClick={() => handleSubmitDocument(doc.key)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isSubmitting ? COLORS.border : COLORS.success,
                color: COLORS.white,
                fontFamily: TYPOGRAPHY.fontFamily,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          )}
          
          {doc.url && (
            <button
              onClick={() => window.open(doc.url!, '_blank')}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: `1px solid ${COLORS.border}`,
                backgroundColor: COLORS.white,
                color: COLORS.text,
                fontFamily: TYPOGRAPHY.fontFamily,
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              View
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.lightBg, padding: '24px' }}>
      <div style={{ marginBottom: '16px' }}>
        <BackToDashboard />
      </div>
      {/* Profile Card */}
      <div style={{
        backgroundColor: COLORS.white,
        border: `1px solid ${COLORS.border}`,
        borderRadius: '10px',
        padding: '24px',
        boxShadow: '0 6px 14px rgba(0,0,0,0.05)',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{
            width: '110px',
            height: '110px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: `2px solid ${COLORS.border}`,
            flexShrink: 0,
            position: 'relative',
            cursor: profileUploading ? 'not-allowed' : 'pointer'
          }}>
            <img
              src={profile.avatarUrl}
              alt="Profile"
              style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: profileUploading ? 'not-allowed' : 'pointer' }}
              onClick={() => !profileUploading && profileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (!profileUploading && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  profileInputRef.current?.click();
                }
              }}
              role="button"
              tabIndex={0}
              title="Upload profile picture"
            />
            <input
              ref={profileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleProfileUpload(file);
              }}
            />
          </div>
          <div style={{ minWidth: '220px' }}>
            <h2 style={{ margin: '0 0 8px', fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.text, fontSize: '22px', fontWeight: 700 }}>
              {profile.name}
            </h2>
            <div style={{ fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight, fontSize: '14px' }}>
              {profile.title}
            </div>
          </div>
        </div>

        <div style={{
          marginTop: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px 24px'
        }}>
          {[
            { label: 'Employee ID', value: profile.employeeId },
            { label: 'Email', value: profile.email },
            { label: 'Department', value: profile.department },
            { label: 'Contact Number', value: profile.phone },
            { label: 'Date of Joining', value: profile.doj },
            { label: 'Location', value: profile.location },
          ].map((item) => (
            <div key={item.label} style={{
              backgroundColor: COLORS.lightBg,
              borderRadius: '8px',
              padding: '12px 14px',
              border: `1px solid ${COLORS.border}`
            }}>
              <div style={{ fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight, fontSize: '13px', marginBottom: '4px' }}>
                {item.label}
              </div>
              <div style={{ fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.text, fontWeight: 600, fontSize: '15px' }}>
                {item.value || '—'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KYC Upload */}
      <div style={{
        backgroundColor: COLORS.white,
        border: `1px solid ${COLORS.border}`,
        borderRadius: '10px',
        padding: '24px',
        boxShadow: '0 6px 14px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ margin: 0, fontFamily: TYPOGRAPHY.fontFamily, fontSize: '18px', color: COLORS.text, fontWeight: 700 }}>
              KYC Document Upload
            </h3>
            <p style={{ margin: '8px 0 0', fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight, fontSize: '14px' }}>
              Upload your KYC documents below to complete your verification.
            </p>
          </div>
          <div style={{ 
            fontFamily: TYPOGRAPHY.fontFamily, 
            color: COLORS.text, 
            fontWeight: 600,
            padding: '8px 16px',
            backgroundColor: COLORS.lightBg,
            borderRadius: '8px',
            border: `1px solid ${COLORS.border}`
          }}>
            {completed} of {mandatoryKeys.length} Sections Completed
          </div>
        </div>

        {errorMsg && (
          <div style={{
            marginTop: '12px',
            padding: '10px 12px',
            borderRadius: '8px',
            backgroundColor: '#fdecea',
            color: '#c0392b',
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '13px'
          }}>
            {errorMsg}
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginTop: '16px'
        }}>
          {mandatoryKeys.map(k => renderKycCard(kycDocs[k]))}
        </div>

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight, fontSize: '14px' }}>
            {allSectionsCompleted ? (
              <span style={{ color: COLORS.success, fontWeight: 600 }}>✓ All sections completed. Ready to send for approval.</span>
            ) : (
              <span>Complete all sections individually before sending for approval.</span>
            )}
          </div>
          <button
            disabled={!canSubmit || submitLoading || overallStatus === 'Under Review' || overallStatus === 'Approved' || overallStatus === 'Re-upload Required'}
            onClick={handleSubmit}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: (!canSubmit || submitLoading || overallStatus === 'Under Review' || overallStatus === 'Approved' || overallStatus === 'Re-upload Required') 
                ? COLORS.border 
                : COLORS.primary,
              color: COLORS.white,
              fontFamily: TYPOGRAPHY.fontFamily,
              fontWeight: 600,
              cursor: (!canSubmit || submitLoading || overallStatus === 'Under Review' || overallStatus === 'Approved' || overallStatus === 'Re-upload Required') 
                ? 'not-allowed' 
                : 'pointer',
              boxShadow: '0 6px 12px rgba(120,23,107,0.25)',
              fontSize: '14px'
            }}
          >
            {overallStatus === 'Under Review' ? 'Under Review' : 
             overallStatus === 'Approved' ? '✓ Approved' :
             overallStatus === 'Re-upload Required' ? 'Re-upload Required' :
             submitLoading ? 'Sending...' : 'Send All for Approval'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyInfo;
