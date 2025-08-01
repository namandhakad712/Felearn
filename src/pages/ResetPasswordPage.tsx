import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import styled from 'styled-components';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword, completePasswordReset, user } = useAuth();
  
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to get parameter from multiple sources
  const getParam = (paramNames: string[]): string | null => {
    // First try React Router search params (hash-based)
    for (const name of paramNames) {
      const value = searchParams.get(name);
      if (value) return value;
    }
    
    // Then try main URL search params (before hash)
    const mainSearch = window.location.search;
    if (mainSearch) {
      const mainParams = new URLSearchParams(mainSearch);
      for (const name of paramNames) {
        const value = mainParams.get(name);
        if (value) return value;
      }
    }
    
    return null;
  };

  // Get reset parameters from URL if they exist
  // Appwrite uses different parameter names, let's try all possibilities
  const userId = getParam(['userId', 'user', 'id', 'userID']);
  const secret = getParam(['secret', 'token', 'code', 'verification']);
  
  // Debug: Log the parameters
  React.useEffect(() => {
    console.log('🔍 ResetPasswordPage loaded');
    console.log('🔍 Full URL:', window.location.href);
    console.log('🔍 Search params:', window.location.search);
    console.log('🔍 Hash:', window.location.hash);
    console.log('🔍 All URL parameters:', Object.fromEntries(searchParams.entries()));
    console.log('🔍 Extracted parameters:', { userId, secret });
    console.log('🔍 User authenticated:', !!user);
    
    // Also try to extract from main URL search params (like we did for email verification)
    const mainSearch = window.location.search;
    if (mainSearch) {
      const mainParams = new URLSearchParams(mainSearch);
      const mainUserId = mainParams.get('userId') || mainParams.get('user') || mainParams.get('id');
      const mainSecret = mainParams.get('secret') || mainParams.get('token') || mainParams.get('code');
      console.log('🔍 Main URL parameters:', { mainUserId, mainSecret });
    }
  }, [userId, secret, user, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      if (userId && secret) {
        // Complete password reset
        if (!newPassword) {
          throw new Error('Please enter a new password.');
        }

        if (!confirmPassword) {
          throw new Error('Please confirm your new password.');
        }

        if (newPassword !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }

        // Validate password strength
        if (newPassword.length < 8) {
          throw new Error('Password must be at least 8 characters long.');
        }

        if (!/[A-Z]/.test(newPassword)) {
          throw new Error('Password must contain at least one uppercase letter.');
        }

        if (!/[a-z]/.test(newPassword)) {
          throw new Error('Password must contain at least one lowercase letter.');
        }

        if (!/[0-9]/.test(newPassword)) {
          throw new Error('Password must contain at least one number.');
        }

        console.log('🔄 Completing password reset with validated password...');
        const result = await completePasswordReset(userId, secret, newPassword);
        console.log('✅ Password reset result:', result);
        
        if (result.success) {
          setSuccessMessage('Password has been reset successfully! Redirecting to login...');
          setTimeout(() => {
            navigate('/auth/login');
          }, 3000);
        } else {
          setError(result.message || 'Failed to reset password. Please try again.');
        }
      } else {
        // Request password reset
        if (!email) {
          throw new Error('Please enter your email address.');
        }

        const result = await resetPassword(email);
        if (result.success) {
          setSuccessMessage(result.message);
        } else {
          setError(result.message);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VideoBackgroundContainer>
      {/* Video Background */}
      <video
        className="video-background"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/public/assets/placeholder-image.png"
      >
        <source src="/public/videos/auth-background-prem.mp4" type="video/mp4" />
        <source src="/public/videos/auth-background-prem.webm" type="video/webm" />
        Your browser does not support the video tag.
      </video>
      
      {/* Dark overlay for better text readability */}
      <div className="video-overlay" />
      
      {/* Content */}
      <div className="content-container">
        <StyledWrapper>
        <div className="text-center mb-8">
            <div className="mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
            {userId && secret ? 'Reset Your Password' : 'Forgot Password?'}
              </h1>
              <p className="text-sm sm:text-base text-white/90 mt-2 drop-shadow">
            {userId && secret
              ? 'Enter your new password below'
              : 'Enter your email and we\'ll send you a reset link'}
          </p>
            </div>
        </div>

        {error && (
          <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 text-green-700 bg-green-100 rounded-lg">
            {successMessage}
          </div>
        )}

          <form className="form" onSubmit={handleSubmit}>
          {userId && secret ? (
            <div>
                <div className="flex-column">
                  <label>New Password</label>
                </div>
                <div className="inputForm">
                  <svg height={20} viewBox="-64 0 512 512" width={20} xmlns="http://www.w3.org/2000/svg">
                    <path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0" />
                    <path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0" />
                  </svg>        
              <input
                type="password"
                    className="input" 
                    placeholder="Enter your new password"
                    required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div className="flex-column">
                  <label>Confirm New Password</label>
                </div>
                <div className="inputForm">
                  <svg height={20} viewBox="-64 0 512 512" width={20} xmlns="http://www.w3.org/2000/svg">
                    <path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0" />
                    <path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0" />
                  </svg>        
              <input
                type="password"
                    className="input" 
                    placeholder="Confirm your new password"
                    required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <div className="mt-2 text-xs sm:text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium mb-1">Password requirements:</p>
                  <ul className="space-y-1">
                    <li className={`flex items-center ${newPassword.length >= 8 ? 'text-green-600' : ''}`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      At least 8 characters long
                    </li>
                    <li className={`flex items-center ${/[A-Z]/.test(newPassword) ? 'text-green-600' : ''}`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${/[A-Z]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      One uppercase letter (A-Z)
                    </li>
                    <li className={`flex items-center ${/[a-z]/.test(newPassword) ? 'text-green-600' : ''}`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${/[a-z]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      One lowercase letter (a-z)
                    </li>
                    <li className={`flex items-center ${/[0-9]/.test(newPassword) ? 'text-green-600' : ''}`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${/[0-9]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      One number (0-9)
                    </li>
                    <li className={`flex items-center ${newPassword && confirmPassword && newPassword === confirmPassword ? 'text-green-600' : ''}`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${newPassword && confirmPassword && newPassword === confirmPassword ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      Passwords match
                    </li>
                  </ul>
                </div>
            </div>
          ) : (
            <div>
                <div className="flex-column">
                  <label>Email</label>
                </div>
                <div className="inputForm">
                  <svg height={20} viewBox="0 0 32 32" width={20} xmlns="http://www.w3.org/2000/svg">
                    <g id="Layer_3" data-name="Layer 3">
                      <path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z" />
                    </g>
                  </svg>
              <input
                type="email"
                    className="input" 
                    placeholder="Enter your email"
                    required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
                </div>
            </div>
          )}

          <button
              className="button-submit" 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              <span>
                {userId && secret ? 'Reset Password' : 'Send Reset Link'}
              </span>
            )}
          </button>

            <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => navigate('/auth/login')}
                className="text-white hover:text-blue-100 text-sm font-medium transition-colors duration-200"
            >
              Back to Login
            </button>
          </div>
        </form>
        </StyledWrapper>
      </div>
    </VideoBackgroundContainer>
  );
};

const VideoBackgroundContainer = styled.div`
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  .video-background {
    position: absolute;
    top: 50%;
    left: 50%;
    min-width: 100%;
    min-height: 100%;
    width: auto;
    height: auto;
    z-index: 0;
    transform: translateX(-50%) translateY(-50%);
    object-fit: cover;
    pointer-events: none;
  }

  .video-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    z-index: 1;
  }

  .content-container {
    position: relative;
    z-index: 2;
    width: 100%;
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    
    @media (max-width: 640px) {
      padding: 0.5rem;
    }
  }

  /* Fallback background if video fails to load */
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const StyledWrapper = styled.div`
  width: 100%;
  max-width: 450px;
  margin: 0 auto;

  .form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    background-color: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    padding: 30px;
    width: 100%;
    max-width: 450px;
    border-radius: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    box-sizing: border-box;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.3);
    
    @media (max-width: 640px) {
      padding: 20px;
      border-radius: 15px;
      gap: 8px;
    }
    
    @media (max-width: 480px) {
      padding: 16px;
      border-radius: 12px;
      margin: 0 8px;
    }
  }

  .flex-column > label {
    color: #000000;
    font-weight: 600;
    font-size: 14px;
    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
    
    @media (max-width: 640px) {
      font-size: 13px;
    }
  }

  .inputForm {
    border: 1.5px solid rgba(236, 237, 236, 0.8);
    border-radius: 10px;
    height: 50px;
    display: flex;
    align-items: center;
    padding-left: 10px;
    transition: 0.2s ease-in-out;
    width: 100%;
    box-sizing: border-box;
    background-color: rgba(255, 255, 255, 0.5);
    
    @media (max-width: 640px) {
      height: 48px;
      border-radius: 8px;
      padding-left: 8px;
    }
    
    @media (max-width: 480px) {
      height: 46px;
    }
  }

  .input {
    margin-left: 10px;
    border-radius: 10px;
    border: none;
    width: 85%;
    height: 100%;
    background: transparent;
    color: #000000;
    font-size: 16px;
    
    @media (max-width: 640px) {
      margin-left: 8px;
      font-size: 16px;
    }
  }

  .input::placeholder {
    color: #666666;
    opacity: 0.8;
  }

  .input:focus {
    outline: none;
  }

  .inputForm:focus-within {
    border: 1.5px solid #2d79f3;
    background-color: rgba(255, 255, 255, 0.8);
  }

  .button-submit {
    margin: 20px 0 10px 0;
    background-color: #151717;
    border: none;
    color: white;
    font-size: 15px;
    font-weight: 500;
    border-radius: 10px;
    height: 50px;
    width: 100%;
    cursor: pointer;
    transition: background-color 0.2s ease-in-out;
    
    @media (max-width: 640px) {
      height: 48px;
      font-size: 14px;
      margin: 16px 0 8px 0;
      border-radius: 8px;
    }
    
    @media (max-width: 480px) {
      height: 46px;
    }
  }

  .button-submit:hover {
    background-color: #252727;
  }

  .button-submit:disabled {
    opacity: 0.75;
    cursor: not-allowed;
  }
`;

export default ResetPasswordPage; 