const transactionController = require("../controllers/transactionController");
const router = require("express").Router();

router.post("/", transactionController.addTransaction);
router.get("/", transactionController.getAllTransactions);
router.get(
  "/byWarehouse/:warehouseId",
  transactionController.getTransactionsByWarehouseId
);
router.get("/inbound", transactionController.getAllInbound);
router.get(
  "/inbound/byWarehouse/:warehouseId",
  transactionController.getInboundByWarehouseId
);
router.get("/outbound", transactionController.getAllOutbound);
router.get(
  "/outbound/byWarehouse/:warehouseId",
  transactionController.getOutboundByWarehouseId
);
router.put("/:id", transactionController.updateTransaction);
router.put("/status/:id", transactionController.updateStatus);
router.delete("/:id", transactionController.deleteTransaction);
module.exports = router;
