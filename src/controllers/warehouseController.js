const Warehouse = require("../models/warehouseModel");
const Employee = require("../models/employeeModel");
const ContactInfo = require("../models/contactInfoModel");

const generateWarehouseCode = async () => {
  const warehouseAmount = await Warehouse.countDocuments({ isDeleted: false });
  const warehouseAmountStr = String(warehouseAmount).padStart(2, "0");
  const warehouseCode = "WH" + warehouseAmountStr;
  return warehouseCode;
};

const warehouseController = {
  addWarehouse: async (req, res) => {
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
      });
      if (!manager)
        return res
          .status(404)
          .send(`The manager with id ${managerId} does not exists`);
      else if (manager.isDeleted === true) {
        return res.status(410).send(`Manager with id ${managerId} is deleted`);
      }
      if (manager.position != "Manager")
        await manager.updateOne({ position: "Manager" });
      const newContact = new ContactInfo({ address, phone_num, email });
      const newWarehouse = new Warehouse({
        name,
        code: await generateWarehouseCode(),
        capacity,
        description,
        contactId: newContact.id,
        managerId,
      });
      await newContact.save();
      // await manager.save();
      const savedWarehouse = await newWarehouse.save();
      res.status(200).json(savedWarehouse);
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  getWarehouse: async (req, res) => {
    try {
      const warehouse = await Warehouse.findById(req.params.id);
      if (warehouse && warehouse.isDeleted === false) {
        res.status(200).json(warehouse);
      } else if (warehouse && warehouse.isDeleted === true) {
        res.status(410).send("Warehouse is deleted");
      } else {
        return res.status(500).send("Not found any warehouses");
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  getAllWarehouse: async (req, res) => {
    try {
      const warehouses = await Warehouse.find({ isDeleted: false });
      if (!warehouses) {
        return res.status(500).send("Not found any warehouses");
      }
      res.status(200).json(warehouses);
    } catch (error) {
      return res.status(500).json(error);
    }
  },
};

module.exports = warehouseController;
