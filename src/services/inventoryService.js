import { getAuthHeaders } from '../utils/api';
const API_URL = import.meta.env.VITE_API_URL + '/inventory';

const handleResponseError = async (res) => {
    let errorMessage = 'Request failed';
    try {
        const data = await res.json();
        errorMessage = data.error || errorMessage;
    } catch (e) {
        // failed to parse JSON
    }

    if (res.status === 401 || errorMessage.toLowerCase().includes('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/signup')) {
            window.location.href = '/login';
        }
    }

    throw new Error(errorMessage);
};

export const inventoryService = {
    async getAll() {
        try {
            const res = await fetch(API_URL, { headers: getAuthHeaders() });
            if (!res.ok) {
                if (res.status === 401) await handleResponseError(res);
                throw new Error('Failed to fetch inventory');
            }
            return await res.json();
        } catch (error) {
            console.error('Error getting inventory:', error);
            return [];
        }
    },

    async add(item) {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(item)
        });
        if (!res.ok) await handleResponseError(res);
        return await res.json();
    },

    async update(id, updates) {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(updates)
        });
        if (!res.ok) await handleResponseError(res);
        return await res.json();
    },

    async delete(id) {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!res.ok) await handleResponseError(res);
        return await res.json();
    },

    async adjustStock(id, amount) {
        // Fetch current item to update stock
        const items = await this.getAll();
        const item = items.find(i => i.id === id);
        if (!item) throw new Error('Item not found');

        const newStock = Math.max(0, (item.stockQty || 0) + amount);
        return this.update(id, { stockQty: newStock });
    },

    async exportDataJSON() {
        const items = await this.getAll();
        return JSON.stringify(items, null, 2);
    },

    async exportDataCSV() {
        const items = await this.getAll();
        if (!items.length) return '';
        const headers = ['id', 'name', 'modelNumber', 'supplierName', 'categoryId', 'stockQty', 'minQty', 'costPrice', 'sellingPrice', 'shelfLocation'];
        const csvRows = [headers.join(',')];
        for (const row of items) {
            const values = headers.map(header => {
                const val = row[header] ? String(row[header]).replace(/"/g, '""') : '';
                return `"${val}"`;
            });
            csvRows.push(values.join(','));
        }
        return csvRows.join('\n');
    },

    async importDataJSON(jsonString) {
        throw new Error("Import is currently disabled in cloud mode. Please use MongoDB Atlas console for bulk imports.");
    }
};
