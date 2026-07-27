const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  modelNumber: { type: String },
  supplierName: { type: String, default: '' },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  stockQty: { type: Number, default: 0 },
  minQty: { type: Number, default: 2 },
  costPrice: { type: Number, default: 0 },
  sellingPrice: { type: Number, default: 0 },
  shelfLocation: { type: String },
  notes: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  team_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }
});

module.exports = mongoose.model('Item', itemSchema);

