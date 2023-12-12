const mongoose = require("mongoose");

const partnerSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, "A partner must have a code"],
    unique: [true, "A code of partner with the same name has already exists"],
  },
  name: {
    type: String,
    required: [true, "Name is missing"],
  },
  type: {
    type: String,
    required: [true, "Type is missing"],
    enum: ["Customer", "Supplier"],
  },
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "ContactInfo",
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  isDeleted: {
    type: Boolean,
    required: true,
    default: false,
  },
  warehouseId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Warehouse",
  },
});

let Partner = mongoose.model("Partner", partnerSchema);

module.exports = Partner;
