import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECT_URL);
    console.log("==== Kết nối MongoDB thành công ====");
  } catch (error) {
    console.error(" === Lỗi kết nối MongoDB:", error, " ===");
    process.exit(1); // Thoát ứng dụng nếu không kết nối được DB
  }
};
