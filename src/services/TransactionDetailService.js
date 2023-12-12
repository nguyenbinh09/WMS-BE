const Product = require("../models/productModel");
const TransactionDetail = require("../models/transactionDetailModel");
const Transaction = require("../models/transactionModel");

const createTransactionDetail = async (
  req,
  res,
  productId,
  quantity,
  session,
  transaction
) => {
  try {
    const product = await Product.findOne({
      _id: productId,
      isDeleted: false,
    }).session(session);
    if (!product)
      return res
        .status(404)
        .send(`The product with id ${productId} does not exists`);
    else if (product.isDeleted === true) {
      return res.status(410).send(`Product with id ${productId} is deleted`);
    }
    //Compute total price of the detail
    const total = product.price * quantity;
    let quantityTemp = 0;
    if (transaction.type === "Inbound") {
      quantityTemp = product.quantity + quantity;
      if (quantityTemp > product.maximumQuantity) {
        return res
          .status(409)
          .send(
            `The quantity of product ${product.skuCode} has exceeded the maximum quantity!`
          );
      }
    } else {
      //If transaction is outbound, quantity of the product will descrease
      if (quantity > product.quantity) {
        return res
          .status(409)
          .send(`Product ${product.skuCode} quantity is not enough!`);
      }
      quantityTemp = product.quantity - quantity;
      await Product.findByIdAndUpdate(
        product._id,
        { $set: { quantity: quantityTemp } },
        { new: true }
      ).session(session);
    }
    const newTransactionDetail = new TransactionDetail({
      productId,
      quantity,
      total,
      transactionId: transaction._id,
    });
    const savedTransaction = await newTransactionDetail.save({ session });
    return savedTransaction;
  } catch (error) {
    return res.status(500).json(error);
  }
};

const updateTransactionDetail = async (
  req,
  res,
  id,
  productId,
  quantity,
  session,
  transaction
) => {
  try {
    const product = await Product.findOne({
      _id: productId,
      isDeleted: false,
    }).session(session);
    if (!product)
      return res
        .status(404)
        .send(`The product with id ${productId} does not exists`);
    else if (product.isDeleted === true) {
      return res.status(410).send(`Product with id ${productId} is deleted`);
    }
    const detail = await TransactionDetail.findById(id).session(session);
    //Compute total price of the detail
    const total = product.price * quantity;
    const oldQuantity = product.quantity - detail.quantity;
    const quantityTemp = oldQuantity + quantity;
    if (transaction.type === "Inbound") {
      //If transaction is inbound
      if (quantityTemp > product.maximumQuantity) {
        return res
          .status(409)
          .send(
            `The quantity of product ${product.skuCode} has exceeded the maximum quantity!`
          );
      }
    } else {
      //If transaction is outbound
      if (quantity > oldQuantity) {
        return res
          .status(409)
          .send(`Product ${product.skuCode} quantity is not enough!`);
      }
      quantityTemp = product.quantity - quantity;
      await Product.findByIdAndUpdate(
        product._id,
        { $set: { quantity: quantityTemp } },
        { new: true }
      ).session(session);
    }
    const updatedDetail = await TransactionDetail.findByIdAndUpdate(
      detail._id,
      {
        $set: { quantity, total },
      },
      { new: true }
    ).session(session);
    return updatedDetail;
  } catch (error) {
    return res.status(500).json(error);
  }
};

const deleteTransactionDetail = async (req, res, id, session) => {
  try {
    const detail = await TransactionDetail.findById(id).session(session);
    const product = await Product.findOne({
      _id: detail.productId,
      isDeleted: false,
    }).session(session);
    if (!product)
      return res
        .status(404)
        .send(`The product with id ${detail.productId} does not exists`);
    else if (product.isDeleted === true) {
      return res
        .status(410)
        .send(`Product with id ${detail.productId} is deleted`);
    }

    await TransactionDetail.findByIdAndDelete(detail._id).session(session);
    return detail;
  } catch (error) {
    return res.status(500).json(error);
  }
};
module.exports = {
  createTransactionDetail,
  updateTransactionDetail,
  deleteTransactionDetail,
};
