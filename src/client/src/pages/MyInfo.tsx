/**
 * arithwise_hrms My Info Section
 * Copyright (C) 2024 Arithwise Inc.
 */

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

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
type KycStatus = 'Pending' | 'Approved' | 'Rejected' | 'Re-upload Required' | 'Under Review';
type KycDoc = {
  key: KycDocKey;
  label: string;
  fileName?: string;
  uploadedAt?: string;
  status: KycStatus;
  url?: string;
  maskedNumber?: string;
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
    aadhaar: { key: 'aadhaar', label: 'Aadhaar Card', status: 'Pending' },
    pan: { key: 'pan', label: 'PAN Card', status: 'Pending' },
    bank: { key: 'bank', label: 'Bank Statement', status: 'Pending' },
  });
  const [overallStatus, setOverallStatus] = useState<KycStatus>('Pending');
  const [submitLoading, setSubmitLoading] = useState(false);
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
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
            Employee Id
          </label>
          <input type="text" defaultValue="4322" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
            Other Id
          </label>
          <input type="text" defaultValue="4957988" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
            Driver's License Number
          </label>
          <input type="text" defaultValue="58768" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
            License Expiry Date
          </label>
          <input type="date" defaultValue="2023-18-10" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
            Nationality
          </label>
          <select style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, backgroundColor: COLORS.white, boxSizing: 'border-box' }}>
            <option>American</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
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
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
            Date of Birth
          </label>
          <input type="date" defaultValue="2023-21-10" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
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
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
            Blood Type
          </label>
          <select style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, backgroundColor: COLORS.white, boxSizing: 'border-box' }}>
            <option>A+</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
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
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
            Street 1
          </label>
          <input type="text" defaultValue="123 Test St" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
            Street 2
          </label>
          <input type="text" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
            City
          </label>
          <input type="text" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
            State/Province
          </label>
          <input type="text" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
            Zip/Postal Code
          </label>
          <input type="text" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
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
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
            Home
          </label>
          <input type="text" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
            Mobile
          </label>
          <input type="text" defaultValue="9901234567" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
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
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
            Work Email
          </label>
          <input type="email" defaultValue="test@email.com" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
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
          color: COLORS.primary,
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
                color: COLORS.primary,
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
          color: COLORS.primary,
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
          color: COLORS.primary,
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
          color: COLORS.primary,
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
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
            Joined Date
          </label>
          <input type="date" defaultValue="1990-11-10" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box', backgroundColor: COLORS.lightBg }} readOnly />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
            Job Title
          </label>
          <input type="text" defaultValue="HR Manager" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box', backgroundColor: COLORS.lightBg }} readOnly />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
            Job Specification
          </label>
          <input type="text" defaultValue="Not Defined" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box', backgroundColor: COLORS.lightBg }} readOnly />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
            Job Category
          </label>
          <input type="text" defaultValue="Officials and Managers" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box', backgroundColor: COLORS.lightBg }} readOnly />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
            Sub Unit
          </label>
          <input type="text" defaultValue="Human Resources" style={{ width: '100%', padding: '10px', border: `1px solid ${COLORS.border}`, borderRadius: '6px', fontFamily: TYPOGRAPHY.fontFamily, boxSizing: 'border-box', backgroundColor: COLORS.lightBg }} readOnly />
          </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.primary }}>
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
        (0) Record Found
      </p>

      <h3 style={{ marginTop: '32px', marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '16px', fontWeight: 600 }}>
        Education
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
        (0) Record Found
      </p>

      <h3 style={{ marginTop: '32px', marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '16px', fontWeight: 600 }}>
        Skills
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
        No Records Found
      </p>

      <h3 style={{ marginTop: '32px', marginBottom: '16px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '16px', fontWeight: 600 }}>
        Languages
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
        No Records Found
      </p>

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
          color: COLORS.primary,
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
      const data = await apiService.getEmployeeProfile(profile.id || 1);
      if (data) {
        setProfile((prev: any) => ({
          ...prev,
          ...data,
          id: data.id || prev.id || 1,
          employeeId: data.employeeId || data.employee_id || prev.employeeId || '',
          avatarUrl: data.avatarUrl || data.avatar_url || prev.avatarUrl
        }));
      }
    } catch (err) {
      // fallback to defaults
    }
  };

  const loadKyc = async () => {
    try {
      const data = await apiService.getKycStatus(profile.id || 1);
      if (data?.documents) {
        setKycDocs((prev) => {
          const updated = { ...prev };
          Object.keys(prev).forEach((key) => {
            const doc = data.documents[key];
            if (doc) {
              updated[key as KycDocKey] = {
                key: key as KycDocKey,
                label: prev[key as KycDocKey].label,
                fileName: doc.fileName || doc.file_name,
                uploadedAt: doc.uploadedAt || doc.uploaded_at,
                status: (doc.status || 'Pending') as KycStatus,
                url: doc.url || doc.file_path,
                maskedNumber: doc.maskedNumber || doc.masked_number,
              };
            }
          });
          return updated;
        });
      }
      if (data?.overallStatus) {
        setOverallStatus((data.overallStatus as KycStatus) || 'Pending');
      }
    } catch (err) {
      // ignore for now
    }
  };

  useEffect(() => {
    loadProfile();
    loadKyc();
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
      formData.append('employee_id', String(profile.id || 1));
      const resp = await apiService.updateEmployeeProfile(formData, profile.id || 1);
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
      formData.append('employee_id', String(profile.id || 1));
      await apiService.uploadKycDocument(formData, profile.id || 1);
      await loadKyc();
    } catch (err: any) {
      setErrorMsg(err.message || 'Upload failed');
    }
  };

  const allMandatoryUploaded = mandatoryKeys.every(
    (k) => kycDocs[k]?.fileName
  );
  const completed = mandatoryKeys.filter((k) => kycDocs[k]?.fileName).length;

  const canSubmit =
    allMandatoryUploaded &&
    overallStatus !== 'Under Review';

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      setErrorMsg(null);
      setSubmitLoading(true);
      await apiService.updateKycStatus('Under Review', profile.id || 1);
      setOverallStatus('Under Review');
      setKycDocs((prev) => {
        const updated = { ...prev };
        mandatoryKeys.forEach(k => {
          updated[k] = { ...updated[k], status: 'Under Review' };
        });
        return updated;
      });
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
      default:
        return { ...base, backgroundColor: COLORS.lightBg, color: COLORS.text };
    }
  };

  const maskAadhaar = (masked?: string) => {
    if (masked) return masked;
    return 'XXXX-XXXX-XXXX';
  };

  const renderKycCard = (doc: KycDoc) => {
    const disabled =
      overallStatus === 'Under Review' && doc.status !== 'Rejected';
    return (
      <div key={doc.key} style={{
        border: `1px solid ${COLORS.border}`,
        borderRadius: '10px',
        padding: '14px',
        backgroundColor: COLORS.white,
        boxShadow: '0 4px 10px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        minHeight: '190px'
      }}>
        <div style={{ fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.text, fontWeight: 600, fontSize: '15px' }}>
          {doc.label} {mandatoryKeys.includes(doc.key) ? <span style={{ color: COLORS.primary }}>*</span> : null}
        </div>
        <div style={{ fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight, fontSize: '13px' }}>
          File: {doc.fileName || 'Not uploaded'}
        </div>
        <div style={{ fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight, fontSize: '13px' }}>
          Uploaded: {doc.uploadedAt || '—'}
        </div>
        <div>
          <span style={getBadgeStyle(doc.status)}>{doc.status}</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
          <button
            disabled={disabled}
            onClick={() => {
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
              backgroundColor: disabled ? COLORS.border : COLORS.primary,
              color: COLORS.white,
              fontFamily: TYPOGRAPHY.fontFamily,
              cursor: disabled ? 'not-allowed' : 'pointer'
            }}
          >
            Upload
          </button>
          <button
            disabled={!doc.url}
            onClick={() => doc.url && window.open(doc.url, '_blank')}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: `1px solid ${COLORS.border}`,
              backgroundColor: COLORS.white,
              color: doc.url ? COLORS.text : COLORS.textLight,
              fontFamily: TYPOGRAPHY.fontFamily,
              cursor: doc.url ? 'pointer' : 'not-allowed'
            }}
          >
            View / Download
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.lightBg, padding: '24px' }}>
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
          <div style={{ fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.text, fontWeight: 600 }}>
            KYC {completed}/{mandatoryKeys.length} completed
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

        <div style={{ marginTop: '20px' }}>
          <button
            disabled={!canSubmit || submitLoading}
            onClick={handleSubmit}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: (!canSubmit || submitLoading) ? COLORS.border : COLORS.primary,
              color: COLORS.white,
              fontFamily: TYPOGRAPHY.fontFamily,
              fontWeight: 600,
              cursor: (!canSubmit || submitLoading) ? 'not-allowed' : 'pointer',
              boxShadow: '0 6px 12px rgba(120,23,107,0.25)'
            }}
          >
            {overallStatus === 'Under Review' ? 'Under Review' : submitLoading ? 'Submitting...' : 'Submit Documents'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyInfo;
