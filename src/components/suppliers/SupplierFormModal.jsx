import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { UserCheck } from 'lucide-react';

export function SupplierFormModal({ isOpen, onClose, onSubmit, supplier = null }) {
  const [formData, setFormData] = useState({
    supplier_name: '',
    company_name: '',
    mobile_number: '',
    gst_number: '',
    address: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (supplier) {
      setFormData({
        supplier_name: supplier.supplier_name || '',
        company_name: supplier.company_name || '',
        mobile_number: supplier.mobile_number || '',
        gst_number: supplier.gst_number || '',
        address: supplier.address || ''
      });
    } else {
      setFormData({
        supplier_name: '',
        company_name: '',
        mobile_number: '',
        gst_number: '',
        address: ''
      });
    }
  }, [supplier, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      alert(error.message || 'Failed to save supplier');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={supplier ? 'Edit Supplier' : 'Add New Supplier'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Supplier Contact Name *"
          placeholder="e.g. Rahul Sharma"
          value={formData.supplier_name}
          onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
          required
        />
        <Input
          label="Company / Shop Name *"
          placeholder="e.g. ABC Mobiles Pvt Ltd"
          value={formData.company_name}
          onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
          required
        />
        <Input
          label="Mobile Number *"
          placeholder="e.g. 9876543210"
          value={formData.mobile_number}
          onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
          required
        />
        <Input
          label="GST Number (Optional)"
          placeholder="e.g. 22AAAAA0000A1Z5"
          value={formData.gst_number}
          onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
        />
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Address (Optional)</label>
          <textarea
            className="w-full h-20 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Supplier shop or office address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            <UserCheck className="mr-2 h-4 w-4" />
            {supplier ? 'Update Supplier' : 'Save Supplier'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
