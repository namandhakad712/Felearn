import React from 'react';
import { AdminLayout } from '../components/admin';
import { PerformanceDashboard } from '../components/admin';

/**
 * Admin performance monitoring page
 */
const AdminPerformancePage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="p-6">
        <PerformanceDashboard />
      </div>
    </AdminLayout>
  );
};

export default AdminPerformancePage;