import React from 'react';
// import { AdminLayout } from '../components/admin/layout'; // File does not exist
import { KeyManagement } from '../components/admin';
import { Card } from '../components/ui';

/**
 * Admin security management page
 */
const AdminSecurityPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Security Management</h2>
        <p className="text-gray-600">
          Manage API keys, security settings, and monitor system security.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* API Key Management */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">API Key Management</h3>
          <KeyManagement />
        </Card>

        {/* Error Reporting & Debugging */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Error Reporting</h3>
          {/* <ErrorReportingTester /> */}
          <p className="text-gray-500">Error reporting system temporarily disabled</p>
        </Card>
      </div>
    </div>
  );
};

export default AdminSecurityPage;