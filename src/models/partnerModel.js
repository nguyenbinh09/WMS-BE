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
  },
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "ContactInfo",
  },
  isDeleted: {
    type: Boolean,
    required: true,
    default: false,
  },
});

let Partner = mongoose.model("Partner", partnerSchema);

module.exports = Partner;
