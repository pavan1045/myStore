const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const SupplierPayment = require('../models/SupplierPayment');
const SupplierBill = require('../models/SupplierBill');
const SupplierAuditLog = require('../models/SupplierAuditLog');

router.use(auth);

// POST record payment for a purchase bill
router.post('/', async (req, res) => {
  try {
    const userId = req.userId || req.user?.userId;
    const teamId = req.teamId;
    const { bill_id, payment_date, payment_amount, payment_method, reference_number, remarks } = req.body;

    if (!bill_id || !payment_date || payment_amount === undefined || !payment_method) {
      return res.status(400).json({ error: 'Bill ID, Payment Date, Amount, and Payment Method are required' });
    }

    const numAmount = Number(payment_amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Payment Amount must be greater than zero' });
    }

    const bill = await SupplierBill.findOne({ _id: bill_id, $or: [{ team_id: teamId }, { userId }], isDeleted: { $ne: true } });
    if (!bill) return res.status(404).json({ error: 'Purchase bill not found' });

    const prevBalance = bill.balance_amount;
    const prevPaid = bill.amount_paid;

    // Create Payment Record
    const newPayment = new SupplierPayment({
      bill_id,
      supplier_id: bill.supplier_id,
      payment_date,
      payment_amount: numAmount,
      payment_method,
      reference_number: reference_number || '',
      remarks: remarks || '',
      userId,
      team_id: teamId
    });

    const savedPayment = await newPayment.save();

    // Recalculate bill status & balance
    bill.amount_paid = prevPaid + numAmount;
    bill.balance_amount = Math.max(0, bill.invoice_amount - bill.amount_paid);
    bill.last_paid_date = payment_date;

    const prevStatus = bill.payment_status;
    if (bill.balance_amount === 0) {
      bill.payment_status = 'Paid';
    } else if (bill.amount_paid > 0) {
      bill.payment_status = 'Partially Paid';
    } else {
      bill.payment_status = 'Pending';
    }

    await bill.save();

    // Audit Log: PAYMENT_ADDED
    await new SupplierAuditLog({
      entity_type: 'Supplier Bill',
      entity_id: bill._id,
      action: 'PAYMENT_ADDED',
      description: `Payment of ₹${numAmount.toLocaleString('en-IN')} recorded for ${bill.bill_number} via ${payment_method}. Outstanding reduced from ₹${prevBalance.toLocaleString('en-IN')} to ₹${bill.balance_amount.toLocaleString('en-IN')}.`,
      new_value: {
        payment_amount: numAmount,
        payment_method,
        reference_number: reference_number || '',
        new_balance: bill.balance_amount
      },
      performed_by: req.user?.username || 'Admin',
      userId,
      team_id: teamId
    }).save();

    // Audit Log: BILL_CLEARED if newly reached zero
    if (prevStatus !== 'Paid' && bill.payment_status === 'Paid') {
      await new SupplierAuditLog({
        entity_type: 'Supplier Bill',
        entity_id: bill._id,
        action: 'BILL_CLEARED',
        description: `Purchase bill ${bill.bill_number} marked as PAID.`,
        performed_by: req.user?.username || 'Admin',
        userId,
        team_id: teamId
      }).save();
    }

    res.json({
      payment: {
        id: savedPayment._id,
        _id: savedPayment._id,
        bill_id: savedPayment.bill_id,
        supplier_id: savedPayment.supplier_id,
        payment_date: savedPayment.payment_date,
        payment_amount: savedPayment.payment_amount,
        payment_method: savedPayment.payment_method,
        reference_number: savedPayment.reference_number,
        remarks: savedPayment.remarks,
        createdAt: savedPayment.createdAt
      },
      bill: {
        id: bill._id,
        _id: bill._id,
        bill_number: bill.bill_number,
        amount_paid: bill.amount_paid,
        balance_amount: bill.balance_amount,
        payment_status: bill.payment_status
      }
    });
  } catch (error) {
    console.error('Record payment error:', error);
    res.status(500).json({ error: 'Server error recording payment' });
  }
});

// PUT edit payment
router.put('/:id', async (req, res) => {
  try {
    const userId = req.userId || req.user?.userId;
    const teamId = req.teamId;
    const paymentId = req.params.id;

    const payment = await SupplierPayment.findOne({ _id: paymentId, $or: [{ team_id: teamId }, { userId }] });
    if (!payment) return res.status(404).json({ error: 'Payment record not found' });

    const bill = await SupplierBill.findOne({ _id: payment.bill_id, $or: [{ team_id: teamId }, { userId }], isDeleted: { $ne: true } });
    if (!bill) return res.status(404).json({ error: 'Associated purchase bill not found' });

    const oldAmount = payment.payment_amount;

    if (req.body.payment_amount !== undefined) {
      const numAmt = Number(req.body.payment_amount);
      if (isNaN(numAmt) || numAmt <= 0) {
        return res.status(400).json({ error: 'Payment Amount must be greater than zero' });
      }
      payment.payment_amount = numAmt;
    }

    if (req.body.payment_date !== undefined) payment.payment_date = req.body.payment_date;
    if (req.body.payment_method !== undefined) payment.payment_method = req.body.payment_method;
    if (req.body.reference_number !== undefined) payment.reference_number = req.body.reference_number;
    if (req.body.remarks !== undefined) payment.remarks = req.body.remarks;

    const updatedPayment = await payment.save();

    // Recalculate all payments for this bill
    const allPayments = await SupplierPayment.find({ bill_id: bill._id, $or: [{ team_id: teamId }, { userId }] });
    const totalPaid = allPayments.reduce((sum, p) => sum + p.payment_amount, 0);

    bill.amount_paid = totalPaid;
    bill.balance_amount = Math.max(0, bill.invoice_amount - totalPaid);

    if (bill.balance_amount === 0 && bill.invoice_amount > 0) {
      bill.payment_status = 'Paid';
    } else if (bill.amount_paid > 0) {
      bill.payment_status = 'Partially Paid';
    } else {
      bill.payment_status = 'Pending';
    }

    await bill.save();

    // Audit Log: PAYMENT_UPDATED
    await new SupplierAuditLog({
      entity_type: 'Supplier Bill',
      entity_id: bill._id,
      action: 'PAYMENT_UPDATED',
      description: `Payment for ${bill.bill_number} updated. Old Amount: ₹${oldAmount.toLocaleString('en-IN')}, New Amount: ₹${updatedPayment.payment_amount.toLocaleString('en-IN')}.`,
      old_value: { payment_amount: oldAmount },
      new_value: { payment_amount: updatedPayment.payment_amount },
      performed_by: req.user?.username || 'Admin',
      userId,
      team_id: teamId
    }).save();

    res.json({
      payment: updatedPayment,
      bill: {
        id: bill._id,
        _id: bill._id,
        amount_paid: bill.amount_paid,
        balance_amount: bill.balance_amount,
        payment_status: bill.payment_status
      }
    });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ error: 'Server error updating payment' });
  }
});

module.exports = router;
