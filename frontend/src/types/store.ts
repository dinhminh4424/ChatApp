import type { Socket } from "socket.io-client";
import type { Conversation, Message } from "./chat";
import type { User } from "./user";

export interface AuthState {
  accessToken: string | null;
  user: User | null;
  loading: boolean | null;

  clearState: () => void;

  setAccessToken: (newAccessToken: string) => void;

  // Định nghĩa SignUp
  signUp: (
    userName: string,
    email: string,
    password: string,
    lastName: string,
    firstName: string,
  ) => Promise<void>;

  // Định Nghĩa SignIn
  signIn: (userName: string, password: string) => Promise<void>;

  // Định Nghĩa LogOut
  signOut: () => Promise<void>;

  // Định Nghĩa fetchMe
  fetchMe: () => Promise<void>;

  // định nghĩa
  refreshToken: () => Promise<void>;
}

export interface ThemeState {
  isDark: boolean; // đang là theme gì || => đói tượng sẽ được lưu vào local storage vì là kdl
  toggleTheme: () => void; // sk mà nhấn nút thay đổi theme
  setTheme: (isDark: boolean) => void; // // thay đổi theme
}

export interface ChatState {
  conversations: Conversation[];
  messages: Record<
    string,
    {
      items: Message[];
      hasMore: boolean; //infinity scroll
      nextCursor?: string | null; // kiểm tra phân trang
    }
  >;
  activeConversationId: string | null; // hộp thoại đang được chọn
  conversationloading: boolean;
  messageLoading: boolean;
  reset: () => void;
  setActiveConversation: (conversationId: string | null) => void;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId?: string) => Promise<void>;
  sendDirectMessage: (
    recipientId: string,
    content: string,
    imgUrl?: string,
  ) => Promise<void>;
  sendGroupMessage: (
    conversationId: string,
    content: string,
    imgUrl?: string,
  ) => Promise<void>;
}

export interface SocketState {
  socket: Socket | null;
  onlineUsers: string[];
  connectSocket: () => void;
  disconnectSocket: () => void;
}
