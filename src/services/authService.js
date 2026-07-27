import { getAuthHeaders, API_BASE_URL, handleApiResponse } from '../utils/api';
const API_URL = `${API_BASE_URL}/auth`;

export const authService = {
    async login(username, password, inviteToken = null) {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, inviteToken })
        });
        return handleApiResponse(response);
    },

    async signup(username, password, inviteToken = null, joinTeam = true) {
        const response = await fetch(`${API_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, inviteToken, joinTeam })
        });
        return handleApiResponse(response);
    },

    async changePassword(currentPassword, newPassword) {
        const response = await fetch(`${API_URL}/change-password`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ currentPassword, newPassword })
        });
        return handleApiResponse(response);
    },

    async getProfile() {
        const response = await fetch(`${API_URL}/me`, {
            headers: getAuthHeaders()
        });
        return handleApiResponse(response);
    },

    async updateProfile(firstName, lastName) {
        const response = await fetch(`${API_URL}/profile`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ firstName, lastName })
        });
        return handleApiResponse(response);
    },

    async deleteAccount() {
        const response = await fetch(`${API_URL}/account`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return handleApiResponse(response);
    }
};
