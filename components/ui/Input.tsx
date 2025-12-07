import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ label, error, icon, className = '', ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-bold text-earth-700 dark:text-earth-300 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-400 dark:text-night-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full bg-white dark:bg-night-950 
            text-earth-900 dark:text-earth-100 
            border border-earth-300 dark:border-night-700 
            rounded-xl 
            focus:ring-2 focus:ring-leaf-500 focus:border-leaf-500 dark:focus:border-leaf-500
            placeholder-earth-400 dark:placeholder-night-500
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200
            ${icon ? 'pl-10' : 'px-4'}
            py-2.5
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-bold text-earth-700 dark:text-earth-300 mb-1">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={`
          w-full bg-white dark:bg-night-950 
          text-earth-900 dark:text-earth-100 
          border border-earth-300 dark:border-night-700 
          rounded-xl 
          focus:ring-2 focus:ring-leaf-500 focus:border-leaf-500 dark:focus:border-leaf-500
          placeholder-earth-400 dark:placeholder-night-500
          transition-colors duration-200
          p-4
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
});

TextArea.displayName = 'TextArea';