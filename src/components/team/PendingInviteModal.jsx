import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Users, CheckCircle2, XCircle } from 'lucide-react';
import { useTeam } from '../../context/TeamContext';

export function PendingInviteModal({ isOpen, onClose, pendingInvite }) {
  const { actions } = useTeam();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!pendingInvite) return null;

  const handleAccept = async () => {
    setIsSubmitting(true);
    try {
      await actions.acceptInvite(pendingInvite.invite_token);
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to accept invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDecline = async () => {
    setIsSubmitting(true);
    try {
      await actions.declineInvite(pendingInvite.invite_token);
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to decline invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Team Invitation"
    >
      <div className="space-y-6 text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center">
          <Users size={28} />
        </div>

        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">You have been invited to join</p>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
            {pendingInvite.team_name}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Accepting will grant you shared access to manage products, inventory, suppliers, sales, and payments together with the team.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
          <Button
            variant="secondary"
            onClick={handleDecline}
            disabled={isSubmitting}
            className="text-gray-600 dark:text-gray-300"
          >
            <XCircle size={16} className="mr-2 text-red-500" /> Decline
          </Button>
          <Button
            onClick={handleAccept}
            isLoading={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <CheckCircle2 size={16} className="mr-2" /> Accept Invitation
          </Button>
        </div>
      </div>
    </Modal>
  );
}
