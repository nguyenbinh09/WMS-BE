const Product = require("../models/productModel");
const TransactionDetail = require("../models/transactionDetailModel");

const createTransactionDetail = async (
  req,
  res,
  productId,
  quantity,
  total,
  session,
  transaction
) => {
  try {
    const product = await Product.findOne({
      _id: productId,
      isDeleted: false,
    }).session(session);
    if (!product)
      return {
        error: true,
        statusCode: 404,
        message: `The product with id ${productId} does not exists`,
      };
    else if (product.isDeleted === true) {
      // return res.status(410).send(`Product with id ${productId} is deleted`);
      return {
        error: true,
        statusCode: 410,
        message: `Product with id ${productId} is deleted`,
      };
    }
    //Compute total price of the detail
    let quantityTemp = 0;
    if (transaction.type === "Inbound") {
      quantityTemp = product.quantity + quantity;
      if (quantityTemp > product.maximumQuantity) {
        // return res
        //   .status(409)
        //   .send(
        //     `The quantity of product ${product.skuCode} has exceeded the maximum quantity!`
        //   );
        return {
          error: true,
          statusCode: 409,
          message: `The quantity of product ${product.skuCode} has exceeded the maximum quantity!`,
        };
      }
    } else {
      //If transaction is outbound, quantity of the product will descrease
      if (quantity > product.quantity) {
        // return res
        //   .status(409)
        //   .send(`Product ${product.skuCode} quantity is not enough!`);
        return {
          error: true,
          statusCode: 409,
          message: `Product ${product.skuCode} quantity is not enough!`,
        };
      }
      quantityTemp = product.quantity - quantity;
      await Product.findByIdAndUpdate(
        product._id,
        { $set: { quantity: quantityTemp } },
        { new: true }
      ).session(session);
    }
    const newTransactionDetail = new TransactionDetail(
      {
        productId,
        quantity,
        total,
        transactionId: transaction._id,
      },
      { session }
    );
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
  total,
  session,
  transaction
) => {
  try {
    const product = await Product.findOne({
      _id: productId,
      isDeleted: false,
    }).session(session);
    if (!product)
      // return res
      //   .status(404)
      //   .send(`The product with id ${productId} does not exists`);
      return {
        error: true,
        statusCode: 404,
        message: `The product with id ${productId} does not exists`,
      };
    else if (product.isDeleted === true) {
      // return res.status(410).send(`Product with id ${productId} is deleted`);
      return {
        error: true,
        statusCode: 410,
        message: `Product with id ${productId} is deleted`,
      };
    }
    const detail = await TransactionDetail.findById(id).session(session);
    //Compute total price of the detail
    const oldQuantity = product.quantity - detail.quantity;
    let quantityTemp;
    if (transaction.type === "Inbound") {
      quantityTemp = oldQuantity + quantity;
      //If transaction is inbound
      if (quantityTemp > product.maximumQuantity) {
        return {
          error: true,
          statusCode: 409,
          message: `The quantity of product ${product.skuCode} has exceeded the maximum quantity!`,
        };
      }
    } else {
      //If transaction is outbound
      if (quantity > oldQuantity) {
        return {
          error: true,
          statusCode: 409,
          message: `Product ${product.skuCode} quantity is not enough!`,
        };
      }
      quantityTemp = product.quantity - quantity;
      console.log(quantityTemp);
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

const deleteTransactionDetail = async (req, res, id, session, transaction) => {
  try {
    const detail = await TransactionDetail.findById(id).session(session);
    const product = await Product.findOne({
      _id: detail.productId,
      isDeleted: false,
    }).session(session);
    if (product && transaction.type === "Outbound") {
      const oldQuantity = product.quantity + detail.quantity;
      await Product.findByIdAndUpdate(
        product._id,
        { $set: { quantity: oldQuantity } },
        { new: true }
      ).session(session);
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
