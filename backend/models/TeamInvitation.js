const mongoose = require('mongoose');

const teamInvitationSchema = new mongoose.Schema({
  team_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  invite_token: { type: String, required: true, unique: true },
  invited_email: { type: String, default: '' },
  invited_phone: { type: String, default: '' },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expires_at: { type: Date },
  accepted_at: { type: Date },
  status: { 
    type: String, 
    enum: ['Pending', 'Accepted', 'Expired', 'Cancelled'], 
    default: 'Pending' 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TeamInvitation', teamInvitationSchema);
