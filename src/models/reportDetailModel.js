const mongoose = require("mongoose");

const reportDetailSchema = new mongoose.Schema(
  {
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
      unique: true,
    },
  },
  { timestamps: true }
);

let ReportDetail = mongoose.model("ReportDetail", reportDetailSchema);

module.exports = ReportDetail;
