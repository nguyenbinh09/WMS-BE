const productController = require("../controllers/productController");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const router = require("express").Router();

router.post("/", upload.single("image"), productController.addProduct);
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getAProduct);
router.put("/:id", upload.single("image"), productController.updateProduct);
router.delete("/:id", productController.deleteProduct);
module.exports = router;
