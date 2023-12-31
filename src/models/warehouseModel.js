const mongoose = require("mongoose");

const warehouseSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "A warehouse must have a code"],
      unique: [
        true,
        "A code of warehouse with the same name has already exists",
      ],
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
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      unique: [true, "The manager is managing another warehouse!"],
      sparse: true,
    },
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
    },
    createdAt: {
      type: Date,
      required: true,
      default: new Date(),
    },
  },
  { timestamps: true }
);

let Warehouse = mongoose.model("Warehouse", warehouseSchema);

module.exports = Warehouse;
