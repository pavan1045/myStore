const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Category = require('../models/Category');
const Item = require('../models/Item');
const Activity = require('../models/Activity');

router.use(auth); // Protect all routes

router.get('/', async (req, res) => {
  try {
    const userId = req.user?.userId || req.userId;
    const teamId = req.teamId;
    const categories = await Category.find({ $or: [{ team_id: teamId }, { userId }] });
    res.json(categories.map(c => ({
      id: c._id,
      _id: c._id,
      name: c.name,
      description: c.description || ''
    })));
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const userId = req.user?.userId || req.userId;
    const teamId = req.teamId;
    const newCategory = new Category({ ...req.body, userId, team_id: teamId });
    const category = await newCategory.save();

    await new Activity({
      type: 'CATEGORY_CREATED',
      entityType: 'Category',
      entityName: category.name,
      userId,
      team_id: teamId
    }).save();

    res.json({
      id: category._id,
      _id: category._id,
      name: category.name,
      description: category.description || ''
    });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;
    const userId = req.user?.userId || req.userId;
    const teamId = req.teamId;

    let category = await Category.findOne({ _id: categoryId, $or: [{ team_id: teamId }, { userId }] });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    category.name = req.body.name !== undefined ? req.body.name : category.name;
    category.description = req.body.description !== undefined ? req.body.description : category.description;
    await category.save();

    await new Activity({
      type: 'CATEGORY_UPDATED',
      entityType: 'Category',
      entityName: category.name,
      userId,
      team_id: teamId
    }).save();

    res.json({
      id: category._id,
      _id: category._id,
      name: category.name,
      description: category.description || ''
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;
    const userId = req.user?.userId || req.userId;
    const teamId = req.teamId;

    const category = await Category.findOne({ _id: categoryId, $or: [{ team_id: teamId }, { userId }] });
    if (!category) return res.status(404).json({ error: 'Category not found' });

    const items = await Item.find({ categoryId, $or: [{ team_id: teamId }, { userId }] });
    if (items.length > 0) {
      return res.status(400).json({ error: 'Cannot delete category with items' });
    }

    await Category.findByIdAndDelete(categoryId);

    await new Activity({
      type: 'CATEGORY_DELETED',
      entityType: 'Category',
      entityName: category.name,
      userId,
      team_id: teamId
    }).save();

    res.json({ msg: 'Category removed' });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
