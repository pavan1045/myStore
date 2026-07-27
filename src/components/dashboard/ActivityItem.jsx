import React, { useMemo } from 'react';
import { Package, Layers, Plus, Edit2, Trash2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { cn, formatRelativeTime } from '../../utils/utils';
import { ACTIVITY_TYPES } from '../../services/activityService';

export const ActivityItem = React.memo(({ activity }) => {
    const config = useMemo(() => {
        const { type, entityName, metadata } = activity;

        switch (type) {
            case ACTIVITY_TYPES.ITEM_CREATED:
                return {
                    icon: Plus,
                    color: 'text-blue-600 bg-blue-50 border-blue-100 dark:text-blue-400 dark:bg-blue-950/40 dark:border-blue-900/50',
                    message: `Item added:`,
                    details: entityName
                };
            case ACTIVITY_TYPES.ITEM_UPDATED:
                return {
                    icon: Edit2,
                    color: 'text-gray-600 bg-gray-50 border-gray-100 dark:text-gray-300 dark:bg-gray-700/50 dark:border-gray-600',
                    message: `Item updated:`,
                    details: entityName
                };
            case ACTIVITY_TYPES.ITEM_DELETED:
                return {
                    icon: Trash2,
                    color: 'text-red-600 bg-red-50 border-red-100 dark:text-red-400 dark:bg-red-950/40 dark:border-red-900/50',
                    message: `Item deleted:`,
                    details: entityName
                };
            case ACTIVITY_TYPES.STOCK_INCREASED:
                return {
                    icon: ArrowUpCircle,
                    color: 'text-green-600 bg-green-50 border-green-100 dark:text-green-400 dark:bg-green-950/40 dark:border-green-900/50',
                    message: `Stock increased:`,
                    details: `${entityName} (+${metadata?.quantityChange})`
                };
            case ACTIVITY_TYPES.STOCK_DECREASED:
                return {
                    icon: ArrowDownCircle,
                    color: 'text-orange-600 bg-orange-50 border-orange-100 dark:text-orange-400 dark:bg-orange-950/40 dark:border-orange-900/50',
                    message: `Stock reduced:`,
                    details: `${entityName} (${metadata?.quantityChange})`
                };
            case ACTIVITY_TYPES.CATEGORY_CREATED:
                return {
                    icon: Plus,
                    color: 'text-blue-600 bg-blue-50 border-blue-100 dark:text-blue-400 dark:bg-blue-950/40 dark:border-blue-900/50',
                    message: `Category added:`,
                    details: entityName
                };
            case ACTIVITY_TYPES.CATEGORY_UPDATED:
                return {
                    icon: Edit2,
                    color: 'text-gray-600 bg-gray-50 border-gray-100 dark:text-gray-300 dark:bg-gray-700/50 dark:border-gray-600',
                    message: `Category updated:`,
                    details: entityName
                };
            case ACTIVITY_TYPES.CATEGORY_DELETED:
                return {
                    icon: Trash2,
                    color: 'text-red-600 bg-red-50 border-red-100 dark:text-red-400 dark:bg-red-950/40 dark:border-red-900/50',
                    message: `Category deleted:`,
                    details: entityName
                };
            default:
                return {
                    icon: Package,
                    color: 'text-gray-400 bg-gray-50 border-gray-100 dark:text-gray-400 dark:bg-gray-700/50 dark:border-gray-600',
                    message: `Activity recorded:`,
                    details: entityName
                };
        }
    }, [activity]);

    const Icon = config.icon;

    return (
        <div className="flex items-start gap-4 p-4 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors rounded-xl group border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
            <div className={cn("p-2 rounded-lg border flex-shrink-0 transition-transform group-hover:scale-110", config.color)}>
                <Icon size={16} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                    <p className="text-sm text-gray-900 dark:text-white leading-snug">
                        <span className="font-bold opacity-75">{config.message}</span>{' '}
                        <span className="font-semibold">{config.details}</span>
                    </p>
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap mt-0.5">
                        {formatRelativeTime(activity.timestamp)}
                    </span>
                </div>
            </div>
        </div>
    );
});

ActivityItem.displayName = 'ActivityItem';

