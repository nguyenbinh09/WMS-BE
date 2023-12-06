const Warehouse = require("../models/warehouseModel");
const Employee = require("../models/employeeModel");
const ContactInfo = require("../models/contactInfoModel");
const mongoose = require("mongoose");
const validator = require("validator");
const Product = require("../models/productModel");

const generateWarehouseCode = async (session) => {
  const warehouseAmount = await Warehouse.countDocuments(
    { isDeleted: false },
    { session }
  );
  const warehouseAmountStr = String(warehouseAmount).padStart(2, "0");
  const warehouseCode = "WH" + warehouseAmountStr;
  return warehouseCode;
};

const warehouseController = {
  addWarehouse: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const {
        managerId,
        name,
        capacity,
        description,
        email,
        phone_num,
        address,
      } = req.body;
      const manager = await Employee.findOne({
        _id: managerId,
        isDeleted: false,
      }).session(session);
      if (!manager)
        return res
          .status(404)
          .send(`The manager with id ${managerId} does not exists`);
      else if (manager.isDeleted === true) {
        return res.status(410).json({
          success: true,
          message: `Manager with id ${managerId} is deleted`,
        });
      }
      const newContact = new ContactInfo(
        { address, phone_num, email },
        { session }
      );
      const newWarehouse = new Warehouse(
        {
          name,
          code: await generateWarehouseCode(session),
          capacity,
          description,
          contactId: newContact.id,
          managerId,
        },
        { session }
      );
      await newContact.save({ session });
      // await manager.save();
      const savedWarehouse = await newWarehouse.save({ session });
      res
        .status(200)
        .send(`New warehouse ${savedWarehouse.code} created successfully!`);
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
  getWarehouse: async (req, res) => {
    try {
      const warehouse = await Warehouse.findById(req.params.id).populate([
        "contactId",
        "managerId",
      ]);
      if (warehouse && warehouse.isDeleted === false) {
        res.status(200).json(warehouse);
      } else if (warehouse && warehouse.isDeleted === true) {
        return res.status(410).send("Warehouse is deleted");
      } else {
        return res.status(500).send("Not found any warehouses");
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  getAllWarehouse: async (req, res) => {
    try {
      const warehouses = await Warehouse.find({ isDeleted: false }).populate([
        "contactId",
        "managerId",
      ]);
      if (!warehouses) {
        return res.status(500).send("Not found any warehouses");
      }
      res.status(200).json(warehouses);
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  updateWarehouse: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const {
        managerId,
        name,
        capacity,
        description,
        email,
        phone_num,
        address,
      } = req.body;
      const { id } = req.params;
      const warehouse = await Warehouse.findById(id).session(session);
      if (!warehouse)
        return res
          .status(404)
          .send(`The warehouse with code ${warehouse.code} does not exists`);
      else if (warehouse.isDeleted === true) {
        return res.status(410).json({
          message: `Manager warehouse id ${warehouse.code} is deleted`,
        });
      }
      const manager = await Employee.findOne({
        _id: managerId,
        isDeleted: false,
      }).session(session);
      if (!manager)
        return res
          .status(404)
          .send(`The manager with id ${managerId} does not exists`);
      else if (manager.isDeleted === true) {
        return res.status(410).send(`Manager with id ${managerId} is deleted`);
      } else if (manager.warehouseId !== "") {
        return res
          .status(400)
          .send(
            `Manager with code ${manager.code} is managing another warehouse!`
          );
      }
      const isEmail = validator.isEmail(email);
      if (!isEmail && email !== "") {
        return res.status(400).send("Email is not invalid!");
      }
      await ContactInfo.findByIdAndUpdate(
        warehouse.contactId,
        {
          $set: {
            email,
            phone_num,
            address,
          },
        },
        { new: true }
      ).session(session);
      await Warehouse.findByIdAndUpdate(
        id,
        {
          $set: { managerId, name, capacity, description },
        },
        { new: true }
      ).session(session);
      res
        .status(200)
        .send(`Updated warehouse with code ${warehouse.code} successfully!`);
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
  deleteWarehouse: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { id } = req.params;
      const employees = await Employee.find({ warehouseId: id }).session(
        session
      );
      const products = await Product.find({ warehouseId: id }).session(session);
      if (employees) {
        return req
          .status(400)
          .send(
            `There are still employees in the warehouse. Please check again!`
          );
      }
      if (products) {
        return req
          .status(400)
          .send(
            `There are still products in the warehouse. Please check again!`
          );
      }
      await Warehouse.findByIdAndUpdate(
        id,
        { $set: { isDeleted: true } },
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
};

module.exports = warehouseController;
