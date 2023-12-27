const authController = require("../controllers/authController");
const middlewareController = require("../controllers/middlewareController");

const router = require("express").Router();

router.post(
  "/register",
  middlewareController.authorizeAdmin,
  authController.registerUser
);
router.post("/login", authController.loginUser);
router.post("/refresh", authController.requestRefreshToken);
router.post(
  "/logout",
  middlewareController.verifyToken,
  authController.logoutUser
);
module.exports = router;
