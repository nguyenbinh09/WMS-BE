const mongoose = require("mongoose");
const Warehouse = require("../models/warehouseModel");
const Report = require("../models/reportModel");
const createReportDetail = require("../services/ReportDetailService");
const Product = require("../models/productModel");

const generateReportCode = async (session) => {
  const reportAmount = await Report.countDocuments().session(session);
  const reportAmountStr = String(reportAmount).padStart(6, "0");
  const reportCode = "INV" + reportAmountStr;
  return reportCode;
};

const reportController = {
  addReport: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const {
        totalActualQuantity,
        totalDiffQuantity,
        increaseQuantity,
        decreaseQuantity,
        managerId,
        details,
        warehouseId,
      } = req.body;
      const newReport = new Report(
        {
          code: await generateReportCode(warehouseId, session),
          totalActualQuantity,
          totalDiffQuantity,
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
          details[i].actualQuantity,
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

  updateApproval: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { isApproved } = req.body;
      const { id } = req.params;
      const report = await Report.findById(id)
        .populate("reportDetails")
        .session(session);
      const details = report.reportDetails;
      if (isApproved === true) {
        for (i = 0; i < details.length; i++) {
          if (details[i].differenceQuantity !== 0) {
            await Product.findByIdAndUpdate(
              details[i].productId,
              { $set: { quantity: details[i].actualQuantity } },
              { new: true }
            ).session(session);
          }
        }
      }
      await Report.findByIdAndUpdate(
        id,
        { $set: { isApproved: isApproved } },
        { new: true }
      ).session(session);
      if (isApproved) {
        res.status(201).json({
          success: true,
          message: `Inventory report ${report.code} has been approved!`,
        });
      } else {
        res.status(201).json({
          success: true,
          message: `Inventory report ${report.code} has been rejected!`,
        });
      }
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
