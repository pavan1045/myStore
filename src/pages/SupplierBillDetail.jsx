import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supplierService } from '../services/supplierService';
import { useSupplier } from '../context/SupplierContext';
import { 
  ArrowLeft, 
  CreditCard, 
  Edit3, 
  Trash2, 
  Printer, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText,
  DollarSign,
  Building2,
  Calendar,
  History
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { PaymentFormModal } from '../components/suppliers/PaymentFormModal';
import { BillFormModal } from '../components/suppliers/BillFormModal';
import { BillActivityTimeline } from '../components/suppliers/BillActivityTimeline';

export default function SupplierBillDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { suppliers, updateBill, deleteBill, recordPayment } = useSupplier();

  const [billDetail, setBillDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isEditBillModalOpen, setIsEditBillModalOpen] = useState(false);

  const fetchDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await supplierService.getBillDetail(id);
      setBillDetail(data);
    } catch (error) {
      alert(error.message || 'Failed to load bill details');
      navigate('/supplier-payments');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete purchase bill ${billDetail?.bill_number}?`)) {
      try {
        await deleteBill(id);
        navigate('/supplier-payments');
      } catch (error) {
        alert(error.message || 'Failed to delete bill');
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
            <AlertCircle size={14} /> Pending
          </span>
        );
      case 'Partially Paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Clock size={14} /> Partially Paid
          </span>
        );
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 size={14} /> Paid
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!billDetail) return null;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/supplier-payments')}>
            <ArrowLeft size={20} className="dark:text-white" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-mono">
                {billDetail.bill_number}
              </h1>
              {getStatusBadge(billDetail.payment_status)}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Supplier: <span className="font-semibold text-gray-800 dark:text-gray-200">{billDetail.company_name}</span> ({billDetail.supplier_name})
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {billDetail.balance_amount > 0 && (
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => setIsPaymentModalOpen(true)}
            >
              <DollarSign className="mr-2 h-4 w-4" /> Record Payment
            </Button>
          )}

          <Button
            variant="secondary"
            onClick={() => setIsEditBillModalOpen(true)}
          >
            <Edit3 className="mr-2 h-4 w-4" /> Edit Bill
          </Button>

          <Button
            variant="secondary"
            onClick={() => window.print()}
          >
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>

          <Button
            variant="ghost"
            onClick={handleDelete}
            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
          >
            <Trash2 size={18} />
          </Button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Invoice Amount</p>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
            ₹{(billDetail.invoice_amount || 0).toLocaleString('en-IN')}
          </p>
          <div className="mt-4 text-xs text-gray-500 space-y-1">
            <p>Purchase Date: <span className="font-medium text-gray-700 dark:text-gray-300">{billDetail.purchase_date}</span></p>
            <p>Last Paid Date: <span className="font-medium text-gray-700 dark:text-gray-300">{billDetail.last_paid_date || 'None'}</span></p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Amount Paid</p>
          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            ₹{(billDetail.amount_paid || 0).toLocaleString('en-IN')}
          </p>
          <p className="mt-4 text-xs text-gray-500">
            Total Payments Count: <span className="font-medium text-gray-700 dark:text-gray-300">{billDetail.payments?.length || 0}</span>
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Outstanding Balance</p>
          <p className="text-3xl font-extrabold text-red-600 dark:text-red-400 mt-1">
            ₹{(billDetail.balance_amount || 0).toLocaleString('en-IN')}
          </p>
          <p className="mt-4 text-xs text-gray-500">
            Payment Status: <span className="font-bold text-gray-700 dark:text-gray-300">{billDetail.payment_status}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details & Payment History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Supplier Info & Notes */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" /> Supplier Information
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400">Company Name</p>
                <p className="font-bold text-gray-800 dark:text-gray-200">{billDetail.company_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Contact Person</p>
                <p className="font-medium text-gray-800 dark:text-gray-200">{billDetail.supplier_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Mobile Number</p>
                <p className="font-medium text-gray-800 dark:text-gray-200">{billDetail.supplier_mobile || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">GST Number</p>
                <p className="font-medium text-gray-800 dark:text-gray-200 font-mono">{billDetail.supplier_gst || 'N/A'}</p>
              </div>
            </div>

            {billDetail.notes && (
              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-400 font-bold uppercase">Notes / Remarks</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{billDetail.notes}</p>
              </div>
            )}
          </div>

          {/* Payment History Table */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-600" /> Payment History
              </h2>
              <span className="text-xs text-gray-500 font-medium">
                Total Paid: ₹{(billDetail.amount_paid || 0).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 font-bold">Payment Date</th>
                    <th className="px-6 py-3 font-bold">Method</th>
                    <th className="px-6 py-3 font-bold">Ref / Txn ID</th>
                    <th className="px-6 py-3 font-bold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {!billDetail.payments || billDetail.payments.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-6 text-gray-400 text-sm">
                        No payments recorded for this bill yet.
                      </td>
                    </tr>
                  ) : (
                    billDetail.payments.map((p) => (
                      <tr key={p.id || p._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 text-gray-800 dark:text-gray-200">{p.payment_date}</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300">
                            {p.payment_method}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-gray-500">{p.reference_number || '--'}</td>
                        <td className="px-6 py-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          +₹{(p.payment_amount || 0).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Activity Timeline Audit Trail */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <History className="h-4 w-4 text-amber-600" /> Audit Activity Log
          </h2>

          <BillActivityTimeline timeline={billDetail.audit_timeline} />
        </div>
      </div>

      {/* Modals */}
      <PaymentFormModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        bill={billDetail}
        onSubmit={async (data) => {
          await recordPayment(data);
          await fetchDetail();
        }}
      />

      <BillFormModal
        isOpen={isEditBillModalOpen}
        onClose={() => setIsEditBillModalOpen(false)}
        suppliers={suppliers}
        bill={billDetail}
        onSubmit={async (data) => {
          await updateBill(billDetail.id, data);
          await fetchDetail();
        }}
      />
    </div>
  );
}
