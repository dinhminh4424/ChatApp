import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";

const ProtectedRoute = () => {
  const { accessToken, user, loading, refreshToken, fetchMe } = useAuthStore();
  const [starting, setStarting] = useState(true); /// đánh dấu là app đnag khởi động

  const init = async () => {
    // nếu chưa có accessToken (Load lại trang) => refresh lại Token => tạo mới trong db
    if (!accessToken) {
      console.log("load lại trang");
      await refreshToken();
    }

    if (accessToken && !user) {
      // nếu có accessToken mà chưa có user  => load lại user
      console.log("load lại user");
      await fetchMe();
    }

    setStarting(false);
  };

  useEffect(() => {
    init();
  }, []);

  if (starting || loading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!accessToken) {
    return <Navigate to={"/signin"} replace />;
  }

  return <Outlet></Outlet>;
};

export default ProtectedRoute;
