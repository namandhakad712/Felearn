import React from 'react';
// import { AdminLayout } from '../components/admin/layout'; // File does not exist
import { KeyManagement, ErrorReportingTester } from '../components/admin';
import { Card } from '../components/ui';

/**
 * Admin security management page
 */
const AdminSecurityPage: React.FC = () => {
  return (
    <div className="admin-layout-placeholder">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Security Management
        </h2>
        
        {/* Key Management */}
        <KeyManagement />
        
        {/* Error Reporting Tester */}
        <ErrorReportingTester />
        
        {/* Security Settings */}
        <Card className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Security Settings
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Two-Factor Authentication
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Require admins to use two-factor authentication
                </p>
              </div>
              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Session Timeout
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Automatically log out inactive users
                </p>
              </div>
              <div className="flex items-center">
                <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
                  <option value="30">30 minutes</option>
                  <option value="60" selected>1 hour</option>
                  <option value="120">2 hours</option>
                  <option value="240">4 hours</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Failed Login Attempts
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Lock account after multiple failed login attempts
                </p>
              </div>
              <div className="flex items-center">
                <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
                  <option value="3">3 attempts</option>
                  <option value="5" selected>5 attempts</option>
                  <option value="10">10 attempts</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors">
              Save Settings
            </button>
          </div>
        </Card>
        
        {/* API Security */}
        <Card>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            API Security
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Rate Limiting
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Limit API requests per user
                </p>
              </div>
              <div className="flex items-center">
                <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
                  <option value="5">5 requests/hour</option>
                  <option value="10" selected>10 requests/hour</option>
                  <option value="20">20 requests/hour</option>
                  <option value="50">50 requests/hour</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  CORS Origins
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Allowed origins for API requests
                </p>
              </div>
              <div className="flex items-center">
                <input
                  type="text"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-64 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  placeholder="https://example.com"
                  value="*"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors">
              Save Settings
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminSecurityPage;