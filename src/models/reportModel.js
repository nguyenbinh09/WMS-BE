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
