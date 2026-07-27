import { STOCK_STATUS } from './constants';

/**
 * Centeralized logic for determining stock status.
 * @param {number} stockQty - Current stock quantity
 * @param {number} minQty - Minimum threshold for low stock alert
 * @returns {string} - Status from STOCK_STATUS
 */
export const getStockStatus = (stockQty, minQty = 2) => {
    if (stockQty <= 0) return STOCK_STATUS.OUT;
    if (stockQty <= minQty) return STOCK_STATUS.LOW;
    return STOCK_STATUS.IN;
};

/**
 * Helper to get status color/variant for UI components
 * @param {string} status - Status from STOCK_STATUS
 * @returns {string} - Color variant
 */
export const getStatusVariant = (status) => {
    switch (status) {
        case STOCK_STATUS.OUT:
            return 'danger';
        case STOCK_STATUS.LOW:
            return 'warning';
        case STOCK_STATUS.IN:
            return 'success';
        default:
            return 'secondary';
    }
};
