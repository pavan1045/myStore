const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Supplier = require('../models/Supplier');
const SupplierBill = require('../models/SupplierBill');
const SupplierAuditLog = require('../models/SupplierAuditLog');

router.use(auth);

// GET all suppliers with computed summary statistics
router.get('/', async (req, res) => {
  try {
    const userId = req.userId || req.user?.userId;
    const teamId = req.teamId;
    const suppliers = await Supplier.find({ $or: [{ team_id: teamId }, { userId }], isDeleted: { $ne: true } }).sort({ createdAt: -1 });
    const bills = await SupplierBill.find({ $or: [{ team_id: teamId }, { userId }], isDeleted: { $ne: true } });

    const result = suppliers.map(sup => {
      const supBills = bills.filter(b => b.supplier_id.toString() === sup._id.toString());
      
      const total_purchase_amount = supBills.reduce((sum, b) => sum + (b.invoice_amount || 0), 0);
      const total_paid = supBills.reduce((sum, b) => sum + (b.amount_paid || 0), 0);
      const outstanding_balance = supBills.reduce((sum, b) => sum + (b.balance_amount || 0), 0);
      const pending_bills_count = supBills.filter(b => b.payment_status !== 'Paid').length;
      
      let last_purchase_date = null;
      if (supBills.length > 0) {
        const sortedDates = supBills.map(b => b.purchase_date).filter(Boolean).sort().reverse();
        last_purchase_date = sortedDates[0] || null;
      }

      return {
        id: sup._id,
        _id: sup._id,
        supplier_name: sup.supplier_name,
        mobile_number: sup.mobile_number,
        company_name: sup.company_name,
        gst_number: sup.gst_number || '',
        address: sup.address || '',
        total_purchase_amount,
        total_paid,
        outstanding_balance,
        pending_bills_count,
        last_purchase_date,
        createdAt: sup.createdAt
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Fetch suppliers error:', error);
    res.status(500).json({ error: 'Server error fetching suppliers' });
  }
});

// POST create supplier
router.post('/', async (req, res) => {
  try {
    const userId = req.userId || req.user?.userId;
    const teamId = req.teamId;
    const { supplier_name, mobile_number, company_name, gst_number, address } = req.body;

    if (!supplier_name || !mobile_number || !company_name) {
      return res.status(400).json({ error: 'Supplier Name, Mobile Number, and Company Name are required' });
    }

    const newSupplier = new Supplier({
      supplier_name,
      mobile_number,
      company_name,
      gst_number: gst_number || '',
      address: address || '',
      userId,
      team_id: teamId
    });

    const saved = await newSupplier.save();

    await new SupplierAuditLog({
      entity_type: 'Supplier',
      entity_id: saved._id,
      action: 'SUPPLIER_CREATED',
      description: `Supplier "${saved.supplier_name}" (${saved.company_name}) added.`,
      new_value: { supplier_name, mobile_number, company_name, gst_number, address },
      performed_by: req.user?.username || 'Admin',
      userId,
      team_id: teamId
    }).save();

    res.json({
      id: saved._id,
      _id: saved._id,
      supplier_name: saved.supplier_name,
      mobile_number: saved.mobile_number,
      company_name: saved.company_name,
      gst_number: saved.gst_number || '',
      address: saved.address || '',
      total_purchase_amount: 0,
      total_paid: 0,
      outstanding_balance: 0,
      pending_bills_count: 0,
      last_purchase_date: null,
      createdAt: saved.createdAt
    });
  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({ error: 'Server error creating supplier' });
  }
});

// PUT update supplier
router.put('/:id', async (req, res) => {
  try {
    const userId = req.userId || req.user?.userId;
    const teamId = req.teamId;
    const supplierId = req.params.id;

    const supplier = await Supplier.findOne({ _id: supplierId, $or: [{ team_id: teamId }, { userId }], isDeleted: { $ne: true } });
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });

    const oldValue = {
      supplier_name: supplier.supplier_name,
      mobile_number: supplier.mobile_number,
      company_name: supplier.company_name,
      gst_number: supplier.gst_number,
      address: supplier.address
    };

    supplier.supplier_name = req.body.supplier_name !== undefined ? req.body.supplier_name : supplier.supplier_name;
    supplier.mobile_number = req.body.mobile_number !== undefined ? req.body.mobile_number : supplier.mobile_number;
    supplier.company_name = req.body.company_name !== undefined ? req.body.company_name : supplier.company_name;
    supplier.gst_number = req.body.gst_number !== undefined ? req.body.gst_number : supplier.gst_number;
    supplier.address = req.body.address !== undefined ? req.body.address : supplier.address;

    const updated = await supplier.save();

    const newValue = {
      supplier_name: updated.supplier_name,
      mobile_number: updated.mobile_number,
      company_name: updated.company_name,
      gst_number: updated.gst_number,
      address: updated.address
    };

    await new SupplierAuditLog({
      entity_type: 'Supplier',
      entity_id: updated._id,
      action: 'SUPPLIER_UPDATED',
      description: `Supplier "${updated.supplier_name}" details updated.`,
      old_value: oldValue,
      new_value: newValue,
      performed_by: req.user?.username || 'Admin',
      userId,
      team_id: teamId
    }).save();

    res.json({
      id: updated._id,
      _id: updated._id,
      supplier_name: updated.supplier_name,
      mobile_number: updated.mobile_number,
      company_name: updated.company_name,
      gst_number: updated.gst_number || '',
      address: updated.address || '',
      createdAt: updated.createdAt
    });
  } catch (error) {
    console.error('Update supplier error:', error);
    res.status(500).json({ error: 'Server error updating supplier' });
  }
});

// DELETE soft delete supplier
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.userId || req.user?.userId;
    const teamId = req.teamId;
    const supplierId = req.params.id;

    const supplier = await Supplier.findOne({ _id: supplierId, $or: [{ team_id: teamId }, { userId }], isDeleted: { $ne: true } });
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });

    supplier.isDeleted = true;
    await supplier.save();

    await new SupplierAuditLog({
      entity_type: 'Supplier',
      entity_id: supplier._id,
      action: 'SUPPLIER_DELETED',
      description: `Supplier "${supplier.supplier_name}" deleted.`,
      performed_by: req.user?.username || 'Admin',
      userId,
      team_id: teamId
    }).save();

    res.json({ msg: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Delete supplier error:', error);
    res.status(500).json({ error: 'Server error deleting supplier' });
  }
});

module.exports = router;
