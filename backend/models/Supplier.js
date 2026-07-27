const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  supplier_name: { type: String, required: true },
  mobile_number: { type: String, required: true },
  company_name: { type: String, required: true },
  gst_number: { type: String, default: '' },
  address: { type: String, default: '' },
  isDeleted: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  team_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Supplier', supplierSchema);
