const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const SupplierBill = require('../models/SupplierBill');
const Supplier = require('../models/Supplier');
const SupplierPayment = require('../models/SupplierPayment');
const SupplierAuditLog = require('../models/SupplierAuditLog');

router.use(auth);

// GET all active purchase bills with filter capabilities
router.get('/', async (req, res) => {
  try {
    const userId = req.userId || req.user?.userId;
    const teamId = req.teamId;
    const { supplierId, status, search, startDate, endDate } = req.query;

    const query = { $or: [{ team_id: teamId }, { userId }], isDeleted: { $ne: true } };

    if (supplierId) {
      query.supplier_id = supplierId;
    }

    if (status) {
      query.payment_status = status;
    }

    if (startDate || endDate) {
      query.purchase_date = {};
      if (startDate) query.purchase_date.$gte = startDate;
      if (endDate) query.purchase_date.$lte = endDate;
    }

    let bills = await SupplierBill.find(query).populate('supplier_id').sort({ createdAt: -1 });

    if (search) {
      const searchLower = search.toLowerCase();
      bills = bills.filter(b => {
        const billNumMatch = b.bill_number && b.bill_number.toLowerCase().includes(searchLower);
        const supNameMatch = b.supplier_id && (
          b.supplier_id.supplier_name.toLowerCase().includes(searchLower) ||
          b.supplier_id.company_name.toLowerCase().includes(searchLower)
        );
        return billNumMatch || supNameMatch;
      });
    }

    const formatted = bills.map(b => ({
      id: b._id,
      _id: b._id,
      bill_number: b.bill_number,
      supplier_id: b.supplier_id ? b.supplier_id._id : null,
      supplier_name: b.supplier_id ? b.supplier_id.supplier_name : 'Unknown',
      company_name: b.supplier_id ? b.supplier_id.company_name : 'Unknown',
      supplier_mobile: b.supplier_id ? b.supplier_id.mobile_number : '',
      purchase_date: b.purchase_date,
      last_paid_date: b.last_paid_date || '',
      invoice_amount: b.invoice_amount,
      amount_paid: b.amount_paid,
      balance_amount: b.balance_amount,
      payment_status: b.payment_status,
      notes: b.notes || '',
      attachment: b.attachment || '',
      createdAt: b.createdAt
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Fetch bills error:', error);
    res.status(500).json({ error: 'Server error fetching bills' });
  }
});

// GET single bill detail with payment history and audit timeline
router.get('/:id', async (req, res) => {
  try {
    const userId = req.userId || req.user?.userId;
    const teamId = req.teamId;
    const billId = req.params.id;

    const bill = await SupplierBill.findOne({ _id: billId, $or: [{ team_id: teamId }, { userId }], isDeleted: { $ne: true } }).populate('supplier_id');
    if (!bill) return res.status(404).json({ error: 'Purchase bill not found' });

    const payments = await SupplierPayment.find({ bill_id: billId, $or: [{ team_id: teamId }, { userId }] }).sort({ createdAt: -1 });
    const auditLogs = await SupplierAuditLog.find({ entity_id: billId, $or: [{ team_id: teamId }, { userId }] }).sort({ timestamp: -1 });

    const detail = {
      id: bill._id,
      _id: bill._id,
      bill_number: bill.bill_number,
      supplier_id: bill.supplier_id ? bill.supplier_id._id : null,
      supplier_name: bill.supplier_id ? bill.supplier_id.supplier_name : 'Unknown',
      company_name: bill.supplier_id ? bill.supplier_id.company_name : 'Unknown',
      supplier_mobile: bill.supplier_id ? bill.supplier_id.mobile_number : '',
      supplier_gst: bill.supplier_id ? bill.supplier_id.gst_number : '',
      supplier_address: bill.supplier_id ? bill.supplier_id.address : '',
      purchase_date: bill.purchase_date,
      last_paid_date: bill.last_paid_date || '',
      invoice_amount: bill.invoice_amount,
      amount_paid: bill.amount_paid,
      balance_amount: bill.balance_amount,
      payment_status: bill.payment_status,
      notes: bill.notes || '',
      attachment: bill.attachment || '',
      createdAt: bill.createdAt,
      payments: payments.map(p => ({
        id: p._id,
        _id: p._id,
        payment_date: p.payment_date,
        payment_amount: p.payment_amount,
        payment_method: p.payment_method,
        reference_number: p.reference_number || '',
        remarks: p.remarks || '',
        createdAt: p.createdAt
      })),
      audit_timeline: auditLogs.map(l => ({
        id: l._id,
        _id: l._id,
        action: l.action,
        description: l.description,
        old_value: l.old_value,
        new_value: l.new_value,
        performed_by: l.performed_by || 'Admin',
        timestamp: l.timestamp
      }))
    };

    res.json(detail);
  } catch (error) {
    console.error('Fetch bill detail error:', error);
    res.status(500).json({ error: 'Server error fetching bill detail' });
  }
});

// POST create purchase bill
router.post('/', async (req, res) => {
  try {
    const userId = req.userId || req.user?.userId;
    const teamId = req.teamId;
    let { bill_number, supplier_id, purchase_date, invoice_amount, notes, attachment } = req.body;

    if (!supplier_id || !purchase_date || invoice_amount === undefined) {
      return res.status(400).json({ error: 'Supplier, Purchase Date, and Invoice Amount are required' });
    }

    const numInvoiceAmount = Number(invoice_amount);
    if (isNaN(numInvoiceAmount) || numInvoiceAmount <= 0) {
      return res.status(400).json({ error: 'Invoice Amount must be greater than zero' });
    }

    // Verify supplier exists
    const supplier = await Supplier.findOne({ _id: supplier_id, $or: [{ team_id: teamId }, { userId }], isDeleted: { $ne: true } });
    if (!supplier) {
      return res.status(404).json({ error: 'Selected supplier not found' });
    }

    let finalBillNumber = (bill_number || '').trim();
    if (!finalBillNumber) {
      // Auto-generate a friendly bill number if omitted
      const count = await SupplierBill.countDocuments({ $or: [{ team_id: teamId }, { userId }] });
      finalBillNumber = `BILL-${1001 + count}`;
    } else {
      // Check duplicate bill_number for same supplier only if custom number was provided
      const existingBill = await SupplierBill.findOne({
        bill_number: finalBillNumber,
        supplier_id,
        $or: [{ team_id: teamId }, { userId }],
        isDeleted: { $ne: true }
      });
      if (existingBill) {
        return res.status(400).json({ error: `Bill number "${finalBillNumber}" already exists for supplier "${supplier.supplier_name}"` });
      }
    }

    const newBill = new SupplierBill({
      bill_number: finalBillNumber,
      supplier_id,
      purchase_date,
      last_paid_date: '',
      invoice_amount: numInvoiceAmount,
      amount_paid: 0,
      balance_amount: numInvoiceAmount,
      payment_status: 'Pending',
      notes: notes || '',
      attachment: attachment || '',
      userId,
      team_id: teamId
    });

    const savedBill = await newBill.save();

    // Create Audit Log
    await new SupplierAuditLog({
      entity_type: 'Supplier Bill',
      entity_id: savedBill._id,
      action: 'BILL_CREATED',
      description: `Purchase bill ${finalBillNumber} added for Supplier ${supplier.company_name || supplier.supplier_name}. Invoice Amount: ₹${numInvoiceAmount.toLocaleString('en-IN')}.`,
      new_value: {
        bill_number: finalBillNumber,
        supplier_name: supplier.supplier_name,
        company_name: supplier.company_name,
        purchase_date,
        last_paid_date: 'N/A',
        invoice_amount: numInvoiceAmount
      },
      performed_by: req.user?.username || 'Admin',
      userId,
      team_id: teamId
    }).save();

    res.json({
      id: savedBill._id,
      _id: savedBill._id,
      bill_number: savedBill.bill_number,
      supplier_id: savedBill.supplier_id,
      supplier_name: supplier.supplier_name,
      company_name: supplier.company_name,
      purchase_date: savedBill.purchase_date,
      last_paid_date: savedBill.last_paid_date || '',
      invoice_amount: savedBill.invoice_amount,
      amount_paid: savedBill.amount_paid,
      balance_amount: savedBill.balance_amount,
      payment_status: savedBill.payment_status,
      notes: savedBill.notes,
      attachment: savedBill.attachment,
      createdAt: savedBill.createdAt
    });
  } catch (error) {
    console.error('Create purchase bill error:', error);
    res.status(500).json({ error: 'Server error creating purchase bill' });
  }
});

// PUT update purchase bill
router.put('/:id', async (req, res) => {
  try {
    const userId = req.userId || req.user?.userId;
    const teamId = req.teamId;
    const billId = req.params.id;

    const bill = await SupplierBill.findOne({ _id: billId, $or: [{ team_id: teamId }, { userId }], isDeleted: { $ne: true } }).populate('supplier_id');
    if (!bill) return res.status(404).json({ error: 'Purchase bill not found' });

    const oldValue = {
      purchase_date: bill.purchase_date,
      last_paid_date: bill.last_paid_date || 'N/A',
      invoice_amount: bill.invoice_amount,
      notes: bill.notes || ''
    };

    if (req.body.invoice_amount !== undefined) {
      const newInv = Number(req.body.invoice_amount);
      if (isNaN(newInv) || newInv <= 0) {
        return res.status(400).json({ error: 'Invoice Amount must be greater than zero' });
      }
      bill.invoice_amount = newInv;
    }

    if (req.body.purchase_date !== undefined) bill.purchase_date = req.body.purchase_date;
    if (req.body.notes !== undefined) bill.notes = req.body.notes;
    if (req.body.attachment !== undefined) bill.attachment = req.body.attachment;

    // Recalculate balance and payment status
    bill.balance_amount = Math.max(0, bill.invoice_amount - bill.amount_paid);

    const prevStatus = bill.payment_status;
    if (bill.balance_amount === 0 && bill.invoice_amount > 0) {
      bill.payment_status = 'Paid';
    } else if (bill.amount_paid > 0 && bill.balance_amount > 0) {
      bill.payment_status = 'Partially Paid';
    } else {
      bill.payment_status = 'Pending';
    }

    const updatedBill = await bill.save();

    const newValue = {
      purchase_date: updatedBill.purchase_date,
      last_paid_date: updatedBill.last_paid_date || 'N/A',
      invoice_amount: updatedBill.invoice_amount,
      notes: updatedBill.notes || ''
    };

    let desc = `Purchase bill ${updatedBill.bill_number} updated.`;
    if (oldValue.invoice_amount !== newValue.invoice_amount) {
      desc += ` Invoice Amount: ₹${oldValue.invoice_amount.toLocaleString('en-IN')} → ₹${newValue.invoice_amount.toLocaleString('en-IN')}.`;
    }

    await new SupplierAuditLog({
      entity_type: 'Supplier Bill',
      entity_id: updatedBill._id,
      action: 'BILL_UPDATED',
      description: desc,
      old_value: oldValue,
      new_value: newValue,
      performed_by: req.user?.username || 'Admin',
      userId,
      team_id: teamId
    }).save();

    if (prevStatus !== 'Paid' && updatedBill.payment_status === 'Paid') {
      await new SupplierAuditLog({
        entity_type: 'Supplier Bill',
        entity_id: updatedBill._id,
        action: 'BILL_CLEARED',
        description: `Purchase bill ${updatedBill.bill_number} marked as PAID.`,
        performed_by: req.user?.username || 'Admin',
        userId,
        team_id: teamId
      }).save();
    }

    res.json({
      id: updatedBill._id,
      _id: updatedBill._id,
      bill_number: updatedBill.bill_number,
      supplier_id: updatedBill.supplier_id ? updatedBill.supplier_id._id : null,
      supplier_name: updatedBill.supplier_id ? updatedBill.supplier_id.supplier_name : '',
      company_name: updatedBill.supplier_id ? updatedBill.supplier_id.company_name : '',
      purchase_date: updatedBill.purchase_date,
      last_paid_date: updatedBill.last_paid_date || '',
      invoice_amount: updatedBill.invoice_amount,
      amount_paid: updatedBill.amount_paid,
      balance_amount: updatedBill.balance_amount,
      payment_status: updatedBill.payment_status,
      notes: updatedBill.notes,
      attachment: updatedBill.attachment,
      createdAt: updatedBill.createdAt
    });
  } catch (error) {
    console.error('Update purchase bill error:', error);
    res.status(500).json({ error: 'Server error updating purchase bill' });
  }
});

// DELETE soft delete purchase bill
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.userId || req.user?.userId;
    const teamId = req.teamId;
    const billId = req.params.id;

    const bill = await SupplierBill.findOne({ _id: billId, $or: [{ team_id: teamId }, { userId }], isDeleted: { $ne: true } });
    if (!bill) return res.status(404).json({ error: 'Purchase bill not found' });

    bill.isDeleted = true;
    await bill.save();

    await new SupplierAuditLog({
      entity_type: 'Supplier Bill',
      entity_id: bill._id,
      action: 'BILL_DELETED',
      description: `Purchase bill ${bill.bill_number} deleted.`,
      performed_by: req.user?.username || 'Admin',
      userId,
      team_id: teamId
    }).save();

    res.json({ msg: 'Purchase bill deleted successfully' });
  } catch (error) {
    console.error('Delete purchase bill error:', error);
    res.status(500).json({ error: 'Server error deleting purchase bill' });
  }
});

module.exports = router;
