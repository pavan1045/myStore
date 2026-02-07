import React, { useState, useRef, useEffect } from 'react';
import { Download, Upload, AlertCircle, CheckCircle, FileDown } from 'lucide-react';
import { dbService } from '../services/dbService';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';

export default function Settings() {
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Export state
  const [isPreparing, setIsPreparing] = useState(false);
  const [exportUrl, setExportUrl] = useState(null);
  const [exportFilename, setExportFilename] = useState('');

  // Import confirmation state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [importConfig, setImportConfig] = useState({ title: '', message: '', variant: 'primary' });

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (exportUrl) window.URL.revokeObjectURL(exportUrl);
    };
  }, [exportUrl]);

  const handlePrepareExport = async () => {
    try {
      console.log('Production Export: Preparing data...');
      setIsPreparing(true);
      setMessage(null);

      const csvData = await dbService.exportDataCSV();

      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const filename = `myStore_inventory_${new Date().toISOString().slice(0, 10)}.csv`;

      setExportUrl(url);
      setExportFilename(filename);
      console.log('Production Export: URL ready for direct download');

    } catch (err) {
      console.error('Production Export Error:', err);
      setMessage({ type: 'error', text: 'Failed to prepare export.' });
    } finally {
      setIsPreparing(false);
    }
  };

  const handleDownloadClick = () => {
    // Clear state after a short delay so the link disappears after use
    setTimeout(() => {
      setExportUrl(null);
      setExportFilename('');
      setMessage({ type: 'success', text: 'Inventory downloaded successfully!' });
    }, 1000);
  };

  const handleFileChange = (e) => {
    console.log('Production Import: File change detected');
    const file = e.target.files?.[0];
    if (!file) return;

    const isJson = file.name.endsWith('.json');
    setPendingFile(file);
    setImportConfig({
      title: isJson ? 'Overwrite All Data?' : 'Import Items?',
      message: isJson
        ? 'WARNING: This will OVERWRITE all current data with the backup. This cannot be undone. Are you sure?'
        : 'This will import items from the file. Existing items with the same name and model will be updated. Continue?',
      variant: isJson ? 'danger' : 'primary'
    });
    setIsImportModalOpen(true);

    // Reset input
    e.target.value = '';
  };

  const confirmImport = async () => {
    if (!pendingFile) return;

    try {
      setLoading(true);
      const text = await pendingFile.text();

      if (pendingFile.name.endsWith('.json')) {
        await dbService.importDataJSON(text);
      } else {
        await dbService.importDataCSV(text);
      }

      setMessage({ type: 'success', text: 'Data imported successfully! Reloading...' });
      setTimeout(() => window.location.reload(), 1500);

    } catch (err) {
      console.error('Import Error:', err);
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
              <p>Your data is stored locally in this browser. Please export backups regularly.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center text-center">
              <Download className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-medium text-gray-900 mb-1">Export Data</h3>
              <p className="text-xs text-gray-500 mb-4 h-8">Step 1: Prepare the file. Step 2: Download.</p>

              {!exportUrl ? (
                <Button
                  onClick={handlePrepareExport}
                  disabled={isPreparing}
                  className="w-full"
                >
                  {isPreparing ? 'Preparing...' : 'Prepare Export'}
                </Button>
              ) : (
                <a
                  href={exportUrl}
                  download={exportFilename}
                  onClick={handleDownloadClick}
                  className="w-full h-10 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-md font-medium inline-flex items-center justify-center shadow-sm transition-colors"
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Download CSV
                </a>
              )}
            </div>

            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center text-center">
              <Upload className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-medium text-gray-900 mb-1">Import Data</h3>
              <p className="text-xs text-gray-500 mb-4 h-8">Select a CSV or JSON backup to restore your inventory.</p>

              <input
                type="file"
                id="file-import-hidden"
                onChange={handleFileChange}
                className="hidden"
                accept=".csv, .xlsx, .xls, .json"
              />
              <label
                htmlFor="file-import-hidden"
                className="w-full h-10 px-4 py-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-md font-medium cursor-pointer inline-flex items-center justify-center shadow-sm transition-colors"
              >
                Select File
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
