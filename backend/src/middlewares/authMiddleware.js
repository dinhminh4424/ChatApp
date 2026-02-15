import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectedRoute = (req, res, next) => {
  try {
    // Lấy token từ header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Do nó có dạng Bearer <Token> nên mới là [1] : <token>
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Không tìm thấy token trong header",
      });
    }

    // Xác nhận token hợp lệ
    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      async (err, decodedUser) => {
        if (err) {
          return res.status(403).json({
            success: false,
            message: "AssessToken không hợp lệ hoặc đã hết hạn",
          });
        }

        // Tìm User
        const user = await User.findById(decodedUser.userId).select(
          "-password",
        );

        if (!user) {
          return res.status(404).json({
            success: false,
            message: "Không tìm thấy người dùng hoặc người dùng không tồn tại",
          });
        }

        // Trả về thông tin trong req
        req.user = user;
        next();
      },
    );
  } catch (error) {
    console.error("Lỗi xác thực JWT trong Middleware:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi xác thực JWT trong Middleware: " + error.message,
    });
  }
};
