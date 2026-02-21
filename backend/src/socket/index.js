// Đây là file tạo "trung tâm realtime" cho app chat.

// 1. Import thư viện
import { Server } from "socket.io"; // thư viện tạo kết nối realtime giữa client ↔ server
import http from "http"; // → module Node.js để tạo HTTP server
import express from "express"; // → framework backend để xử lý API
import { socketAuthMiddleware } from "../middlewares/socketMiddleware.js";
import Message from "../models/Message.js";
import conversationController from "../controllers/conversationController.js";

// 2. Tạo app Express
// Khởi tạo ứng dụng Express.

// Đây là nơi bạn sẽ khai báo route API như:
//                                          app.get("/api", (req,res)=>{})
const app = express();

// 3. Tạo HTTP server từ Express
// const server = http.createServer(app); ➡ tạo server HTTP và dùng Express để xử lý request.
// Lý do cần bước này:
//      ➡ Socket.IO cần attach vào HTTP server thật để dùng chung port.
const server = http.createServer(app); // tạo server HTTP và dùng Express để xử lý request.

// Tạo Socket.IO server
// Ý nghĩa:
//      Gắn Socket.IO vào server HTTP.
//      Config CORS để cho phép frontend kết nối.

const io = new Server(server, {
  // Config CORS để cho phép frontend kết nối.
  // Gắn Socket.IO vào server HTTP.
  cors: {
    origin: process.env.CLIENT_URL, // → Chỉ cho phép domain frontend truy cập (ví dụ http://localhost:5173)
    credentials: true, // → Cho phép gửi cookie / token.
  },
});

// Sử dụng socketAuthMiddleware
io.use(socketAuthMiddleware);

// Danh sách user Online
const userOnline = new Map(); // {userId: socketId}

// Lắng nghe kết nối socket
io.on("connection", async (socket) => {
  //  Sự kiện "connection" chạy khi:
  //    👉 Một client connect tới server.
  //     socket là đối tượng đại diện cho client đó.

  const user = socket.user;

  console.log(
    ` SOCKET.io [socket/index.js]: User ${user._id} - ${user.userName}  Kết Nối (online) Với: ${socket.id} `,
  ); // socket.id = ID duy nhất của client.

  //  =================================================== ONLINE/OFFLINE =========================================================
  // online
  userOnline.set(user._id, socket.id);
  io.emit("online-users", Array.from(userOnline.keys())); // 👉 gửi danh sách user._id => ["us1", "us2"]

  //  =================================================== END ONLINE/OFFLINE =====================================================

  // =================================================== ROOM ============================================================
  // Lấy danh sách hộp thoại của user Và tạo ROOM từ danh sách hộp thoại đoá
  const conversationIds = await conversationController.getConversationForUser(
    user._id,
  );

  // tạo đưa user vào room với id room là id của hộp thoại chat
  conversationIds.forEach((conversitionId) => {
    socket.join(conversitionId); // đưa socket hiện tại vào một phòng (room)
  });

  // mốt sau này gửi [io.to("c1").emit("new-message", message); ] trong controller

  // =================================================== END ROOM ==========================================================

  // Lắng nghe sự kiện disconnect

  // Sự kiện "disconnect" chạy khi:
  //    → user đóng tab
  //    → mất mạng
  //    → logout
  //    → server restart
  socket.on("disconnect", () => {
    userOnline.delete(user._id); // xoá us trong danh sách online
    io.emit("online-users", Array.from(userOnline.keys())); // trả về danh sách usid online mới
    console.log(
      ` SOCKET.io [socket/index.js]: User ${user._id} - ${user.userName} Đã Ngắt Kết Nối (offline) Với: ${socket.id}`,
    );
  });
});

// Cho phép file khác import dùng:
export { io, server, app };
