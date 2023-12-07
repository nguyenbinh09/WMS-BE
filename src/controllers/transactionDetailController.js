const Product = require("../models/productModel");
const TransactionDetail = require("../models/transactionDetailModel");

const transactionDetailController = {
  getAllTransactionDetails: async (req, res) => {
    try {
      const transactionDetails = await TransactionDetail.find({
        isDeleted: false,
      }).populate("productId");
      res.status(200).json(transactionDetails);
    } catch (error) {
      return res.status(500).json(error);
    }
  },
};
