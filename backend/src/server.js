import express from "express";
import dotenv from "dotenv"; // Đọc file .env
import cookieParser from "cookie-parser"; // Middleware để phân tích cookie
import cors from "cors"; // Middleware để xử lý CORS

dotenv.config(); // Khởi tạo dotenv để sử dụng biến môi trường từ file .env

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================= START Middleware  ====================================

// Middleware để phân tích cookie
app.use(cookieParser()); // Sử dụng cookieParser từ package cookie-parser

// Middleware để phân tích JSON
app.use(express.json());

// Middleware để xử lý CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL, //
    credentials: true,
  }),
);

// ============================================================= END Middleware  ====================================

// PUBLIC Router

import authRouter from "./routes/authRouter.js";
app.use("/api/auth", authRouter);

// PRIVATE Router
import { protectedRoute } from "./middlewares/authMiddleware.js";
app.use(protectedRoute);

// GỌI API
import routers from "./routes/index.js";
app.use("/api", routers);

// ==================================================== Import và kết nối DB ====================================
import { connectDB } from "./libs/db.js";
connectDB().then(() => {
  // Khởi động server
  app.listen(PORT, () => {
    console.log(`Server bắt đầu trên cổng ${PORT}`);
    console.log(`http://localhost:${PORT}`);
  });
});
//  =================================================== END Import và kết nối DB ================================
