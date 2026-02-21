import { create } from "zustand";
import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "./useAuthStore";
import type { SocketState } from "@/types/store";

const baseURL = import.meta.env.VITE_SOCKET_URL; // trong .env.developme || .env.production

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null, // Ban đầu chưa connect nên socket = null
  onlineUsers: [],
  connectSocket: () => {
    // Đây là hàm gọi khi:
    //      user login
    //      app start
    //      cần realtime

    const accessToken = useAuthStore.getState().accessToken; // ➡ lấy token trực tiếp từ auth store
    const existingSocket = get().socket;
    if (existingSocket) {
      // kiểm tra socket đã tồn tại chưa
      // nếu có rồi thì thôi tránh tạo nhiều socket
      return;
    }

    const socket: Socket = io(baseURL, {
      auth: { token: accessToken }, // → gửi token khi connect
      // Socket.io có 2 mode:
      //    polling (HTTP fallback)
      //    websocket (real realtime)

      transports: ["websocket"],
    });

    set({
      socket,
    });

    socket.on("connect", () => {
      console.log("Đã kết nối với Socket");
    });

    // sau khi kết nối thì lắng nghe socket online-users nhận về các string userId đang online
    socket.on("online-users", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: () => {
    // Dùng khi:
    //      logout
    //      chuyển account
    //      đóng app
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },
}));
