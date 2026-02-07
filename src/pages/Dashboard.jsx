import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit2, Package } from 'lucide-react';
import { useCategories, useItems } from '../hooks/useData';
import { dbService } from '../services/dbService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const categories = useCategories();
  const items = useItems(); // Fetch all items to calculate counts
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [error, setError] = useState('');

  // Deletion state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name });
    } else {
      setEditingCategory(null);
      setFormData({ name: '' });
    }
    setError('');
    setIsModalOpen(true);
  };

  const handleCardClick = (categoryId) => {
    navigate(`/items?category=${categoryId}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      if (editingCategory) {
        await dbService.updateCategory(editingCategory.id, formData.name.trim());
      } else {
        await dbService.addCategory(formData.name.trim());
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      setError('Failed to save category. Name might already exist.');
    }
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    setCategoryToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await dbService.deleteCategory(categoryToDelete);
    } catch (err) {
      console.error(err);
      alert('Failed to delete category');
    } finally {
      setCategoryToDelete(null);
    }
  };

  const handleEdit = (e, category) => {
    e.stopPropagation();
    handleOpenModal(category);
  };

  if (!categories) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Manage your inventory categories and overview.</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No categories</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new category.</p>
            <div className="mt-6">
              <Button onClick={() => handleOpenModal()}>Add Category</Button>
            </div>
          </div>
        ) : (
          categories.map((category) => (
            <Card
              key={category.id}
              className="hover:border-blue-200 transition-colors group cursor-pointer"
              onClick={() => handleCardClick(category.id)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                  {category.name}
                </CardTitle>
                <Package className="h-4 w-4 text-gray-500 group-hover:text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {items ? items.filter(i => i.categoryId === category.id).length : 0}
                </div>
                <p className="text-xs text-gray-500">Items</p>
                <div className="flex justify-end space-x-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" onClick={(e) => handleEdit(e, category)}>
                    <Edit2 className="h-4 w-4 text-gray-500" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={(e) => handleDelete(e, category.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Category Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Cables"
            error={error}
            autoFocus
          />
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Category?"
        message="Are you sure you want to delete this category? This will also remove all items associated with it. This action cannot be undone."
      />
    </div>
  );
}
