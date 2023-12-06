const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "A user must have a code"],
      unique: [true, "A code of user with the same name has already exists"],
    },
    name: {
      type: String,
      required: [true, "Name is missing"],
    },
    position: {
      type: String,
      required: [true, "Position is missing"],
    },
    startDate: {
      type: Date,
      required: [true, "StartDate is missing"],
    },
    finishDate: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      required: [true, "Gender is missing"],
      enum: ["male", "female"],
    },
    birthday: {
      type: Date,
      required: [true, "Birthday is missing"],
    },
    idCard: {
      type: String,
      required: true,
      unique: true,
    },
    imageUrl: {
      type: String,
      default:
        "https://res.cloudinary.com/dux8aqzzz/image/upload/v1685547037/xd0gen7b4z5wgwuqfvpz.png",
    },
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
    },
    contactId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "ContactInfo",
    },
    warehouseId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Warehouse",
      default: "",
    },
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

let Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;
