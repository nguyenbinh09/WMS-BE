const mongoose = require("mongoose");

const warehouseSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, "A warehouse must have a code"],
    unique: [true, "A code of warehouse with the same name has already exists"],
  },
  name: {
    type: String,
    required: [true, "Name is missing"],
  },
  capacity: {
    type: Number,
    required: [true, "Capacity is missing"],
  },
  description: {
    type: String,
    required: true,
    default: "None",
  },
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "ContactInfo",
  },
});

let Warehouse = mongoose.model("Warehouse", warehouseSchema);

module.exports = Warehouse;
