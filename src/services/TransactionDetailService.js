const Product = require("../models/productModel");
const TransactionDetail = require("../models/transactionDetailModel");

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
    const total = product.price * quantity;
    let quantityTemp = 0;
    if (transaction.type === "Inbound") {
      quantityTemp = product.quantity + quantity;
      if (quantityTemp > product.maximumQuantity) {
        return res
          .status(409)
          .send("The quantity has exceeded the maximum quantity!");
      }
    } else {
      if (quantity > product.quantity) {
        return res
          .status(409)
          .send(`Product ${product.skuCode} quantity is not enough!`);
      }
      quantityTemp = product.quantity - quantity;
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

module.exports = createTransactionDetail;
