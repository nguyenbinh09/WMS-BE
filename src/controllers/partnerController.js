const Partner = require("../models/partnerModel");
const ContactInfo = require("../models/contactInfoModel");
const mongoose = require("mongoose");
const validator = require("validator");
const Product = require("../models/productModel");

const generatePartnerCode = async (type, session) => {
  const partnerAmount = await Partner.countDocuments({ type: type }).session(
    session
  );
  const partnerAmountStr = String(partnerAmount).padStart(3, "0");
  let partnerCode = "";
  if (type === "Supplier") {
    partnerCode = "SUP" + partnerAmountStr;
  } else {
    partnerCode = "CUS" + partnerAmountStr;
  }
  return partnerCode;
};

const partnerController = {
  addPartner: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { name, type, email, phone_num, address } = req.body;
      const isEmail = validator.isEmail(email);
      if (!isEmail && email !== null) {
        return res.status(400).send("Email is not invalid!");
      }
      const newContact = new ContactInfo(
        { address, phone_num, email },
        { session }
      );
      console.log(newContact);
      const newPartner = new Partner(
        {
          name,
          code: await generatePartnerCode(type, session),
          type,
          contactId: newContact._id,
        },
        { session }
      );
      await newContact.save({ session });
      const savedPartner = await newPartner.save({ session });
      res.status(201).json({
        success: true,
        message: `New ${type.toLowerCase()} ${
          savedPartner.code
        } created successfully!`,
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

  getAllPartner: async (req, res) => {
    try {
      const partners = await Partner.find({ isDeleted: false }).populate([
        "contactId",
      ]);
      if (!partners) {
        return res.status(404).send("Not found any partners");
      }
      res.status(200).json(partners);
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  getCustomer: async (req, res) => {
    try {
      const partners = await Partner.find({
        type: "Customer",
        isDeleted: false,
      }).populate(["contactId"]);
      if (!partners) {
        return res.status(404).send("Not found any customers");
      }
      res.status(200).json(partners);
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  getCustomerByWarehouseId: async (req, res) => {
    try {
      const warehouseId = req.params.warehouseId;
      const partners = await Partner.find({
        type: "Customer",
        isDeleted: false,
        warehouseId: warehouseId,
      }).populate(["contactId"]);
      if (!partners) {
        return res.status(404).send("Not found any customers");
      }
      res.status(200).json(partners);
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  getSupplier: async (req, res) => {
    try {
      const warehouseId = req.params.warehouseId;
      const partners = await Partner.find({
        type: "Supplier",
        isDeleted: false,
        warehouseId: warehouseId,
      }).populate(["contactId"]);
      if (!partners) {
        return res.status(404).send("Not found any suppliers");
      }
      res.status(200).json(partners);
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  getSupplier: async (req, res) => {
    try {
      const partners = await Partner.find({
        type: "Supplier",
        isDeleted: false,
      }).populate(["contactId"]);
      if (!partners) {
        return res.status(404).send("Not found any suppliers");
      }
      res.status(200).json(partners);
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  updatePartner: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { id } = req.params;
      const { name, email, phone_num, address } = req.body;
      const partner = await Partner.findById(id);
      if (email) {
        const isEmail = validator.isEmail(email);
        if (!isEmail && email !== null) {
          return res.status(400).send("Email is not invalid!");
        }
      }
      await ContactInfo.findByIdAndUpdate(
        partner.contactId,
        { $set: { email, phone_num, address } },
        { new: true }
      ).session(session);
      const updatedPartner = await Partner.findByIdAndUpdate(
        id,
        { $set: { name } },
        { new: true }
      ).session(session);
      res
        .status(200)
        .json(
          `The ${partner.type.toLowerCase()} with code ${
            updatedPartner.code
          } updated successfully!`
        );
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

  deletePartner: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { id } = req.params;
      const partner = await Partner.findByIdAndUpdate(
        id,
        { $set: { isDeleted: true } },
        { new: true }
      ).session(session);
      if (partner.type === "Supplier") {
        for (i = 0; i < partner.products.length; i++) {
          await Product.findOneAndUpdate(
            { _id: partner.products[i], isDeleted: false },
            { $set: { supplierId: null } },
            { new: true }
          ).session(session);
        }
      }
      if (!partner) {
        return res.status(404).json(`The partner is not found!`);
      }
      res
        .status(200)
        .json(`Deleted ${partner.type.toLowerCase()} successfully!`);
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

module.exports = partnerController;
