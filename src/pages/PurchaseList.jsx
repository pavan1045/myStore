import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Package, 
  Filter, 
  Calendar, 
  User, 
  Layers, 
  X, 
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Building2,
  RefreshCw
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { useInventoryContext } from '../context/InventoryContext';
import { purchaseListService } from '../services/purchaseListService';

export default function PurchaseList() {
  const { items: inventoryItems, categories, refreshData } = useInventoryContext();

  // Active Tab: 'purchase_list' | 'out_of_stock'
  const [activeTab, setActiveTab] = useState('purchase_list');

  // Purchase List Tab State
  const [purchaseItems, setPurchaseItems] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [addedByFilter, setAddedByFilter] = useState('All');

  // Out of Stock Tab State
  const [outOfStockItems, setOutOfStockItems] = useState([]);
  const [loadingOutOfStock, setLoadingOutOfStock] = useState(false);
  const [outOfStockCategoryFilter, setOutOfStockCategoryFilter] = useState('All');
  const [outOfStockSearch, setOutOfStockSearch] = useState('');

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State
  const [formProductId, setFormProductId] = useState('');
  const [formProductSearch, setFormProductSearch] = useState('');
  const [formQuantity, setFormQuantity] = useState(1);
  const [formNotes, setFormNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Show temporary toast notification
  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch Purchase List items
  const fetchPurchaseList = useCallback(async () => {
    setLoadingList(true);
    try {
      const data = await purchaseListService.getPurchaseList({
        status: statusFilter,
        category: categoryFilter,
        search: searchQuery
      });
      setPurchaseItems(data);
    } catch (err) {
      console.error('Error loading purchase list:', err);
    } finally {
      setLoadingList(false);
    }
  }, [statusFilter, categoryFilter, searchQuery]);

  // Fetch Out of Stock items
  const fetchOutOfStockItems = useCallback(async () => {
    setLoadingOutOfStock(true);
    try {
      const data = await purchaseListService.getOutOfStockItems({
        category: outOfStockCategoryFilter,
        search: outOfStockSearch
      });
      setOutOfStockItems(data);
    } catch (err) {
      console.error('Error loading out of stock items:', err);
    } finally {
      setLoadingOutOfStock(false);
    }
  }, [outOfStockCategoryFilter, outOfStockSearch]);

  useEffect(() => {
    if (activeTab === 'purchase_list') {
      fetchPurchaseList();
    } else {
      fetchOutOfStockItems();
    }
  }, [activeTab, fetchPurchaseList, fetchOutOfStockItems]);

  // Extract unique "Added By" users for filter dropdown
  const uniqueAddedBy = useMemo(() => {
    const users = new Set(purchaseItems.map(i => i.created_by).filter(Boolean));
    return Array.from(users);
  }, [purchaseItems]);

  // Filter purchase list items locally by addedBy if specified
  const filteredPurchaseItems = useMemo(() => {
    if (addedByFilter === 'All') return purchaseItems;
    return purchaseItems.filter(i => i.created_by === addedByFilter);
  }, [purchaseItems, addedByFilter]);

  // Filter inventory items for Add Modal search dropdown
  const filteredInventoryOptions = useMemo(() => {
    if (!formProductSearch.trim()) return inventoryItems.slice(0, 15);
    const q = formProductSearch.toLowerCase().trim();
    return inventoryItems.filter(item => 
      item.name.toLowerCase().includes(q) || 
      (item.modelNumber && item.modelNumber.toLowerCase().includes(q))
    ).slice(0, 15);
  }, [inventoryItems, formProductSearch]);

  // Handlers for Add Item Modal
  const handleOpenAddModal = (preselectedProduct = null) => {
    setModalError('');
    if (preselectedProduct) {
      setFormProductId(preselectedProduct._id || preselectedProduct.id);
      setFormProductSearch(preselectedProduct.name);
    } else {
      setFormProductId('');
      setFormProductSearch('');
    }
    setFormQuantity(1);
    setFormNotes('');
    setIsAddModalOpen(true);
  };

  const handleCreatePurchaseItem = async (e) => {
    e.preventDefault();
    if (!formProductId) {
      setModalError('Please select a product from the list.');
      return;
    }
    if (formQuantity < 1) {
      setModalError('Quantity must be at least 1.');
      return;
    }

    setModalError('');
    setIsSubmitting(true);

    try {
      await purchaseListService.addPurchaseItem(formProductId, formQuantity, formNotes);
      setIsAddModalOpen(false);
      showToast('Item successfully added to Purchase List!');
      if (activeTab === 'purchase_list') {
        fetchPurchaseList();
      } else {
        fetchOutOfStockItems();
      }
    } catch (err) {
      setModalError(err.message || 'Failed to add item to purchase list.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Add from Out of Stock tab
  const handleQuickAddFromOutOfStock = async (product) => {
    try {
      await purchaseListService.addPurchaseItem(product._id || product.id, 1, '');
      showToast(`${product.name} added to Purchase List!`);
      fetchOutOfStockItems();
    } catch (err) {
      showToast(err.message || 'Product already in Purchase List.', 'error');
    }
  };

  // Handlers for Edit Item Modal
  const handleOpenEditModal = (item) => {
    setModalError('');
    setEditingItem(item);
    setFormQuantity(item.quantity || 1);
    setFormNotes(item.notes || '');
    setIsEditModalOpen(true);
  };

  const handleUpdatePurchaseItem = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    if (formQuantity < 1) {
      setModalError('Quantity must be at least 1.');
      return;
    }

    setModalError('');
    setIsSubmitting(true);

    try {
      await purchaseListService.updatePurchaseItem(editingItem._id, {
        quantity: formQuantity,
        notes: formNotes
      });
      setIsEditModalOpen(false);
      showToast('Purchase item updated!');
      fetchPurchaseList();
    } catch (err) {
      setModalError(err.message || 'Failed to update item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Action: Change Status
  const handleStatusChange = async (item, newStatus) => {
    try {
      await purchaseListService.updatePurchaseItem(item._id, { status: newStatus });
      showToast(`Status updated to ${newStatus}`);
      fetchPurchaseList();
      fetchOutOfStockItems();
      if (refreshData) {
        await refreshData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  // Remove Item
  const handleDeleteItem = async (item) => {
    const name = item.product_id?.name || 'Product';
    if (window.confirm(`Are you sure you want to remove "${name}" from the Purchase List?`)) {
      try {
        await purchaseListService.deletePurchaseItem(item._id);
        showToast('Item removed from Purchase List.');
        fetchPurchaseList();
      } catch (err) {
        showToast(err.message || 'Failed to remove item', 'error');
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border text-sm font-semibold animate-in slide-in-from-top duration-300 ${
          toastMessage.type === 'error'
            ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
        }`}>
          {toastMessage.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toastMessage.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            Purchase List Workspace
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track products to purchase, monitor out-of-stock items, and manage replenishment entries.
          </p>
        </div>

        <Button
          onClick={() => handleOpenAddModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-2"
        >
          <Plus size={18} /> Add Purchase Item
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('purchase_list')}
          className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'purchase_list'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <ShoppingCart size={18} />
          Purchase List
          {purchaseItems.length > 0 && (
            <span className="px-2 py-0.5 text-xs font-extrabold rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
              {purchaseItems.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('out_of_stock')}
          className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'out_of_stock'
              ? 'border-red-600 text-red-600 dark:text-red-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <AlertCircle size={18} />
          Out of Stock
          {outOfStockItems.length > 0 && (
            <span className="px-2 py-0.5 text-xs font-extrabold rounded-full bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300">
              {outOfStockItems.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: PURCHASE LIST */}
      {activeTab === 'purchase_list' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Filters Bar */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3 text-gray-400" size={16} />
              <Input
                type="text"
                placeholder="Search products or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 text-xs bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 rounded-xl"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Purchased">Purchased</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Categories</option>
                {categories.map(cat => (
                  <option key={cat._id || cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Added By Filter */}
            <div>
              <select
                value={addedByFilter}
                onChange={(e) => setAddedByFilter(e.target.value)}
                className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Added By</option>
                {uniqueAddedBy.map(user => (
                  <option key={user} value={user}>{user}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table / Content */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            {loadingList ? (
              <div className="flex items-center justify-center py-16">
                <RefreshCw className="animate-spin h-8 w-8 text-blue-600" />
              </div>
            ) : filteredPurchaseItems.length === 0 ? (
              /* Empty State */
              <div className="text-center py-16 px-4 space-y-4">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto">
                  <ShoppingCart size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    No products have been added to the Purchase List.
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                    Start planning your inventory purchases by manually adding items or importing out-of-stock items.
                  </p>
                </div>
                <Button
                  onClick={() => handleOpenAddModal()}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                >
                  <Plus size={16} className="mr-2" /> Add Purchase Item
                </Button>
              </div>
            ) : (
              /* Purchase List Table */
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 dark:bg-gray-700/40 text-[11px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                      <th className="py-3.5 px-4">Product</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4 text-center">Stock</th>
                      <th className="py-3.5 px-4 text-center">Suggested Qty</th>
                      <th className="py-3.5 px-4">Notes</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Added By</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 text-xs">
                    {filteredPurchaseItems.map((item) => {
                      const product = item.product_id;
                      const categoryName = product?.categoryId?.name || 'Uncategorized';
                      const currentStock = product?.stockQty ?? 0;

                      return (
                        <tr key={item._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                          {/* Product */}
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-gray-900 dark:text-white">
                              {product?.name || 'Deleted Product'}
                            </p>
                            {product?.modelNumber && (
                              <p className="text-[11px] font-mono text-gray-400 dark:text-gray-400">
                                Model: {product.modelNumber}
                              </p>
                            )}
                          </td>

                          {/* Category */}
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                              {categoryName}
                            </span>
                          </td>

                          {/* Current Stock */}
                          <td className="py-3.5 px-4 text-center">
                            <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                              currentStock === 0
                                ? 'bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {currentStock}
                            </span>
                          </td>

                          {/* Suggested Quantity */}
                          <td className="py-3.5 px-4 text-center">
                            <span className="font-extrabold text-sm text-blue-600 dark:text-blue-400">
                              {item.quantity}
                            </span>
                          </td>

                          {/* Notes */}
                          <td className="py-3.5 px-4 max-w-[200px] truncate text-gray-500 dark:text-gray-400 italic">
                            {item.notes || '—'}
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-4">
                            {item.status === 'Purchased' && (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 w-fit">
                                <CheckCircle size={12} /> Purchased
                              </span>
                            )}
                            {item.status === 'Pending' && (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1 w-fit">
                                <Clock size={12} /> Pending
                              </span>
                            )}
                            {item.status === 'Cancelled' && (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1 w-fit">
                                <XCircle size={12} /> Cancelled
                              </span>
                            )}
                          </td>

                          {/* Added By & Date */}
                          <td className="py-3.5 px-4 text-gray-500 dark:text-gray-400">
                            <p className="font-semibold text-gray-800 dark:text-gray-200">{item.created_by}</p>
                            <p className="text-[10px]">{new Date(item.createdAt).toLocaleDateString()}</p>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right space-x-1">
                            {item.status === 'Pending' && (
                              <>
                                <button
                                  onClick={() => handleStatusChange(item, 'Purchased')}
                                  title="Mark as Purchased"
                                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                                >
                                  <CheckCircle2 size={16} />
                                </button>
                                <button
                                  onClick={() => handleOpenEditModal(item)}
                                  title="Edit Quantity & Notes"
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                >
                                  <Edit3 size={16} />
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => handleDeleteItem(item)}
                              title="Remove from List"
                              className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: OUT OF STOCK */}
      {activeTab === 'out_of_stock' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Filters Bar */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3 text-gray-400" size={16} />
              <Input
                type="text"
                placeholder="Search out of stock products..."
                value={outOfStockSearch}
                onChange={(e) => setOutOfStockSearch(e.target.value)}
                className="pl-10 h-10 text-xs bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 rounded-xl"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={outOfStockCategoryFilter}
                onChange={(e) => setOutOfStockCategoryFilter(e.target.value)}
                className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Categories</option>
                {categories.map(cat => (
                  <option key={cat._id || cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table / Content */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            {loadingOutOfStock ? (
              <div className="flex items-center justify-center py-16">
                <RefreshCw className="animate-spin h-8 w-8 text-blue-600" />
              </div>
            ) : outOfStockItems.length === 0 ? (
              <div className="text-center py-16 px-4 space-y-3">
                <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle size={28} />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  No products are currently out of stock!
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  All inventory products have stock quantities greater than zero.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 dark:bg-gray-700/40 text-[11px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                      <th className="py-3.5 px-4">Product</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Supplier</th>
                      <th className="py-3.5 px-4 text-center">Stock</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 text-xs">
                    {outOfStockItems.map((prod) => {
                      const categoryName = prod.categoryId?.name || 'Uncategorized';
                      return (
                        <tr key={prod._id || prod.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">
                            {prod.name}
                            {prod.modelNumber && (
                              <span className="block text-[11px] font-mono font-normal text-gray-400">
                                SKU: {prod.modelNumber}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                              {categoryName}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300 font-medium">
                            {prod.supplierName || '—'}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="font-extrabold px-2.5 py-0.5 rounded-full text-[11px] bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800">
                              0
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <Button
                              size="sm"
                              onClick={() => handleQuickAddFromOutOfStock(prod)}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-1.5"
                            >
                              <Plus size={14} className="mr-1" /> Add to Purchase List
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD PURCHASE ITEM */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Product to Purchase List"
      >
        <form onSubmit={handleCreatePurchaseItem} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          {/* Product Search & Select */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Select Product
            </label>
            <div className="relative">
              <Input
                type="text"
                required
                placeholder="Search & select inventory product..."
                value={formProductSearch}
                onChange={(e) => {
                  setFormProductSearch(e.target.value);
                  setFormProductId('');
                }}
                className="w-full text-xs"
              />
              {filteredInventoryOptions.length > 0 && !formProductId && formProductSearch.trim() && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredInventoryOptions.map(prod => (
                    <button
                      key={prod._id || prod.id}
                      type="button"
                      onClick={() => {
                        setFormProductId(prod._id || prod.id);
                        setFormProductSearch(prod.name);
                      }}
                      className="w-full text-left p-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-xs transition-colors flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{prod.name}</p>
                        <p className="text-[10px] text-gray-400">Stock: {prod.stockQty}</p>
                      </div>
                      <span className="text-[10px] text-blue-600 font-semibold">Select</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Suggested Purchase Quantity
            </label>
            <Input
              type="number"
              min="1"
              required
              value={formQuantity}
              onChange={(e) => setFormQuantity(parseInt(e.target.value) || 1)}
              className="w-full text-xs"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Notes (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Add optional purchasing notes..."
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Add to List
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: EDIT PURCHASE ITEM */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Purchase List Entry"
      >
        <form onSubmit={handleUpdatePurchaseItem} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Product</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
              {editingItem?.product_id?.name}
            </p>
          </div>

          {/* Quantity */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Purchase Quantity
            </label>
            <Input
              type="number"
              min="1"
              required
              value={formQuantity}
              onChange={(e) => setFormQuantity(parseInt(e.target.value) || 1)}
              className="w-full text-xs"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Notes
            </label>
            <textarea
              rows={3}
              placeholder="Update purchasing notes..."
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
