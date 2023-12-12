const User = require("../models/userModel");

const userController = {
  //GET ALL USERS
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find({
        isDeleted: false,
        isEmployee: true,
      }).populate("employeeId");
      res.status(200).json(users);
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      await User.findByIdAndUpdate(
        id,
        { $set: { isDeleted: true } },
        { new: true }
      );
      res.status(200).send("Deleted user successfully!");
    } catch (error) {
      return res.status(500).json(error);
    }
  },
};

module.exports = userController;
