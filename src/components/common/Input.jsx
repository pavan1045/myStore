import React from 'react';
import { cn } from '../../utils/utils';

export function Input({ label, error, helperText, className, ...props }) {
    return (
        <div className="space-y-1 w-full">
            {label && (
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {label}
                </label>
            )}
            <input
                className={cn(
                    'flex h-10 w-full rounded-md border border-gray-300 bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-700 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all',
                    error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
                    className
                )}
                {...props}
            />
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            {helperText && !error && <p className="text-xs text-gray-500">{helperText}</p>}
        </div>
    );
}
