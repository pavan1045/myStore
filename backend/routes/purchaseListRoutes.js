const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const PurchaseList = require('../models/PurchaseList');
const Item = require('../models/Item');
const User = require('../models/User');
const TeamActivityLog = require('../models/TeamActivityLog');

// All routes require authentication
router.use(auth);

// Helper to get user display name
const getUserDisplayName = async (userId) => {
  if (!userId) return 'User';
  const user = await User.findById(userId);
  if (!user) return 'User';
  return user.username || user.firstName || 'User';
};

// GET /api/purchase-list - Get all purchase list items
router.get('/', async (req, res) => {
  try {
    const { status, category, search } = req.query;
    let query = { team_id: req.teamId };

    if (status && status !== 'All') {
      query.status = status;
    }

    let items = await PurchaseList.find(query)
      .populate({
        path: 'product_id',
        populate: { path: 'categoryId', select: 'name' }
      })
      .sort({ createdAt: -1 });

    // Filter out items where product no longer exists
    items = items.filter(item => item.product_id != null);

    // Apply category & search filters if specified
    if (category && category !== 'All') {
      items = items.filter(item => 
        item.product_id?.categoryId?.name === category || 
        item.product_id?.categoryId?._id?.toString() === category
      );
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter(item => {
        const pName = item.product_id?.name?.toLowerCase() || '';
        const pModel = item.product_id?.modelNumber?.toLowerCase() || '';
        const notes = item.notes?.toLowerCase() || '';
        return pName.includes(q) || pModel.includes(q) || notes.includes(q);
      });
    }

    res.json(items);
  } catch (error) {
    console.error('Get purchase list error:', error);
    res.status(500).json({ error: 'Server error fetching purchase list' });
  }
});

// GET /api/purchase-list/out-of-stock - Get all items with stockQty == 0
router.get('/out-of-stock', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = { team_id: req.teamId, stockQty: 0 };

    let items = await Item.find(query)
      .populate('categoryId', 'name')
      .sort({ name: 1 });

    if (category && category !== 'All') {
      items = items.filter(item => 
        item.categoryId?.name === category || 
        item.categoryId?._id?.toString() === category
      );
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter(item => {
        const name = item.name?.toLowerCase() || '';
        const model = item.modelNumber?.toLowerCase() || '';
        return name.includes(q) || model.includes(q);
      });
    }

    res.json(items);
  } catch (error) {
    console.error('Get out of stock items error:', error);
    res.status(500).json({ error: 'Server error fetching out of stock items' });
  }
});

// POST /api/purchase-list - Add item to purchase list
router.post('/', async (req, res) => {
  try {
    const { product_id, quantity, notes } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Duplicate Prevention: Check if product already exists with Pending status
    const existingPending = await PurchaseList.findOne({
      team_id: req.teamId,
      product_id: product_id,
      status: 'Pending'
    });

    if (existingPending) {
      return res.status(400).json({ error: 'This product is already in your Purchase List.' });
    }

    const product = await Item.findById(product_id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const userName = await getUserDisplayName(req.userId);

    const purchaseItem = new PurchaseList({
      team_id: req.teamId,
      product_id: product_id,
      quantity: Number(quantity) || 1,
      notes: notes || '',
      status: 'Pending',
      user_id: req.userId,
      created_by: userName
    });

    await purchaseItem.save();

    // Log Activity
    await new TeamActivityLog({
      team_id: req.teamId,
      action: 'PURCHASE_LIST_ADDED',
      description: `${product.name} added to Purchase List by ${userName}.`,
      performed_by: userName
    }).save();

    const populatedItem = await PurchaseList.findById(purchaseItem._id).populate({
      path: 'product_id',
      populate: { path: 'categoryId', select: 'name' }
    });

    res.status(201).json(populatedItem);
  } catch (error) {
    console.error('Add purchase list item error:', error);
    res.status(500).json({ error: 'Server error adding purchase list item' });
  }
});

// PUT /api/purchase-list/:id - Update purchase list item
router.put('/:id', async (req, res) => {
  try {
    const { quantity, notes, status } = req.body;

    const item = await PurchaseList.findOne({
      _id: req.params.id,
      team_id: req.teamId
    }).populate('product_id');

    if (!item) {
      return res.status(404).json({ error: 'Purchase list item not found' });
    }

    const userName = await getUserDisplayName(req.userId);
    const productName = item.product_id ? item.product_id.name : 'Product';
    let activityLogMsg = '';

    if (status && status !== item.status) {
      item.status = status;
      if (status === 'Purchased') {
        item.purchased_at = new Date();
        const addQty = Number(item.quantity) || 1;
        activityLogMsg = `${productName} marked as Purchased.`;

        // Update product inventory stock
        if (item.product_id) {
          const product = await Item.findById(item.product_id._id || item.product_id);
          if (product) {
            product.stockQty = (product.stockQty || 0) + addQty;
            await product.save();
            activityLogMsg = `${productName} marked as Purchased. Stock increased by ${addQty} (New Stock: ${product.stockQty}).`;
          }
        }
      } else if (status === 'Cancelled') {
        activityLogMsg = `${productName} marked as Cancelled.`;
      } else {
        activityLogMsg = `${productName} status updated to ${status}.`;
      }
    } else if (quantity !== undefined && Number(quantity) !== item.quantity) {
      const oldQty = item.quantity;
      item.quantity = Number(quantity);
      activityLogMsg = `Quantity for ${productName} changed from ${oldQty} to ${item.quantity}.`;
    } else if (notes !== undefined) {
      item.notes = notes;
      activityLogMsg = `Notes updated for ${productName}.`;
    }

    if (quantity !== undefined) item.quantity = Number(quantity);
    if (notes !== undefined) item.notes = notes;

    await item.save();

    if (activityLogMsg) {
      await new TeamActivityLog({
        team_id: req.teamId,
        action: 'PURCHASE_LIST_UPDATED',
        description: activityLogMsg,
        performed_by: userName
      }).save();
    }

    const updatedItem = await PurchaseList.findById(item._id).populate({
      path: 'product_id',
      populate: { path: 'categoryId', select: 'name' }
    });

    res.json(updatedItem);
  } catch (error) {
    console.error('Update purchase list item error:', error);
    res.status(500).json({ error: 'Server error updating purchase list item' });
  }
});

// DELETE /api/purchase-list/:id - Remove purchase list item
router.delete('/:id', async (req, res) => {
  try {
    const item = await PurchaseList.findOne({
      _id: req.params.id,
      team_id: req.teamId
    }).populate('product_id');

    if (!item) {
      return res.status(404).json({ error: 'Purchase list item not found' });
    }

    const userName = await getUserDisplayName(req.userId);
    const productName = item.product_id ? item.product_id.name : 'Product';

    await PurchaseList.deleteOne({ _id: item._id });

    // Log Activity
    await new TeamActivityLog({
      team_id: req.teamId,
      action: 'PURCHASE_LIST_REMOVED',
      description: `${productName} removed from Purchase List.`,
      performed_by: userName
    }).save();

    res.json({ success: true, message: 'Purchase list item removed successfully' });
  } catch (error) {
    console.error('Delete purchase list item error:', error);
    res.status(500).json({ error: 'Server error removing purchase list item' });
  }
});

module.exports = router;
