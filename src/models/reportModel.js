const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    reportDetail: [
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
  },
  { timestamps: true }
);

let Report = mongoose.model("Report", reportSchema);

module.exports = Report;
