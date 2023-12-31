const { findById, findByIdAndUpdate } = require("../models/employeeModel");
const Partner = require("../models/partnerModel");
const Product = require("../models/productModel");
const Warehouse = require("../models/warehouseModel");
const mongoose = require("mongoose");
const cloudinary = require("../utils/helper");
const { compareSync } = require("bcrypt");

const skuCodeGenerator = async (name) => {
  const firstValue = name.substring(0, 2);
  const productAmount = await Product.countDocuments();
  const count = String(productAmount).padStart(6, "0");
  const sku = firstValue + count;
  const sku1 = sku.toUpperCase();
  return sku1;
};

const handleSkuCode = async (name, productId, session) => {
  const product = await Product.findById(productId).session(session);
  const newName = name.toUpperCase().substring(0, 2);
  const oldCode = product.skuCode;
  const productCode = oldCode.substring(0, 2);
  const newCode = oldCode.replace(productCode, newName);
  return newCode;
};

const productController = {
  addProduct: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
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
      const supplier = await Partner.findOne({
        _id: supplierId,
        type: "Supplier",
        isDeleted: false,
      }).session(session);
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
        skuCode: await skuCodeGenerator(name, warehouseId, session),
        maximumQuantity,
        price,
        unit,
        specification,
        warehouseId,
        supplierId,
      });
      // upload result init
      let result;
      if (req.file) {
        try {
          result = await cloudinary.uploader.upload(req.file.path, {
            public_id: `${newProduct._id}_view`,
            width: 500,
            height: 500,
            crop: "fill",
          });
        } catch (err) {
          console.log(err);
          return res
            .status(500)
            .send("Unable to upload image, please try again");
        }
      }
      let imageUrl;
      // check if image upload or not
      if (result) {
        imageUrl = result.url;
      }
      newProduct.imageUrl = imageUrl;

      const savedProduct = await newProduct.save({ session });

      await supplier
        .updateOne({ $push: { products: savedProduct._id } })
        .session(session);
      res.status(201).json({
        success: true,
        message: `New product ${savedProduct.skuCode} created successfully!`,
      });
      console.log(savedProduct);
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

  getAllProducts: async (req, res) => {
    try {
      const products = await Product.find().populate([
        "warehouseId",
        "supplierId",
      ]);
      res.status(200).json(products);
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  getProductByWarehouseId: async (req, res) => {
    try {
      const warehouseId = req.params.warehouseId;
      const products = await Product.find({
        isDeleted: false,
        warehouseId: warehouseId,
      })
        .populate("supplierId")
        .populate("warehouseId");
      res.status(200).json(products);
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  getAProduct: async (req, res) => {
    try {
      const product = await Product.findById(req.params.id).populate([
        "warehouseId",
        "supplierId",
      ]);
      res.status(200).json(product);
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  updateProduct: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { name, maximumQuantity, price, unit, specification, supplierId } =
        req.body;
      const { id } = req.params;
      const product = await Product.findById(id).session(session);
      //edit name
      let newCode;
      if (name) {
        newCode = await handleSkuCode(name, id, session);
      }
      //edit supplier
      if (supplierId || supplierId === null) {
        if (supplierId !== null) {
          const supplier = await Partner.findOne({
            _id: supplierId,
            type: "Supplier",
            isDeleted: false,
          }).session(session);
          if (!supplier) {
            return res
              .status(404)
              .send(`Supplier with code ${supplier.code} is not found!`);
          } else if (supplier.isDeleted === true) {
            return res
              .status(404)
              .send(`Supplier with code ${supplier.code} is deleted!`);
          }
          await Partner.findOneAndUpdate(
            { _id: supplier._id, type: "Supplier" },
            { $push: { products: product._id } },
            { new: true }
          )
            .populate("products")
            .session(session);
        }

        if (product.supplierId) {
          await Partner.findOneAndUpdate(
            { _id: product.supplierId, type: "Supplier" },
            { $pull: { products: product._id } },
            { new: true }
          )
            .session(session)
            .populate("products");
        }
      }

      //edit image
      let result;
      if (req.file) {
        try {
          result = await cloudinary.uploader.upload(req.file.path, {
            public_id: `${product._id}_view`,
            width: 500,
            height: 500,
            crop: "fill",
          });
        } catch (err) {
          console.log(err);
          return res
            .status(500)
            .send("Unable to upload image, please try again");
        }
      }
      let imageUrl;
      // check if image upload or not
      if (result) {
        imageUrl = result.url;
      }
      //update all changes
      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        {
          name,
          code: newCode,
          maximumQuantity,
          price,
          unit,
          imageUrl,
          specification,
          supplierId,
        },
        { new: true }
      ).session(session);

      res
        .status(200)
        .json(`Product with ${product.skuCode} updated Successfully`);
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

  deleteProduct: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { id } = req.params;
      const product = await Product.findByIdAndUpdate(
        id,
        {
          $set: { isDeleted: true },
        },
        { new: true }
      ).session(session);
      if (product.supplierId) {
        await Partner.findOneAndUpdate(
          { _id: product.supplierId, type: "Supplier", isDeleted: false },
          { $pull: { products: product._id } },
          { new: true }
        )
          .session(session)
          .populate("products");
      }
      res.status(201).send("Deleted product successfully!");
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

module.exports = productController;
