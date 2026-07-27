import React from 'react';
import { Edit2, Trash2, Layers } from 'lucide-react';
import { Button } from '../common/Button';

export function CategoryCard({ category, itemCount, onEdit, onDelete }) {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                    <Layers size={20} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onEdit(category)}>
                        <Edit2 size={14} className="text-gray-600 dark:text-gray-300" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 dark:text-red-400" onClick={() => onDelete(category.id)}>
                        <Trash2 size={14} />
                    </Button>
                </div>
            </div>
            <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{category.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{category.description || 'No description provided.'}</p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-50 dark:border-gray-700/60 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-400 uppercase tracking-wider">Metrics</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{itemCount} Items</span>
            </div>
        </div>
    );
}

