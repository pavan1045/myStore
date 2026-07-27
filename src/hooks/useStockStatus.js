import { useMemo } from 'react';
import { getStockStatus, getStatusVariant } from '../utils/stockUtils';

/**
 * Hook to get stock status and UI properties for an item.
 * @param {number} stockQty - Current stock
 * @param {number} minQty - Min threshold
 */
export function useStockStatus(stockQty, minQty) {
    return useMemo(() => {
        const status = getStockStatus(stockQty, minQty);
        const variant = getStatusVariant(status);

        return {
            status,
            variant,
            isLow: status === 'LOW',
            isOut: status === 'OUT',
            label: status.replace('_', ' '), // e.g. "OUT OF STOCK" if we had that
            badgeProps: {
                variant,
                label: status === 'IN' ? 'In Stock' : status === 'LOW' ? 'Low Stock' : 'Out of Stock'
            }
        };
    }, [stockQty, minQty]);
}
