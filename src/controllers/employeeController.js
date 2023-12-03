const Employee = require("../models/employeeModel");
const Warehouse = require("../models/warehouseModel");
const ContactInfo = require("../models/contactInfoModel");
const cloudinary = require("../utils/helper");
const { format, parse } = require("date-fns");
const mongoose = require("mongoose");
const validator = require("validator");
const User = require("../models/userModel");

const generateEmployeeCode = async (warehouseId, position, session) => {
  {
    const employeePosition = position.toUpperCase().substring(0, 3);
    const employeeAmount = await Employee.countDocuments().session(session);
    const employeeAmountStr = String(employeeAmount).padStart(4, "0");
    const employeeCode = employeePosition + employeeAmountStr;
    return employeeCode;
  }
};

const handleEmployeeCode = async (position, employeeId, session) => {
  const employee = await Employee.findById(employeeId).session(session);
  const employeePosition = position.toUpperCase().substring(0, 3);
  const employeeCode = employee.code;
  const positionCode = employeeCode.substring(0, 3);
  const newCode = employeeCode.replace(positionCode, employeePosition);
  return newCode;
};

const employeeController = {
  addEmployee: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const {
        name,
        position,
        startDate,
        gender,
        idCard,
        birthday,
        email,
        phone_num,
        address,
        warehouseId,
      } = req.body;
      const birthDay = parse(birthday, "dd/MM/yyyy", new Date());
      const isoBirthDayStr = format(birthDay, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
      const startdate = parse(startDate, "dd/MM/yyyy", new Date());
      const isoStartDateStr = format(startdate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

      const isEmail = validator.isEmail(email);
      if (!isEmail && email !== "") {
        return res.status(400).send("Email is not invalid!");
      }
      const newContact = new ContactInfo(
        { address, phone_num, email },
        { session }
      );

      const newEmployee = new Employee(
        {
          name,
          code: await generateEmployeeCode(warehouseId, position, session),
          position,
          startDate: isoStartDateStr,
          gender,
          idCard,
          contactId: newContact._id,
          birthday: isoBirthDayStr,
          warehouseId,
        },
        { session }
      );
      // upload result init
      let result;
      if (req.file) {
        try {
          result = await cloudinary.uploader.upload(req.file.path, {
            public_id: `${newEmployee._id}_profile`,
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
      newEmployee.imageUrl = imageUrl;
      await newContact.save({ session });
      //save employee
      const savedemployee = await newEmployee.save({ session });

      res.status(201).json({
        success: true,
        message: `New product ${savedemployee.code} created successfully!`,
      });
      await session.commitTransaction();
    } catch (error) {
      // Rollback any changes made in the database
      await session.abortTransaction();
      // Rethrow the error
      throw error;
    } finally {
      // Ending the session
      await session.endSession();
    }
  },

  getEmployee: async (req, res) => {
    try {
      const employees = await Employee.find({
        position: { $nin: "Manager" },
        isDeleted: false,
      }).populate(["contactId", "warehouseId"]);
      if (!employees) {
        return res.status(404).send("Not found any employees");
      }
      res.status(200).json(employees);
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  getManager: async (req, res) => {
    try {
      const managers = await Employee.find({
        position: "Manager",
        isDeleted: false,
      }).populate(["contactId", "warehouseId"]);
      if (!managers) {
        return res.status(404).send("Not found any managers");
      }
      res.status(200).json(managers);
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  getAnEmployee: async (req, res) => {
    try {
      const employee = await Employee.findById(req.params.id).populate([
        "contactId",
        "warehouseId",
      ]);
      if (!employee) {
        return res.status(404).send("The employee does not exist");
      }
      res.status(200).json(employee);
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  updateEmployee: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const {
        name,
        position,
        startDate,
        gender,
        idCard,
        birthday,
        email,
        phone_num,
        address,
        warehouseId,
      } = req.body;
      const { id } = req.params;
      let isoBirthDayStr;
      let isoStartDateStr;
      //edit birthday
      if (birthday) {
        const birthDay = parse(birthday, "dd/MM/yyyy", new Date());
        isoBirthDayStr = format(birthDay, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
      }
      //edit startDate
      if (startDate) {
        const startdate = parse(startDate, "dd/MM/yyyy", new Date());
        isoStartDateStr = format(startdate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
      }
      const employee = await Employee.findById(id)
        .populate("contactId")
        .session(session);
      if (!employee)
        return res
          .status(404)
          .send(`The employee with id ${id} does not exists`);
      else if (employee.isDeleted === true) {
        return res.status(410).send(`Employee with id ${id} is deleted`);
      }
      //edit email
      if (email) {
        const isEmail = validator.isEmail(email);
        if (!isEmail && email !== "") {
          return res.status(400).send("Email is not invalid!");
        }
      }
      //edit contact
      await ContactInfo.findByIdAndUpdate(
        employee.contactId,
        {
          $set: { email, address, phone_num },
        },
        { new: true }
      ).session(session);
      //edit position --> code change
      let newCode;
      if (position) {
        newCode = await handleEmployeeCode(position, id, session, warehouseId);
      }
      //edit image
      let result;
      if (req.file) {
        try {
          result = await cloudinary.uploader.upload(req.file.path, {
            public_id: `${employee._id}_profile`,
            width: 500,
            height: 500,
            crop: "fill",
          });
        } catch (err) {
          return res
            .status(500)
            .send("Unable to upload image, please try again");
        }
      }
      let imageUrl;
      if (result) {
        imageUrl = result.url;
      }
      //update employee
      const updatedEmployee = await Employee.findByIdAndUpdate(
        id,
        {
          $set: {
            code: newCode,
            name,
            position,
            startDate: isoStartDateStr,
            gender,
            idCard,
            birthday: isoBirthDayStr,
            email,
            imageUrl,
            phone_num,
            address,
            warehouseId,
          },
        },
        { new: true }
      ).session(session);

      res
        .status(200)
        .json(
          `The employee with code ${updatedEmployee.code} updated successfully!`
        );
      await session.commitTransaction();
    } catch (error) {
      // Rollback any changes made in the database
      await session.abortTransaction();
      // Rethrow the error
      throw error;
    } finally {
      // Ending the session
      await session.endSession();
    }
  },

  deleteEmployee: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const id = req.params.id;
      const employee = await Employee.findByIdAndUpdate(
        id,
        { $set: { isDeleted: true, finishDate: new Date() } },
        { new: true }
      ).session(session);
      const user = await User.findOneAndUpdate(
        { employeeId: employee._id },
        { $set: { isDeleted: true } },
        { new: true }
      ).session(session);
      res.status(200).send(`Deleted employee successfully!`);
      await session.commitTransaction();
    } catch (error) {
      // Rollback any changes made in the database
      await session.abortTransaction();
      // Rethrow the error
      throw error;
    } finally {
      // Ending the session
      await session.endSession();
    }
  },
};

module.exports = employeeController;
