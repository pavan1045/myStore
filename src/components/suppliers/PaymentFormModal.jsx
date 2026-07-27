import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { CreditCard, AlertTriangle } from 'lucide-react';

export function PaymentFormModal({ isOpen, onClose, onSubmit, bill, payment = null }) {
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    payment_date: today,
    payment_amount: '',
    payment_method: 'UPI',
    reference_number: '',
    remarks: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showOverpaymentWarning, setShowOverpaymentWarning] = useState(false);

  useEffect(() => {
    if (payment) {
      setFormData({
        payment_date: payment.payment_date || today,
        payment_amount: payment.payment_amount || '',
        payment_method: payment.payment_method || 'UPI',
        reference_number: payment.reference_number || '',
        remarks: payment.remarks || ''
      });
    } else if (bill) {
      setFormData({
        payment_date: today,
        payment_amount: bill.balance_amount || '',
        payment_method: 'UPI',
        reference_number: '',
        remarks: ''
      });
    }
    setShowOverpaymentWarning(false);
  }, [payment, bill, isOpen, today]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const amt = Number(formData.payment_amount);
    if (isNaN(amt) || amt <= 0) {
      alert('Payment Amount must be greater than zero');
      return;
    }

    // Check if payment is greater than outstanding balance
    if (bill && amt > bill.balance_amount && !showOverpaymentWarning && !payment) {
      setShowOverpaymentWarning(true);
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({
        bill_id: bill?._id || bill?.id,
        ...formData,
        payment_amount: amt
      });
      onClose();
    } catch (error) {
      alert(error.message || 'Failed to record payment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={payment ? 'Edit Payment Record' : `Record Payment for ${bill?.bill_number || ''}`}
    >
      <form onSubmit={handleFormSubmit} className="space-y-4">
        {bill && (
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl border border-blue-100 dark:border-blue-800 flex justify-between items-center text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Invoice Amount</p>
              <p className="font-bold text-gray-900 dark:text-white">₹{(bill.invoice_amount || 0).toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Amount Paid</p>
              <p className="font-bold text-green-600 dark:text-green-400">₹{(bill.amount_paid || 0).toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Outstanding Balance</p>
              <p className="font-bold text-red-600 dark:text-red-400">₹{(bill.balance_amount || 0).toLocaleString('en-IN')}</p>
            </div>
          </div>
        )}

        {showOverpaymentWarning && (
          <div className="bg-amber-50 dark:bg-amber-900/40 p-4 rounded-xl border border-amber-200 dark:border-amber-700 flex items-start gap-3 text-amber-800 dark:text-amber-300 text-sm">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Overpayment Warning</p>
              <p className="mt-0.5">
                The payment amount (₹{Number(formData.payment_amount).toLocaleString('en-IN')}) is greater than the outstanding balance (₹{(bill?.balance_amount || 0).toLocaleString('en-IN')}).
                Click <strong>Confirm & Submit</strong> to proceed anyway.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="date"
            label="Payment Date *"
            value={formData.payment_date}
            onChange={(e) => {
              setFormData({ ...formData, payment_date: e.target.value });
              setShowOverpaymentWarning(false);
            }}
            required
          />

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Payment Method *</label>
            <select
              className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              required
            >
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cheque">Cheque</option>
              <option value="Card">Card</option>
            </select>
          </div>
        </div>

        <Input
          type="number"
          step="any"
          label="Payment Amount (₹) *"
          placeholder="e.g. 20000"
          value={formData.payment_amount}
          onChange={(e) => {
            setFormData({ ...formData, payment_amount: e.target.value });
            setShowOverpaymentWarning(false);
          }}
          min="0.01"
          required
        />

        <Input
          label="Reference / Transaction Number (Optional)"
          placeholder="e.g. UPI-9876543210 or CHQ-1002"
          value={formData.reference_number}
          onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
        />

        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Remarks / Notes</label>
          <textarea
            className="w-full h-20 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Payment notes or installment details"
            value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} className={showOverpaymentWarning ? "bg-amber-600 hover:bg-amber-700 text-white" : ""}>
            <CreditCard className="mr-2 h-4 w-4" />
            {showOverpaymentWarning ? 'Confirm & Submit Overpayment' : (payment ? 'Update Payment' : 'Record Payment')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
