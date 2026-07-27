import React, { useMemo } from 'react';
import { Package, AlertTriangle, XCircle, Grid } from 'lucide-react';
import { StatCard } from './StatCard';
import { useInventory } from '../../hooks/useInventory';
import { useCategories } from '../../hooks/useCategories';
import { getStockStatus } from '../../utils/stockUtils';
import { STOCK_STATUS } from '../../utils/constants';

export function DashboardStats() {
    const { allItems, loading: itemsLoading } = useInventory();
    const { categories, loading: catsLoading } = useCategories();

    const stats = useMemo(() => {
        if (!allItems) return null;

        const lowStock = allItems.filter(item => getStockStatus(item.stockQty, item.minQty) === STOCK_STATUS.LOW).length;
        const outOfStock = allItems.filter(item => getStockStatus(item.stockQty, item.minQty) === STOCK_STATUS.OUT).length;

        return [
            {
                title: 'Total Items',
                value: allItems.length,
                icon: Package,
                variant: 'primary'
            },
            {
                title: 'Low Stock',
                value: lowStock,
                icon: AlertTriangle,
                variant: 'warning'
            },
            {
                title: 'Out of Stock',
                value: outOfStock,
                icon: XCircle,
                variant: 'danger'
            },
            {
                title: 'Categories',
                value: categories?.length || 0,
                icon: Grid,
                variant: 'secondary'
            }
        ];
    }, [allItems, categories]);

    if (itemsLoading || catsLoading || !stats) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-100 rounded-xl border border-gray-200" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
                <StatCard key={stat.title} {...stat} />
            ))}
        </div>
    );
}
