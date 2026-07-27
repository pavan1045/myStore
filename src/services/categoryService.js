import { getAuthHeaders, API_BASE_URL } from '../utils/api';
const API_URL = `${API_BASE_URL}/categories`;

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

export const categoryService = {
    async getAll() {
        try {
            const res = await fetch(API_URL, { headers: getAuthHeaders() });
            if (!res.ok) {
                if (res.status === 401) handleResponseError(res);
                throw new Error('Failed to fetch categories');
            }
            return await res.json();
        } catch (error) {
            console.error('Error getting categories:', error);
            return [];
        }
    },

    async add(name, description = '') {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ name, description })
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
    }
};

