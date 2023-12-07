const warehouseController = require("../controllers/warehouseController");

const router = require("express").Router();

router.post("/", warehouseController.addWarehouse);
router.get("/", warehouseController.getAllWarehouse);
router.get("/:id", warehouseController.getWarehouse);
router.put("/:id", warehouseController.updateWarehouse);
router.delete("/:id", warehouseController.deleteWarehouse);

module.exports = router;
