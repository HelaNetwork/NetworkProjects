import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function SetToken() {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token") || "";
    const dest = params.get("dest") || "/employee";
    if (token) {
      localStorage.setItem("token", token);
    }
    window.location.href = dest;
  }, [location.search]);

  return null;
}
