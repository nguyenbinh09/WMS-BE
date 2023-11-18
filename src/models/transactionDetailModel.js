const mongoose = require("mongoose");

const transactionDetailModel = new mongoose.Schema({
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
});

const TransactionDetail = mongoose.model(
  "TransactionDetail",
  transactionDetailSchema
);

module.exports = TransactionDetail;
