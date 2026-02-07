import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, Edit2, Trash2 } from 'lucide-react';
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

  const handleUpdate = async () => {
    const numValue = Number(value);
    // Optimization: Don't save if value hasn't changed or is invalid
    if (numValue === initialQuantity || isNaN(numValue)) return;

    setIsSaving(true);
    try {
      await dbService.updateItem(itemId, { quantity: numValue });
    } catch (err) {
      console.error("Failed to update quantity", err);
      setValue(initialQuantity); // Revert on error
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur(); // Trigger blur to save
    }
  };

  return (
    <div className="relative">
      <input
        type="number"
        min="0"
        className={`w-20 px-2 py-1 text-right text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${value === 0 || value === '0' ? 'text-red-600 border-red-300 bg-red-50' : 'border-gray-300 text-gray-900'
          }`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleUpdate}
        onKeyDown={handleKeyDown}
      />
      {isSaving && (
        <span className="absolute -right-3 top-2 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" title="Saving..."></span>
      )}
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
                <th className="px-4 py-3 text-right">Qty</th>
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
                    <td className="px-4 py-3 text-right font-mono font-medium">
                      <QuantityCell itemId={item.id} initialQuantity={item.quantity} />
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/items/edit/${item.id}`)}>
                        <Edit2 className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
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
