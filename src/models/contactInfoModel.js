const mongoose = require("mongoose");

const contactInfoSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
  },
  phone_num: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
});

let ContactInfo = mongoose.model("ContactInfo", contactInfoSchema);

module.exports = ContactInfo;
