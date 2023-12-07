const User = require("../models/userModel");

const userController = {
  //GET ALL USERS
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find({ isDeleted: false }).populate(
        "employeeId"
      );
      res.status(200).json(users);
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  deleteUser: async (req, res) => {
    try {
      const user = User.findById(req.params.id);
      res.status(200).send("Delete Successfully!");
    } catch (error) {
      return res.status(500).json(error);
    }
  },
};

module.exports = userController;
