const warehouseController = require("../controllers/warehouseController");

const router = require("express").Router();

router.post("/", warehouseController.addWarehouse);
router.get("/", warehouseController.getAllWarehouse);
router.get("/:id", warehouseController.getWarehouse);
module.exports = router;
