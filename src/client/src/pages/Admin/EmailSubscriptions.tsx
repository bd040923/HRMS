/**
 * arithwise_hrms Email Subscriptions Page
 * Copyright (C) 2024 Arithwise Inc.
 */

import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import ProtectedRoute from '../../components/ProtectedRoute';

const COLORS = {
  primary: '#78176b',
  white: '#ffffff',
  text: '#333333',
  textLight: '#666666',
  border: '#e0e0e0',
  lightBg: '#faf3ff',
};

const TYPOGRAPHY = {
  fontFamily: "'Segoe UI', Arial, sans-serif",
};

interface Subscription {
  id: number;
  notificationType: string;
  subscribers: string[];
  enabled: boolean;
}

const EmailSubscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    { id: 1, notificationType: 'Leave Applications', subscribers: [], enabled: false },
    { id: 2, notificationType: 'Leave Approvals', subscribers: [], enabled: false },
    { id: 3, notificationType: 'Leave Assignments', subscribers: [], enabled: false },
    { id: 4, notificationType: 'Leave Cancellations', subscribers: [], enabled: false },
    { id: 5, notificationType: 'Leave Rejections', subscribers: [], enabled: false },
  ]);

  const handleToggle = (id: number) => {
    setSubscriptions(subscriptions.map(sub =>
      sub.id === id ? { ...sub, enabled: !sub.enabled } : sub
    ));
  };

  const handleAddSubscriber = (id: number) => {
    alert(`Add subscriber modal for ${subscriptions.find(s => s.id === id)?.notificationType}`);
  };

  return (
    <ProtectedRoute requiredPermission="manage_users">
      <AdminLayout title="Configuration" breadcrumbs={['Admin', 'Configuration', 'Email Subscriptions']}>
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
            Email Subscriptions
          </h2>

          <div style={{ marginBottom: '16px', color: COLORS.textLight, fontFamily: TYPOGRAPHY.fontFamily }}>
            ({subscriptions.length}) Records Found
          </div>

          {/* Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: COLORS.lightBg }}>
                <th style={{
                  padding: '12px',
                  textAlign: 'left',
                  borderBottom: `2px solid ${COLORS.border}`,
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontWeight: 500,
                }}>
                  Notification Type
                </th>
                <th style={{
                  padding: '12px',
                  textAlign: 'left',
                  borderBottom: `2px solid ${COLORS.border}`,
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontWeight: 500,
                }}>
                  Subscribers
                </th>
                <th style={{
                  padding: '12px',
                  textAlign: 'right',
                  borderBottom: `2px solid ${COLORS.border}`,
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontWeight: 500,
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((subscription) => (
                <tr key={subscription.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  <td style={{ padding: '12px', fontFamily: TYPOGRAPHY.fontFamily }}>
                    {subscription.notificationType}
                  </td>
                  <td style={{ padding: '12px', fontFamily: TYPOGRAPHY.fontFamily, color: COLORS.textLight }}>
                    {subscription.subscribers.length > 0 ? subscription.subscribers.join(', ') : '-'}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleAddSubscriber(subscription.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '18px',
                        marginRight: '12px',
                        color: COLORS.primary,
                      }}
                      title="Add Subscriber"
                    >
                      👤+
                    </button>
                    <label style={{ cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={subscription.enabled}
                        onChange={() => handleToggle(subscription.id)}
                        style={{
                          width: '40px',
                          height: '20px',
                          cursor: 'pointer',
                        }}
                      />
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default EmailSubscriptions;

