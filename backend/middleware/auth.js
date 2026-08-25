const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Team = require('../models/Team');
const TeamMember = require('../models/TeamMember');
const TeamActivityLog = require('../models/TeamActivityLog');

const Item = require('../models/Item');
const Category = require('../models/Category');
const Activity = require('../models/Activity');
const Supplier = require('../models/Supplier');
const SupplierBill = require('../models/SupplierBill');
const SupplierPayment = require('../models/SupplierPayment');
const SupplierAuditLog = require('../models/SupplierAuditLog');

module.exports = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const jwtSecret = process.env.JWT_SECRET || 'super_secret_jwt_key_for_mystore';
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    req.userId = decoded.userId;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ error: 'User account not found.' });
    }

    if (user.status === 'Disabled') {
      return res.status(403).json({ error: 'Your account is disabled' });
    }

    // Check if user is explicitly disabled in their team membership
    const disabledMember = await TeamMember.findOne({ user_id: req.userId, status: 'Disabled' });
    if (disabledMember) {
      return res.status(403).json({ error: 'Your account is disabled' });
    }

    // Find active team membership for user
    let member = await TeamMember.findOne({ user_id: req.userId, status: 'Active' });

    if (!member) {
      const teamName = user.firstName 
        ? `${user.firstName}'s Team` 
        : (user.username ? `${user.username}'s Team` : 'My Store Team');

      const team = new Team({
        team_name: teamName,
        owner_user_id: user._id
      });
      await team.save();

      member = new TeamMember({
        team_id: team._id,
        user_id: user._id,
        role: 'Owner',
        status: 'Active'
      });
      await member.save();

      // Log Team Created activity
      await new TeamActivityLog({
        team_id: team._id,
        action: 'TEAM_CREATED',
        description: `Team "${team.team_name}" created.`,
        performed_by: user.username || user.firstName || 'Owner'
      }).save();

      // Backfill team_id for existing user records
      const updateFilter = { userId: user._id, $or: [{ team_id: { $exists: false } }, { team_id: null }] };
      const updateDoc = { $set: { team_id: team._id } };

      await Promise.all([
        Item.updateMany(updateFilter, updateDoc),
        Category.updateMany(updateFilter, updateDoc),
        Activity.updateMany(updateFilter, updateDoc),
        Supplier.updateMany(updateFilter, updateDoc),
        SupplierBill.updateMany(updateFilter, updateDoc),
        SupplierPayment.updateMany(updateFilter, updateDoc),
        SupplierAuditLog.updateMany(updateFilter, updateDoc)
      ]);
    }

    req.teamId = member.team_id;
    req.teamRole = member.role;

    next();
  } catch (ex) {
    console.error('Auth middleware error:', ex);
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};
