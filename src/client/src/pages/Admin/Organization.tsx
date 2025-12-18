/**
 * Arithwise HRM Organization Management Page
 * Copyright (C) 2024 Arithwise Inc.
 */

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';

const Organization: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only redirect if we're exactly on /admin/organization
    if (location.pathname === '/admin/organization') {
      navigate('/admin/general-information', { replace: true });
    }
  }, [navigate, location.pathname]);

  return (
    <ProtectedRoute requiredPermission="manage_departments">
      <div>Loading...</div>
    </ProtectedRoute>
  );
};

export default Organization;

