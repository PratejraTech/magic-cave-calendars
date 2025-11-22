import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  productType?: 'calendar' | 'storybook' | 'interactive_game';
  theme?: string;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * ErrorBoundary - Product-specific error handling component
 *
 * Catches JavaScript errors anywhere in the product component tree,
 * logs them, and displays a product-appropriate fallback UI.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // TODO: Implement proper logging service

    // Log to analytics/monitoring service
    this.logError(error, errorInfo);

    this.setState({
      error,
      errorInfo
    });
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    // In a real app, this would send to monitoring service
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      productType: this.props.productType,
      theme: this.props.theme,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // TODO: Implement proper logging service

    // Could send to analytics service here
    // analytics.track('product_error', errorData);
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReport = () => {
    // In a real app, this would open a feedback form or send error report
    alert('Error report sent. Thank you for helping us improve!');
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback
        productType={this.props.productType}
        theme={this.props.theme}
        error={this.state.error}
        onRetry={this.handleRetry}
        onReport={this.handleReport}
      />;
    }

    return this.props.children;
  }
}

/**
 * ErrorFallback - Product-specific error display component
 */
interface ErrorFallbackProps {
  productType?: 'calendar' | 'storybook' | 'interactive_game';
  theme?: string;
  error?: Error;
  onRetry: () => void;
  onReport: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  productType = 'calendar',
  theme = 'default',
  error,
  onRetry,
  onReport
}) => {
  // Theme-aware styling
  const getThemeStyles = () => {
    switch (theme) {
      case 'snow':
      case 'christmas':
        return {
          background: 'bg-gradient-to-br from-blue-300 via-cyan-300 to-indigo-400',
          textColor: 'text-blue-800',
          buttonColor: 'bg-red-500 hover:bg-red-600'
        };
      case 'warm':
      case 'winter':
        return {
          background: 'bg-gradient-to-br from-amber-200 via-orange-200 to-yellow-300',
          textColor: 'text-amber-800',
          buttonColor: 'bg-orange-500 hover:bg-orange-600'
        };
      case 'candy':
        return {
          background: 'bg-gradient-to-br from-pink-400 via-red-400 to-yellow-400',
          textColor: 'text-pink-800',
          buttonColor: 'bg-pink-500 hover:bg-pink-600'
        };
      case 'forest':
        return {
          background: 'bg-gradient-to-br from-green-400 via-emerald-400 to-teal-500',
          textColor: 'text-green-800',
          buttonColor: 'bg-green-500 hover:bg-green-600'
        };
      case 'starlight':
      case 'magical':
        return {
          background: 'bg-gradient-to-br from-purple-300 via-pink-300 to-indigo-400',
          textColor: 'text-purple-800',
          buttonColor: 'bg-purple-500 hover:bg-purple-600'
        };
      default:
        return {
          background: 'bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300',
          textColor: 'text-gray-800',
          buttonColor: 'bg-gray-500 hover:bg-gray-600'
        };
    }
  };

  const styles = getThemeStyles();

  // Product-specific error messages
  const getErrorMessage = () => {
    switch (productType) {
      case 'calendar':
        return {
          title: 'Oops! Calendar Magic Failed',
          message: 'Something went wrong loading your advent calendar. Don\'t worry, your progress is safe!',
          icon: '🎄'
        };
      case 'storybook':
        return {
          title: 'Story Time Interrupted',
          message: 'We encountered an issue loading your storybook. Let\'s try again!',
          icon: '📚'
        };
      case 'interactive_game':
        return {
          title: 'Game Glitch Detected',
          message: 'Your adventure hit a bump! Ready to continue the fun?',
          icon: '🎮'
        };
      default:
        return {
          title: 'Something Went Wrong',
          message: 'We encountered an unexpected error. Please try again.',
          icon: '⚠️'
        };
    }
  };

  const errorMessage = getErrorMessage();

  return (
    <motion.div
      className={`min-h-screen flex items-center justify-center p-4 ${styles.background}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Error Icon */}
        <motion.div
          className="text-6xl mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
        >
          {errorMessage.icon}
        </motion.div>

        {/* Error Title */}
        <motion.h1
          className={`text-2xl font-bold mb-4 ${styles.textColor}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {errorMessage.title}
        </motion.h1>

        {/* Error Message */}
        <motion.p
          className="text-gray-600 mb-6 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {errorMessage.message}
        </motion.p>

        {/* Error Details (in development) */}
        {process.env.NODE_ENV === 'development' && error && (
          <motion.details
            className="mb-6 text-left bg-gray-50 p-3 rounded-lg text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <summary className="cursor-pointer font-medium text-gray-700 mb-2">
              Error Details (Development)
            </summary>
            <pre className="text-red-600 whitespace-pre-wrap break-words">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </motion.details>
        )}

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <button
            onClick={onRetry}
            className={`px-6 py-3 ${styles.buttonColor} text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            Try Again
          </button>

          <button
            onClick={onReport}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Report Issue
          </button>
        </motion.div>

        {/* Support Message */}
        <motion.p
          className="text-sm text-gray-500 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          If the problem persists, please contact our support team.
        </motion.p>
      </div>
    </motion.div>
  );
};

export default ErrorBoundary;