import React from 'react';
import { InventoryRow } from './InventoryRow';
import { EmptyState } from '../common/EmptyState';
import { PackageOpen } from 'lucide-react';

export function InventoryTable({ items, onEdit, onDelete, onAdjustStock, isLoading }) {
    if (items.length === 0 && !isLoading) {
        return <EmptyState icon={PackageOpen} title="No items match your filters" />;
    }

    return (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                        <th className="px-6 py-4 font-bold">Product Details</th>
                        <th className="px-6 py-4 font-bold">Supplier</th>
                        <th className="px-6 py-4 font-bold">Price (Cost / Sell)</th>
                        <th className="px-6 py-4 font-bold">Status</th>
                        <th className="px-6 py-4 font-bold text-center">In Stock</th>
                        <th className="px-6 py-4 font-bold">Location</th>
                        <th className="px-6 py-4 font-bold text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                    {items.map((item) => (
                        <InventoryRow
                            key={item.id}
                            item={item}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onAdjustStock={onAdjustStock}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

