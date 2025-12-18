/**
 * Arithwise HRM Organization Structure Page
 * Copyright (C) 2024 Arithwise Inc.
 */

import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import ProtectedRoute from '../../components/ProtectedRoute';

const COLORS = {
  primary: '#78176b',
  primaryHover: '#590a4f',
  lightBg: '#faf3ff',
  lightBgAlt: '#fffafe',
  white: '#ffffff',
  text: '#333333',
  textLight: '#666666',
  border: '#e0e0e0',
  green: '#76c043',
  red: '#dc3545',
  orange: '#ff8c00',
};

const TYPOGRAPHY = {
  fontFamily: "'Segoe UI', Arial, sans-serif",
  textImportant: { fontSize: '16px' },
  textNote: { fontSize: '14px' },
};

interface OrgUnit {
  id: number;
  name: string;
  level: number;
  children?: OrgUnit[];
}

const Structure: React.FC = () => {
  const [orgStructure, setOrgStructure] = useState<OrgUnit>({
    id: 1,
    name: 'arithwise_hrms',
    level: 0,
    children: [
      {
        id: 2,
        name: '100: Administration',
        level: 1,
        children: [],
      },
      {
        id: 3,
        name: 'Engineering',
        level: 1,
        children: [],
      },
      {
        id: 4,
        name: 'Sales & Marketing',
        level: 1,
        children: [],
      },
      {
        id: 5,
        name: 'Client Services',
        level: 1,
        children: [],
      },
      {
        id: 6,
        name: 'Finance',
        level: 1,
        children: [],
      },
      {
        id: 7,
        name: 'Human Resources',
        level: 1,
        children: [
          {
            id: 8,
            name: '1: hola',
            level: 2,
            children: [],
          },
          {
            id: 9,
            name: 'juan perez',
            level: 2,
            children: [],
          },
        ],
      },
    ],
  });

  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set([1, 7]));
  const [isEditing, setIsEditing] = useState(false);

  const toggleNode = (id: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  const renderOrgUnit = (unit: OrgUnit, depth: number = 0): React.ReactNode => {
    const hasChildren = unit.children && unit.children.length > 0;
    const isExpanded = expandedNodes.has(unit.id);
    const indent = depth * 30;

    return (
      <div key={unit.id}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px',
            paddingLeft: `${16 + indent}px`,
            backgroundColor: depth === 0 ? COLORS.lightBgAlt : COLORS.white,
            borderBottom: `1px solid ${COLORS.border}`,
            position: 'relative',
          }}
        >
          {/* Connector lines */}
          {depth > 0 && (
            <>
              <div
                style={{
                  position: 'absolute',
                  left: `${indent - 15}px`,
                  top: 0,
                  bottom: '50%',
                  width: '1px',
                  backgroundColor: COLORS.orange,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: `${indent - 15}px`,
                  top: '50%',
                  width: '15px',
                  height: '1px',
                  backgroundColor: COLORS.orange,
                }}
              />
            </>
          )}

          {/* Expand/Collapse button */}
          {hasChildren && (
            <button
              onClick={() => toggleNode(unit.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                marginRight: '8px',
                fontSize: '14px',
                color: COLORS.text,
              }}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}

          {!hasChildren && <span style={{ width: '22px', display: 'inline-block' }} />}

          {/* Unit name */}
          <span
            style={{
              fontFamily: TYPOGRAPHY.fontFamily,
              fontSize: TYPOGRAPHY.textImportant.fontSize,
              color: depth === 0 ? COLORS.primary : COLORS.text,
              fontWeight: depth === 0 ? 600 : 400,
              flex: 1,
            }}
          >
            {unit.name}
          </span>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && unit.children!.map(child => renderOrgUnit(child, depth + 1))}
      </div>
    );
  };

  return (
    <ProtectedRoute requiredPermission="manage_departments">
      <AdminLayout title="Organization Structure" breadcrumbs={['Admin', 'Organization']}>
        <div style={{
          backgroundColor: COLORS.lightBg,
          minHeight: 'calc(100vh - 200px)',
          padding: '24px',
        }}>
          {/* Card */}
          <div style={{
            backgroundColor: COLORS.white,
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 24px',
              borderBottom: `1px solid ${COLORS.border}`,
              backgroundColor: COLORS.lightBgAlt,
            }}>
              <h2 style={{
                color: COLORS.primary,
                fontSize: '1.25rem',
                fontFamily: TYPOGRAPHY.fontFamily,
                fontWeight: 500,
                margin: 0,
              }}>
                Organization Structure
              </h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: COLORS.white,
                  color: COLORS.primary,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontFamily: TYPOGRAPHY.fontFamily,
                  fontSize: TYPOGRAPHY.textNote.fontSize,
                }}
              >
                Edit
              </button>
            </div>

            {/* Organization Tree */}
            <div style={{ padding: '0' }}>
              {renderOrgUnit(orgStructure)}
            </div>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default Structure;

