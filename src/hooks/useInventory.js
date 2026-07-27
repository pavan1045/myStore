import { useMemo } from 'react';
import { useInventoryContext } from '../context/InventoryContext';

export function useInventory() {
    const { items, actions, loading } = useInventoryContext();

    return {
        allItems: items,
        actions,
        loading
    };
}
