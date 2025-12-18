/**
 * arithwise_hrms My Info Section
 * Copyright (C) 2024 Arithwise Inc.
 */

import React, { useState } from 'react';
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

type InfoTab = 'personal' | 'contact' | 'emergency' | 'dependents' | 'immigration' | 'job' | 'salary' | 'reportTo' | 'qualifications' | 'memberships';

const MyInfo: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<InfoTab>('personal');

  const tabs = [
    { id: 'personal' as InfoTab, label: 'Personal Details' },
    { id: 'contact' as InfoTab, label: 'Contact Details' },
    { id: 'emergency' as InfoTab, label: 'Emergency Contacts' },
    { id: 'dependents' as InfoTab, label: 'Dependents' },
    { id: 'immigration' as InfoTab, label: 'Immigration' },
    { id: 'job' as InfoTab, label: 'Job' },
    { id: 'salary' as InfoTab, label: 'Salary' },
    { id: 'reportTo' as InfoTab, label: 'Report-to' },
    { id: 'qualifications' as InfoTab, label: 'Qualifications' },
    { id: 'memberships' as InfoTab, label: 'Memberships' },
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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: COLORS.lightBg }}>
      {/* Left Sidebar with Profile and Tabs */}
      <div style={{
        width: '240px',
        backgroundColor: COLORS.white,
        borderRight: `1px solid ${COLORS.border}`,
        padding: '24px 0',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto',
      }}>
        {/* Profile Section */}
        <div style={{ textAlign: 'center', marginBottom: '32px', padding: '0 24px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            margin: '0 auto 16px',
            overflow: 'hidden',
            border: `2px solid ${COLORS.border}`,
          }}>
            <img src="/api/placeholder/80/80" alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h3 style={{ margin: '0 0 8px', fontFamily: TYPOGRAPHY.fontFamily, fontSize: '16px', fontWeight: 600 }}>
            akash lala
          </h3>
          </div>

        {/* Navigation Tabs */}
        <div>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                width: '100%',
                padding: '12px 24px',
                border: 'none',
                backgroundColor: activeTab === tab.id ? COLORS.lightBg : 'transparent',
                color: activeTab === tab.id ? COLORS.primary : COLORS.text,
                textAlign: 'left',
                cursor: 'pointer',
                fontFamily: TYPOGRAPHY.fontFamily,
                fontSize: '14px',
                borderLeft: activeTab === tab.id ? `3px solid ${COLORS.primary}` : '3px solid transparent',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.backgroundColor = COLORS.lightBg;
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ marginLeft: '240px', flex: 1, padding: '24px' }}>
        {renderContent()}
      </div>
    </div>
  );
};

export default MyInfo;
