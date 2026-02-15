import express from "express";
import AuthController from "../controllers/authController.js";
("../controllers/authController.js");

const router = express.Router();

router.post("/signUp", AuthController.signUp);
router.post("/signIn", AuthController.signIn);
router.post("/signOut", AuthController.signOut);
router.post("/refreshToken", AuthController.refreshToken);

// @route   POST api/auth/register
// @desc    Đăng ký người dùng
// @access  Public
router.post("/register", (req, res) => {
  res.send("Đăng ký người dùng");
});

export default router;
