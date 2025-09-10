import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/auth';
import type { AuthResponse } from '@/services/auth';
import styled from 'styled-components';

// Styled Components for the button loader
const ButtonLoader = styled.div`
  .loader {
    --path: #ffffff;
    --dot: #ffffff;
    --duration: 2s;
    width: 20px;
    height: 20px;
    position: relative;
  }

  .loader:before {
    content: "";
    width: 4px;
    height: 4px;
    border-radius: 50%;
    position: absolute;
    display: block;
    background: var(--dot);
    top: 16px;
    left: 8px;
    transform: translate(-8px, -8px);
    animation: dotRect var(--duration) cubic-bezier(0.785, 0.135, 0.15, 0.86)
      infinite;
  }

  .loader svg {
    display: block;
    width: 100%;
    height: 100%;
  }

  .loader svg rect,
  .loader svg polygon,
  .loader svg circle {
    fill: none;
    stroke: var(--path);
    stroke-width: 3px;
    stroke-linejoin: round;
    stroke-linecap: round;
  }

  .loader svg polygon {
    stroke-dasharray: 145 76 145 76;
    stroke-dashoffset: 0;
    animation: pathTriangle var(--duration) cubic-bezier(0.785, 0.135, 0.15, 0.86)
      infinite;
  }

  .loader svg rect {
    stroke-dasharray: 192 64 192 64;
    stroke-dashoffset: 0;
    animation: pathRect 2s cubic-bezier(0.785, 0.135, 0.15, 0.86) infinite;
  }

  .loader svg circle {
    stroke-dasharray: 150 50 150 50;
    stroke-dashoffset: 75;
    animation: pathCircle var(--duration) cubic-bezier(0.785, 0.135, 0.15, 0.86)
      infinite;
  }

  .loader.triangle {
    width: 22px;
  }

  .loader.triangle:before {
    left: 9px;
    transform: translate(-4px, -8px);
    animation: dotTriangle var(--duration) cubic-bezier(0.785, 0.135, 0.15, 0.86)
      infinite;
  }

  @keyframes pathTriangle {
    33% {
      stroke-dashoffset: 74;
    }

    66% {
      stroke-dashoffset: 147;
    }

    100% {
      stroke-dashoffset: 221;
    }
  }

  @keyframes dotTriangle {
    33% {
      transform: translate(0, 0);
    }

    66% {
      transform: translate(4px, -8px);
    }

    100% {
      transform: translate(-4px, -8px);
    }
  }

  @keyframes pathRect {
    25% {
      stroke-dashoffset: 64;
    }

    50% {
      stroke-dashoffset: 128;
    }

    75% {
      stroke-dashoffset: 192;
    }

    100% {
      stroke-dashoffset: 256;
    }
  }

  @keyframes dotRect {
    25% {
      transform: translate(0, 0);
    }

    50% {
      transform: translate(8px, -8px);
    }

    75% {
      transform: translate(0, -16px);
    }

    100% {
      transform: translate(-8px, -8px);
    }
  }

  @keyframes pathCircle {
    25% {
      stroke-dashoffset: 125;
    }

    50% {
      stroke-dashoffset: 175;
    }

    75% {
      stroke-dashoffset: 225;
    }

    100% {
      stroke-dashoffset: 275;
    }
  }

  .loader {
    display: inline-block;
    margin: 0 8px;
  }
`;

// Small Geometric Loader Component for buttons
const SmallGeometricLoader = () => {
  return (
    <ButtonLoader>
      <div>
        <div className="loader">
          <svg viewBox="0 0 80 80">
            <circle r={32} cy={40} cx={40} id="test" />
          </svg>
        </div>
        <div className="loader triangle">
          <svg viewBox="0 0 86 80">
            <polygon points="43 8 79 72 7 72" />
          </svg>
        </div>
        <div className="loader">
          <svg viewBox="0 0 80 80">
            <rect height={64} width={64} y={8} x={8} />
          </svg>
        </div>
      </div>
    </ButtonLoader>
  );
};

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Check for verification message from location state
  useEffect(() => {
    const state = location?.state as any;
    if (state?.needsVerification) {
      setError('Please verify your email before accessing your account. Check your inbox for a verification link.');
    }
  }, [location]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render auth page if user is authenticated
  if (isAuthenticated) {
    return null;
  }

  // Password validation function
  const validatePassword = (password: string): { isValid: boolean; message: string } => {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }
    return { isValid: true, message: '' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      if (!isLogin) {
        // Validate password before registration
        const { isValid, message } = validatePassword(password);
        if (!isValid) {
          setError(message);
          setIsLoading(false);
          return;
        }
      }

      if (isLogin) {
        try {
          const result: AuthResponse = await login(email, password);
          if (result.success) {
            // Check if user needs onboarding
            const currentUser = await authService.getCurrentUser();
            if (currentUser && !currentUser.emailVerification) {
              setError('Please verify your email before logging in. Check your inbox for a verification link.');
              return;
            }
            
            // Let ProtectedRoute handle onboarding redirect
            navigate('/dashboard');
          } else {
            setError(result.message);
          }
        } catch (loginError: any) {
          console.log('Login failed, attempting auto-registration...', loginError.message);
          console.log('Full error object:', loginError);
          
          // If login fails, try auto-registration for new users
          // Check for various login failure messages
          const shouldTryAutoRegister = 
            loginError.message?.includes('Invalid credentials') || 
            loginError.message?.includes('Invalid email or password') ||
            loginError.message?.includes('User (role: guests) missing scope') ||
            loginError.message?.includes('check the email and password') ||
            loginError.code === 401;
          
          if (shouldTryAutoRegister) {
            
            // Validate password for auto-registration
            const { isValid, message } = validatePassword(password);
            if (!isValid) {
              setError(`Account doesn't exist and password doesn't meet requirements for new account: ${message}`);
              setIsLoading(false);
              return;
            }

            try {
              // Attempting auto-registration
              // Attempt auto-registration
              const registerResult: AuthResponse = await register(email, password);
              if (registerResult.success) {
                if (registerResult.requiresVerification) {
                  setSuccessMessage(`✨ New account created! ${registerResult.message}`);
                } else {
                  navigate('/dashboard');
                }
              } else {
                setError(`Login failed and couldn't create new account: ${registerResult.message}`);
              }
            } catch (registerError: any) {
              console.error('Auto-registration failed:', registerError);
              if (registerError.message?.includes('already exists')) {
                setError('An account with this email already exists. Please check your password or use "Forgot Password" to reset it.');
              } else {
                setError(`Registration failed: ${registerError.message}`);
              }
            }
          } else {
            setError(loginError.message);
          }
        }
      } else {
        const result: AuthResponse = await register(email, password);
        if (result.success) {
          if (result.requiresVerification) {
            setSuccessMessage(result.message);
          } else {
            // New user registered successfully, they'll be redirected to onboarding by ProtectedRoute
            navigate('/dashboard');
          }
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

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    try {
      console.log(`🔐 Starting ${provider} OAuth login...`);
      await authService.createOAuthSession(provider);
      console.log(`✅ ${provider} OAuth initiated successfully`);
    } catch (error: any) {
      console.error(`❌ ${provider} OAuth error:`, error);
      setError(`${provider} authentication failed: ${error.message}`);
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
        poster="/assets/placeholder-image.webp"
        webkit-playsinline="true"
        x5-playsinline="true"
        x5-video-player-type="h5"
        x5-video-player-fullscreen="true"
        x5-video-orientation="portraint"
      >
        <source src="/videos/auth-background-prem.mp4" type="video/mp4" />
        <source src="/videos/auth-background-prem.webm" type="video/webm" />
        {/* Fallback for browsers that don't support video */}
        Your browser does not support the video tag.
      </video>
      
      {/* Dark overlay for better text readability */}
      <div className="video-overlay" />
      
      {/* Content */}
      <div className="content-container">
        <StyledWrapper>


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
          {isLogin && (
            <div className="smart-login-info">
              <div className="flex items-start">
                <svg className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-xs text-blue-800">
                  <p className="font-medium">Smart Login</p>
                  <p>Enter your credentials. If you're a new user, we'll automatically create your account!</p>
                </div>
              </div>
            </div>
          )}
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
              placeholder="Enter your Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="flex-column">
            <label>Password</label>
          </div>
          <div className="inputForm">
            <svg height={20} viewBox="-64 0 512 512" width={20} xmlns="http://www.w3.org/2000/svg">
              <path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0" />
              <path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0" />
            </svg>        
            <input 
              type="password" 
              className="input text-gray-700 dark:text-gray-300" 
              placeholder="Enter your Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {!isLogin && (
            <div className="mt-2 text-xs sm:text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
              <p className="font-medium mb-1">Password requirements:</p>
              <ul className="space-y-1">
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                  At least 8 characters long
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                  One uppercase letter (A-Z)
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                  One lowercase letter (a-z)
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                  One number (0-9)
                </li>
              </ul>
            </div>
          )}
          
          <div className="flex-row">
            <div>
              <input type="checkbox" />
              <label>Remember me</label>
            </div>
            {isLogin && (
              <span 
                className="span" 
                onClick={() => navigate('/auth/reset-password')}
                style={{ cursor: 'pointer' }}
              >
                Forgot password?
              </span>
            )}
          </div>
          
          <button 
            className="button-submit" 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <SmallGeometricLoader />
                Processing...
              </span>
            ) : (
              isLogin ? 'Sign In' : 'Sign Up'
            )}
          </button>
          
          <p className="p">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span 
              className="span" 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccessMessage('');
              }}
              style={{ cursor: 'pointer' }}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </span>
          </p>
          
          <p className="p line">Or With</p>
          
          <div className="flex-row">
            <button 
              className="btn google" 
              type="button"
              onClick={() => handleOAuthLogin('google')}
              disabled={isLoading}
            >
              <svg version="1.1" width={20} id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style={{background: 'new 0 0 512 512'}} xmlSpace="preserve">
                <path style={{fill: '#FBBB00'}} d="M113.47,309.408L95.648,375.94l-65.139,1.378C11.042,341.211,0,299.9,0,256
                c0-42.451,10.324-82.483,28.624-117.732h0.014l57.992,10.632l25.404,57.644c-5.317,15.501-8.215,32.141-8.215,49.456
                C103.821,274.792,107.225,292.797,113.47,309.408z" />
                <path style={{fill: '#518EF8'}} d="M507.527,208.176C510.467,223.662,512,239.655,512,256c0,18.328-1.927,36.206-5.598,53.451
                c-12.462,58.683-45.025,109.925-90.134,146.187l-0.014-0.014l-73.044-3.727l-10.338-64.535
                c29.932-17.554,53.324-45.025,65.646-77.911h-136.89V208.176h138.887L507.527,208.176L507.527,208.176z" />
                <path style={{fill: '#28B446'}} d="M416.253,455.624l0.014,0.014C372.396,490.901,316.666,512,256,512
                c-97.491,0-182.252-54.491-225.491-134.681l82.961-67.91c21.619,57.698,77.278,98.771,142.53,98.771
                c28.047,0,54.323-7.582,76.87-20.818L416.253,455.624z" />
                <path style={{fill: '#F14336'}} d="M419.404,58.936l-82.933,67.896c-23.335-14.586-50.919-23.012-80.471-23.012
                c-66.729,0-123.429,42.957-143.965,102.724l-83.397-68.276h-0.014C71.23,56.123,157.06,0,256,0
                C318.115,0,375.068,22.126,419.404,58.936z" />
              </svg>
              Google 
            </button>
            
            <button 
              className="btn apple" 
              type="button"
              onClick={() => handleOAuthLogin('github')}
              disabled={isLoading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#333"
                  d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z"
                />
              </svg>
              GitHub 
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
    z-index: 0; /* Changed from -2 to ensure video is visible */
    transform: translateX(-50%) translateY(-50%);
    object-fit: cover;
    pointer-events: none; /* Prevent video from being interactive */
    
    /* Ensure video loads properly in production */
    opacity: 1;
    visibility: visible;
    
    /* Better mobile support */
    @media (max-width: 768px) {
      /* On mobile, ensure video covers properly */
      min-width: 120%;
      min-height: 120%;
    }
  }

  .video-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    z-index: 1;
    
    @media (max-width: 768px) {
      background: rgba(0, 0, 0, 0.3); /* Lighter overlay on mobile */
    }
    
    @media (max-width: 480px) {
      background: rgba(0, 0, 0, 0.25); /* Even lighter on small mobile */
    }
  }

  .content-container {
    position: relative;
    z-index: 2; /* Ensure content is above video and overlay */
    width: 100%;
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    
    @media (max-width: 768px) {
      padding: 1rem 0.75rem;
      align-items: flex-start;
      padding-top: 2rem;
      padding-bottom: 2rem;
    }
    
    @media (max-width: 480px) {
      padding: 1rem 0.5rem;
      padding-top: 1.5rem;
      padding-bottom: 1.5rem;
    }
  }

  /* Fallback background if video fails to load */
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const StyledWrapper = styled.div`
  width: 100%;
  max-width: 450px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    max-width: 400px;
    padding: 0 0.5rem;
  }
  
  @media (max-width: 480px) {
    max-width: 340px;
    padding: 0 0.25rem;
  }
  
  @media (max-width: 360px) {
    max-width: 320px;
    padding: 0 0.125rem;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    background-color: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    padding: 30px;
    width: 100%;
    max-width: 450px;
    border-radius: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    box-sizing: border-box;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.3);
    
    /* Mobile responsive - smaller form on mobile */
    @media (max-width: 768px) {
      padding: 24px 20px;
      border-radius: 16px;
      gap: 8px;
      background-color: rgba(255, 255, 255, 0.88);
      max-width: 380px;
      margin: 0 auto;
    }
    
    @media (max-width: 480px) {
      padding: 20px 16px;
      border-radius: 14px;
      gap: 8px;
      background-color: rgba(255, 255, 255, 0.90);
      max-width: 320px;
      margin: 0 auto;
      min-width: 280px;
    }
    
    @media (max-width: 360px) {
      padding: 18px 14px;
      border-radius: 12px;
      max-width: 300px;
      min-width: 260px;
      gap: 6px;
    }
    
    @media (max-width: 320px) {
      padding: 16px 12px;
      border-radius: 10px;
      max-width: 280px;
      min-width: 240px;
      gap: 6px;
    }
  }

  .smart-login-info {
    background-color: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 15px;
    width: 100%;
    box-sizing: border-box;
    
    @media (max-width: 640px) {
      padding: 10px;
      margin-bottom: 12px;
      border-radius: 6px;
    }
  }

  ::placeholder {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }

  .form button {
    align-self: flex-end;
  }

  .flex-column > label {
    color: #000000;
    font-weight: 600;
    font-size: 14px;
    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5); /* Add subtle text shadow */
    
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
    background-color: rgba(255, 255, 255, 0.5); /* Slightly white background */
    
    @media (max-width: 640px) {
      height: 48px;
      border-radius: 8px;
      padding-left: 8px;
    }
    
    @media (max-width: 480px) {
      height: 46px;
      border-radius: 8px;
      padding-left: 8px;
    }
    
    @media (max-width: 360px) {
      height: 44px;
      border-radius: 6px;
      padding-left: 6px;
    }
    
    @media (max-width: 320px) {
      height: 42px;
      border-radius: 6px;
      padding-left: 6px;
    }
  }

  .input {
    margin-left: 10px;
    border-radius: 10px;
    border: none;
    width: 85%;
    height: 100%;
    background: transparent; /* Make input background transparent */
    color: #000000; /* Set text color to black */
    font-size: 16px; /* Prevents zoom on iOS */
    outline: none;
    
    @media (max-width: 640px) {
      margin-left: 8px;
      font-size: 16px;
      width: 82%;
    }
    
    @media (max-width: 480px) {
      margin-left: 6px;
      font-size: 16px;
      width: 80%;
    }
    
    @media (max-width: 360px) {
      margin-left: 6px;
      font-size: 16px;
      width: 78%;
    }
    
    @media (max-width: 320px) {
      margin-left: 4px;
      font-size: 16px;
      width: 75%;
    }
  }

  .input::placeholder {
    color: #666666; /* Darker placeholder text for better visibility */
    opacity: 0.8;
  }

  .input:focus {
    outline: none;
  }

  .inputForm:focus-within {
    border: 1.5px solid #2d79f3;
    background-color: rgba(255, 255, 255, 0.8); /* More white background when focused */
  }

  .flex-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    justify-content: space-between;
    flex-wrap: wrap;
    
    @media (max-width: 480px) {
      gap: 8px;
    }
  }

  .flex-row > div > label {
    font-size: 14px;
    color: black;
    font-weight: 400;
    
    @media (max-width: 640px) {
      font-size: 13px;
    }
  }

  .span {
    font-size: 14px;
    margin-left: 5px;
    color: #2d79f3;
    font-weight: 500;
    cursor: pointer;
    
    @media (max-width: 640px) {
      font-size: 13px;
    }
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

  .p {
    text-align: center;
    color: black;
    font-size: 14px;
    margin: 5px 0;
    
    @media (max-width: 640px) {
      font-size: 13px;
      margin: 4px 0;
    }
  }

  .p.line {
    position: relative;
    margin: 20px 0;
    
    @media (max-width: 640px) {
      margin: 16px 0;
    }
  }

  .p.line::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background-color: #ededef;
    z-index: 1;
  }

  .p.line {
    background-color: white;
    padding: 0 15px;
    z-index: 2;
    position: relative;
    display: inline-block;
    width: auto;
    margin: 20px auto;
    
    @media (max-width: 640px) {
      margin: 16px auto;
      padding: 0 12px;
    }
  }

  .btn {
    margin-top: 10px;
    width: 48%; /* Changed from 100% to 48% to fit side by side with gap */
    height: 50px;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 500;
    gap: 10px;
    border: 1px solid #ededef;
    background-color: white;
    cursor: pointer;
    transition: 0.2s ease-in-out;
    font-size: 14px;
    
    @media (max-width: 640px) {
      height: 48px;
      font-size: 13px;
      gap: 8px;
      border-radius: 8px;
      margin-top: 8px;
    }
    
    @media (max-width: 480px) {
      height: 46px;
      font-size: 12px;
    }
  }

  /* OAuth buttons container */
  .oauth-buttons {
    display: flex;
    justify-content: space-between;
    gap: 4%;
    width: 100%;
    margin-top: 10px;
  }

  .btn:hover {
    border: 1px solid #2d79f3;
    background-color: rgba(45, 121, 243, 0.1);
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn.google {
    color: #333;
  }

  .btn.apple {
    color: #333;
  }

  /* Update the flex-row styles for the OAuth buttons */
  .flex-row:last-child {
    justify-content: space-between;
    gap: 4%;
    
    @media (max-width: 480px) {
      flex-direction: row; /* Keep row direction even on mobile */
      gap: 4%;
    }
  }

  .flex-row:last-child .btn {
    @media (max-width: 480px) {
      width: 48%; /* Keep the width at 48% even on mobile */
    }
  }
`;

export default AuthPage;