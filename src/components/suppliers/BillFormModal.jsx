import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { FileText } from 'lucide-react';

export function BillFormModal({ isOpen, onClose, onSubmit, suppliers = [], bill = null, defaultSupplierId = '' }) {
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    supplier_id: defaultSupplierId || '',
    bill_number: '',
    purchase_date: today,
    due_date: '',
    invoice_amount: '',
    notes: '',
    attachment: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (bill) {
      setFormData({
        supplier_id: bill.supplier_id || defaultSupplierId || '',
        bill_number: bill.bill_number || '',
        purchase_date: bill.purchase_date || today,
        due_date: bill.due_date || '',
        invoice_amount: bill.invoice_amount || '',
        notes: bill.notes || '',
        attachment: bill.attachment || ''
      });
    } else {
      setFormData({
        supplier_id: defaultSupplierId || (suppliers[0]?.id || ''),
        bill_number: '',
        purchase_date: today,
        due_date: '',
        invoice_amount: '',
        notes: '',
        attachment: ''
      });
    }
  }, [bill, isOpen, defaultSupplierId, suppliers, today]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.supplier_id) {
      alert('Please select a supplier');
      return;
    }
    if (Number(formData.invoice_amount) <= 0) {
      alert('Invoice Amount must be greater than zero');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({
        ...formData,
        invoice_amount: Number(formData.invoice_amount)
      });
      onClose();
    } catch (error) {
      alert(error.message || 'Failed to save purchase bill');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={bill ? 'Edit Purchase Bill' : 'New Purchase Bill'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Select Supplier *</label>
          <select
            className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.supplier_id}
            onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
            disabled={!!bill}
            required
          >
            <option value="">-- Choose Supplier --</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>
                {s.company_name} ({s.supplier_name})
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Bill / Invoice Number (Optional)"
          placeholder="e.g. BILL-1045 (Auto-generated if left empty)"
          value={formData.bill_number}
          onChange={(e) => setFormData({ ...formData, bill_number: e.target.value })}
          disabled={!!bill}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="date"
            label="Purchase Date *"
            value={formData.purchase_date}
            onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
            required
          />
          <Input
            type="date"
            label="Due Date (Optional)"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
          />
        </div>

        <Input
          type="number"
          step="any"
          label="Invoice Amount (₹) *"
          placeholder="e.g. 58400"
          value={formData.invoice_amount}
          onChange={(e) => setFormData({ ...formData, invoice_amount: e.target.value })}
          min="0.01"
          required
        />

        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Notes / Remarks</label>
          <textarea
            className="w-full h-20 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Items purchased or invoice details"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        <Input
          label="Attachment URL / Ref (Optional)"
          placeholder="e.g. https://invoice-link.com/inv1045.pdf"
          value={formData.attachment}
          onChange={(e) => setFormData({ ...formData, attachment: e.target.value })}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            <FileText className="mr-2 h-4 w-4" />
            {bill ? 'Update Bill' : 'Create Bill'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
