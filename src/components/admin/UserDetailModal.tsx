import React, { useState, useEffect } from 'react';
import { Modal } from '../ui';
import { adminService } from '../../services';
import { User } from '../../types';
import { formatDate } from '../../utils/dateUtils';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

interface UserActivity {
  type: string;
  timestamp: string;
  details: string;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ isOpen, onClose, user }) => {
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'activity'>('info');

  useEffect(() => {
    if (isOpen && user) {
      loadUserActivity();
    }
  }, [isOpen, user]);

  const loadUserActivity = async () => {
    try {
      setIsLoading(true);
      const activity = await adminService.getUserActivity(user.$id);
      setUserActivity(activity);
    } catch (error) {
      console.error('Failed to load user activity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`User Details: ${user.name || user.email}`}>
      <div className="space-y-6">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('info')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'info'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
              }`}
            >
              User Information
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'activity'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Activity History
            </button>
          </nav>
        </div>

        {/* User Information Tab */}
        {activeTab === 'info' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h4>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.email}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</h4>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.name || '-'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</h4>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {formatDate(user.createdAt)}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Login</h4>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h4>
                <p className="mt-1 text-sm">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.disabled 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  }`}>
                    {user.disabled ? 'Disabled' : 'Active'}
                  </span>
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Authentication</h4>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {user.oauthProvider ? `OAuth (${user.oauthProvider})` : 'Email/Password'}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</h4>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {user.isAdmin ? 'Administrator' : 'User'}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Verification</h4>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {user.emailVerification ? 'Verified' : 'Not Verified'}
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Preferences</h4>
              <div className="mt-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Theme:</span>{' '}
                    <span className="text-sm text-gray-900 dark:text-white">
                      {typeof user.settings === 'object' ? user.settings.theme : 'Unknown'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Language:</span>{' '}
                    <span className="text-sm text-gray-900 dark:text-white">
                      {typeof user.settings === 'object' ? user.settings.language : 'Unknown'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Onboarding:</span>{' '}
                    <span className="text-sm text-gray-900 dark:text-white">
                      {typeof user.settings === 'object' && user.settings.onboardingCompleted 
                        ? 'Completed' 
                        : 'Not Completed'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activity History Tab */}
        {activeTab === 'activity' && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-indigo-500 border-t-transparent"></div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading activity...</p>
              </div>
            ) : userActivity.length > 0 ? (
              <div className="overflow-hidden">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {userActivity.map((activity, index) => (
                    <li key={index} className="py-4">
                      <div className="flex space-x-3">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">{activity.type}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(activity.timestamp)}</p>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{activity.details}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No activity found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  This user has no recorded activity yet.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default UserDetailModal;