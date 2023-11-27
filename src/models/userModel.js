const mongoose = require("mongoose");
const generatePassword = require("generate-password");
const bcrypt = require("bcrypt");
const { mailTransport, UserPassword } = require("../utils/mail");
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
      default: function () {
        const randomPassword = generatePassword.generate({
          length: 10,
          numbers: true,
        });
        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds);
        const hashedPassword = bcrypt.hashSync(randomPassword, salt);
        // mailTransport().sendMail({
        //   from: "nguyenthaibinh810@gmail.com",
        //   to: "21521878@gm.uit.edu.com",
        //   subject: "Your Password",
        //   html: UserPassword(randomPassword),
        // });

        return hashedPassword;
      },
    },
    isEmployee: {
      type: Boolean,
      required: true,
      default: true,
    },
    employee_id: {
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
