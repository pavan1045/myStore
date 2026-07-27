const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  team_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { 
    type: String, 
    enum: ['Owner', 'Member'], 
    default: 'Member' 
  },
  status: { 
    type: String, 
    enum: ['Active', 'Pending', 'Disabled', 'Removed'], 
    default: 'Active' 
  },
  joined_at: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('TeamMember', teamMemberSchema);
