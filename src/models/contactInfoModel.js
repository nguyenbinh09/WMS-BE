const mongoose = require("mongoose");

const contactInfoSchema = new mongoose.Schema({
  address: {
    type: String,
    required: [true, "Address is missing"],
  },
  phone_num: {
    type: String,
    required: [true, "Phone number is missing"],
  },
  email: {
    type: String,
    default: null,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

let ContactInfo = mongoose.model("ContactInfo", contactInfoSchema);

module.exports = ContactInfo;
