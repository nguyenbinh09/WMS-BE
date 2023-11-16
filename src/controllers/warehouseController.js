const Warehouse = require("../models/warehouseModel");

const warehouseController = {
  addWarehouse: async (req, res) => {
    try {
      const newWarehouse = new Warehouse(req.body);
      const savedWarehouse = await newWarehouse.save();
      res.status(200).json(savedWarehouse);
    } catch (error) {
      res.status(500).json(error);
    }
  },

  getAllWarehouse: async (req, res) => {
    try {
      const warehouses = await Warehouse.find();
      res.status(200).json(warehouses);
    } catch (error) {
      res.status(500).json(error);
    }
  },
};

module.exports = warehouseController;
