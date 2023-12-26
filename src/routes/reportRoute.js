const reportController = require("../controllers/reportController");

const router = require("express").Router();

router.post("/", reportController.addReport);
router.get("/", reportController.getAllReport);
router.get(
  "/byWarehouse/:warehouseId",
  reportController.getReportByWarehouseId
);
module.exports = router;
