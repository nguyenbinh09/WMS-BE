const mongoose = require("mongoose");
const Warehouse = require("../models/warehouseModel");
const Report = require("../models/reportModel");
const createReportDetail = require("../services/ReportDetailService");

const generateReportCode = async (warehouseId, session) => {
  const warehouse = await Warehouse.findById(warehouseId).session(session);
  const warehouseCode = warehouse.code;
  const reportAmount = await Report.countDocuments();
  const reportAmountStr = String(reportAmount).padStart(4, "0");
  const reportCode = "INV" + reportAmountStr + warehouseCode;
  return reportCode;
};

const reportController = {
  addReport: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const {
        actualQuantity,
        increaseQuantity,
        decreaseQuantity,
        managerId,
        details,
        warehouseId,
      } = req.body;
      const newReport = new Report(
        {
          code: await generateReportCode(warehouseId, session),
          actualQuantity,
          increaseQuantity,
          decreaseQuantity,
          warehouseId,
          managerId,
        },
        { session }
      );
      const savedReport = await newReport.save({ session });
      for (i = 0; i < details.length; i++) {
        let reportDetail = await createReportDetail(
          req,
          res,
          details[i].productId,
          details[i].description,
          details[i].differenceQuantity,
          savedReport,
          session
        );
        if (reportDetail) {
          if (reportDetail.error === true) {
            return res
              .status(reportDetail.statusCode)
              .send(reportDetail.message);
          }
          await savedReport
            .updateOne({
              $push: { reportDetails: reportDetail._id },
            })
            .session(session);
        }
      }

      res.status(201).json({
        success: true,
        message: `New inventory report ${savedReport.code} created successfully!`,
      });
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

  getAllReport: async (req, res) => {
    try {
      const reports = await Report.find().populate([
        "reportDetails",
        "managerId",
        "warehouseId",
      ]);
      if (!reports) {
        return res.status(404).send("Not found any reports");
      }

      res.status(200).json(reports);
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  getReportByWarehouseId: async (req, res) => {
    try {
      const warehouseId = req.params.warehouseId;
      const reports = await Report.find({
        warehouseId: warehouseId,
      }).populate(["reportDetails", "managerId", "warehouseId"]);
      if (!reports) {
        return res.status(404).send("Not found any reports");
      }

      res.status(200).json(reports);
    } catch (error) {
      return res.status(500).json(error);
    }
  },
};

module.exports = reportController;
