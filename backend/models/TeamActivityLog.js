const mongoose = require('mongoose');

const teamActivityLogSchema = new mongoose.Schema({
  team_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  action: { type: String, required: true },
  description: { type: String, required: true },
  performed_by: { type: String, default: 'Admin' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TeamActivityLog', teamActivityLogSchema);
