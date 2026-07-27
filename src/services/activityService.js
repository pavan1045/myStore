import { getAuthHeaders } from '../utils/api';
const API_URL = import.meta.env.VITE_API_URL + '/activities';

export const ACTIVITY_TYPES = {
    ITEM_CREATED: 'ITEM_CREATED',
    ITEM_UPDATED: 'ITEM_UPDATED',
    ITEM_DELETED: 'ITEM_DELETED',
    STOCK_INCREASED: 'STOCK_INCREASED',
    STOCK_DECREASED: 'STOCK_DECREASED',
    CATEGORY_CREATED: 'CATEGORY_CREATED',
    CATEGORY_UPDATED: 'CATEGORY_UPDATED',
    CATEGORY_DELETED: 'CATEGORY_DELETED'
};

export const activityService = {
    async getRecent(limit = 10) {
        try {
            const res = await fetch(`${API_URL}?limit=${limit}`, { headers: getAuthHeaders() });
            if (!res.ok) throw new Error('Failed to fetch activities');
            return await res.json();
        } catch (error) {
            console.error('Error getting activities:', error);
            return [];
        }
    }
};
