export const getApiBaseUrl = () => {
    // 1. If VITE_API_URL environment variable is explicitly provided, use it
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    // 2. Fallback relative /api route for production live hosting (e.g. Render)
    return '/api';
};

export const API_BASE_URL = getApiBaseUrl();

export const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};
