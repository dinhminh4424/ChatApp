import express from "express";
import authRoutes from "./authRouter.js";
import userRouter from "./userRouter.js";

const router = express.Router();

router.use("/auth", authRoutes);

router.use("/user", userRouter);

router.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is healthy" });
});
export default router;
