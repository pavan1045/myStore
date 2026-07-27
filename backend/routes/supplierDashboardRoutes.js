const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const SupplierBill = require('../models/SupplierBill');
const SupplierPayment = require('../models/SupplierPayment');
const Supplier = require('../models/Supplier');

router.use(auth);

// GET dashboard widgets metrics
router.get('/metrics', async (req, res) => {
  try {
    const userId = req.userId || req.user?.userId;
    const teamId = req.teamId;

    const bills = await SupplierBill.find({ $or: [{ team_id: teamId }, { userId }], isDeleted: { $ne: true } });
    const payments = await SupplierPayment.find({ $or: [{ team_id: teamId }, { userId }] });
    const suppliers = await Supplier.find({ $or: [{ team_id: teamId }, { userId }], isDeleted: { $ne: true } });

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const total_outstanding = bills.reduce((sum, b) => sum + (b.balance_amount || 0), 0);

    const pending_bills_count = bills.filter(b => b.payment_status === 'Pending').length;
    const partially_paid_bills_count = bills.filter(b => b.payment_status === 'Partially Paid').length;

    const paid_bills_this_month_count = bills.filter(b => {
      if (b.payment_status !== 'Paid') return false;
      const d = new Date(b.updatedAt || b.createdAt);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    }).length;

    const total_purchase_this_month = bills.reduce((sum, b) => {
      const d = new Date(b.purchase_date || b.createdAt);
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        return sum + (b.invoice_amount || 0);
      }
      return sum;
    }, 0);

    const total_payments_this_month = payments.reduce((sum, p) => {
      const d = new Date(p.payment_date || p.createdAt);
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        return sum + (p.payment_amount || 0);
      }
      return sum;
    }, 0);

    res.json({
      total_outstanding,
      pending_bills_count,
      partially_paid_bills_count,
      paid_bills_this_month_count,
      total_purchase_this_month,
      total_payments_this_month,
      total_suppliers_count: suppliers.length
    });
  } catch (error) {
    console.error('Fetch dashboard metrics error:', error);
    res.status(500).json({ error: 'Server error fetching dashboard metrics' });
  }
});

module.exports = router;
