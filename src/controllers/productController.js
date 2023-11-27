const Partner = require("../models/partnerModel");
const Product = require("../models/productModel");
const Warehouse = require("../models/warehouseModel");

const skuCodeGenerator = async (name, warehouseId) => {
  const firstValue = name.substring(0, 2);
  const warehouse = await Warehouse.findOne({ _id: warehouseId });

  const secondValue = warehouse.code.substring(0, 2);
  const productAmount = await Product.countDocuments({ isDeleted: false });
  const count = String(productAmount).padStart(4, "0");
  const sku = firstValue + count + secondValue;
  const sku1 = sku.toUpperCase();
  return sku1;
};

const productController = {
  addProduct: async (req, res) => {
    try {
      const {
        name,
        maximumQuantity,
        price,
        unit,
        specification,
        warehouseId,
        supplierId,
      } = req.body;
      const supplier = await Partner.findById(supplierId);
      if (!supplier)
        return res
          .status(404)
          .send(`The supplier with id ${supplierId} does not exists`);
      else if (supplier.isDeleted === true) {
        return res
          .status(410)
          .send(`Supplier with id ${supplierId} is deleted`);
      }
      const newProduct = new Product({
        name,
        skuCode: await skuCodeGenerator(name, warehouseId),
        maximumQuantity,
        price,
        unit,
        specification,
        warehouseId,
        supplierId,
      });
      const savedProduct = await newProduct.save();
      await supplier.updateOne({ $push: { products: savedProduct._id } });
      res.status(201).json({
        success: true,
        message: `New product ${savedProduct.code} created successfully!`,
      });
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  getAllProducts: async (req, res) => {
    try {
      const products = await Product.find();
      res.status(200).json(products);
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  getAProduct: async (req, res) => {
    try {
      const products = await Product.findById(req.params.id);
      res.status(200).json(products);
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  updateProduct: async (req, res) => {},
};

module.exports = productController;
