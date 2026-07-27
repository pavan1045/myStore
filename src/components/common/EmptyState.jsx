import React from 'react';
import { PackageSearch } from 'lucide-react';
import { cn } from '../../utils/utils';

export function EmptyState({
    title = "No data found",
    message = "Try adjusting your search or add a new record.",
    icon: Icon = PackageSearch,
    className
}) {
    return (
        <div className={cn("flex flex-col items-center justify-center p-12 text-center", className)}>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-full mb-4">
                <Icon size={48} className="text-gray-300 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">{message}</p>
        </div>
    );
}

