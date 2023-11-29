const Partner = require("../models/partnerModel");
const ContactInfo = require("../models/contactInfoModel");
const mongoose = require("mongoose");

const generatePartnerCode = async (type, session) => {
  const partnerAmount = await Partner.countDocuments(
    { type: type },
    { session }
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
        message: `New ${type} ${savedPartner.code} created successfully!`,
      });
      await session.commitTransaction();
    } catch (error) {
      // Rollback any changes made in the database
      await session.abortTransaction();
      // Rethrow the error
      throw error;
    } finally {
      // Ending the session
      await session.endSession();
    }
  },

  getAllPartner: async (req, res) => {
    try {
      const partners = await Partner.find().populate(["contactId"]);
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
      const partners = await Partner.find({ type: "Customer" }).populate([
        "contactId",
      ]);
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
      const partners = await Partner.find({ type: "Supplier" }).populate([
        "contactId",
      ]);
      if (!partners) {
        return res.status(404).send("Not found any suppliers");
      }
      res.status(200).json(partners);
    } catch (error) {
      return res.status(500).json(error);
    }
  },
};

module.exports = partnerController;
