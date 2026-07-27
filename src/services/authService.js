import { getAuthHeaders, API_BASE_URL } from '../utils/api';
const API_URL = `${API_BASE_URL}/auth`;

export const authService = {
    async login(username, password, inviteToken = null) {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, inviteToken })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Login failed');
        return data;
    },

    async signup(username, password, inviteToken = null, joinTeam = true) {
        const response = await fetch(`${API_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, inviteToken, joinTeam })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Signup failed');
        return data;
    },

    async changePassword(currentPassword, newPassword) {
        const response = await fetch(`${API_URL}/change-password`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ currentPassword, newPassword })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Password change failed');
        return data;
    },

    async getProfile() {
        const response = await fetch(`${API_URL}/me`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch profile');
        return data;
    },

    async updateProfile(firstName, lastName) {
        const response = await fetch(`${API_URL}/profile`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ firstName, lastName })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to update profile');
        return data;
    },

    async deleteAccount() {
        const response = await fetch(`${API_URL}/account`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to delete account');
        return data;
    }
};
