import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { validateGeminiApiKey } from '@/utils/userUtils';
import styled from 'styled-components';

// Simple error boundary for debugging
class OnboardingErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('🚨 OnboardingPage Error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 OnboardingPage Error Details:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Onboarding Error</h2>
            <p className="text-red-800 mb-4">Something went wrong loading the onboarding page.</p>
            <pre className="text-sm text-red-700 bg-red-100 p-4 rounded">
              {this.state.error?.message}
            </pre>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser, refreshUser } = useAuth();
  const { setTheme } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>('light');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [error, setError] = useState('');

  // Debug: Log component mount and user info
  React.useEffect(() => {
    console.log('🚀 OnboardingPage mounted');
    // User object available
    console.log('🔄 Current step:', currentStep);
    return () => {
      console.log('🚀 OnboardingPage unmounted');
    };
  }, []);

  // Debug: Log when currentStep changes
  // Debug: Log when currentStep changes

  // Debug: Log when selectedTheme changes
  // Debug: Log when selectedTheme changes

  // Early return with debug info if user is not available
  if (!user) {
    console.log('❌ OnboardingPage: No user found');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading...</h2>
          <p className="text-gray-600">Waiting for user authentication</p>
        </div>
      </div>
    );
  }



  const totalSteps = 3;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleApiKeySubmit = async () => {
    if (!geminiApiKey.trim()) {
      setError('Please enter your Gemini API key');
      return;
    }

    setIsValidatingKey(true);
    setError('');

    try {
      // Validate the API key first
      const validation = await validateGeminiApiKey(geminiApiKey);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid API key');
        setIsValidatingKey(false);
        return;
      }

      setIsLoading(true);
      setIsValidatingKey(false);

      // Save the API key and move to next step
      await updateUser({
        geminiKey: geminiApiKey
      });
      
      handleNext();
    } catch (error: any) {
      setError(error.message || 'Failed to save API key');
    } finally {
      setIsLoading(false);
      setIsValidatingKey(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    console.log('🎯 Completing onboarding with theme:', selectedTheme);
    setIsLoading(true);
    setError('');

    try {
      const updateData = {
        onboardingcompleted: true,
        settings: JSON.stringify({
          theme: selectedTheme,
          notifications: true,
          autoSave: true,
          language: 'en'
        })
      };
      
      console.log('🎯 Updating user with data:', updateData);
      await updateUser(updateData);
      
      console.log('🎯 Onboarding completed, refreshing user state...');
      
      // Refresh user state to ensure onboarding status is updated
      const refreshedUser = await refreshUser();
      
      console.log('🎯 User state refreshed:', refreshedUser);
      console.log('🎯 Onboarding status after refresh:', refreshedUser?.onboardingcompleted);
      console.log('🎯 User state refreshed, applying theme and navigating to dashboard');
      // Apply theme before navigating
      setTheme(selectedTheme);
      // Applying theme
      
      // Force a complete refresh of the user state
      console.log('🎯 Forcing complete user state refresh...');
      
      // Clear any cached user data and refresh
      const { databaseService } = await import('@/services/database');
      const userDoc = await databaseService.getUserDocument(user?.$id || '');
      console.log('🎯 Fresh user document from DB:', userDoc);
      
      // Small delay to ensure state is updated
      setTimeout(() => {
        console.log('🎯 Navigating to dashboard...');
        navigate('/dashboard');
      }, 500);
      
    } catch (error: any) {
      console.error('Onboarding completion error:', error);
      setError(error.message || 'Failed to complete onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  // const handleSkip = async () => {
  //   try {
  //     await updateUser({
  //       onboardingcompleted: true,
  //       settings: JSON.stringify({
  //         theme: selectedTheme,
  //         notifications: true,
  //         autoSave: true,
  //         language: 'en'
  //       })
  //     });
      
  //     // Just navigate - theme will be applied by dashboard
  //     navigate('/dashboard');
      
  //   } catch (error) {
  //     console.error('Failed to update onboarding status:', error);
  //     navigate('/dashboard'); // Navigate anyway
  //   }
  // };

  console.log('🎨 OnboardingPage render called, currentStep:', currentStep);

  // Add a simple test div to see if component renders at all
  if (process.env.NODE_ENV === 'development') {
    console.log('🧪 OnboardingPage: Rendering in development mode');
  }

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
        {/* Fallback for browsers that don't support video */}
        Your browser does not support the video tag.
      </video>
      
      {/* Dark overlay for better text readability */}
      <div className="video-overlay" />
      
      {/* Content */}
      <div className="content-container">
        {/* Debug indicator */}
        <div className="fixed top-4 right-4 bg-green-500 text-white px-3 py-1 rounded text-sm z-50">
          Onboarding Loaded
        </div>
        
        <div className="max-w-2xl w-full bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Welcome */}
        {currentStep === 1 && (
          <div className="text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to Felearn! 🎉
              </h1>
              <p className="text-gray-600 text-lg">
                Your AI-powered storytelling platform that explains complex concepts using adorable tiny cats!
              </p>
            </div>

            <div className="bg-indigo-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-indigo-900 mb-3">What you can do:</h3>
              <ul className="text-left space-y-2 text-indigo-800">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></span>
                  Generate visual stories with AI-powered illustrations
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></span>
                  Explain complex topics using cute cat metaphors
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></span>
                  Save, organize, and export your stories
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></span>
                  Share knowledge in an engaging, visual way
                </li>
              </ul>
            </div>

            <button
              onClick={handleNext}
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Let's Get Started!
            </button>
          </div>
        )}

        {/* Step 2: API Key Setup */}
        {currentStep === 2 && (
          <div>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3a1 1 0 011-1h2.586l6.414-6.414A6 6 0 0119 9z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Set Up Your Gemini API Key
              </h2>
              <p className="text-gray-600">
                To generate AI-powered stories and illustrations, you'll need a Google Gemini API key.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-medium text-yellow-800 mb-1">How to get your API key:</h4>
                  <ol className="text-sm text-yellow-700 space-y-1">
                    <li>1. Visit <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-800">Google AI Studio</a></li>
                    <li>2. Sign in with your Google account</li>
                    <li>3. Click "Create API Key"</li>
                    <li>4. Copy the generated key and paste it below</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gemini API Key
              </label>
              <input
                type="password"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {error && (
                <p className="text-red-600 text-sm mt-2">{error}</p>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handlePrevious}
                className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleApiKeySubmit}
                disabled={isLoading || isValidatingKey || !geminiApiKey.trim()}
                className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {isValidatingKey ? 'Validating...' : isLoading ? 'Saving...' : 'Continue'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Theme Selection & Ready to Go */}
        {currentStep === 3 && (
          <div>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Choose Your Theme
              </h2>
              <p className="text-gray-600">
                Select your preferred theme for the best experience.
              </p>
            </div>

            <div className="mb-8">
              <div className="grid grid-cols-2 gap-4">
                {/* Light Theme */}
                <button
                  onClick={() => {
                    console.log('🎨 Light theme clicked, current step:', currentStep);
                    setSelectedTheme('light');
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedTheme === 'light'
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="bg-white rounded-lg p-3 mb-3 shadow-sm">
                    <div className="h-2 bg-gray-200 rounded mb-2"></div>
                    <div className="h-2 bg-gray-100 rounded w-3/4"></div>
                  </div>
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="font-medium text-gray-900">Light</span>
                  </div>
                </button>

                {/* Dark Theme */}
                <button
                  onClick={() => {
                    console.log('🎨 Dark theme clicked, current step:', currentStep);
                    console.log('🎨 Selected theme set to dark');
                    setSelectedTheme('dark');
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedTheme === 'dark'
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="bg-gray-800 rounded-lg p-3 mb-3 shadow-sm">
                    <div className="h-2 bg-gray-600 rounded mb-2"></div>
                    <div className="h-2 bg-gray-700 rounded w-3/4"></div>
                  </div>
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    <span className="font-medium text-gray-900">Dark</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Tips:</h3>
              <ul className="text-left space-y-2 text-gray-700">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></span>
                  Try prompts like "Explain quantum physics" or "How does the internet work?"
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                  The more specific your prompt, the better the story will be
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-pink-400 rounded-full mr-3"></span>
                  All your stories are automatically saved to your library
                </li>
              </ul>
            </div>

            {error && (
              <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={handlePrevious}
                className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleCompleteOnboarding}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Setting up...' : 'Start Creating Stories!'}
              </button>
            </div>
          </div>
        )}
        </div>
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
    
    @media (max-width: 768px) {
      background: rgba(0, 0, 0, 0.3);
    }
    
    @media (max-width: 480px) {
      background: rgba(0, 0, 0, 0.25);
    }
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

// Wrap with error boundary
const OnboardingPageWithErrorBoundary: React.FC = () => (
  <OnboardingErrorBoundary>
    <OnboardingPage />
  </OnboardingErrorBoundary>
);

export default OnboardingPageWithErrorBoundary;