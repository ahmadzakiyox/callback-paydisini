const mongoose = require('mongoose');

// Definisi model User
const userSchema = new mongoose.Schema({
  userId: { type: Number, required: true, unique: true },
  saldo: { type: Number, default: 0 },
});

const User = mongoose.model('User', userSchema);

// Definisi model Deposit
const depositSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  uniqueCode: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Deposit = mongoose.model('Deposit', depositSchema);

module.exports = {
  User,
  Deposit,
};
