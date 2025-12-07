
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  onClick,
  interactive = false
}) => {
  return (
    <div 
      onClick={onClick}
      className={`
        bg-white dark:bg-night-900 
        rounded-2xl border border-earth-200 dark:border-night-800 
        shadow-card dark:shadow-none
        transition-all duration-200
        ${interactive ? 'cursor-pointer hover:border-earth-300 dark:hover:border-night-700 hover:shadow-soft dark:hover:bg-night-800' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`mb-3 ${className}`}>
    {children}
  </div>
);

export const CardTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-xl font-serif font-bold text-earth-900 dark:text-earth-100 leading-tight">
    {children}
  </h3>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`text-earth-600 dark:text-night-300 ${className}`}>
    {children}
  </div>
);
