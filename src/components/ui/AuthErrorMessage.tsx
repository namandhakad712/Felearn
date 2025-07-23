import React from 'react';
import { ErrorDisplayData } from '../../utils/authErrorDisplay';

interface AuthErrorMessageProps {
  errorData: ErrorDisplayData | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Component for displaying authentication errors with helpful information
 */
const AuthErrorMessage: React.FC<AuthErrorMessageProps> = ({
  errorData,
  onRetry,
  onDismiss,
  className = ''
}) => {
  if (!errorData) return null;
  
  const { message, helpText, suggestions, isRetryable, severity } = errorData;
  
  // Get appropriate color based on severity
  const getSeverityColor = () => {
    switch (severity) {
      case 'low':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'medium':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'high':
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };
  
  return (
    <div className={`rounded-md border p-4 mb-4 ${getSeverityColor()} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {/* Error icon */}
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium">{message}</h3>
          
          {/* Help text */}
          {helpText && (
            <div className="mt-2 text-sm">
              <p>{helpText}</p>
            </div>
          )}
          
          {/* Suggestions */}
          {suggestions && suggestions.length > 0 && (
            <div className="mt-2 text-sm">
              <ul className="list-disc pl-5 space-y-1">
                {suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="mt-4">
            <div className="flex space-x-3">
              {isRetryable && onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="rounded-md bg-white px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  Try Again
                </button>
              )}
              
              {onDismiss && (
                <button
                  type="button"
                  onClick={onDismiss}
                  className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthErrorMessage;