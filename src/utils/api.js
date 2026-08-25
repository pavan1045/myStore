export const getApiBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
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

export const handleApiResponse = async (response) => {
    const text = await response.text();
    let data;
    try {
        data = text ? JSON.parse(text) : {};
    } catch (e) {
        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/signup')) {
                window.location.href = '/login';
            }
        }
        if (!response.ok) {
            throw new Error(`Server returned status ${response.status}`);
        }
        throw new Error('Server returned invalid response format. Please check backend deployment URL.');
    }

    if (!response.ok) {
        if (response.status === 401 || (data.error && String(data.error).toLowerCase().includes('token'))) {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/signup')) {
                window.location.href = '/login';
            }
        }
        throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
    }

    return data;
};
