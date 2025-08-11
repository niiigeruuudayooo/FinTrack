const Transaction = require('../models/Transactions');

exports.getTransactions = async (req, res) => {
  const transactions = await Transaction.find({ user: req.user });
  res.json(transactions);
};

exports.addTransaction = async (req, res) => {
  const { type, amount, category, paymentMethod } = req.body;
  const transaction = await Transaction.create({
    user: req.user, type, amount, category, paymentMethod
  });
  res.json(transaction);
};

exports.deleteTransaction = async (req, res) => {
  await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user });
  res.json({ success: true });
};
