import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminDashboardPage, UserManagementPage } from '.';
import AdminSecurityPage from '../AdminSecurityPage';
import AdminPerformancePage from '../AdminPerformancePage';

/**
 * Admin routes component
 */
const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboardPage />} />
      <Route path="/users" element={<UserManagementPage />} />
      <Route path="/security" element={<AdminSecurityPage />} />
      <Route path="/performance" element={<AdminPerformancePage />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AdminRoutes;