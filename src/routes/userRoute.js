const userController = require("../controllers/userController");
const middlewareController = require("../controllers/middlewareController");
const router = require("express").Router();

router.get("/", middlewareController.verifyToken, userController.getAllUsers);
router.delete(
  "/:id",
  middlewareController.authorizeAdmin,
  userController.deleteUser
);

module.exports = router;
