const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, "A customer must have a code"],
    unique: [true, "A code of customer with the same name has already exists"],
  },
  name: {
    type: String,
    required: [true, "Name is missing"],
  },
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "ContactInfo",
  },
});

let Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
