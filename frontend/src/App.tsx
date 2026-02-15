import { BrowserRouter, Routes, Route } from "react-router";
import SignUp from "./page/SignUp";
import SignIn from "./page/SignIn";
import ChatApp from "./page/ChatApp";
import { Toaster } from "sonner"; // THÔNG BÁO
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <>
      <Toaster richColors /> {/* THÔNG BÁO */}
      <BrowserRouter>
        <Routes>
          {/* PUBLIC ROUTER */}
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />

          {/* PROTECTED ROUTER */}
          <Route element={<ProtectedRoute />}>
            <Route path="/chatapp" element={<ChatApp />} />
            <Route path="/" element={<ChatApp />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
