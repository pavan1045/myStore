import React, { memo } from 'react';
import { Edit2, Trash2, Plus, Minus } from 'lucide-react';
import { Button } from '../common/Button';
import { StatusBadge } from '../common/StatusBadge';
import { useStockStatus } from '../../hooks/useStockStatus';

export const InventoryRow = memo(({ item, onEdit, onDelete, onAdjustStock }) => {
    const { badgeProps } = useStockStatus(item.stockQty, item.minQty);

    return (
        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700/50 last:border-0">
            <td className="px-6 py-4">
                <div className="font-semibold text-gray-900 dark:text-white">{item.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">{item.modelNumber || 'NO SKU'}</div>
            </td>
            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                {item.supplierName || '--'}
            </td>
            <td className="px-6 py-4 text-sm">
                <div className="font-medium text-gray-900 dark:text-white">
                    ${(item.sellingPrice || 0).toFixed(2)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                    Cost: ${(item.costPrice || 0).toFixed(2)}
                </div>
            </td>
            <td className="px-6 py-4">
                <StatusBadge {...badgeProps} />
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => onAdjustStock(item.id, -1)}
                        disabled={item.stockQty <= 0}
                    >
                        <Minus size={14} />
                    </Button>
                    <span className="w-12 text-center font-bold text-gray-900 dark:text-white">{item.stockQty}</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => onAdjustStock(item.id, 1)}
                    >
                        <Plus size={14} />
                    </Button>
                </div>
            </td>
            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                {item.shelfLocation || '--'}
            </td>
            <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(item)}>
                        <Edit2 size={16} className="text-gray-500 dark:text-gray-400" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(item.id)}>
                        <Trash2 size={16} className="text-red-500 dark:text-red-400" />
                    </Button>
                </div>
            </td>
        </tr>
    );
});

InventoryRow.displayName = 'InventoryRow';

