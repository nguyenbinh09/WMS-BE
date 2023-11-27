const mongoose = require("mongoose");
const getSKU = require("../utils/helper");
const warehouseController = require("../controllers/warehouseController");
const Warehouse = require("./warehouseModel");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is missing"],
  },
  skuCode: {
    type: String,
    required: [true, "A product must have a sku code"],
    unique: [
      true,
      "A sku code of product with the same name has already exists",
    ],
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is missing"],
    default: 0,
  },
  maximumQuantity: {
    type: Number,
    required: [true, "Maximum quantity is missing"],
  },
  price: {
    type: Number,
    required: [true, "Price is missing"],
  },
  unit: {
    type: String,
    required: [true, "Unit is missing"],
  },
  imageUrl: {
    type: String,
    required: true,
    default:
      "https://apandharampur.websites.co.in/dummytemplate/img/product-placeholder.png",
  },
  specification: {
    type: String,
    required: [true, "Specification is missing"],
  },
  warehouseId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Warehouse",
  },
  supplierId: {
    type: String, //mongoose.Types.ObjectId,
    required: true,
    //ref: "Supplier",
  },
  isDeleted: {
    type: Boolean,
    required: true,
    default: false,
  },
});

let Product = mongoose.model("Product", productSchema);

module.exports = Product;
