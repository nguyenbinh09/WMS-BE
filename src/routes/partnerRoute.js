const partnerController = require("../controllers/partnerController");

const router = require("express").Router();

router.post("/", partnerController.addPartner);
router.get("/", partnerController.getAllPartner);
router.get("/customer", partnerController.getCustomer);
router.get("/supplier", partnerController.getSupplier);
router.get(
  "/customer/byWarehouse/:warehouseId",
  partnerController.getCustomerByWarehouseId
);
router.get(
  "/supplier/byWarehouse/:warehouseId",
  partnerController.getSupplierByWarehouseId
);
router.put("/:id", partnerController.updatePartner);
router.delete("/:id", partnerController.deletePartner);

module.exports = router;
