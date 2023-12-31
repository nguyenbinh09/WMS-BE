const mongoose = require("mongoose");

const transactionDetailSchema = new mongoose.Schema({
  quantity: {
    type: Number,
    required: [true, "Quantity is missing"],
  },
  total: {
    type: Number,
    required: [true, "Total is missing"],
  },
  productId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Product",
  },
  transactionId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Transaction",
  },
  createdAt: {
    type: Date,
    required: true,
    default: new Date(),
  },
});

const TransactionDetail = mongoose.model(
  "TransactionDetail",
  transactionDetailSchema
);

module.exports = TransactionDetail;
