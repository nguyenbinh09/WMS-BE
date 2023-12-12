const transactionController = require("../controllers/transactionController");
const router = require("express").Router();

router.post("/", transactionController.addTransaction);
router.get("/", transactionController.getAllTransactions);
router.get("/inbound", transactionController.getAllInbound);
router.get("/outbound", transactionController.getAllOutbound);
router.put("/:id");

module.exports = router;
