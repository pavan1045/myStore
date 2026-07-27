import React, { useState } from 'react';
import { Database, User as UserIcon, Users, ChevronRight } from 'lucide-react';
import { UserSettingsDetail } from '../components/settings/UserSettingsDetail';
import { DataSettingsDetail } from '../components/settings/DataSettingsDetail';
import { TeamSettingsDetail } from '../components/settings/TeamSettingsDetail';
import { useTeam } from '../context/TeamContext';

export default function Settings() {
  const [activeView, setActiveView] = useState('summary'); // 'summary' | 'user' | 'data' | 'team'
  const { team } = useTeam();
  const isOwner = team?.current_user_role === 'Owner';

  // If a detail view is active, render it instead of the summary cards
  if (activeView === 'user') {
    return <UserSettingsDetail onBack={() => setActiveView('summary')} />;
  }
  if (activeView === 'data') {
    return <DataSettingsDetail onBack={() => setActiveView('summary')} />;
  }
  if (activeView === 'team' && isOwner) {
    return <TeamSettingsDetail onBack={() => setActiveView('summary')} />;
  }

  // Summary View
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Application Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your account, preferences, and system data.</p>
      </div>

      <div className={`grid grid-cols-1 ${isOwner ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
        
        {/* Team Members Summary Card (Owner Only) */}
        {isOwner && (
          <button 
            onClick={() => setActiveView('team')}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-purple-200 dark:hover:border-purple-800 transition-all text-left flex flex-col items-start group"
          >
            <div className="flex items-center justify-between w-full mb-4">
              <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Users size={24} />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Team Members</h2>
              </div>
              <ChevronRight className="text-gray-400 group-hover:text-purple-600 transition-colors" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Manage your shared business workspace, invite team members, assign roles, and track audit activities.
            </p>
            <div className="mt-auto flex flex-wrap gap-2 w-full pt-2 border-t border-gray-50 dark:border-gray-700/50">
              <span className="px-2 py-1 bg-purple-50 dark:bg-purple-900/30 text-xs font-bold text-purple-700 dark:text-purple-300 rounded-md">
                {team?.team_name || 'My Team'}
              </span>
              <span className="px-2 py-1 bg-gray-50 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 rounded-md">
                {team?.total_members || 1} Members
              </span>
            </div>
          </button>
        )}

        {/* User Settings Summary Card */}
        <button 
          onClick={() => setActiveView('user')}
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all text-left flex flex-col items-start group"
        >
          <div className="flex items-center justify-between w-full mb-4">
            <div className="flex items-center gap-3 text-blue-600">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <UserIcon size={24} />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">User Settings</h2>
            </div>
            <ChevronRight className="text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            Manage your personal profile information, update your security password, and customize your display mode preferences.
          </p>
          <div className="mt-auto flex gap-2">
            <span className="px-2 py-1 bg-gray-50 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 rounded-md">Profile</span>
            <span className="px-2 py-1 bg-gray-50 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 rounded-md">Security</span>
            <span className="px-2 py-1 bg-gray-50 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 rounded-md">Theme</span>
          </div>
        </button>

        {/* Data Management Summary Card */}
        <button 
          onClick={() => setActiveView('data')}
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-green-200 dark:hover:border-green-800 transition-all text-left flex flex-col items-start group"
        >
          <div className="flex items-center justify-between w-full mb-4">
            <div className="flex items-center gap-3 text-green-600">
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Database size={24} />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Exports and Imports</h2>
            </div>
            <ChevronRight className="text-gray-400 group-hover:text-green-600 transition-colors" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            Safeguard your data by exporting full database backups, generating CSV reports, or restoring from a previous snapshot.
          </p>
          <div className="mt-auto flex gap-2">
            <span className="px-2 py-1 bg-gray-50 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 rounded-md">Backups</span>
            <span className="px-2 py-1 bg-gray-50 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 rounded-md">CSV Exports</span>
          </div>
        </button>

      </div>
    </div>
  );
}
