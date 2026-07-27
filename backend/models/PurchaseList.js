const mongoose = require('mongoose');

const purchaseListSchema = new mongoose.Schema({
  team_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  quantity: { type: Number, required: true, default: 1 },
  notes: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['Pending', 'Purchased', 'Cancelled'], 
    default: 'Pending' 
  },
  created_by: { type: String, default: 'System' },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  purchased_at: { type: Date, default: null }
}, {
  timestamps: true
});

module.exports = mongoose.model('PurchaseList', purchaseListSchema);
