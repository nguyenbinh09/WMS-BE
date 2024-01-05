const mongoose = require("mongoose");
const Transfer = require("../models/transferModel");
const Warehouse = require("../models/warehouseModel");
const Employee = require("../models/employeeModel");
const Product = require("../models/productModel");

const generateTransferCode = async () => {
  const transferAmount = await Transfer.countDocuments();
  const transferAmountStr = String(transferAmount).padStart(6, "0");
  const transferCode = "TRS" + transferAmountStr;
  return transferCode;
};

const transferController = {
  addTransfer: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { type, fromWarehouse, toWarehouse, list } = req.body;
      const to_warehouse = await Warehouse.findById(toWarehouse).session(
        session
      );
      if (!to_warehouse)
        return res
          .status(404)
          .send(`The warehouse with id ${toWarehouse} does not exists`);
      else if (to_warehouse.isDeleted === true) {
        return res
          .status(410)
          .send(`Warehouse with id ${toWarehouse} is deleted`);
      }
      let newTransfer;
      if (type === "Employee") {
        newTransfer = new Transfer(
          {
            code: await generateTransferCode(),
            type,
            fromWarehouse,
            toWarehouse,
            employees: list,
          },
          { session }
        );
      } else {
        newTransfer = new Transfer(
          {
            code: await generateTransferCode(),
            type,
            fromWarehouse,
            toWarehouse,
            products: list,
          },
          { session }
        );
      }
      const savedTransfer = await newTransfer.save({ session });
      res
        .status(200)
        .send(`New transfer ${savedTransfer.code} created successfully!`);
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

  getAllTransfer: async (req, res) => {
    try {
      const transfers = await Transfer.find().populate([
        "fromWarehouse",
        "toWarehouse",
        "products",
        "employees",
      ]);
      if (!transfers) {
        return res.status(500).send("Not found any transfer");
      }
      res.status(200).json(transfers);
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  getTransferByFromWarehouseId: async (req, res) => {
    try {
      const { id } = req.params.fromWarehouseId;
      const transfers = await Transfer.find({ fromWarehouse: id }).populate([
        "fromWarehouse",
        "toWarehouse",
        "products",
        "employees",
      ]);
      if (!transfers) {
        return res.status(500).send("Not found any tranfers");
      }
      res.status(200).json(transfers);
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  getTransferByToWarehouseId: async (req, res) => {
    try {
      const { id } = req.params.toWarehouseId;
      const transfers = await Transfer.find({ toWarehouse: id }).populate([
        "fromWarehouse",
        "toWarehouse",
        "products",
        "employees",
      ]);
      if (!transfers) {
        return res.status(500).send("Not found any tranfers");
      }
      res.status(200).json(transfers);
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  updateTransfer: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { id } = req.params;
      const { isAccepted } = req.body;
      const transfer = await Transfer.findById(id)
        .session(session)
        .populate(["fromWarehouse", "toWarehouse", "products", "employees"])
        .session(session);
      if (!transfer) {
        return res.status(404).send("Transfer is not found!");
      }
      if (isAccepted === true) {
        const toWarehouse = transfer.toWarehouse;
        if (transfer.type === "Employee") {
          for (i = 0; i < transfer.employees.length; i++) {
            await Employee.findByIdAndUpdate(
              transfer.employees[i],
              {
                $set: {
                  warehouseId: toWarehouse,
                },
              },
              { new: true }
            ).session(session);
          }
        } else {
          for (i = 0; i < transfer.products.length; i++) {
            await Product.findByIdAndUpdate(
              transfer.products[i],
              {
                $set: {
                  warehouseId: toWarehouse,
                },
              },
              { new: true }
            ).session(session);
          }
        }
      }
      await Transfer.findByIdAndUpdate(
        id,
        { $set: { isAccepted: isAccepted } },
        { new: true }
      ).session(session);
      if (isAccepted) {
        res.status(200).send(`Transfer ${transfer.code} has been accepted!`);
      } else {
        res.status(200).send(`Transfer ${transfer.code} has been rejected!`);
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

module.exports = transferController;
