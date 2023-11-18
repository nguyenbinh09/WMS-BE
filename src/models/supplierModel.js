const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, "A supplier must have a code"],
    unique: [true, "A code of supplier with the same name has already exists"],
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

let Supplier = mongoose.model("Supplier", supplierSchema);

module.exports = Supplier;
