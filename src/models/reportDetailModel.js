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
    productId: {},
  },
  { timestamps: true }
);

let ReportDetail = mongoose.model("ReportDetail", reportDetailSchema);

module.exports = ReportDetail;
