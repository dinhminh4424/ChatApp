import type { ThemeState } from "@/types/store";
import { create } from "zustand";

import { persist } from "zustand/middleware"; // middleware lưu state, giá trị vào storage , chỉ lưu giá trị ko lưu function

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDark: true,
      toggleTheme: () => {
        // là sk bấm nút đổi theme á
        const newValue = !get().isDark;
        // cập nhật lại theme
        set({ isDark: newValue });
        if (newValue) {
          document.documentElement.classList.add("dark"); // add vào thẻ html ở ngoài cùng trang web (documentElement)
        } else {
          document.documentElement.classList.remove("dark");
        }
      },
      setTheme: (dark: boolean) => {
        // này là Thay đổi theme
        set({ isDark: dark });
        if (dark) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      },
    }),
    { name: "theme-storage" }, // lưu state và local storage với tên là theme-storag
  ),
);
