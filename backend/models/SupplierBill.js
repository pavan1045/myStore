const mongoose = require('mongoose');

const supplierBillSchema = new mongoose.Schema({
  bill_number: { type: String, default: '' },
  supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  purchase_date: { type: String, required: true }, // ISO date string YYYY-MM-DD
  last_paid_date: { type: String, default: '' },
  invoice_amount: { type: Number, required: true },
  amount_paid: { type: Number, default: 0 },
  balance_amount: { type: Number, required: true },
  payment_status: { 
    type: String, 
    enum: ['Pending', 'Partially Paid', 'Paid'], 
    default: 'Pending' 
  },
  notes: { type: String, default: '' },
  attachment: { type: String, default: '' },
  isDeleted: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  team_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }
}, {
  timestamps: true
});

module.exports = mongoose.model('SupplierBill', supplierBillSchema);
