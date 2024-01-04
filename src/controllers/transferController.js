const Transfer = require("../models/transferModel");

const transferController = {
  addTransfer: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      await session.commitTransaction();
    } catch (error) {
      // Rollback any changes made in the database
      await session.abortTransaction();
      // Rethrow the error
      return res.status(500).json(error);
    } finally {
      // Ending the session
      await session.endSession();
    }
  },
};

module.exports = transferController;
