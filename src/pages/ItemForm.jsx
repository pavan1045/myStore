import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Package } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useInventory } from '../hooks/useInventory';
import { useCategories } from '../hooks/useCategories';
import { Modal } from '../components/common/Modal';
import { CategoryForm } from '../components/categories/CategoryForm';

export default function ItemForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { actions, allItems } = useInventory();
  const { categories, actions: categoryActions } = useCategories();

  const isEditing = !!id;
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    modelNumber: '',
    supplierName: '',
    categoryId: '',
    stockQty: 0,
    minQty: 2,
    costPrice: 0,
    sellingPrice: 0,
    shelfLocation: '',
    notes: ''
  });

  useEffect(() => {
    if (isEditing && allItems) {
      const item = allItems.find(i => String(i.id) === String(id) || String(i._id) === String(id));
      if (item) {
        setFormData({
          name: item.name || '',
          modelNumber: item.modelNumber || '',
          supplierName: item.supplierName || '',
          categoryId: item.categoryId || '',
          stockQty: item.stockQty || 0,
          minQty: item.minQty || 0,
          costPrice: item.costPrice || 0,
          sellingPrice: item.sellingPrice || 0,
          shelfLocation: item.shelfLocation || '',
          notes: item.notes || ''
        });
      }
    }
  }, [id, isEditing, allItems]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        categoryId: formData.categoryId,
        stockQty: Number(formData.stockQty),
        minQty: Number(formData.minQty),
        costPrice: Number(formData.costPrice),
        sellingPrice: Number(formData.sellingPrice),
        updatedAt: new Date().toISOString()
      };

      if (isEditing) {
        await actions.updateItem(id, payload);
      } else {
        await actions.addItem(payload);
      }
      navigate('/items');
    } catch (error) {
      alert('Failed to save item: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === 'create_new') {
      setIsCategoryModalOpen(true);
    } else {
      setFormData({ ...formData, categoryId: value });
    }
  };

  const handleCategorySubmit = async (data) => {
    setIsCategoryLoading(true);
    try {
      const newCat = await categoryActions.addCategory(data.name, data.description);
      setIsCategoryModalOpen(false);
      if (newCat && newCat.id) {
        setFormData(prev => ({ ...prev, categoryId: newCat.id }));
      } else if (newCat && newCat._id) {
        setFormData(prev => ({ ...prev, categoryId: newCat._id }));
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setIsCategoryLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} className="dark:text-white" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isEditing ? `Modifying SKU: ${formData.modelNumber || 'N/A'}` : 'Register a new item in the inventory system.'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6 bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
            <Package size={20} />
            <h2 className="font-bold uppercase tracking-wider text-xs">General Information</h2>
          </div>

          <Input
            label="Product Name"
            placeholder="e.g. Cat6 Ethernet Cable"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Model / SKU Number"
            placeholder="e.g. SKU-12345"
            value={formData.modelNumber}
            onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })}
          />

          <Input
            label="Supplier Name"
            placeholder="e.g. Acme Supplies Inc."
            value={formData.supplierName}
            onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
          />

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Category</label>
            <select
              className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={formData.categoryId}
              onChange={handleCategoryChange}
              required
            >
              <option value="">Select a Category</option>
              <option value="create_new" className="font-bold text-blue-600 dark:text-blue-400">➕ Create Category</option>
              {categories?.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-6 bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
            <Package size={20} />
            <h2 className="font-bold uppercase tracking-wider text-xs">Stock & Logistics</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label="Stock Quantity"
              value={formData.stockQty}
              onChange={(e) => setFormData({ ...formData, stockQty: e.target.value })}
              min="0"
              required
            />
            <Input
              type="number"
              label="Min Threshold"
              value={formData.minQty}
              onChange={(e) => setFormData({ ...formData, minQty: e.target.value })}
              min="0"
              required
              helperText="Alerts when stock is ≤ this value"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              step="any"
              label="Cost Price"
              placeholder="0.00"
              value={formData.costPrice}
              onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
              min="0"
            />
            <Input
              type="number"
              step="any"
              label="Selling Price"
              placeholder="0.00"
              value={formData.sellingPrice}
              onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
              min="0"
            />
          </div>

          <Input
            label="Shelf Location"
            placeholder="e.g. A-12-3"
            value={formData.shelfLocation}
            onChange={(e) => setFormData({ ...formData, shelfLocation: e.target.value })}
          />

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Notes & Specifications</label>
            <textarea
              className="w-full h-24 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Technical details, supplier info, etc."
            />
          </div>
        </div>

        <div className="md:col-span-2 flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/items')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
          >
            <Save className="mr-2 h-4 w-4" />
            {isEditing ? 'Update Item' : 'Create Item'}
          </Button>
        </div>
      </form>

      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Add Category"
      >
        <CategoryForm
          onSubmit={handleCategorySubmit}
          onCancel={() => setIsCategoryModalOpen(false)}
          isLoading={isCategoryLoading}
        />
      </Modal>
    </div>
  );
}
