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
    actualQuantity: {
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
  },
  { timestamps: true }
);

let Report = mongoose.model("Report", reportSchema);

module.exports = Report;
