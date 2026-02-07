import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, Edit2, Trash2, Minus } from 'lucide-react';
import { useItems, useCategories } from '../hooks/useData';
import { dbService } from '../services/dbService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { formatDateToDisplay } from '../utils/utils';

// Helper Component for Inline Quantity
function QuantityCell({ itemId, initialQuantity }) {
  const [value, setValue] = useState(initialQuantity);
  const [isSaving, setIsSaving] = useState(false);

  const handleIncrement = () => {
    const newVal = Number(value) + 1;
    setValue(newVal);
    saveUpdate(newVal);
  };

  const handleDecrement = () => {
    const newVal = Math.max(0, Number(value) - 1);
    setValue(newVal);
    saveUpdate(newVal);
  };

  const saveUpdate = async (numValue) => {
    if (isNaN(numValue) || numValue < 0) return;
    setIsSaving(true);
    try {
      await dbService.updateItem(itemId, { quantity: numValue });
    } catch (err) {
      console.error("Failed to update quantity", err);
      setValue(initialQuantity);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = () => {
    const numValue = Number(value);
    if (numValue === initialQuantity || isNaN(numValue)) return;
    saveUpdate(numValue);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  return (
    <div className="flex items-center justify-center space-x-2 group pl-3.5">
      <div className="relative flex items-center bg-gray-50 border border-gray-300 rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-blue-500 transition-all">
        <button
          onClick={handleDecrement}
          disabled={isSaving || value <= 0}
          className="p-1 hover:bg-gray-200 text-gray-500 disabled:opacity-30 transition-colors border-r border-gray-200"
          title="Decrease"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <input
          type="number"
          min="0"
          className={`w-12 px-1 py-1 text-center text-sm bg-transparent focus:outline-none transition-colors font-mono font-medium ${value === 0 || value === '0' ? 'text-red-600' : 'text-gray-900'
            }`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleUpdate}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleIncrement}
          disabled={isSaving}
          className="p-1 hover:bg-gray-200 text-gray-500 disabled:opacity-30 transition-colors border-l border-gray-200"
          title="Increase"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="w-1.5 h-1.5 flex-shrink-0">
        {isSaving && (
          <span className="block w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
        )}
      </div>
    </div>
  );
}

export default function Inventory() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || '');

  // Deletion state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Synchronize category state with URL parameter
  useEffect(() => {
    setSelectedCategory(categoryParam || '');
  }, [categoryParam]);

  const items = useItems();
  const categories = useCategories();

  const filteredItems = React.useMemo(() => {
    if (!items) return [];

    return items.filter(item => {
      const matchSearch = !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.modelNumber?.toLowerCase().includes(search.toLowerCase());

      const matchCategory = !selectedCategory || item.categoryId === Number(selectedCategory);

      return matchSearch && matchCategory;
    });
  }, [items, search, selectedCategory]);

  const handleDelete = (id) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await dbService.deleteItem(itemToDelete);
    } catch (err) {
      console.error(err);
      alert('Failed to delete item');
    } finally {
      setItemToDelete(null);
    }
  };

  const getCategoryName = (id) => {
    return categories?.find(c => c.id === id)?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Inventory</h1>
          <p className="text-gray-500">Manage your stock items.</p>
        </div>
        <Button onClick={() => navigate('/items/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Item
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="pl-9"
            placeholder="Search items by name or model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="sm:w-64">
          <select
            className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories?.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Model</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Date Added</th>
                <th className="px-4 py-3 text-center">Qty</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No items found.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                    <td className="px-4 py-3 text-gray-500">{item.modelNumber || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {getCategoryName(item.categoryId)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{item.shelfLocation || '-'}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDateToDisplay(item.addedDate) || '-'}</td>
                    <td className="px-4 py-3 text-center font-mono font-medium">
                      <QuantityCell itemId={item.id} initialQuantity={item.quantity} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-50 group/edit" onClick={() => navigate(`/items/edit/${item.id}`)}>
                          <Edit2 className="h-4 w-4 text-blue-600 group-hover/edit:scale-110 transition-transform" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50 group/delete" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-4 w-4 text-red-500 group-hover/delete:scale-110 transition-transform" />
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

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Item?"
        message="Are you sure you want to delete this item from your inventory? This action cannot be undone."
      />
    </div>
  );
}
