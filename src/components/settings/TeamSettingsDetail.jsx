import React, { useState } from 'react';
import { 
  Users, 
  ArrowLeft, 
  UserPlus, 
  Edit3, 
  ShieldCheck, 
  User, 
  Trash2, 
  Clock, 
  History, 
  Copy, 
  Check, 
  Share2,
  Mail,
  Phone,
  Crown,
  AlertTriangle,
  UserCheck,
  UserX
} from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { TeamInviteModal } from '../team/TeamInviteModal';
import { useTeam } from '../../context/TeamContext';

export function TeamSettingsDetail({ onBack }) {
  const { team, activityLogs, actions, loading } = useTeam();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [copiedToken, setCopiedToken] = useState(null);

  const [memberToDelete, setMemberToDelete] = useState(null);
  const [isDeletingMember, setIsDeletingMember] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isOwner = team?.current_user_role === 'Owner';

  const handleOpenRename = () => {
    setNewTeamName(team?.team_name || '');
    setIsRenameModalOpen(true);
  };

  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    setIsRenaming(true);
    try {
      await actions.updateTeamName(newTeamName.trim());
      setIsRenameModalOpen(false);
    } catch (err) {
      alert(err.message || 'Failed to rename team');
    } finally {
      setIsRenaming(false);
    }
  };

  const handleOpenDisableModal = (memberId, name, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setMemberToDelete({ id: memberId, name });
  };

  const handleConfirmDisable = async () => {
    if (!memberToDelete) return;
    setIsDeletingMember(true);
    try {
      await actions.removeMember(memberToDelete.id);
      setMemberToDelete(null);
    } catch (err) {
      alert(err.message || 'Failed to disable user');
    } finally {
      setIsDeletingMember(false);
    }
  };

  const handleEnableMember = async (memberId, name) => {
    try {
      await actions.enableMember(memberId);
    } catch (err) {
      alert(err.message || 'Failed to enable user');
    }
  };

  const handleCopyLink = (token) => {
    const url = `${window.location.origin}/register?invite=${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft size={20} className="dark:text-white" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                {team?.team_name || "Business Team"}
              </h1>
              {isOwner && (
                <button
                  onClick={handleOpenRename}
                  title="Rename Team"
                  className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Edit3 size={16} />
                </button>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Shared workspace • <span className="font-semibold text-gray-800 dark:text-gray-200">{team?.total_members || 1} Total Members</span>
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          <UserPlus size={16} className="mr-2" /> Invite Member
        </Button>
      </div>

      {/* Member Cards Grid */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" /> Existing Team Members
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 rounded-full">
            {team?.members?.length || 0} Members
          </span>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
          {team?.members?.map((m) => {
            const isMemberOwner = m.role === 'Owner';
            return (
              <div key={m.id || m._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    isMemberOwner 
                      ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700' 
                      : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                  }`}>
                    {isMemberOwner ? <Crown size={18} /> : <User size={18} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 dark:text-white text-sm">
                        {m.name || m.username}
                      </p>
                      {isMemberOwner ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          Owner
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          Member
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">
                      Username: <span className="font-mono text-gray-700 dark:text-gray-300">@{m.username}</span> • Joined {new Date(m.joined_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {m.status === 'Disabled' ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 flex items-center gap-1">
                      <UserX size={12} /> Disabled
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <ShieldCheck size={12} /> Active
                    </span>
                  )}

                  {!isMemberOwner && (
                    m.status === 'Disabled' ? (
                      isOwner ? (
                        <button
                          onClick={() => handleEnableMember(m.id || m._id, m.name || m.username)}
                          title="Enable User"
                          className="px-2.5 py-1 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold"
                        >
                          <UserCheck size={14} /> Enable
                        </button>
                      ) : (
                        <button
                          disabled
                          title="Contact owner to enable user"
                          className="px-2.5 py-1 text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-not-allowed rounded-lg flex items-center gap-1.5 text-xs font-bold opacity-60"
                        >
                          <UserCheck size={14} /> Enable
                        </button>
                      )
                    ) : (
                      isOwner ? (
                        <button
                          onClick={(e) => handleOpenDisableModal(m.id || m._id, m.name || m.username, e)}
                          title="Disable User"
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : (
                        <button
                          disabled
                          title="Contact owner to disable user"
                          className="p-1.5 text-gray-300 dark:text-gray-600 cursor-not-allowed rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      )
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending Invitations Section */}
      {team?.pending_invitations && team.pending_invitations.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" /> Pending Invitations
          </h2>

          <div className="space-y-3">
            {team.pending_invitations.map((inv) => (
              <div key={inv.id || inv._id} className="p-3.5 bg-gray-50 dark:bg-gray-700/40 rounded-xl border border-gray-200 dark:border-gray-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700">
                      Token: {inv.invite_token.substring(0, 10)}...
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      Pending Acceptance
                    </span>
                  </div>
                  {inv.invited_email && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Mail size={12} /> {inv.invited_email}
                    </p>
                  )}
                  {inv.invited_phone && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Phone size={12} /> {inv.invited_phone}
                    </p>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleCopyLink(inv.invite_token)}
                >
                  {copiedToken === inv.invite_token ? (
                    <>
                      <Check size={14} className="mr-1 text-emerald-500" /> Copied Link
                    </>
                  ) : (
                    <>
                      <Copy size={14} className="mr-1" /> Copy Link
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Activity Audit Log */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <History className="h-4 w-4 text-purple-600" /> Team Activity Audit Log
        </h2>

        {activityLogs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No activity recorded for this team yet.</p>
        ) : (
          <div className="relative pl-6 border-l-2 border-gray-100 dark:border-gray-700 space-y-6">
            {activityLogs.map((log) => (
              <div key={log._id || log.id} className="relative group">
                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-white dark:border-gray-800 shadow-sm" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {log.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    By <span className="font-medium text-gray-700 dark:text-gray-300">{log.performed_by || 'Admin'}</span> • {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <TeamInviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />

      <Modal
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        title="Rename Team"
      >
        <form onSubmit={handleRenameSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
              Team Name
            </label>
            <input
              type="text"
              required
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <Button type="button" variant="ghost" onClick={() => setIsRenameModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isRenaming} className="bg-blue-600 hover:bg-blue-700 text-white">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Custom Disable User Confirm Modal */}
      <Modal
        isOpen={!!memberToDelete}
        onClose={() => setMemberToDelete(null)}
        title="Disable User Account"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
            <p className="text-xs font-semibold leading-relaxed">
              Disabling <span className="font-bold underline">{memberToDelete?.name}</span> will immediately terminate their active session and block them from logging into this team workspace.
            </p>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300">
            Are you sure you want to disable this user account?
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setMemberToDelete(null)}
              disabled={isDeletingMember}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              isLoading={isDeletingMember}
              onClick={handleConfirmDisable} 
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Disable User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
