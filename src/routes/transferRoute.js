const transferController = require("../controllers/transferController");

const router = require("express").Router();

router.post("/", transferController.addTransfer);
router.get("/", transferController.getAllTransfer);
router.put("/:id", transferController.updateTransfer);

module.exports = router;
