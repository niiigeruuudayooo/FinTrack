// routes/budget.js
const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const auth = require('../middleware/auth');

// GET all budgets for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id });
    res.json(budgets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching budgets' });
  }
});

// POST create a new budget
router.post('/', auth, async (req, res) => {
  try {
    const { name, max, current } = req.body;
    if (!name || !max) {
      return res.status(400).json({ message: 'Name and max are required' });
    }
    const newBudget = await Budget.create({
      user: req.user.id,
      name,
      max,
      current: current || 0
    });
    res.status(201).json(newBudget);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating budget' });
  }
});

// DELETE a budget by ID
router.delete('/:id', auth, async (req, res) => {
  try {
    const goal = await Budget.findOne({ _id: req.params.id, user: req.user.id });
    if (!goal) {
      return res.status(404).json({ message: 'Budget goal not found' });
    }
    await goal.deleteOne();
    res.json({ message: 'Budget goal removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting budget goal' });
  }
});

module.exports = router;
