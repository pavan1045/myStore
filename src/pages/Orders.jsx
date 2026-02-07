import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, Clock } from 'lucide-react';
import { dbService } from '../services/dbService';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null); // For editing, though requirements just said Add
  const [formData, setFormData] = useState({ itemName: '', quantity: 1 });
  const [error, setError] = useState('');

  // Deletion state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  // Fetch orders
  const loadOrders = async () => {
    const data = await dbService.getOrders();
    setOrders(data);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.itemName.trim()) {
      setError('Item Name is required');
      return;
    }

    try {
      await dbService.addOrder({
        itemName: formData.itemName,
        quantity: parseInt(formData.quantity) || 1
      });
      setIsModalOpen(false);
      setFormData({ itemName: '', quantity: 1 });
      loadOrders();
    } catch (err) {
      console.error(err);
      setError('Failed to save order');
    }
  };

  const handleDelete = (id) => {
    setOrderToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;
    try {
      await dbService.deleteOrder(orderToDelete);
      loadOrders();
    } catch (err) {
      console.error(err);
      alert('Failed to delete order');
    } finally {
      setOrderToDelete(null);
    }
  };

  const handleStatusUpdate = async (id, currentStatus) => {
    const newStatus = currentStatus === 'pending' ? 'ordered' : 'pending';
    await dbService.updateOrder(id, { status: newStatus });
    loadOrders();
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const completedOrders = orders.filter(o => o.status === 'ordered');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Pending Orders</h1>
          <p className="text-gray-500">Track items that need to be purchased.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Order
        </Button>
      </div>

      {/* Pending Orders List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-orange-600">
            <Clock className="h-5 w-5 mr-2" />
            Pending ({pendingOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingOrders.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No pending orders.</p>
          ) : (
            <div className="divide-y">
              {pendingOrders.map(order => (
                <div key={order.id} className="py-3 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-900">{order.itemName}</h3>
                    <p className="text-sm text-gray-500">Qty: {order.quantity} • Created: {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="secondary" size="sm" onClick={() => handleStatusUpdate(order.id, 'pending')} title="Mark as Ordered">
                      Mark Ordered
                    </Button>
                    <button
                      onClick={() => handleDelete(order.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ordered / History List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-green-600">
            <CheckCircle className="h-5 w-5 mr-2" />
            Completed History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {completedOrders.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No order history.</p>
          ) : (
            <div className="divide-y opacity-75">
              {completedOrders.map(order => (
                <div key={order.id} className="py-3 flex justify-between items-center bg-gray-50 px-2 rounded">
                  <div className="line-through text-gray-500">
                    <h3 className="font-medium">{order.itemName}</h3>
                    <p className="text-xs">Qty: {order.quantity}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStatusUpdate(order.id, 'ordered')}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Re-open
                    </button>
                    <button
                      onClick={() => handleDelete(order.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Item to Order List"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Item Name"
            value={formData.itemName}
            onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
            placeholder="e.g., USB-C Cable"
            required
          />
          <Input
            label="Quantity Needed"
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            min="1"
            required
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Add to List
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Remove Order?"
        message="Are you sure you want to remove this order from the list? This action cannot be undone."
      />
    </div>
  );
}
