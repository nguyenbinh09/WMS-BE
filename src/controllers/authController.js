const Employee = require("../models/employeeModel");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const generatePassword = require("generate-password");
const bcrypt = require("bcrypt");
const passwordValidator = require("password-validator");
const {
  mailTransport,
  UserPassword,
  ResetPasswordTemplate,
} = require("../utils/mail");
const dotenv = require("dotenv").config();
const ResetToken = require("../models/resetTokenModel");
const ContactInfo = require("../models/contactInfoModel");
const { url } = require("../utils/helper");

// init password validator
let passwordSchema = new passwordValidator();

// Add properties to it
passwordSchema
  .is()
  .min(8) // Minimum length 8
  .is()
  .max(16) // Maximum length 16
  .has()
  .uppercase() // Must have uppercase letters
  .has()
  .lowercase() // Must have lowercase letters
  .has()
  .not()
  .spaces(); // Should not have spaces

let refreshTokens = [];
const generatePasswordAuto = (email) => {
  const randomPassword = generatePassword.generate({
    length: 10,
    numbers: true,
  });
  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  const hashedPassword = bcrypt.hashSync(randomPassword, salt);
  mailTransport().sendMail({
    from: process.env.MAILTRAN_USERNAME,
    to: email,
    subject: "Your Password",
    html: UserPassword(randomPassword),
  });

  return hashedPassword;
};

const authController = {
  //REGISTER
  registerUser: async (req, res) => {
    try {
      const { employeeId } = req.body;
      const employee = await Employee.findById(employeeId).populate(
        "contactId"
      );

      if (!employee)
        return res
          .status(404)
          .send(`The employee with id ${employeeId} does not exists`);
      else if (employee.isDeleted === true) {
        return res
          .status(410)
          .send(`Employee with id ${employeeId} is deleted`);
      }
      //Create new user
      const newUser = new User({
        username: employee.code,
        employeeId: employeeId,
        password: generatePasswordAuto(employee.contactId.email),
      });
      //Save to DB
      const user = await newUser.save();
      return res
        .status(201)
        .json({ success: true, message: "User created successfully!" });
    } catch (err) {
      return res.status(500).json(err);
    }
  },

  //GENERATE ACCESS TOKEN
  generateAccessToken: (user) => {
    return jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_ACCESS_KEY,
      { expiresIn: "2h" }
    );
  },

  //GENERATE REFRESH TOKEN
  generateFreshToken: (user) => {
    return jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_REFRESH_KEY,
      { expiresIn: "365d" }
    );
  },

  //LOGIN
  loginUser: async (req, res) => {
    try {
      const user = await User.findOne({ username: req.body.username }).populate(
        "employeeId"
      );
      if (!user) {
        return res.status(404).json("Wrong Useranme!");
      }
      const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!validPassword) {
        return res.status(404).json("Wrong Password!");
      }
      if (user && validPassword) {
        const accessToken = authController.generateAccessToken(user);
        const refreshToken = authController.generateFreshToken(user);
        refreshTokens.push(refreshToken);
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: false, //when deploy, set true
          path: "/",
          sameSite: "strict",
        });
        const { password, ...others } = user._doc;
        return res.status(200).json({ ...others, accessToken });
      }
    } catch (err) {
      return res.status(500).json(err);
    }
  },

  requestRefreshToken: async (req, res) => {
    //Take refresh token from user
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json("You're not authenticated!");
    if (!refreshTokens.includes(refreshToken)) {
      return res.status(403).json("Refresh token is not valid");
    }
    jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (err, user) => {
      if (err) {
        console.log(err);
      }
      refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
      const newAccessToken = authController.generateAccessToken(user);
      const newRefreshToken = authController.generateFreshToken(user);
      refreshTokens.push(newRefreshToken);
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: false, //when deploy, set true
        path: "/",
        sameSite: "strict",
      });
      return res.status(200).json({ accessToken: newAccessToken });
    });
  },

  logoutUser: async (req, res) => {
    res.clearCookie("refreshToken");
    refreshTokens = refreshTokens.filter(
      (token) => token !== req.cookies.refreshToken
    );
    return res.status(200).json("Logged out successfully!");
  },

  //reset password
  changePassword: async (req, res, next) => {
    try {
      const { newPassword, oldPassword } = req.body;
      console.log(newPassword, oldPassword);
      if (!newPassword || !oldPassword)
        return res.status(401).send("Invalid request!");

      const { id } = req.params;
      const user = await User.findById(id);
      const employee = await Employee.findById(user.employeeId).populate(
        "contactId"
      );
      if (!user) return res.status(404).send("User not found!");

      const isSameOldPassword = await user.comparePassword(oldPassword);
      if (!isSameOldPassword)
        return res.status(401).send("Wrong password. Please check it again.");
      const isSameNewPassword = await user.comparePassword(newPassword);
      if (isSameNewPassword)
        return res
          .status(401)
          .send("New password must be different from the old one!");

      // validate password
      const validateResult = passwordSchema.validate(newPassword.trim(), {
        details: true,
      });
      if (validateResult.length !== 0) {
        return res.status(401).send(validateResult);
      }

      user.password = newPassword.trim();

      res
        .status(200)
        .json({ Status: "Success", message: "Changed password successfully" });
    } catch (err) {
      return res.status(500).send(err);
    }
  },

  //forgot password
  forgotPassword: async (req, res) => {
    try {
      const { email, url } = req.body;
      const contact = await ContactInfo.findOne({ email: email });
      const employee = await Employee.findById(contact._id);
      const user = await User.findById(employee._id);
      if (!user) return res.status(404).send("User not found, invalid request");

      // send a mail that contain link to reset password
      mailTransport().sendMail({
        from: process.env.MAILTRAN_USERNAME,
        to: employee.contactId.email,
        subject: "Link Reset Password",
        html: ResetPasswordTemplate(url),
      });

      res.status(200).json(result);
    } catch (err) {
      return res.status(500).send(err);
    }
  },

  //reset password
  resetPassword: async (req, res) => {
    try {
      const { password } = req.body;
      if (!password) return res.status(401).send("Invalid request!");

      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).send("User not found!");

      // validate password
      const validateResult = passwordSchema.validate(password.trim(), {
        details: true,
      });
      if (validateResult.length !== 0) {
        return res.status(401).send(validateResult);
      }

      user.password = password.trim();
      await user.save();
      await ResetToken.findOneAndDelete({ owner: user.id });

      res
        .status(200)
        .json({ Status: "Success", message: "Password Reset Successfully" });
    } catch (err) {
      return res.status(500).send(err);
    }
  },
};

//STORE TOKEN
//1. LOCAL STORAGE:
//XSS
//2. HTTPONLY COOKIES:
//CSRF -> SAMESITE
//3. REDUX STORE -> ACCESSTOKEN
//HTTPONLY COOKIES -> REFRESHTOKEN

//LOG OUT

module.exports = authController;
