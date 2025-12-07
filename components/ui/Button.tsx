import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon,
  className = '',
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-night-900 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-leaf-700 hover:bg-leaf-800 dark:bg-leaf-600 dark:hover:bg-leaf-700 text-white shadow-soft shadow-leaf-700/20 focus:ring-leaf-500",
    secondary: "bg-earth-200 hover:bg-earth-300 dark:bg-night-800 dark:hover:bg-night-700 text-earth-800 dark:text-earth-100 focus:ring-earth-400",
    outline: "border-2 border-earth-300 dark:border-night-600 text-earth-700 dark:text-earth-200 hover:bg-earth-100 dark:hover:bg-night-800 focus:ring-earth-400",
    ghost: "text-earth-600 dark:text-night-400 hover:bg-earth-100 dark:hover:bg-night-800 hover:text-earth-800 dark:hover:text-earth-100",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-4 py-2.5 text-base gap-2",
    lg: "px-6 py-3.5 text-lg gap-2.5",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <span className="w-5 h-5 flex items-center justify-center">{icon}</span>}
      {children}
    </button>
  );
};