import React, { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import { useInventory } from '../hooks/useInventory';
import { CategoryGrid } from '../components/categories/CategoryGrid';
import { CategoryForm } from '../components/categories/CategoryForm';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { ConfirmationModal } from '../components/common/ConfirmationModal';

export default function Categories() {
    const { categories, actions, loading: catsLoading } = useCategories();
    const { allItems, loading: itemsLoading } = useInventory();

    // State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Handlers
    const handleAddStart = () => {
        setEditingCategory(null);
        setIsFormOpen(true);
    };

    const handleEditStart = (category) => {
        setEditingCategory(category);
        setIsFormOpen(true);
    };

    const handleFormSubmit = async (data) => {
        setIsLoading(true);
        try {
            if (editingCategory) {
                const catId = editingCategory.id || editingCategory._id;
                await actions.updateCategory(catId, data);
            } else {
                await actions.addCategory(data.name, data.description);
            }
            setIsFormOpen(false);
        } catch (error) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!categoryToDelete) return;
        setIsLoading(true);
        try {
            await actions.deleteCategory(categoryToDelete);
            setCategoryToDelete(null);
        } catch (error) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Organize your inventory by creating and managing product categories.
                    </p>
                </div>
                <Button onClick={handleAddStart}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                </Button>
            </div>

            <CategoryGrid
                categories={categories || []}
                items={allItems || []}
                onEdit={handleEditStart}
                onDelete={(id) => setCategoryToDelete(id)}
            />

            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingCategory ? 'Edit Category' : 'Add Category'}
            >
                <CategoryForm
                    category={editingCategory}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setIsFormOpen(false)}
                    isLoading={isLoading}
                />
            </Modal>

            <ConfirmationModal
                isOpen={!!categoryToDelete}
                onClose={() => setCategoryToDelete(null)}
                onConfirm={handleDelete}
                title="Delete Category"
                message="Are you sure you want to delete this category? This will also remove the categorization from all items in this category. (Note: Safety check prevents deleting categories with items)."
                isLoading={isLoading}
            />
        </div>
    );
}
