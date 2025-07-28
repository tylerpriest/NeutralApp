import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  className?: string;
  variant?: 'default' | 'page' | 'inline';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  message = 'Loading...',
  className = '',
  variant = 'default'
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'min-h-[100px] p-5',
          spinner: 'w-6 h-6',
          message: 'text-sm mt-3'
        };
      case 'large':
        return {
          container: 'min-h-[400px] p-15',
          spinner: 'w-15 h-15',
          message: 'text-lg mt-6'
        };
      default:
        return {
          container: 'min-h-[200px] p-10',
          spinner: 'w-10 h-10',
          message: 'text-base mt-4'
        };
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'page':
        return 'fixed inset-0 bg-white/95 backdrop-blur-sm z-50 min-h-screen p-0';
      case 'inline':
        return 'min-h-auto p-5 bg-transparent backdrop-blur-none';
      default:
        return 'bg-white/90 backdrop-blur-md rounded-xl';
    }
  };

  const sizeClasses = getSizeClasses();
  const variantClasses = getVariantClasses();

  return (
    <div 
      className={`
        flex flex-col items-center justify-center
        ${sizeClasses.container}
        ${variantClasses}
        ${className}
      `}
      role="status"
      aria-live="polite"
      aria-label={message || "Loading"}
    >
      <div className="relative inline-block">
        <div className={`
          ${sizeClasses.spinner}
          border-3 border-transparent border-t-blue-600 rounded-full
          animate-spin
        `} />
        <div className={`
          absolute top-1 left-1
          ${size === 'small' ? 'w-4.5 h-4.5' : size === 'large' ? 'w-11 h-11' : 'w-7.5 h-7.5'}
          border-3 border-transparent border-r-purple-600 rounded-full
          animate-spin
        `} 
        style={{ animationDelay: '0.2s' }}
        />
        <div className={`
          absolute top-2 left-2
          ${size === 'small' ? 'w-3 h-3' : size === 'large' ? 'w-7.5 h-7.5' : 'w-5 h-5'}
          border-3 border-transparent border-b-pink-400 rounded-full
          animate-spin
        `}
        style={{ animationDelay: '0.4s' }}
        />
      </div>
      {message && (
        <p className={`
          text-gray-600 font-medium text-center max-w-[200px] leading-relaxed
          ${sizeClasses.message}
          ${variant === 'page' ? 'text-gray-800 font-semibold text-xl' : ''}
        `}>
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner; 