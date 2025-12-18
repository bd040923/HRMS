/**
 * arithwise_hrms Email Configuration Page
 * Copyright (C) 2024 Arithwise Inc.
 */

import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import ProtectedRoute from '../../components/ProtectedRoute';

const COLORS = {
  primary: '#78176b',
  success: '#28a745',
  white: '#ffffff',
  text: '#333333',
  textLight: '#666666',
  border: '#e0e0e0',
  lightBg: '#faf3ff',
};

const TYPOGRAPHY = {
  fontFamily: "'Segoe UI', Arial, sans-serif",
};

const EmailConfiguration: React.FC = () => {
  const [mailSentAs, setMailSentAs] = useState('admin@mail.com');
  const [sendingMethod, setSendingMethod] = useState('sendmail');
  const [pathToSendmail, setPathToSendmail] = useState('/usr/sbin/sendmail -bs');
  const [sendTestMail, setSendTestMail] = useState(false);

  const handleReset = () => {
    setMailSentAs('admin@mail.com');
    setSendingMethod('sendmail');
    setPathToSendmail('/usr/sbin/sendmail -bs');
    setSendTestMail(false);
  };

  const handleSave = () => {
    alert('Email configuration saved successfully!');
  };

  return (
    <ProtectedRoute requiredPermission="manage_users">
      <AdminLayout title="Configuration" breadcrumbs={['Admin', 'Configuration', 'Email Configuration']}>
        <div style={{
          backgroundColor: COLORS.white,
          padding: '32px',
          borderRadius: '8px',
          border: `1px solid ${COLORS.border}`,
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{
            marginTop: 0,
            marginBottom: '24px',
            color: COLORS.text,
            fontFamily: TYPOGRAPHY.fontFamily,
            fontSize: '18px',
          }}>
            Email Configuration
          </h2>

          {/* Mail Sent As and Sending Method */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            marginBottom: '24px'
          }}>
            {/* Mail Sent As */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontFamily: TYPOGRAPHY.fontFamily,
                color: COLORS.text,
                fontSize: '14px',
              }}>
                Mail Sent As*
              </label>
              <input
                type="email"
                value={mailSentAs}
                onChange={(e) => setMailSentAs(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '6px',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Sending Method */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontFamily: TYPOGRAPHY.fontFamily,
                color: COLORS.text,
                fontSize: '14px',
              }}>
                Sending Method
              </label>
              <div style={{ display: 'flex', gap: '24px', paddingTop: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="sendingMethod"
                    value="secure_smtp"
                    checked={sendingMethod === 'secure_smtp'}
                    onChange={(e) => setSendingMethod(e.target.value)}
                  />
                  <span style={{ fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px' }}>SECURE SMTP</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="sendingMethod"
                    value="smtp"
                    checked={sendingMethod === 'smtp'}
                    onChange={(e) => setSendingMethod(e.target.value)}
                  />
                  <span style={{ fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px' }}>SMTP</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="sendingMethod"
                    value="sendmail"
                    checked={sendingMethod === 'sendmail'}
                    onChange={(e) => setSendingMethod(e.target.value)}
                  />
                  <span style={{ fontFamily: TYPOGRAPHY.fontFamily, fontSize: '14px', color: COLORS.success, fontWeight: 500 }}>
                    Sendmail
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Path to Sendmail */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontFamily: TYPOGRAPHY.fontFamily,
              color: COLORS.text,
              fontSize: '14px',
            }}>
              Path to Sendmail
            </label>
            <input
              type="text"
              value={pathToSendmail}
              onChange={(e) => setPathToSendmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: `1px solid ${COLORS.border}`,
                borderRadius: '6px',
                fontFamily: TYPOGRAPHY.fontFamily,
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Send Test Mail */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontFamily: TYPOGRAPHY.fontFamily,
              color: COLORS.text,
              fontSize: '14px',
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={sendTestMail}
                onChange={(e) => setSendTestMail(e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                }}
              />
              Send Test Mail
            </label>
          </div>

          {/* Required Note */}
          <div style={{
            marginBottom: '24px',
            color: COLORS.textLight,
            fontSize: '12px',
            fontFamily: TYPOGRAPHY.fontFamily,
          }}>
            * Required
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              onClick={handleReset}
              style={{
                padding: '10px 24px',
                backgroundColor: 'transparent',
                color: COLORS.text,
                border: `1px solid ${COLORS.border}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: TYPOGRAPHY.fontFamily,
                fontSize: '14px',
              }}
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '10px 24px',
                backgroundColor: COLORS.success,
                color: COLORS.white,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: TYPOGRAPHY.fontFamily,
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              Save
            </button>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default EmailConfiguration;

