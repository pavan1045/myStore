import { useInventoryContext } from '../context/InventoryContext';

export function useCategories() {
    const { categories, actions, loading } = useInventoryContext();

    return {
        categories,
        actions,
        loading
    };
}
