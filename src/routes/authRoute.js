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
router.post("/forgotPassword", authController.forgotPassword);
router.post("/resetPassword/:id", authController.resetPassword);
router.post(
  "/changePassword/:id",
  middlewareController.verifyToken,
  authController.changePassword
);
module.exports = router;
