const Product = require("../models/productModel");
const Warehouse = require("../models/warehouseModel");

const skuCodeGenerator = async (name, warehouseId) => {
  const firstValue = name.substring(0, 2);
  const warehouse = await Warehouse.findOne({ _id: warehouseId });

  const secondValue = warehouse.code.substring(0, 2);
  const productAmount = await Product.countDocuments();
  const num1 = String(productAmount).padStart(4, "0");
  const sku = firstValue + secondValue + num1;
  const sku1 = sku.toUpperCase();
  return sku1;
};

const productController = {
  addProduct: async (req, res) => {
    try {
      const {
        name,
        quantity,
        price,
        unit,
        specification,
        warehouseId,
        supplierId,
      } = req.body;
      const newProduct = new Product({
        name,
        skuCode: await skuCodeGenerator(name, warehouseId),
        quantity,
        price,
        unit,
        specification,
        warehouseId,
        supplierId,
      });
      const savedProduct = await newProduct.save();
      res.status(200).json(savedProduct);
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
};

module.exports = productController;
