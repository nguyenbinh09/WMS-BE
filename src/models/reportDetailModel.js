const mongoose = require("mongoose");

const reportDetailSchema = new mongoose.Schema(
  {
    actualQuantity: {
      type: Number,
      required: true,
    },
    differenceQuantity: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    productId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    reportId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    createdAt: {
      type: Date,
      required: true,
      default: new Date(),
    },
  },
  { timestamps: true }
);

let ReportDetail = mongoose.model("ReportDetail", reportDetailSchema);

module.exports = ReportDetail;
