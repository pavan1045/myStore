import { getAuthHeaders, API_BASE_URL } from '../utils/api';
const API_URL = `${API_BASE_URL}/team`;

export const teamService = {
  async getCurrentTeam() {
    const response = await fetch(`${API_URL}/current`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch team details');
    return data;
  },

  async updateTeamName(team_name) {
    const response = await fetch(`${API_URL}/name`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ team_name })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to update team name');
    return data;
  },

  async createInvite(invited_email = '', invited_phone = '') {
    const response = await fetch(`${API_URL}/invite`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ invited_email, invited_phone })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to create invitation');
    return data;
  },

  async verifyInviteToken(token) {
    const response = await fetch(`${API_URL}/invite/verify/${token}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Invalid or expired invitation link');
    return data;
  },

  async acceptInvite(invite_token) {
    const response = await fetch(`${API_URL}/invite/accept`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ invite_token })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to accept invitation');
    return data;
  },

  async declineInvite(invite_token) {
    const response = await fetch(`${API_URL}/invite/decline`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ invite_token })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to decline invitation');
    return data;
  },

  async removeMember(memberId) {
    let response = await fetch(`${API_URL}/members/${memberId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok && response.status === 404) {
      response = await fetch(`${API_URL}/members/${memberId}/remove`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
    }
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to remove team member');
    return data;
  },

  async enableMember(memberId) {
    const response = await fetch(`${API_URL}/members/${memberId}/enable`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to enable team member');
    return data;
  },

  async getActivityLogs() {
    const response = await fetch(`${API_URL}/activity`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch team activity logs');
    return data;
  }
};
