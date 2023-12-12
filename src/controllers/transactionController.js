const TransactionDetail = require("../models/transactionDetailModel");
const Transaction = require("../models/transactionModel");
const mongoose = require("mongoose");
const {
  createTransactionDetail,
  updateTransactionDetail,
  deleteTransactionDetail,
} = require("../services/TransactionDetailService");
const Warehouse = require("../models/warehouseModel");
const Partner = require("../models/partnerModel");
const Product = require("../models/productModel");

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
        isDeleted: false,
      }).populate(["transactionDetails", "employeeId", "warehouseId"]);
      if (!inboundTransactions) {
        return res.status(404).send("Not found any inbound transactions");
      }

      res.status(200).json(inboundTransactions);
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  getInboundByWarehouseId: async (req, res) => {
    try {
      const warehouseId = req.params.warehouseId;
      const inboundTransactions = await Transaction.find({
        type: "Inbound",
        warehouseId: warehouseId,
        isDeleted: false,
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
        isDeleted: false,
      }).populate(["transactionDetails", "employeeId", "warehouseId"]);
      if (!outboundTransactions) {
        return res.status(404).send("Not found any outbound transactions");
      }
      res.status(200).json(outboundTransactions);
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  getOutboundByWarehouseId: async (req, res) => {
    try {
      const warehouseId = req.params.warehouseId;
      const outboundTransactions = await Transaction.find({
        type: "Outbound",
        warehouseId: warehouseId,
        isDeleted: false,
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
            .send(`Partner with id ${partnerId} is not found!`);
        } else if (partner.isDeleted === true) {
          return res
            .status(404)
            .send(`${partner.type} with code ${partner.code} is deleted!`);
        }
      }
      const transaction = await Transaction.findById(id);
      let total = 0;
      for (i = 0; i < details.length; i++) {
        let transactionDetail;
        //If update transaction detail existing
        if (details[i].action === "update") {
          transactionDetail = await updateTransactionDetail(
            req,
            res,
            details[i].id,
            details[i].productId,
            details[i].quantity,
            session,
            transaction
          );
          if (transactionDetail) {
            total += transactionDetail.total;
          }
        }
        //If add new transaction detail
        else if (details[i].action === "new") {
          transactionDetail = await createTransactionDetail(
            req,
            res,
            details[i].productId,
            details[i].quantity,
            session,
            transaction
          );
          if (transactionDetail) {
            total += transactionDetail.total;
            await Transaction.findByIdAndUpdate(
              id,
              {
                $push: { transactionDetails: transactionDetail._id },
              },
              { new: true }
            ).session(session);
          }
        }
        //If delete transaction detail existing
        else if (details[i].action === "delete") {
          transactionDetail = await deleteTransactionDetail(
            req,
            res,
            details[i].id,
            session,
            transaction
          );
          if (transactionDetail) {
            await Transaction.findByIdAndUpdate(
              id,
              {
                $pull: { transactionDetails: transactionDetail._id },
              },
              { new: true }
            ).session(session);
          }
        }
      }
      await Transaction.findByIdAndUpdate(
        id,
        { $set: { partnerId } },
        { new: true }
      ).session(session);
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

  updateStatus: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { id } = req.params;
      const { status } = req.body;
      const transaction = await Transaction.findById(id)
        .session(session)
        .populate("transactionDetails");
      const details = transaction.transactionDetails;
      if (status === "Done" && transaction.type === "Inbound") {
        for (i = 0; i < details.length; i++) {
          const product = await Product.findById(details[i].productId).session(
            session
          );
          const tempQuantity = product.quantity + details[i].quantity;
          await Product.findByIdAndUpdate(
            product._id,
            { $set: { quantity: tempQuantity } },
            { new: true }
          ).session(session);
        }
      }
      if (status === "Returned" && transaction.type === "Outbound") {
        for (i = 0; i < details.length; i++) {
          const product = await Product.findById(details[i].productId).session(
            session
          );
          const tempQuantity = product.quantity + details[i].quantity;
          await Product.findByIdAndUpdate(
            product._id,
            { $set: { quantity: tempQuantity } },
            { new: true }
          ).session(session);
        }
      }
      await Transaction.findByIdAndUpdate(
        id,
        { $set: { status } },
        { new: true }
      ).session(session);
      res.status(201).json({
        success: true,
        message: `Updated status successfully!`,
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

  deleteTransaction: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { id } = req.params;
      const { status } = req.body;
      const transaction = await Transaction.findById({
        _id: id,
        status: "Order",
        isDeleted: false,
      }).session(session);
      if (!transaction) {
        return res.status(404).send(`Transaction with id ${id} is not found!`);
      } else if (transaction.isDeleted === true) {
        return res
          .status(404)
          .send(`Transaction with code ${transaction.code} is deleted!`);
      } else if (transaction.status !== "Order") {
        return res
          .status(404)
          .send("The transaction is not in an editable state");
      }
      if (transaction.type === "Outbound") {
        const details = transaction.transactionDetails;
        for (i = 0; i < details.length; i++) {
          const product = await Product.findById(details[i].productId).session(
            session
          );
          const tempQuantity = product.quantity + details[i].quantity;
          await Product.findByIdAndUpdate(
            product._id,
            { $set: { quantity: tempQuantity } },
            { new: true }
          ).session(session);
        }
      }
      await Transaction.findByIdAndUpdate(
        id,
        { $set: { isDeleted: true } },
        { new: true }
      ).session(session);
      res.status(201).json({
        success: true,
        message: `Deleted transaction successfully!`,
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
};

module.exports = transactionController;
