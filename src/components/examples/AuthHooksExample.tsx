import React, { useState } from 'react';
import { 
  // useAuth, // Unused import
  useAuthState, 
  useLogin, 
  useLogout, 
  useRegister,
  usePasswordReset,
  // useUserProfile, // Hook doesn't exist
  useAuthPersistence
} from '../../hooks';

/**
 * Example component demonstrating how to use authentication hooks
 */
const AuthHooksExample: React.FC = () => {
  // Basic auth hook
  // const auth = useAuth(); // Unused variable
  
  // Auth state hooks
  const { user, isAuthenticated, isLoading } = useAuthState();
  
  // Auth operations hooks
  const { login, isLoading: loginLoading, error: loginError } = useLogin();
  const { register, isLoading: registerLoading, error: registerError } = useRegister();
  const { logout } = useLogout();
  const { resetPassword, isLoading: resetLoading, error: resetError } = usePasswordReset();
  
  // These methods don't exist in the hooks, so we'll use the ones that do exist
  // const { loginWithEmail } = useLogin(); // Doesn't exist - use login instead
  // const { registerWithEmail } = useRegister(); // Doesn't exist - use register instead
  // const { sendPasswordResetEmail, success } = usePasswordReset(); // Doesn't exist - use resetPassword instead

  // Profile hook - commenting out since it doesn't exist
  // const useUserProfile = null; // Hook doesn't exist
  
  // Auth persistence hook
  const { 
    persistenceType, 
    setAuthPersistence, 
    isLoading: isPersistenceLoading 
  } = useAuthPersistence();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  
  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };
  
  // Handle registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await register(email, password);
    
    if (success && displayName) {
      // Update the user profile with the display name
      // await updateProfile({ name: displayName }); // updateProfile is not available
    }
  };
  
  // Handle logout
  const handleLogout = async () => {
    await logout();
  };
  
  // Handle password reset
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    await resetPassword(email);
  };
  
  // Handle persistence change
  const handlePersistenceChange = async (type: string) => {
    await setAuthPersistence(type);
  };
  
  // Render loading state
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Authentication Hooks Example</h2>
      
      {/* Authentication Status */}
      <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Authentication Status</h3>
        <p>
          <strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
        </p>
        {user && (
          <div className="mt-2">
            <p><strong>User ID:</strong> {user.$id}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Name:</strong> {user.name || 'Not set'}</p>
          </div>
        )}
      </div>
      
      {/* Authentication Forms */}
      {!isAuthenticated ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Login Form */}
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Login</h3>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              {loginError && (
                <div className="text-red-500">{loginError.message}</div>
              )}
              <button
                type="submit"
                disabled={loginLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loginLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
          
          {/* Registration Form */}
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Register</h3>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Display Name (Optional)</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              {registerError && (
                <div className="text-red-500">{registerError.message}</div>
              )}
              <button
                type="submit"
                disabled={registerLoading}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                {registerLoading ? 'Registering...' : 'Register'}
              </button>
            </form>
          </div>
          
          {/* Password Reset Form */}
          <div className="p-4 border rounded-lg md:col-span-2">
            <h3 className="text-lg font-semibold mb-2">Password Reset</h3>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="block mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              {/* resetSuccess && ( // resetSuccess is not available
                <div className="text-green-500">Password reset email sent!</div>
              ) */}
              {resetError && (
                <div className="text-red-500">{resetError.message}</div>
              )}
              <button
                type="submit"
                disabled={resetLoading}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
              >
                {resetLoading ? 'Sending...' : 'Send Reset Email'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* User Profile */}
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">User Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Display Name</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={displayName || (user?.name || '')}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded"
                  />
                  {/* updateProfile is not available */}
                  {/* <button
                    onClick={() => updateProfile({ name: displayName })}
                    disabled={isProfileLoading}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    {isProfileLoading ? 'Updating...' : 'Update'}
                  </button> */}
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={handleLogout}
                  disabled={false} // isLogoutLoading is not available
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                >
                  {/* isLogoutLoading is not available */}
                  Logout
                </button>
                
                {/* deleteUserAccount is not available */}
                {/* <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                      deleteUserAccount();
                    }
                  }}
                  disabled={isProfileLoading}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                >
                  Delete Account
                </button> */}
              </div>
            </div>
          </div>
          
          {/* Persistence Settings */}
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Authentication Persistence</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="persistence-local"
                  name="persistence"
                  checked={persistenceType === 'LOCAL'}
                  onChange={() => handlePersistenceChange('LOCAL')}
                  disabled={isPersistenceLoading}
                  className="mr-2"
                />
                <label htmlFor="persistence-local">
                  Remember me (stays logged in even after browser restart)
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="persistence-session"
                  name="persistence"
                  checked={persistenceType === 'SESSION'}
                  onChange={() => handlePersistenceChange('SESSION')}
                  disabled={isPersistenceLoading}
                  className="mr-2"
                />
                <label htmlFor="persistence-session">
                  Current session only (logs out when browser is closed)
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="persistence-none"
                  name="persistence"
                  checked={persistenceType === 'NONE'}
                  onChange={() => handlePersistenceChange('NONE')}
                  disabled={isPersistenceLoading}
                  className="mr-2"
                />
                <label htmlFor="persistence-none">
                  No persistence (logs out when tab is closed or refreshed)
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthHooksExample;