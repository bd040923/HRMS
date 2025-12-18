/**
 * Arithwise HRM Qualifications Management Page
 * Copyright (C) 2024 Arithwise Inc.
 */

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';

const Qualifications: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only redirect if we're exactly on /admin/qualifications
    if (location.pathname === '/admin/qualifications') {
      navigate('/admin/skills', { replace: true });
    }
  }, [navigate, location.pathname]);

  return (
    <ProtectedRoute requiredPermission="view_employees">
      <div>Loading...</div>
    </ProtectedRoute>
  );
};

export default Qualifications;
