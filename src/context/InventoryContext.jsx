import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { inventoryService } from '../services/inventoryService';
import { categoryService } from '../services/categoryService';
import { activityService } from '../services/activityService';

const InventoryContext = createContext(null);

export function InventoryProvider({ children }) {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    const refreshData = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setItems([]);
            setCategories([]);
            setActivities([]);
            setLoading(false);
            return;
        }

        try {
            const [fetchedItems, fetchedCategories, fetchedActivities] = await Promise.all([
                inventoryService.getAll(),
                categoryService.getAll(),
                activityService.getRecent(10)
            ]);
            setItems(fetchedItems || []);
            setCategories(fetchedCategories || []);
            setActivities(fetchedActivities || []);
        } catch (error) {
            console.error("Failed to load inventory data", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const actions = useMemo(() => ({
        refreshData,
        // Items
        async addItem(item) {
            const res = await inventoryService.add(item);
            await refreshData();
            return res;
        },
        async updateItem(id, updates) {
            const res = await inventoryService.update(id, updates);
            await refreshData();
            return res;
        },
        async deleteItem(id) {
            const res = await inventoryService.delete(id);
            await refreshData();
            return res;
        },
        async adjustStock(id, amount) {
            const res = await inventoryService.adjustStock(id, amount);
            await refreshData();
            return res;
        },

        // Categories
        async addCategory(name, description) {
            const res = await categoryService.add(name, description);
            await refreshData();
            return res;
        },
        async updateCategory(id, updates) {
            const res = await categoryService.update(id, updates);
            await refreshData();
            return res;
        },
        async deleteCategory(id) {
            const res = await categoryService.delete(id);
            await refreshData();
            return res;
        }
    }), [refreshData]);

    const value = useMemo(() => ({
        items,
        categories,
        activities,
        actions,
        refreshData,
        loading
    }), [items, categories, activities, actions, refreshData, loading]);

    return (
        <InventoryContext.Provider value={value}>
            {children}
        </InventoryContext.Provider>
    );
}

export const useInventoryContext = () => {
    const context = useContext(InventoryContext);
    if (!context) {
        throw new Error('useInventoryContext must be used within an InventoryProvider');
    }
    return context;
};
