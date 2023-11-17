const crypto = require("crypto");

const generateRandomPassword = (length) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const password = [];

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, characters.length);
    password.push(characters.charAt(randomIndex));
  }

  return password.join("");
};

module.exports = generateRandomPassword;
