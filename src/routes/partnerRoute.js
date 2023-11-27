const partnerController = require("../controllers/partnerController");

const router = require("express").Router();

router.post("/", partnerController.addPartner);
router.get("/", partnerController.getAllPartner);
module.exports = router;
