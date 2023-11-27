const Employee = require("../models/employeeModel");
const Warehouse = require("../models/warehouseModel");
const ContactInfo = require("../models/contactInfoModel");
const cloudinary = require("../utils/helper");
const { format, parse } = require("date-fns");

const generateEmployeeCode = async (warehouseId, position) => {
  {
    const warehouse = await Warehouse.findOne({ _id: warehouseId });
    let employeePosition = position;
    if (employeePosition)
      switch (employeePosition) {
        case "Manager":
          employeePosition = "MN";
          break;
        case "Employee":
          employeePosition = "EP";
          break;
        default:
          break;
      }
    const employeeAmount = await Employee.countDocuments({
      isDeleted: false,
    });
    const employeeAmountStr = String(employeeAmount).padStart(4, "0");
    const warehouseCode = warehouse.code.substring(0, 2);
    const employeeCode = warehouseCode + employeeAmountStr + employeePosition;
    return employeeCode;
  }
};

const employeeController = {
  addEmployee: async (req, res) => {
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
      // upload result init
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
          throw new InternalServerError(
            "Unable to upload image, please try again"
          );
        }
      }
      let imageUrl;
      // check if image upload or not
      if (result) {
        imageUrl = result.url;
      }

      const newContact = new ContactInfo({ address, phone_num, email });
      const newEmployee = new Employee({
        name,
        code: await generateEmployeeCode(warehouseId, position),
        position,
        startDate: isoStartDateStr,
        gender,
        idCard,
        contactId: newContact._id,
        imageUrl,
        birthday: isoBirthDayStr,
        warehouseId,
      });
      await newContact.save();
      const employee = await newEmployee.save();
      res.status(200).json(req.file);
    } catch (error) {
      throw error;
    }
  },
  getAllEmployee: async (req, res) => {
    try {
      const employees = await Employee.find();
      if (!employees) {
        return res.status(404).send("Unable to upload image, please try again");
      }
      res.status(200).json(employees);
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  getAnEmployee: async (req, res) => {
    try {
      const employee = await Employee.findById(req.params.id).populate(
        "contactId"
      );
      if (!employee) {
        return res.status(404).send("The employee does not exist");
      }
      console.log(employee.contactId.address);
      res.status(200).json(employee);
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  updateEmployee: async (req, res) => {
    try {
      const {
        name,
        position,
        startDate,
        finishDate,
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
      const finishdate = parse(finishDate, "dd/MM/yyyy", new Date());
      const isoFinishDateStr = format(
        finishdate,
        "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
      );
      const { id } = req.params;
      const employee = await Employee.findById(id).populate("contactId");
      if (!employee)
        return res
          .status(404)
          .send(`The employee with id ${id} does not exists`);
      else if (employee.isDeleted === true) {
        return res.status(410).send(`Employee with id ${id} is deleted`);
      }

      res.status(200).send("Updated Successfully!");
    } catch (error) {
      return res.status(500).json(error);
    }
  },
};

module.exports = employeeController;
