const TransactionDetail = require("../models/transactionDetailModel");
const Transaction = require("../models/transactionModel");
const mongoose = require("mongoose");
const createTransactionDetail = require("../services/TransactionDetailService");
const Warehouse = require("../models/warehouseModel");
const Partner = require("../models/partnerModel");

const generateTransactionCode = async (warehouseId, type, session) => {
  const warehouse = await Warehouse.findById(warehouseId).session(session);
  const warehouseCode = warehouse.code;
  const transactionAmount = await Transaction.countDocuments(
    { type: type },
    { session }
  );
  const transactionAmountStr = String(transactionAmount).padStart(4, "0");
  let transactionCode = "";
  if (type === "Inbound") {
    transactionCode = "ASN" + transactionAmountStr + warehouseCode;
  } else {
    transactionCode = "DN" + transactionAmountStr + warehouseCode;
  }
  return transactionCode;
};

const transactionController = {
  addTransaction: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { type, employeeId, partnerId, warehouseId, details } = req.body;
      let total = 0;
      const newTransaction = new Transaction(
        {
          code: await generateTransactionCode(warehouseId, type, session),
          type,
          total,
          warehouseId,
          employeeId,
          partnerId,
        },
        { session }
      );
      const savedTransaction = await newTransaction.save({ session });
      for (i = 0; i < details.length; i++) {
        let transactionDetail = await createTransactionDetail(
          req,
          res,
          details[i].productId,
          details[i].quantity,
          session,
          savedTransaction
        );
        if (transactionDetail) {
          total += transactionDetail.total;
          await savedTransaction
            .updateOne({
              $push: { transactionDetails: transactionDetail._id },
            })
            .session(session);
        }
      }
      res.status(201).json({
        success: true,
        message: `New transaction ${savedTransaction.code} created successfully!`,
      });
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

  getAllTransactions: async (req, res) => {
    try {
      const transactions = await Transaction.find({
        isDeleted: false,
      }).populate(["transactionDetails", "employeeId", "warehouseId"]);
      if (!transactions) {
        return res.status(404).send("Not found any transactions");
      }
      res.status(200).json(transactions);
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  getAllInbound: async (req, res) => {
    try {
      const inboundTransactions = await Transaction.find({
        type: "Inbound",
      }).populate(["transactionDetails", "employeeId", "warehouseId"]);
      if (!inboundTransactions) {
        return res.status(404).send("Not found any inbound transactions");
      }

      res.status(200).json(inboundTransactions);
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  getAllOutbound: async (req, res) => {
    try {
      const outboundTransactions = await Transaction.find({
        type: "Outbound",
      }).populate(["transactionDetails", "employeeId", "warehouseId"]);
      if (!outboundTransactions) {
        return res.status(404).send("Not found any outbound transactions");
      }
      res.status(200).json(outboundTransactions);
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  updateTransaction: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { id } = req.params;
      const { partnerId, details } = req.body;
      if (partnerId) {
        const partner = await Partner.findById(partnerId).session(session);
        if (!partner) {
          return res
            .status(404)
            .send(`Supplier with code ${partner.code} is not found!`);
        } else if (partner.isDeleted === true) {
          return res
            .status(404)
            .send(`Supplier with code ${partner.code} is deleted!`);
        }
      }

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

module.exports = transactionController;
