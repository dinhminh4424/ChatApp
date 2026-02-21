import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ❗ Chỉ user đã đăng nhập hợp lệ mới được kết nối socket

// | param  | nghĩa                    |
// | ------ | ------------------------ |
// | socket | thông tin connection     |
// | next   | gọi để cho phép tiếp tục |

export const socketAuthMiddleware = async (socket, next) => {
  try {
    // 1️⃣ Lấy token từ client

    // Client gửi token khi connect: trong useSocketStore.ts [FE]
    // io(URL, {
    //   auth: { token },
    // });

    const token = socket.handshake.auth?.token; // do  [token] này được định nghĩa trong useSocketStore.ts [FE]

    if (!token) {
      console.log(
        "socketAuthMiddleware : UNAUTHORIZED - Token không tồn tại -  Không tìm thấy token trong handshake",
      );
      return next(
        new Error(
          "UNAUTHORIZED - Token không tồn tại -  Không tìm thấy token trong handshake",
        ),
      );
    }

    // 2️⃣ Verify JWT
    // Kiểm tra token còn hợp lệ
    // Mã hoá ra cái mà lúc đăng nhập ở authController [signIn]

    //     JWT verify sẽ:
    //          check chữ ký
    //          check hết hạn
    //          decode payload
    //     Nếu token:
    //          sai secret
    //          hết hạn
    //          bị sửa
    //     → nó sẽ throw error → nhảy vào catch
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decoded) {
      console.log(
        "socketAuthMiddleware : Không mã hoá được token - Token không hợp lệ hoặc đã hết hạn",
      );
      return next(
        new Error("UNAUTHORIZED - Token không hợp lệ hoặc đã hết hạn "),
      );
    }

    // 3️⃣ Tìm user trong database
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      console.log("socketAuthMiddleware : Không tìm thấy người dùng ");
      return next(new Error("UNAUTHORIZED - Không tìm thấy người dùng"));
    }

    // 4️⃣ Gắn user vào socket
    socket.user = user;

    // 5️⃣ Cho phép kết nối
    next();
  } catch (error) {
    console.error(
      "socketAuthMiddleware.js Lỗi Khi verify JWT trong socketAuthMiddleware : ",
      error,
    );
    return next(new Error("UNAUTHORIZED"));
  }
};
