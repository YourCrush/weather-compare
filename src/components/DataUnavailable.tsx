import React from 'react';

interface DataUnavailableProps {
  title?: string;
  message?: string;
  icon?: 'weather' | 'network' | 'data' | 'location' | 'chart';
  actionButton?: {
    text: string;
    onClick: () => void;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const DataUnavailable: React.FC<DataUnavailableProps> = ({
  title = 'Data Unavailable',
  message = 'The requested data is currently unavailable. Please try again later.',
  icon = 'data',
  actionButton,
  className = '',
  size = 'md',
}) => {
  const icons = {
    weather: (
      <svg className="w-full h-full text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
    network: (
      <svg className="w-full h-full text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    data: (
      <svg className="w-full h-full text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    location: (
      <svg className="w-full h-full text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    chart: (
      <svg className="w-full h-full text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  };

  const sizes = {
    sm: {
      container: 'py-6',
      icon: 'w-8 h-8',
      title: 'text-sm',
      message: 'text-xs',
      button: 'px-3 py-1 text-xs',
    },
    md: {
      container: 'py-12',
      icon: 'w-12 h-12',
      title: 'text-lg',
      message: 'text-sm',
      button: 'px-4 py-2 text-sm',
    },
    lg: {
      container: 'py-16',
      icon: 'w-16 h-16',
      title: 'text-xl',
      message: 'text-base',
      button: 'px-6 py-3 text-base',
    },
  };

  const sizeConfig = sizes[size];

  return (
    <div className={`text-center ${sizeConfig.container} ${className}`}>
      <div className={`${sizeConfig.icon} mx-auto mb-4`}>
        {icons[icon]}
      </div>
      
      <h3 className={`${sizeConfig.title} font-medium text-gray-900 dark:text-gray-100 mb-2`}>
        {title}
      </h3>
      
      <p className={`${sizeConfig.message} text-gray-500 dark:text-gray-400 max-w-sm mx-auto`}>
        {message}
      </p>

      {actionButton && (
        <button
          onClick={actionButton.onClick}
          className={`
            mt-4 ${sizeConfig.button} bg-primary-600 text-white rounded-md 
            hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 
            focus:ring-offset-2 transition-colors
          `}
        >
          {actionButton.text}
        </button>
      )}
    </div>
  );
};