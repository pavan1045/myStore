const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Activity = require('../models/Activity');

router.use(auth); // Protect all routes

router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const userId = req.user?.userId || req.userId;
    const teamId = req.teamId;
    const activities = await Activity.find({ $or: [{ team_id: teamId }, { userId }] })
      .sort({ timestamp: -1 })
      .limit(limit);
    res.json(activities.map(act => ({
      id: act._id,
      type: act.type,
      entityType: act.entityType,
      entityName: act.entityName,
      metadata: act.metadata,
      timestamp: act.timestamp
    })));
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
