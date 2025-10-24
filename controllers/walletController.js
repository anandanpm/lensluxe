const User = require('../model/userSchema');
const Product = require('../model/productSchema');
const Cart = require('../model/cartSchema');
const Order = require('../model/orderSchema')
const Coupon = require('../model/couponSchema')
const Wallet = require('../model/walletSchema')
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../config/constants');

const walletCheck = async (req, res) => {
  try {
    let userId;

    // Check if req.user is present (authenticated via OAuth)
    if (req.user) {
      userId = req.user._id;
    } else {
      // If req.user is not present, use session.user
      userId = req.session.user_id;
    }

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      return res.status(404).json({ error: ERROR_MESSAGES.WALLET_NOT_FOUND });
    }

    res.json({ walletBalance: wallet.walletBalance });
  } catch (error) {
    console.error('Error checking wallet balance:', error);
    res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
}

const reducewallet = async (req, res) => {
  try {
    const { amount } = req.body;
    console.log(req.body, 'kdieyiuofs');
    let userId;

    // Check if req.user is present (authenticated via OAuth)
    if (req.user) {
      userId = req.user._id;
    } else {
      // If req.user is not present, use session.user
      userId = req.session.user_id;
    }

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      return res.status(404).json({ error: ERROR_MESSAGES.WALLET_NOT_FOUND });
    }

    if (wallet.walletBalance < amount) {
      return res.status(400).json({ error: ERROR_MESSAGES.INSUFFICIENT_WALLET_BALANCE });
    }

    wallet.walletBalance -= amount;
    wallet.amountSpent += amount;
    wallet.walletBalance = Number(wallet.walletBalance.toFixed(2));
    wallet.refundAmount = Number(wallet.walletBalance.toFixed(2));

    const newTransaction = {
      amount: -amount,
      description: 'Product purchase',
      type: 'debit',
      transactionDate: new Date(),
    };

    wallet.transactions.push(newTransaction);
    await wallet.save();

    res.json({
      success: true,
      message: SUCCESS_MESSAGES.AMOUNT_DEBITED,
      walletBalance: wallet.walletBalance,
    });
  } catch (error) {
    console.error('Error deducting wallet balance:', error);
    res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

module.exports = {
  walletCheck,
  reducewallet
}