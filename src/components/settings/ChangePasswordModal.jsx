import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useAuth } from '../../auth/AuthContext';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export function ChangePasswordModal({ isOpen, onClose }) {
  const { changePassword } = useAuth();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setSuccess('Password updated successfully!');
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to change password.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPasswordInput = (id, label, value, setter, show, setShow) => (
    <div className="space-y-1">
      <label htmlFor={id} className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 dark:text-gray-400">
        {label}
      </label>
      <div className="relative group">
        <Input
          id={id}
          type={show ? "text" : "password"}
          required
          placeholder="••••••••"
          className="pr-11 h-12 bg-gray-50/50 border-gray-200 rounded-xl focus:bg-white dark:bg-gray-800 dark:border-gray-700 dark:focus:bg-gray-700 transition-all w-full"
          value={value}
          onChange={(e) => setter(e.target.value)}
          disabled={isLoading || success}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          onClick={() => setShow(!show)}
          tabIndex={-1}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Change Password">
      <form onSubmit={handleSubmit} className="space-y-6 pt-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-3">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl text-sm font-medium">
            {success}
          </div>
        )}

        {renderPasswordInput('currentPassword', 'Current Password', currentPassword, setCurrentPassword, showCurrent, setShowCurrent)}
        {renderPasswordInput('newPassword', 'New Password', newPassword, setNewPassword, showNew, setShowNew)}
        {renderPasswordInput('confirmPassword', 'Confirm New Password', confirmPassword, setConfirmPassword, showConfirm, setShowConfirm)}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} disabled={success}>
            Update Password
          </Button>
        </div>
      </form>
    </Modal>
  );
}
