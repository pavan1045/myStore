import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { InventoryTable } from '../components/inventory/InventoryTable';
import { InventoryToolbar } from '../components/inventory/InventoryToolbar';
import { Button } from '../components/common/Button';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { useInventory } from '../hooks/useInventory';
import { getStockStatus } from '../utils/stockUtils';

export default function Inventory() {
  const navigate = useNavigate();
  const { allItems, actions, loading } = useInventory();

  // Filter States
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Delete Confirmation State
  const [itemToDelete, setItemToDelete] = useState(null);

  // Derived & Filtered Data
  const filteredItems = useMemo(() => {
    if (!allItems) return [];

    return allItems.filter(item => {
      const matchesSearch = !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.modelNumber?.toLowerCase().includes(search.toLowerCase()) ||
        item.shelfLocation?.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = categoryFilter === 'all' || String(item.categoryId) === String(categoryFilter);

      const matchesStatus = statusFilter === 'all' || getStockStatus(item.stockQty, item.minQty) === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [allItems, search, categoryFilter, statusFilter]);

  // Handlers
  const handleEdit = useCallback((item) => {
    navigate(`/items/edit/${item.id}`);
  }, [navigate]);

  const handleDelete = useCallback(async () => {
    if (itemToDelete) {
      await actions.deleteItem(itemToDelete);
      setItemToDelete(null);
    }
  }, [itemToDelete, actions]);

  const handleAdjustStock = useCallback(async (id, amount) => {
    await actions.adjustStock(id, amount);
  }, [actions]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Total {allItems?.length || 0} items tracking stock across all locations.
          </p>
        </div>
        <Button onClick={() => navigate('/items/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      <InventoryToolbar
        search={search}
        setSearch={setSearch}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      <InventoryTable
        items={filteredItems}
        isLoading={loading}
        onEdit={handleEdit}
        onDelete={(id) => setItemToDelete(id)}
        onAdjustStock={handleAdjustStock}
      />

      <ConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action will permanently remove it from the inventory database."
      />
    </div>
  );
}
