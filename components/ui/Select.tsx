import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ label, error, icon, children, className = '', ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-bold text-earth-500 dark:text-earth-400 uppercase mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-400 dark:text-night-400 pointer-events-none">
            {icon}
          </div>
        )}
        <select
          ref={ref}
          className={`
            w-full bg-white dark:bg-night-950 
            text-earth-900 dark:text-earth-100 
            border border-earth-300 dark:border-night-700 
            rounded-lg 
            focus:ring-2 focus:ring-leaf-500 focus:border-leaf-500 dark:focus:border-leaf-500
            disabled:opacity-50 disabled:cursor-not-allowed
            appearance-none
            transition-colors duration-200
            ${icon ? 'pl-9' : 'px-3'}
            pr-8 py-2
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        >
          {children}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-earth-400 dark:text-night-400">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';