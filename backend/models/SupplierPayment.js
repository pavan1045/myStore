const mongoose = require('mongoose');

const supplierPaymentSchema = new mongoose.Schema({
  bill_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SupplierBill', required: true },
  supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  payment_date: { type: String, required: true },
  payment_amount: { type: Number, required: true },
  payment_method: { 
    type: String, 
    enum: ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Card'], 
    required: true 
  },
  reference_number: { type: String, default: '' },
  remarks: { type: String, default: '' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  team_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }
}, {
  timestamps: true
});

module.exports = mongoose.model('SupplierPayment', supplierPaymentSchema);
