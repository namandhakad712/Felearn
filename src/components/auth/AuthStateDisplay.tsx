import React from 'react';
import { useAuthState, useLogout } from '../../hooks';

/**
 * Component that displays the current authentication state
 * This is a simple example of how to use the authentication hooks
 */
const AuthStateDisplay: React.FC = () => {
  const { user, isLoading, isAuthenticated } = useAuthState();
  const { logout, isLoading: isLoggingOut } = useLogout();
  
  if (isLoading) {
    return <div>Loading authentication state...</div>;
  }
  
  if (!isAuthenticated) {
    return <div>Not authenticated</div>;
  }
  
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Authentication State
      </h3>
      
      <div className="space-y-2">
        <div>
          <span className="font-medium">User ID:</span> {user?.$id}
        </div>
        <div>
          <span className="font-medium">Email:</span> {user?.email}
        </div>
        {user?.name && (
          <div>
            <span className="font-medium">Name:</span> {user.name}
          </div>
        )}
        <div>
          <span className="font-medium">Email Verified:</span> {user?.emailVerification ? 'Yes' : 'No'}
        </div>
      </div>
      
      <div className="mt-4">
        <button
          onClick={() => logout()}
          disabled={isLoggingOut}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </div>
  );
};

export default AuthStateDisplay;