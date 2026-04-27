import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  onClick,
  disabled = false,
  ...props 
}) => {
  const variants = {
    primary: 'bg-duo-green border-duo-green-dark text-white',
    secondary: 'bg-duo-blue border-duo-blue-dark text-white',
    tertiary: 'bg-white border-duo-swan text-duo-blue',
    ghost: 'bg-transparent border-transparent text-duo-wolf hover:bg-duo-swan',
    danger: 'bg-duo-red border-duo-red-dark text-white',
    yellow: 'bg-duo-yellow border-duo-yellow-dark text-white',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-xl border-b-2',
    md: 'px-6 py-3 text-base rounded-2xl border-b-4',
    lg: 'px-8 py-4 text-lg rounded-2xl border-b-[6px]',
    full: 'w-full px-6 py-3 text-base rounded-2xl border-b-4',
  };

  return (
    <motion.button
      whileTap={!disabled ? { y: 2, scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={twMerge(
        'duo-button relative group overflow-hidden',
        variants[variant],
        sizes[size],
        disabled && 'opacity-50 cursor-not-allowed border-none translate-y-0 shadow-none',
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
