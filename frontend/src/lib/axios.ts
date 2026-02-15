import { useAuthStore } from "@/stores/useAuthStore";
import axios from "axios";
const api = axios.create({
  baseURL:
    import.meta.env.MODE === "development" ? "http://localhost:5000" : "/api",
  withCredentials: true,
});

// gắn access token vào req header
// để có thể sử dụng authMiddleware (BE) => để biết được user hiện tại đang đăng nhập trong BE

api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// tự động gọi api refreshkhi access token hết hạn
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // Những api ko cần check
    if (
      originalRequest.url.includes("/api/auth/signIn") ||
      originalRequest.url.includes("/api/auth/signUp") ||
      originalRequest.url.includes("/api/auth/refreshToken") ||
      originalRequest.url.includes("/api/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retryCount = originalRequest._retryCount || 0;

    console.log("Số lần gọi api refresh:" + originalRequest._retryCount);

    if (error.response?.status === 403 && originalRequest._retryCount < 4) {
      // 403 là định nghĩa trong authMiddleware lỗi 403

      originalRequest._retryCount = originalRequest._retryCount + 1;

      try {
        const res = await api.post(
          "/api/auth/refreshToken",
          {},
          {
            withCredentials: true,
          },
        );

        const newAccessToken = res.data.accessToken;

        useAuthStore.getState().setAccessToken(newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (error) {
        useAuthStore.getState().clearState();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);
export default api;
