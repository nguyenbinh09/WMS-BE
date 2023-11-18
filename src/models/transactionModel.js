const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "A transaction must have a code"],
      unique: [
        true,
        "A code of transaction with the same name has already exists",
      ],
    },
    finishTime: {
      type: Date,
    },
    status: {
      type: String,
      required: true,
      default: "Updating",
    },
    total: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: [true, "type is missing"],
    },
    employeeId: {
      type: mongoose.Types.ObjectId,
      required: [true, "Employee id is missing"],
      ref: "Employee",
    },
    supplierId: {
      type: mongoose.Types.ObjectId,
      required: [true, "Supplier id is missing"],
      ref: "Supplier",
    },
    customerId: {
      type: mongoose.Types.ObjectId,
      required: [true, "Customer id is missing"],
      ref: "Customer",
    },
    warehouseId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Warehouse",
    },
    transactionDetails: [
      {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "TransactionDetail",
      },
    ],
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
