import api from "@/lib/axios";

export const authService = {
  signUp: async (
    userName: string,
    email: string,
    password: string,
    lastName: string,
    firstName: string,
  ) => {
    try {
      const data = {
        userName,
        email,
        password,
        lastName,
        firstName,
      };

      const res = await api.post("/api/auth/signUp", data, {
        withCredentials: true,
      });
      console.log("Đăng ký thành công: ", res.data);

      return res.data;
    } catch (error) {
      console.log(error);
    }
  },

  signIn: async (userName: string, password: string) => {
    try {
      const data = {
        userName,
        password,
      };

      const res = await api.post("/api/auth/signIn", data, {
        withCredentials: true,
      });
      console.log("Đăng nhập thành công: ", res.data);

      return res.data;
    } catch (error) {
      console.error(error);
    }
  },

  signOut: async () => {
    try {
      const res = await api.post(
        "/api/auth/signOut",
        {},
        {
          withCredentials: true,
        },
      );

      return res.data;
    } catch (error) {
      console.error(error);
    }
  },

  fetchMe: async () => {
    try {
      const res = await api.get("/api/user/me", { withCredentials: true });

      return res.data.user;
    } catch (error) {
      console.error(error);
    }
  },

  refreshToken: async () => {
    try {
      const res = await api.post(
        "/api/auth/refreshToken",
        {},
        {
          withCredentials: true,
        },
      );

      return res.data;
    } catch (error) {
      console.error(error);
    }
  },
};
