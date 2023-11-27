const employeeController = require("../controllers/employeeController");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const router = require("express").Router();

router.post("/", upload.single("image"), employeeController.addEmployee);
router.get("/", employeeController.getAllEmployee);
router.get("/:id", employeeController.getAnEmployee);
router.put("/:id", employeeController.updateEmployee);

module.exports = router;
