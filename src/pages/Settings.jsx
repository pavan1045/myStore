import React, { useState, useRef } from 'react';
import { Download, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { dbService } from '../services/dbService';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

export default function Settings() {
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleExport = async () => {
    try {
      setLoading(true);
      // Use CSV export by default as per UI label
      const csvData = await dbService.exportDataCSV();
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `myStore_inventory_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setMessage({ type: 'success', text: 'Inventory exported successfully!' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to export data.' });
    } finally {
      setLoading(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isJson = file.name.endsWith('.json');
    const warningMsg = isJson 
      ? 'WARNING: This will OVERWRITE all current data with the backup. This cannot be undone. Are you sure?' 
      : 'This will import items from the CSV/Excel file. Existing items with the same name and model will be updated. New items will be added. Continue?';

    if (!window.confirm(warningMsg)) {
      e.target.value = ''; // Reset
      return;
    }

    try {
      setLoading(true);
      const text = await file.text();
      
      if (file.name.endsWith('.json')) {
         await dbService.importDataJSON(text);
      } else {
         // Assume CSV for everything else (.csv, .xls, .xlsx mapped to CSV handling for now)
         await dbService.importDataCSV(text);
      }
      
      setMessage({ type: 'success', text: 'Data imported successfully! Reloading...' });
      setTimeout(() => window.location.reload(), 1500);
      
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Failed to import data.' });
    } finally {
      setLoading(false);
      e.target.value = ''; // Reset
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
              <p className="text-sm text-gray-500 mb-4">Download your inventory as a CSV file (opens in Excel).</p>
              <Button onClick={() => {
                handleExport();
                // Override download extension in handleExport or here? 
                // handleExport logic in component needs update to use dbService.exportData which now returns CSV text.
              }} disabled={loading}>
                Export CSV
              </Button>
            </div>

            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
               <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Import CSV to <strong>update/add</strong> items. Use JSON to <strong>restore complete backup</strong> (overwrites).
              </p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".csv, .xlsx, .xls, .json"
              />
              <Button variant="secondary" onClick={handleImportClick} disabled={loading}>
                Import File
              </Button>
            </div>
          </div>

          {message && (
             <div className={`p-4 rounded-lg flex items-center ${
               message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
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
    </div>
  );
}
