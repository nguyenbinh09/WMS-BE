const Employee = require("../models/employeeModel");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const generatePassword = require("generate-password");
const bcrypt = require("bcrypt");
const { mailTransport, UserPassword } = require("../utils/mail");

const dotenv = require("dotenv").config();

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
      console.log(employee);
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
      const user = await User.findOne({ username: req.body.username });
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
  resetPassword: async (req, res, next) => {},

  //forgot password
  forgotPassword: async (req, res, next) => {},
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
