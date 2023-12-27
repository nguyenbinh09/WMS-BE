const jwt = require("jsonwebtoken");
const Employee = require("../models/employeeModel");
const User = require("../models/userModel");

const middlewareController = {
  //verifyToken
  verifyToken: (req, res, next) => {
    const token = req.headers.token;
    if (token) {
      const accessToken = token.split(" ")[1];
      jwt.verify(accessToken, process.env.JWT_ACCESS_KEY, (err, user) => {
        if (err) {
          return res.status(403).json("Token is not valid!");
        }
        req.user = user;
        next();
      });
    } else {
      return res.status(401).json("You're not authenticated!");
    }
  },

  authorizeAdmin: (req, res, next) => {
    middlewareController.verifyToken(req, res, async () => {
      const user = await User.findById(req.user.id);
      if (user.isEmployee !== true) {
        next();
      } else {
        return res.status(403).json("You're not authorized!");
      }
    });
  },

  authorizeManager: (req, res, next) => {
    middlewareController.verifyToken(req, res, async () => {
      const user = await User.findById(req.user.id).populate("employeeId");
      if (user.isEmployee === true && user.employeeId.position === "Manager") {
        next();
      } else {
        return res.status(403).json("You're not authorized!");
      }
    });
  },

  authorizeEmployee: (req, res, next) => {
    middlewareController.verifyToken(req, res, async () => {
      const user = await User.findById(req.user.id).populate("employeeId");
      if (user.isEmployee === true && user.employeeId.position === "Employee") {
        next();
      } else {
        return res.status(403).json("You're not authorized!");
      }
    });
  },
};

module.exports = middlewareController;
