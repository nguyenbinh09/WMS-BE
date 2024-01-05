const Product = require("../models/productModel");
const ReportDetail = require("../models/reportDetailModel");

const createReportDetail = async (
  req,
  res,
  productId,
  description,
  actualQuantity,
  differenceQuantity,
  report,
  session
) => {
  try {
    const product = await Product.findOne({
      _id: productId,
      isDeleted: false,
    }).session(session);
    console.log(product);
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
    const newReportDetail = new ReportDetail(
      {
        productId,
        description,
        actualQuantity,
        differenceQuantity,
        reportId: report._id,
      },
      { session }
    );
    const savedReportDetail = await newReportDetail.save({ session });

    return savedReportDetail;
  } catch (error) {
    return res.status(500).json(error);
  }
};

module.exports = createReportDetail;
