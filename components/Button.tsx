
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  fullWidth?: boolean;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  loading = false,
  className = '',
  disabled,
  ...props 
}) => {
  // Modern rounded-full (pill) shape, bolder font
  const baseStyles = "px-8 py-4 rounded-full font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";
  
  const variants = {
    // Orange text/bg for maximum contrast and "Grind" look
    // Updated shadow to rgba(255, 85, 0, ...) for Electric Orange
    primary: "bg-primary hover:bg-orange-400 text-black shadow-[0_0_20px_-5px_rgba(255,85,0,0.4)] hover:shadow-[0_0_25px_-5px_rgba(255,85,0,0.6)]",
    secondary: "bg-surface-highlight hover:bg-zinc-700 text-white border border-zinc-700",
    outline: "bg-transparent border-2 border-zinc-700 text-zinc-400 hover:text-white hover:border-white",
    danger: "bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20"
  };

  return (
    <button 
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>WAIT...</span>
        </>
      ) : children}
    </button>
  );
};
