const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    reportDetails: [
      {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "ReportDetail",
      },
    ],
    totalActualQuantity: {
      type: Number,
      required: true,
    },
    totalDiffQuantity: {
      type: Number,
      required: true,
    },
    increaseQuantity: {
      type: Number,
      required: true,
    },
    decreaseQuantity: {
      type: Number,
      required: true,
    },
    warehouseId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Warehouse",
    },
    managerId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Employee",
    },
    isApproved: {
      type: Boolean,
    },
    createdAt: {
      type: Date,
      required: true,
      default: new Date(),
    },
  },
  { timestamps: true }
);

let Report = mongoose.model("Report", reportSchema);

module.exports = Report;
