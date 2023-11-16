const mongoose = require("mongoose");

const warehouseSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  capacity: {
    type: Number,
  },
  description: {
    type: String,
  },
  contact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ContactInfo",
  },
});

let Warehouse = mongoose.model("Warehouse", warehouseSchema);

module.exports = Warehouse;
