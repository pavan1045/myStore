const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Item = require('../models/Item');
const Activity = require('../models/Activity');

router.use(auth); // Protect all routes

router.get('/', async (req, res) => {
  try {
    const userId = req.user?.userId || req.userId;
    const teamId = req.teamId;
    const items = await Item.find({ $or: [{ team_id: teamId }, { userId }] });

    res.json(items.map(item => ({
      id: item._id,
      _id: item._id,
      name: item.name,
      modelNumber: item.modelNumber || '',
      supplierName: item.supplierName || '',
      categoryId: item.categoryId ? item.categoryId.toString() : '',
      stockQty: item.stockQty || 0,
      minQty: item.minQty !== undefined ? item.minQty : 2,
      costPrice: item.costPrice || 0,
      sellingPrice: item.sellingPrice || 0,
      shelfLocation: item.shelfLocation || '',
      notes: item.notes || ''
    })));
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const userId = req.user?.userId || req.userId;
    const teamId = req.teamId;
    const newItem = new Item({ ...req.body, userId, team_id: teamId });
    const item = await newItem.save();
    
    await new Activity({
      type: 'ITEM_CREATED',
      entityType: 'Item',
      entityName: item.name,
      userId,
      team_id: teamId
    }).save();

    res.json({
      id: item._id,
      _id: item._id,
      name: item.name,
      modelNumber: item.modelNumber || '',
      supplierName: item.supplierName || '',
      categoryId: item.categoryId ? item.categoryId.toString() : '',
      stockQty: item.stockQty || 0,
      minQty: item.minQty !== undefined ? item.minQty : 2,
      costPrice: item.costPrice || 0,
      sellingPrice: item.sellingPrice || 0,
      shelfLocation: item.shelfLocation || '',
      notes: item.notes || ''
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const userId = req.user?.userId || req.userId;
    const teamId = req.teamId;
    const originalItem = await Item.findOne({ _id: req.params.id, $or: [{ team_id: teamId }, { userId }] });
    if (!originalItem) return res.status(404).json({ error: 'Item not found' });

    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    // Determine if it was a stock adjustment or item update
    let activityType = 'ITEM_UPDATED';
    let metadata = {};
    
    if (req.body.stockQty !== undefined && req.body.stockQty !== originalItem.stockQty) {
      const diff = req.body.stockQty - originalItem.stockQty;
      activityType = diff > 0 ? 'STOCK_INCREASED' : 'STOCK_DECREASED';
      metadata = { quantityChange: Math.abs(diff) };
    }

    await new Activity({
      type: activityType,
      entityType: 'Item',
      entityName: item.name,
      metadata,
      userId,
      team_id: teamId
    }).save();

    res.json({
      id: item._id,
      _id: item._id,
      name: item.name,
      modelNumber: item.modelNumber || '',
      supplierName: item.supplierName || '',
      categoryId: item.categoryId ? item.categoryId.toString() : '',
      stockQty: item.stockQty || 0,
      minQty: item.minQty !== undefined ? item.minQty : 2,
      costPrice: item.costPrice || 0,
      sellingPrice: item.sellingPrice || 0,
      shelfLocation: item.shelfLocation || '',
      notes: item.notes || ''
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user?.userId || req.userId;
    const teamId = req.teamId;
    const item = await Item.findOneAndDelete({ _id: req.params.id, $or: [{ team_id: teamId }, { userId }] });
    if (!item) return res.status(404).json({ error: 'Item not found' });

    await new Activity({
      type: 'ITEM_DELETED',
      entityType: 'Item',
      entityName: item.name,
      userId,
      team_id: teamId
    }).save();

    res.json({ msg: 'Item removed' });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
