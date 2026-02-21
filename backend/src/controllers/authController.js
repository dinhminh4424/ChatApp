import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import Session from "../models/Session.js";

const REFRESH_TOKEN_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 ngày (ms)

class AuthController {
  async signUp(req, res) {
    const { userName, password, email, firstName, lastName } = req.body;
    console.log("Request body:", req.body);

    if (!userName || !password || !email || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message:
          "Không thể thiếu thông tin UserName, Password, ConfirmPassword, Email, FirstName hoặc LastName",
      });
    }

    // Kiểm tra xem userName đã tồn tại chưa
    const existingUser = await User.findOne({ userName });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Tên người dùng (UserName) đã tồn tại.",
      });
    }

    // Mã hóa mật khẩu

    const hashedPassword = await bcrypt.hash(password, 10); // Số 10 là số vòng băm (salt rounds)

    // Tạo người dùng mới
    try {
      const newUser = new User({
        userName,
        password: hashedPassword,
        email,
        displayName: `${lastName} ${firstName}`,
      });

      await newUser.save();

      return res.status(201).json({
        success: true,
        message: "Tạo người dùng mới thành công.",
        user: newUser,
      });
    } catch (error) {
      console.error("Lỗi khi tạo người dùng mới:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi tạo người dùng mới: " + error.message,
      });
    }
  }

  async signIn(req, res) {
    try {
      // console.log("accessToken time:", process.env.ACCESS_TOKEN_TTL);

      const { userName, password } = req.body;

      if (!userName || !password) {
        console.log("Không thể thiếu thông tin UserName hoặc Password");
        return res.status(400).json({
          success: false,
          message: "Không thể thiếu thông tin UserName hoặc Password",
        });
      }

      const user = await User.findOne({ userName });

      if (!user) {
        console.log("User Không Tồn Tại");
        return res.status(400).json({
          success: false,
          message: "UserName hoặc Password không đúng",
        });
      }

      // Kiểm tra mật khẩu
      const isPasswordValid = await bcrypt.compare(password, user.password); // So sánh mật khẩu nhập vào với mật khẩu đã mã hóa

      if (!isPasswordValid) {
        console.log("Mật khẩu không đúng");
        return res.status(400).json({
          success: false,
          message: "UserName hoặc Password không đúng",
        });
      }

      // Nếu khớp tạo accessTokenvới JWT
      const accessToken = jwt.sign(
        // Tạo accessToken với JWT
        {
          userId: user._id, // payload chứa userId là phần thông tin về người dùng
        },
        process.env.ACCESS_TOKEN_SECRET, // bí mật để ký
        {
          expiresIn: process.env.ACCESS_TOKEN_TTL, // thời gian tồn tại của token
        },
      );

      // Tạo refreshToken với CRYPTO
      const refreshToken = crypto.randomBytes(64).toString("hex"); // Tạo chuỗi ngẫu nhiên dài 128 ký tự

      // Tạo session mới để lưu refresh Token vào DB

      await Session.create({
        userId: user._id,
        refreshToken: refreshToken,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      });

      // Trả refresh Token về trong cookie
      // Tạo ra cookie có tên refreshToken chứa giá trị refreshToken để gửi về trình duyệt
      // mốt mà muốn lấy lại refreshToken thì chỉ cần truy cập vào cookie
      // muốn người dùng out thì xóa cookie đi là được
      // lúc gọi api cần axios.post("/api/url", data : {}, { withCredentials: true });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true, // chỉ truy cập được từ phía server, không truy cập được từ phía client (JS)
        secure: false, // true nếu dùng HTTPS
        sameSite: "lax", // backend và frontend khác domain [HTTPS: là none, LOCAL (http): lax]
        maxAge: REFRESH_TOKEN_TTL_MS, // thời gian tồn tại của cookie
      });

      // Đăng nhập thành công
      return res.status(200).json({
        success: true,
        message: `User ${user.email} - ${user.displayName} đăng nhập thành công.`,
        user: user,
        accessToken: accessToken,
      });
    } catch (error) {
      console.error("Lỗi khi đăng nhập:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi đăng nhập: " + error.message,
      });
    }
  }

  async signOut(req, res) {
    try {
      // Lấy refresh token từ cookie
      // Sử dụng optional chaining để tránh lỗi nếu req.cookies là undefined
      const token = req.cookies?.refreshToken; // req.cookies do package cookie-parser tạo ra

      if (token) {
        // Xoá session trong DB (Session)
        await Session.findOneAndDelete({ refreshToken: token });
        // Xoá cookie trên trình duyệt
        res.clearCookie("refreshToken");
        console.log("Đăng xuất thành công");
      } else {
        console.log("Không tìm thấy refreshToken trong cookie");
      }

      return res.sendStatus(204);
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi đăng xuất: " + error.message,
      });
    }
  }

  // tạo access mới từ process token
  async refreshToken(req, res) {
    try {
      // Lấy refessh token từ cookie
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        console.log("Không tìm thấy refreshToken trong cookie");
        return res.status(401).json({
          success: false,
          message: "Không tìm thấy refreshToken trong cookie",
        });
      }

      // So với refesh token với db
      const session = await Session.findOne({ refreshToken });
      if (!session) {
        console.log("RefreshToken không hợp lệ hoặc đã hết hạn");
        return res.status(401).json({
          success: false,
          message: "RefreshToken không hợp lệ hoặc đã hết hạn",
        });
      }

      // Kiểm tra hết hạn

      if (session.expiresAt < new Date()) {
        console.log("RefreshToken  đã hết hạn");
        return res.status(403).json({
          success: false,
          message: "RefreshToken  đã hết hạn",
        });
      }

      // Tạo assecc token mới
      const accessToken = jwt.sign(
        {
          userId: session.userId,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: process.env.ACCESS_TOKEN_TTL,
        },
      );

      // return
      return res.status(200).json({
        success: true,
        message: "Tạo accessToken mới thành công",
        accessToken: accessToken,
      });
    } catch (error) {
      console.error("Lỗi khi gọi refreshToken:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi refreshToken: " + error.message,
      });
    }
  }
}

// export default AuthController;

export default new AuthController();
