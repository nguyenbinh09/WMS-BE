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
      enum: ["Order", "Delivery", "Done", "Returned"],
      default: "Order",
    },
    total: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: [true, "type is missing"],
      enum: ["Inbound", "Outbound"],
    },
    employeeId: {
      type: mongoose.Types.ObjectId,
      required: [true, "Employee id is missing"],
      ref: "Employee",
    },
    partnerId: {
      type: String, //mongoose.Types.ObjectId,
      required: [true, "Partner id is missing"],
      // ref: "Partner",
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
