const mongoose = require("mongoose");
const generatePassword = require("generate-password");
const bcrypt = require("bcrypt");

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
        //   from: "AdminWMS@gmail.com",
        //   to: this.email,
        //   subject: "Your Password",
        //   html: UserPassword(randomPassword),
        // });

        return hashedPassword;
      },
    },
    role: {
      type: String,
    },
    employee_id: {
      type: String,
      ref: "Employee",
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
