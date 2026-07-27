const mongoose = require('mongoose');

const supplierAuditLogSchema = new mongoose.Schema({
  entity_type: { type: String, default: 'Supplier Bill' },
  entity_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  action: { 
    type: String, 
    enum: ['BILL_CREATED', 'BILL_UPDATED', 'PAYMENT_ADDED', 'PAYMENT_UPDATED', 'BILL_CLEARED', 'BILL_DELETED', 'SUPPLIER_CREATED', 'SUPPLIER_UPDATED', 'SUPPLIER_DELETED'],
    required: true 
  },
  description: { type: String, required: true },
  old_value: { type: Object, default: null },
  new_value: { type: Object, default: null },
  performed_by: { type: String, default: 'Admin' },
  timestamp: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  team_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }
});

module.exports = mongoose.model('SupplierAuditLog', supplierAuditLogSchema);
