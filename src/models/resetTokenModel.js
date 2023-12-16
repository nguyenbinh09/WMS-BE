const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const resetTokenSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    require: true,
  },
  token: {
    type: String,
    require: true,
  },
  createAt: {
    type: Date,
    expires: 300,
    default: Date.now(),
  },
});

resetTokenSchema.pre("save", function (next) {
  if (this.isModified("token")) {
    const hash = bcrypt.hash(this.token, 8);
    this.token = hash;
  }

  next();
});

resetTokenSchema.methods.compareToken = function (token) {
  const result = bcrypt.compareSync(token, this.token);
  return result;
};

let resetToken = mongoose.model("ResetToken", resetTokenSchema);

module.exports = resetToken;
