import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Copy, Check, Share2, QrCode, Mail, Phone, Sparkles } from 'lucide-react';
import { useTeam } from '../../context/TeamContext';

export function TeamInviteModal({ isOpen, onClose }) {
  const { actions, team } = useTeam();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [createdInvite, setCreatedInvite] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const invite = await actions.createInvite(email, phone);
      setCreatedInvite(invite);
    } catch (err) {
      alert(err.message || 'Failed to generate invitation');
    } finally {
      setIsGenerating(false);
    }
  };

  const getInviteUrl = () => {
    if (!createdInvite) return '';
    return `${window.location.origin}/register?invite=${createdInvite.invite_token}`;
  };

  const handleCopy = () => {
    const url = getInviteUrl();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = async () => {
    const url = getInviteUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${team?.team_name || 'My Store'}`,
          text: `You have been invited to join ${team?.team_name} team on myStore!`,
          url: url
        });
      } catch (e) {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const handleCloseModal = () => {
    setCreatedInvite(null);
    setEmail('');
    setPhone('');
    onClose();
  };

  const inviteUrl = getInviteUrl();
  const qrApiUrl = inviteUrl 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(inviteUrl)}`
    : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseModal}
      title="Invite Team Member"
    >
      {!createdInvite ? (
        <form onSubmit={handleGenerate} className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Generate an invitation link for <span className="font-semibold text-gray-800 dark:text-gray-200">{team?.team_name}</span>. Anyone with this link can join your business team.
          </p>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1 flex items-center gap-1.5">
              <Mail size={14} className="text-blue-500" /> Invited Email (Optional)
            </label>
            <input
              type="email"
              placeholder="e.g. member@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1 flex items-center gap-1.5">
              <Phone size={14} className="text-emerald-500" /> Invited Phone (Optional)
            </label>
            <input
              type="tel"
              placeholder="e.g. +91 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isGenerating} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Sparkles className="mr-2 h-4 w-4" /> Generate Invitation Link
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6 text-center animate-in fade-in duration-200">
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
            <Sparkles size={24} />
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Invitation Created!</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Share this secure invitation link with your team member to join <span className="font-semibold text-gray-700 dark:text-gray-200">{team?.team_name}</span>.
            </p>
          </div>

          {/* Invitation Link Input Box */}
          <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-200 dark:border-gray-700">
            <input
              type="text"
              readOnly
              value={inviteUrl}
              className="w-full bg-transparent text-xs font-mono text-gray-700 dark:text-gray-300 focus:outline-none px-2 select-all"
            />
            <Button
              size="sm"
              onClick={handleCopy}
              className={copied ? "bg-emerald-600 text-white" : "bg-blue-600 text-white"}
            >
              {copied ? (
                <>
                  <Check size={14} className="mr-1" /> Copied
                </>
              ) : (
                <>
                  <Copy size={14} className="mr-1" /> Copy
                </>
              )}
            </Button>
          </div>

          {/* Optional QR Code */}
          {qrApiUrl && (
            <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 inline-block shadow-sm">
              <div className="flex items-center justify-center gap-1 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                <QrCode size={14} className="text-blue-500" /> Scan QR Code to Join
              </div>
              <img
                src={qrApiUrl}
                alt="Invitation QR Code"
                className="w-40 h-40 mx-auto rounded-lg"
              />
            </div>
          )}

          <div className="flex justify-center gap-3 pt-2">
            <Button variant="secondary" onClick={handleShare}>
              <Share2 size={16} className="mr-2" /> Share Link
            </Button>
            <Button onClick={handleCloseModal}>
              Done
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
