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
      type: mongoose.Types.ObjectId,
      ref: "Employee",
      required: true,
      unique: [true, "User of the employee existed!"],
    },
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = async function (password) {
  const result = await bcrypt.compare(password, this.password);
  return result;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
