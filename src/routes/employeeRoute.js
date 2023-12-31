const employeeController = require("../controllers/employeeController");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const router = require("express").Router();

router.post("/", upload.single("image"), employeeController.addEmployee);
router.get("/", employeeController.getAllEmployees);
router.get("/manager", employeeController.getManager);
router.get("/staff", employeeController.getStaff);
router.get(
  "/staff/byWarehouse/:warehouseId",
  employeeController.getStaffByWarehouseId
);
router.get("/:id", employeeController.getAnEmployee);
router.put("/:id", upload.single("image"), employeeController.updateEmployee);
router.delete("/:id", employeeController.deleteEmployee);

module.exports = router;
