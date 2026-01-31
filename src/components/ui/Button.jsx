import React from 'react';
import { cn } from '../../utils/utils';

export const Button = React.forwardRef(({ className, variant = 'primary', size = 'md', ...props }, ref) => {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm focus-visible:ring-blue-500',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm focus-visible:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm focus-visible:ring-red-500',
    ghost: 'hover:bg-gray-100 text-gray-700',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
  };

  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 py-2',
    lg: 'h-12 px-6 text-lg',
    icon: 'h-10 w-10 p-0 flex items-center justify-center',
  };

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});

Button.displayName = 'Button';
