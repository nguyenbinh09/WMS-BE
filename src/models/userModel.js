const mongoose = require("mongoose");

const dotenv = require("dotenv").config();

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 25,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    isEmployee: {
      type: Boolean,
      required: true,
      default: true,
    },
    employeeId: {
      type: String,
      ref: "Employee",
      required: true,
      unique: true,
    },
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
