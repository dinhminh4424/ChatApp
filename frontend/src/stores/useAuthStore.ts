import { authService } from "@/services/authService";
import type { AuthState } from "@/types/store";
import { toast } from "sonner";
import { create } from "zustand";

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  loading: false,

  clearState: () => {
    set({ accessToken: null, user: null, loading: false });
  },

  setAccessToken: (newAccessToken) => {
    set({ accessToken: newAccessToken });
  },

  // Đăng Kí
  signUp: async (userName, email, password, lastName, firstName) => {
    try {
      set({ loading: true });

      // gọi api
      await authService.signUp(userName, email, password, lastName, firstName);

      // đăng kí thành công
      toast.success("Đăng ký tài khoản thành công");
    } catch (error) {
      toast.error("Đăng ký thất bại: " + error);
      console.error(error);
    } finally {
      set({ loading: false });
    }
  },

  // Đăng Nhập
  signIn: async (userName, password) => {
    try {
      set({ loading: true });

      // gọi api
      const data = await authService.signIn(userName, password);

      // thành công

      console.log("Đăng nhập thành công: ", data);

      set({ accessToken: data.accessToken });

      toast.success("Đăng nhập thành công !!!");

      await get().fetchMe();
    } catch (error) {
      toast.error("Đăng nhập thất bại: " + error);
      console.error(error);
    } finally {
      set({ loading: false });
    }
  },

  // Đăng suất
  signOut: async () => {
    try {
      set({ loading: true });

      const data = await authService.signOut();

      console.log("Đăng xuất thành công: ", data);

      get().clearState();

      toast.success("Đăng xuất thành công !!!");
    } catch (error) {
      toast.error("Đăng nhập thất bại: " + error);
      console.error(error);
    } finally {
      set({ loading: false });
    }
  },

  fetchMe: async () => {
    try {
      set({ loading: true });

      const user = await authService.fetchMe();
      set({ user: user });
    } catch (error) {
      console.error(error);
      toast.error("Lấy thông tin người dùng thất bại: " + error);
    } finally {
      set({ loading: false });
    }
  },

  // lấy token giúp khi load tại trang ko bị out đăng nhập
  refreshToken: async () => {
    try {
      set({ loading: true });

      const { user, fetchMe, setAccessToken } = get();

      const data = await authService.refreshToken();

      setAccessToken(data.accessToken);

      if (!user) {
        await fetchMe();
      }
    } catch (error) {
      console.error(error);
      toast.error(
        "Phiên đăng nhập đã hết hạn !!!. Vui lòng đăng nhập lại\n Lấy thông tin người dùng thất bại: " +
          error,
      );
      get().clearState();
    } finally {
      set({ loading: false });
    }
  },
}));
