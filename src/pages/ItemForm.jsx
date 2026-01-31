import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useCategories, useItem } from '../hooks/useData';
import { dbService } from '../services/dbService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';

export default function ItemForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const categories = useCategories();
  const existingItem = useItem(id);

  const [formData, setFormData] = useState({
    name: '',
    modelNumber: '',
    categoryId: '',
    quantity: 0,
    shelfLocation: '',
    notes: ''
  });
  const [error, setError] = useState('');

  // Populate form when existing item loads
  useEffect(() => {
    if (existingItem) {
      setFormData({
        name: existingItem.name,
        modelNumber: existingItem.modelNumber || '',
        categoryId: existingItem.categoryId || '',
        quantity: existingItem.quantity || 0,
        shelfLocation: existingItem.shelfLocation || '',
        notes: existingItem.notes || ''
      });
    }
  }, [existingItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name) return setError('Item Name is required');
    if (!formData.categoryId) return setError('Category is required');

    try {
      const payload = {
        ...formData,
        categoryId: Number(formData.categoryId), // Ensure number
        quantity: Number(formData.quantity)
      };

      if (isEditMode) {
        await dbService.updateItem(Number(id), payload);
      } else {
        await dbService.addItem(payload);
      }
      navigate('/items');
    } catch (err) {
      console.error(err);
      setError('Failed to save item.');
    }
  };

  if (isEditMode && !existingItem) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/items')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          {isEditMode ? 'Edit Item' : 'Add New Item'}
        </h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Item Name *"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Micro USB Cable"
                required
              />
              <Input
                label="Model Number"
                value={formData.modelNumber}
                onChange={e => setFormData({ ...formData, modelNumber: e.target.value })}
                placeholder="SN-12345"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Category *</label>
                <select
                  className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.categoryId}
                  onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                  required
                >
                  <option value="">Select Category</option>
                  {categories?.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <Input
                type="number"
                label="Quantity"
                value={formData.quantity}
                onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                min="0"
              />
            </div>

            <Input
              label="Shelf Location"
              value={formData.shelfLocation}
              onChange={e => setFormData({ ...formData, shelfLocation: e.target.value })}
              placeholder="Row A, Shelf 3"
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                className="w-full min-h-[100px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional details..."
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
          </CardContent>
          <CardFooter className="flex justify-end space-x-2 border-t bg-gray-50/50 p-6">
            <Button type="button" variant="secondary" onClick={() => navigate('/items')}>
              Cancel
            </Button>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Save Item
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
