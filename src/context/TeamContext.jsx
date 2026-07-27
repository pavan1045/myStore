import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { teamService } from '../services/teamService';

const TeamContext = createContext(null);

export function TeamProvider({ children }) {
  const [team, setTeam] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshTeam = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setTeam(null);
      setActivityLogs([]);
      setLoading(false);
      return;
    }

    try {
      const [teamData, logsData] = await Promise.all([
        teamService.getCurrentTeam(),
        teamService.getActivityLogs()
      ]);
      setTeam(teamData);
      setActivityLogs(logsData || []);
    } catch (error) {
      console.error('Failed to load team data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshTeam();
  }, [refreshTeam]);

  const actions = useMemo(() => ({
    refreshTeam,
    async updateTeamName(name) {
      const res = await teamService.updateTeamName(name);
      await refreshTeam();
      return res;
    },
    async createInvite(email = '', phone = '') {
      const res = await teamService.createInvite(email, phone);
      await refreshTeam();
      return res;
    },
    async acceptInvite(token) {
      const res = await teamService.acceptInvite(token);
      await refreshTeam();
      // Also reload window to update inventory / supplier context data
      window.location.reload();
      return res;
    },
    async declineInvite(token) {
      const res = await teamService.declineInvite(token);
      await refreshTeam();
      return res;
    },
    async removeMember(memberId) {
      const res = await teamService.removeMember(memberId);
      await refreshTeam();
      return res;
    },
    async enableMember(memberId) {
      const res = await teamService.enableMember(memberId);
      await refreshTeam();
      return res;
    }
  }), [refreshTeam]);

  const value = useMemo(() => ({
    team,
    activityLogs,
    loading,
    actions
  }), [team, activityLogs, loading, actions]);

  return (
    <TeamContext.Provider value={value}>
      {children}
    </TeamContext.Provider>
  );
}

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
};
