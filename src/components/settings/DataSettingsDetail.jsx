import React, { useState } from 'react';
import { ArrowLeft, Download, Upload, FileText, AlertTriangle } from 'lucide-react';
import { Button } from '../common/Button';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { inventoryService } from '../../services/inventoryService';

export function DataSettingsDetail({ onBack }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleExportJSON = async () => {
    setIsLoading(true);
    try {
      const data = await inventoryService.exportDataJSON();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `myStore_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      setMessage({ type: 'success', text: 'Backup exported successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Export failed: ' + err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setIsLoading(true);
    try {
      const csv = await inventoryService.exportDataCSV();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `myStore_inventory_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      setMessage({ type: 'success', text: 'Inventory CSV exported successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'CSV Export failed: ' + err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingFile(file);
      setIsImportModalOpen(true);
    }
    e.target.value = '';
  };

  const confirmImport = async () => {
    if (!pendingFile) return;
    setIsLoading(true);
    try {
      const text = await pendingFile.text();
      if (pendingFile.name.endsWith('.json')) {
        await inventoryService.importDataJSON(text);
      } else {
        throw new Error("CSV Import not yet refactored. Use JSON for backups.");
      }
      setMessage({ type: 'success', text: 'Data imported! Reloading system...' });
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
      setIsImportModalOpen(false);
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
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Exports and Imports</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your data backups, exports, and restoration.</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/30 border-green-100 dark:border-green-800 text-green-700 dark:text-green-400' 
            : 'bg-red-50 dark:bg-red-900/30 border-red-100 dark:border-red-800 text-red-700 dark:text-red-400'
        }`}>
          <AlertTriangle size={18} />
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-8 space-y-8">
        
        {/* Data Management */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Data Management</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Export a full database backup or download inventory reports as CSV for external analysis.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button variant="outline" className="w-full justify-start h-14" onClick={handleExportJSON} disabled={isLoading}>
              <Download className="mr-3 h-5 w-5 text-blue-600" />
              <div className="flex flex-col items-start">
                <span>Export Full Backup</span>
                <span className="text-xs font-normal text-gray-500 dark:text-gray-400">JSON format</span>
              </div>
            </Button>
            <Button variant="outline" className="w-full justify-start h-14" onClick={handleExportCSV} disabled={isLoading}>
              <FileText className="mr-3 h-5 w-5 text-green-600" />
              <div className="flex flex-col items-start">
                <span>Export Inventory</span>
                <span className="text-xs font-normal text-gray-500 dark:text-gray-400">CSV format</span>
              </div>
            </Button>
          </div>
        </div>

        <hr className="border-gray-100 dark:border-gray-700" />

        {/* Restore & Import */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Restore & Import</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Restore your inventory from a previous JSON backup. 
            <strong> Warning: This will completely overwrite your current data.</strong>
          </p>
          <div>
            <input
              type="file"
              id="restore-file"
              className="hidden"
              accept=".json"
              onChange={handleFileSelect}
            />
            <label
              htmlFor="restore-file"
              className="w-full sm:w-auto px-6 h-12 border-2 border-dashed border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/40 cursor-pointer rounded-xl font-semibold inline-flex items-center justify-center transition-all"
            >
              <Upload className="mr-2 h-5 w-5" />
              Select Backup File to Import
            </label>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onConfirm={confirmImport}
        title="Restore system from backup?"
        message="This action will completely overwrite your current inventory and categories with the data from the backup file. This cannot be undone."
        isLoading={isLoading}
      />
    </div>
  );
}
