const Budget = require('../models/Budget');

exports.getBudgets = async (req, res) => {
  const budgets = await Budget.find({ user: req.user });
  res.json(budgets);
};

exports.addBudget = async (req, res) => {
  const { category, limit, period } = req.body;
  const budget = await Budget.create({
    user: req.user, category, limit, period
  });
  res.json(budget);
};

exports.deleteBudget = async (req, res) => {
  await Budget.findOneAndDelete({ _id: req.params.id, user: req.user });
  res.json({ success: true });
};
