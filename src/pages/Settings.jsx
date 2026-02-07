import React, { useState, useRef } from 'react';
import { Download, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { dbService } from '../services/dbService';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';

export default function Settings() {
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Import confirmation state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [importConfig, setImportConfig] = useState({ title: '', message: '', variant: 'primary' });

  const handleExport = async () => {
    try {
      console.log('Starting handleExport...');
      setLoading(true);
      const csvData = await dbService.exportDataCSV();
      console.log('CSV Data generated, length:', csvData.length);

      if (csvData.length < 50) {
        console.warn('CSV Data seems very short, possibly just headers?');
      }

      // UTF-8 BOM for Excel
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvData], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);

      const filename = `myStore_inventory_${new Date().toISOString().slice(0, 10)}.csv`;
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;

      // Ensure the link is in the DOM and visible but not intrusive
      link.style.display = 'none';
      document.body.appendChild(link);

      console.log('Triggering virtual click on download link...');
      link.click();

      // Wait longer before revocation to ensure browser has time to start download
      setTimeout(() => {
        console.log('Cleaning up download link and object URL (long timeout)...');
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        window.URL.revokeObjectURL(url);
      }, 10000);

      setMessage({ type: 'success', text: 'Inventory exported successfully!' });
    } catch (err) {
      console.error('Export error:', err);
      setMessage({ type: 'error', text: 'Failed to export data.' });
    } finally {
      setLoading(false);
    }
  };

  // Removed handleImportClick

  const handleFileChange = (e) => {
    console.log('handleFileChange triggered');
    const file = e.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File selected:', file.name, 'size:', file.size);

    const isJson = file.name.endsWith('.json');
    setPendingFile(file);
    setImportConfig({
      title: isJson ? 'Overwrite All Data?' : 'Import Items?',
      message: isJson
        ? 'WARNING: This will OVERWRITE all current data with the backup. This cannot be undone. Are you sure?'
        : 'This will import items from the file. Existing items with the same name and model will be updated. New items will be added. Continue?',
      variant: isJson ? 'danger' : 'primary'
    });
    setIsImportModalOpen(true);

    // Reset the input so the same file can be selected again later
    e.target.value = '';
  };

  const confirmImport = async () => {
    console.log('confirmImport triggered, pendingFile:', pendingFile?.name);
    if (!pendingFile) return;

    try {
      setLoading(true);
      console.log('Reading file content...');
      const text = await pendingFile.text();
      console.log('File text read, length:', text.length);

      if (pendingFile.name.endsWith('.json')) {
        await dbService.importDataJSON(text);
      } else {
        await dbService.importDataCSV(text);
      }

      setMessage({ type: 'success', text: 'Data imported successfully! Reloading...' });
      setTimeout(() => window.location.reload(), 1500);

    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Failed to import data.' });
    } finally {
      setLoading(false);
      setPendingFile(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage application data and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border border-blue-100 bg-blue-50 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold">Local Storage Only</p>
              <p>Your inventory data is stored in this browser (IndexedDB). If you clear your browser cache, you will lose your data.</p>
              <p className="mt-2">Regularly export backups to keep your data safe.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </h3>
              <p className="text-sm text-gray-500 mb-4">Download your inventory as a CSV file to your computer.</p>
              <Button onClick={handleExport} disabled={loading}>
                Export CSV
              </Button>
            </div>

            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Import CSV to <strong>update/add</strong> items. Use JSON to <strong>restore backup</strong>.
              </p>
              <input
                type="file"
                id="file-import"
                onChange={handleFileChange}
                className="hidden"
                accept=".csv, .xlsx, .xls, .json"
              />
              <label
                htmlFor="file-import"
                className="inline-flex items-center justify-center rounded-md font-medium h-10 px-4 py-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
              >
                Import File
              </label>
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-lg flex items-center ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2" />
              )}
              {message.text}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-center text-xs text-gray-400">
        myStore v1.0.0
      </div>

      <ConfirmationModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onConfirm={confirmImport}
        title={importConfig.title}
        message={importConfig.message}
        confirmText="Proceed"
        variant={importConfig.variant}
      />
    </div>
  );
}
