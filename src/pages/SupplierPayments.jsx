import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupplier } from '../context/SupplierContext';
import { 
  Building2, 
  Receipt, 
  CreditCard, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar,
  ChevronRight,
  Printer,
  DollarSign,
  FileSpreadsheet
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { SupplierFormModal } from '../components/suppliers/SupplierFormModal';
import { BillFormModal } from '../components/suppliers/BillFormModal';
import { PaymentFormModal } from '../components/suppliers/PaymentFormModal';

export default function SupplierPayments() {
  const navigate = useNavigate();
  const {
    suppliers,
    bills,
    metrics,
    isLoading,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    addBill,
    updateBill,
    deleteBill,
    recordPayment
  } = useSupplier();

  const [activeTab, setActiveTab] = useState('bills'); // 'dashboard', 'suppliers', 'bills', 'reports'
  
  // Modals
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [defaultBillSupplierId, setDefaultBillSupplierId] = useState('');

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPaymentBill, setSelectedPaymentBill] = useState(null);

  // Filters for Bills Tab
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplierFilter, setSelectedSupplierFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  // Filter logic for bills
  const filteredBills = bills.filter(b => {
    if (selectedSupplierFilter && String(b.supplier_id) !== String(selectedSupplierFilter)) {
      return false;
    }
    if (selectedStatusFilter && b.payment_status !== selectedStatusFilter) {
      return false;
    }
    if (startDateFilter && b.purchase_date < startDateFilter) {
      return false;
    }
    if (endDateFilter && b.purchase_date > endDateFilter) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchNum = b.bill_number?.toLowerCase().includes(q);
      const matchSup = b.supplier_name?.toLowerCase().includes(q) || b.company_name?.toLowerCase().includes(q);
      if (!matchNum && !matchSup) return false;
    }
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
            <AlertCircle size={12} /> Pending
          </span>
        );
      case 'Partially Paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Clock size={12} /> Partially Paid
          </span>
        );
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 size={12} /> Paid
          </span>
        );
      default:
        return null;
    }
  };

  const handleExportCSV = () => {
    if (!filteredBills.length) {
      alert('No bills to export');
      return;
    }
    const headers = ['Bill Number', 'Supplier', 'Company', 'Purchase Date', 'Last Paid Date', 'Invoice Amount', 'Amount Paid', 'Balance Amount', 'Payment Status'];
    const rows = filteredBills.map(b => [
      `"${b.bill_number}"`,
      `"${b.supplier_name}"`,
      `"${b.company_name}"`,
      `"${b.purchase_date}"`,
      `"${b.last_paid_date || 'N/A'}"`,
      b.invoice_amount,
      b.amount_paid,
      b.balance_amount,
      `"${b.payment_status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Supplier_Bills_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard className="h-7 w-7 text-blue-600" />
            Supplier Payments
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage purchase bills, record supplier payments, and track audit history.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              setEditingSupplier(null);
              setIsSupplierModalOpen(true);
            }}
          >
            <Building2 className="mr-2 h-4 w-4" />
            + Add Supplier
          </Button>

          <Button
            onClick={() => {
              setEditingBill(null);
              setDefaultBillSupplierId('');
              setIsBillModalOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            + New Purchase Bill
          </Button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Outstanding</p>
          <p className="text-2xl font-extrabold text-red-600 dark:text-red-400 mt-1">
            ₹{(metrics.total_outstanding || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">{metrics.pending_bills_count} Pending Bills</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Suppliers</p>
          <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
            {metrics.total_suppliers_count || suppliers.length}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Active vendor accounts</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Purchases This Month</p>
          <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
            ₹{(metrics.total_purchase_this_month || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">New bills created</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payments This Month</p>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            ₹{(metrics.total_payments_this_month || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">{metrics.paid_bills_this_month_count} Bills Cleared</p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('bills')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'bills'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          <Receipt size={18} />
          Purchase Bills ({bills.length})
        </button>

        <button
          onClick={() => setActiveTab('suppliers')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'suppliers'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          <Building2 size={18} />
          Suppliers Directory ({suppliers.length})
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'reports'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          <FileSpreadsheet size={18} />
          Reports & Export
        </button>
      </div>

      {/* TAB 1: BILLS LIST */}
      {activeTab === 'bills' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search Bill # or Supplier..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
              <select
                className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none"
                value={selectedSupplierFilter}
                onChange={(e) => setSelectedSupplierFilter(e.target.value)}
              >
                <option value="">All Suppliers</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.company_name}</option>
                ))}
              </select>

              <select
                className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none"
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Paid">Paid</option>
              </select>

              <input
                type="date"
                className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                placeholder="From Date"
              />

              <input
                type="date"
                className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                placeholder="To Date"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 font-bold">Bill #</th>
                  <th className="px-6 py-4 font-bold">Supplier</th>
                  <th className="px-6 py-4 font-bold">Purchase Date</th>
                  <th className="px-6 py-4 font-bold">Last Paid Date</th>
                  <th className="px-6 py-4 font-bold text-right">Invoice Amount</th>
                  <th className="px-6 py-4 font-bold text-right">Amount Paid</th>
                  <th className="px-6 py-4 font-bold text-right">Outstanding</th>
                  <th className="px-6 py-4 font-bold text-center">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {filteredBills.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No purchase bills match your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredBills.map((b) => (
                    <tr
                      key={b.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700/50"
                    >
                      <td className="px-6 py-4 font-bold font-mono text-blue-600 dark:text-blue-400">
                        {b.bill_number}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900 dark:text-white">{b.company_name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{b.supplier_name}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {b.purchase_date}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {b.last_paid_date || '--'}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">
                        ₹{(b.invoice_amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-emerald-600 dark:text-emerald-400">
                        ₹{(b.amount_paid || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-red-600 dark:text-red-400">
                        ₹{(b.balance_amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(b.payment_status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {b.balance_amount > 0 && (
                            <Button
                              size="sm"
                              className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2"
                              onClick={() => {
                                setSelectedPaymentBill(b);
                                setIsPaymentModalOpen(true);
                              }}
                            >
                              <DollarSign size={14} className="mr-1" />
                              Pay
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => navigate(`/supplier-payments/bills/${b.id}`)}
                          >
                            Details <ChevronRight size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SUPPLIERS DIRECTORY */}
      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((s) => (
            <div
              key={s.id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{s.company_name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Contact: {s.supplier_name}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">📞 {s.mobile_number}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingSupplier(s);
                      setIsSupplierModalOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                </div>

                {s.gst_number && (
                  <p className="text-xs bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md inline-block mt-3 font-mono">
                    GST: {s.gst_number}
                  </p>
                )}

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-gray-400">Total Purchase</p>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">
                      ₹{(s.total_purchase_amount || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Outstanding</p>
                    <p className="font-bold text-red-600 dark:text-red-400 text-sm">
                      ₹{(s.outstanding_balance || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Pending Bills</p>
                    <p className="font-semibold text-amber-600">{s.pending_bills_count} bills</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Last Purchase</p>
                    <p className="font-medium text-gray-700 dark:text-gray-300">{s.last_purchase_date || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="secondary"
                  className="w-full text-xs"
                  onClick={() => {
                    setEditingBill(null);
                    setDefaultBillSupplierId(s.id);
                    setIsBillModalOpen(true);
                  }}
                >
                  + Add Purchase Bill
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: REPORTS & EXPORT */}
      {activeTab === 'reports' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Supplier Payments Financial Report</h2>
              <p className="text-sm text-gray-500">Summary of purchases, payments, and outstanding balances.</p>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" /> Print Report
              </Button>
              <Button onClick={handleExportCSV}>
                <Download className="mr-2 h-4 w-4" /> Export CSV
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 p-6 bg-gray-50 dark:bg-gray-700/40 rounded-xl">
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase">Total Suppliers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{suppliers.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase">Total Purchase Amount</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ₹{bills.reduce((sum, b) => sum + (b.invoice_amount || 0), 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase">Total Outstanding</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                ₹{metrics.total_outstanding.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <SupplierFormModal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        supplier={editingSupplier}
        onSubmit={async (data) => {
          if (editingSupplier) {
            await updateSupplier(editingSupplier.id, data);
          } else {
            await addSupplier(data);
          }
        }}
      />

      <BillFormModal
        isOpen={isBillModalOpen}
        onClose={() => setIsBillModalOpen(false)}
        suppliers={suppliers}
        bill={editingBill}
        defaultSupplierId={defaultBillSupplierId}
        onSubmit={async (data) => {
          if (editingBill) {
            await updateBill(editingBill.id, data);
          } else {
            await addBill(data);
          }
        }}
      />

      <PaymentFormModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        bill={selectedPaymentBill}
        onSubmit={async (data) => {
          await recordPayment(data);
        }}
      />
    </div>
  );
}
