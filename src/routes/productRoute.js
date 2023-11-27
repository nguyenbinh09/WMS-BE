const productController = require("../controllers/productController");

const router = require("express").Router();

router.post("/", productController.addProduct);
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getAProduct);
module.exports = router;
