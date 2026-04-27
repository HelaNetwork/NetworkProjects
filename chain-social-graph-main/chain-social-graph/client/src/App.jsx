import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import useAuthStore from "./store/authStore";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Explore from "./pages/Explore";
import Landing from "./pages/Landing";
import SetupProfile from "./pages/SetupProfile";
import Layout from "./components/Layout";

function ProtectedRoute({ children }) {
  const { walletAddress } = useAuthStore();
  return walletAddress ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1a1a26",
            color: "#e8e8f0",
            border: "1px solid #2a2a3a",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "14px",
          },
          success: { iconTheme: { primary: "#00d4aa", secondary: "#0a0a0f" } },
          error: { iconTheme: { primary: "#ff4d6d", secondary: "#0a0a0f" } },
        }}
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/setup" element={<ProtectedRoute><SetupProfile /></ProtectedRoute>} />
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/feed" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/profile/:address" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
