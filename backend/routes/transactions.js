const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transactions'); // ✅ plural file name
const auth = require('../middleware/authMiddleware');

// GET all transactions for this user
router.get('/', auth, async (req, res) => {
  try {
    const txs = await Transaction.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(txs);
  } catch (err) {
    console.error('Get transactions error:', err);
    res.status(500).json({ message: 'Server error fetching transactions' });
  }
});

// POST create new transaction
router.post('/', auth, async (req, res) => {
  try {
    const { type, amount, category, paymentMethod } = req.body;
    if (!type || !amount || !category || !paymentMethod) {
      return res.status(400).json({ message: 'All transaction fields required' });
    }
    const tx = await Transaction.create({
      user: req.user.id,
      type,
      amount,
      category,
      paymentMethod,
      date: new Date()
    });
    res.status(201).json(tx);
  } catch (err) {
    console.error('Create transaction error:', err);
    res.status(500).json({ message: 'Server error creating transaction' });
  }
});

// GET single transaction
router.get('/:id', auth, async (req, res) => {
  try {
    const tx = await Transaction.findOne({ _id: req.params.id, user: req.user.id });
    if (!tx) return res.status(404).json({ message: 'Transaction not found' });
    res.json(tx);
  } catch (err) {
    console.error('Get transaction by ID error:', err);
    res.status(500).json({ message: 'Server error fetching transaction' });
  }
});

// DELETE transaction
router.delete('/:id', auth, async (req, res) => {
  try {
    const tx = await Transaction.findOne({ _id: req.params.id, user: req.user.id });
    if (!tx) return res.status(404).json({ message: 'Transaction not found' });
    await tx.deleteOne();
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    console.error('Delete transaction error:', err);
    res.status(500).json({ message: 'Server error deleting transaction' });
  }
});

module.exports = router;
