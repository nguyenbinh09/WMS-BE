const mongoose = require("mongoose");

const transferDetailSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
    },
    fromWarehouse: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Warehouse",
    },
    toWarehouse: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Warehouse",
    },
    isAccepted: {
      type: Boolean,
    },
    products: [
      {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Product",
      },
    ],
    employees: [
      {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Employee",
      },
    ],
    type: {
      type: String,
      required: true,
      enum: ["Employee", "Product"],
    },
    createdAt: {
      type: Date,
      required: true,
      default: new Date(),
    },
  },
  { timestamps: true }
);

let TransferDetail = mongoose.model("TransferDetail", transferDetailSchema);

module.exports = TransferDetail;
