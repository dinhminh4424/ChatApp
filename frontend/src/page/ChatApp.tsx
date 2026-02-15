import Logout from "@/components/auth/Logout";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import React from "react";
import { toast } from "sonner";

const ChatApp = () => {
  const user = useAuthStore((s) => s.user);

  const handleClick = async () => {
    try {
      await api.get("/api/user/test", {
        withCredentials: true,
      });
      toast.success("Thành công");
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra");
    }
  };

  return (
    <div className="flex  min-h-svh flex-col items-center justify-center">
      <div className="">
        {user && <h1>Xin chào, {user.userName}</h1>}
        <Logout />

        <Button onClick={handleClick}>Test</Button>
      </div>
    </div>
  );
};

export default ChatApp;
