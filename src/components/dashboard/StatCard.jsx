import React from 'react';
import { cn } from '../../utils/utils';

export function StatCard({ title, value, icon: Icon, variant = 'primary', className }) {
    const variants = {
        primary: 'border-blue-100 bg-blue-50/50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-400',
        warning: 'border-yellow-100 bg-yellow-50/50 text-yellow-700 dark:border-yellow-900/50 dark:bg-yellow-950/40 dark:text-yellow-400',
        danger: 'border-red-100 bg-red-50/50 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400',
        success: 'border-green-100 bg-green-50/50 text-green-700 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-400',
        secondary: 'border-gray-100 bg-gray-50/50 text-gray-700 dark:border-gray-700 dark:bg-gray-700/50 dark:text-gray-300',
    };

    return (
        <div className={cn(
            "p-6 rounded-xl border bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4 transition-all hover:shadow-md",
            className
        )}>
            <div className={cn("p-3 rounded-lg border", variants[variant])}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
            </div>
        </div>
    );
}

