import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Lock, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { ChangePasswordModal } from './ChangePasswordModal';

export function UserSettingsDetail({ onBack }) {
  const { user, updateProfile } = useAuth();
  const { theme, setMode } = useTheme();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateProfile(firstName, lastName);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft size={20} className="dark:text-white" />
        </Button>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Settings</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your profile, security, and preferences.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-8 space-y-8">
        
        {/* Profile Form */}
        <form onSubmit={handleSave} className="space-y-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Profile Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="First Name" 
              value={firstName} 
              onChange={(e) => setFirstName(e.target.value)} 
              placeholder="e.g. John" 
            />
            <Input 
              label="Last Name" 
              value={lastName} 
              onChange={(e) => setLastName(e.target.value)} 
              placeholder="e.g. Doe" 
            />
          </div>
          <div>
            <Button type="submit" isLoading={isLoading}>
              <Save className="mr-2 h-4 w-4" /> Save Profile
            </Button>
          </div>
        </form>

        <hr className="border-gray-100 dark:border-gray-700" />

        {/* Security */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Security</h3>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <Input 
                label="Password" 
                value="••••••••" 
                disabled 
                className="bg-gray-50 text-gray-400 dark:bg-gray-900"
              />
            </div>
            <Button variant="outline" type="button" onClick={() => setIsPasswordModalOpen(true)}>
              <Lock className="mr-2 h-4 w-4" /> Reset Password
            </Button>
          </div>
        </div>

        <hr className="border-gray-100 dark:border-gray-700" />

        {/* Preferences */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Display Mode</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Choose your preferred theme. This will be applied to the entire application.
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMode('light')}
              className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${
                theme === 'light' 
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Sun size={24} />
              <span className="font-semibold text-sm">Light Mode</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('dark')}
              className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${
                theme === 'dark' 
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Moon size={24} />
              <span className="font-semibold text-sm">Dark Mode</span>
            </button>
          </div>
        </div>
      </div>

      <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
    </div>
  );
}
