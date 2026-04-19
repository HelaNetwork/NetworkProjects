import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { login } from "../../app/api";

export default function AutoLogin() {
  const location = useLocation();
  const [status, setStatus] = useState("Logging in...");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const role = (params.get("role") || "employee").toLowerCase();
    const destParam = params.get("dest");
    const employerDest = "/employer-dashboard/overview";
    const employeeDest = "/employee";
    const dest = destParam || (role === "employer" ? employerDest : employeeDest);

    const demoEmployerEmail = (import.meta as any).env?.VITE_DEMO_EMPLOYER_EMAIL || "employer@test.com";
    const demoEmployerPassword = (import.meta as any).env?.VITE_DEMO_EMPLOYER_PASSWORD || "123456";
    const demoEmployeeEmail = (import.meta as any).env?.VITE_DEMO_EMPLOYEE_EMAIL || "employee@test.com";
    const demoEmployeePassword = (import.meta as any).env?.VITE_DEMO_EMPLOYEE_PASSWORD || "123456";

    const email = role === "employer" ? demoEmployerEmail : demoEmployeeEmail;
    const password = role === "employer" ? demoEmployerPassword : demoEmployeePassword;

    if (!email || !password) {
      setStatus("Demo credentials not configured");
      return;
    }

    login(email, password)
      .then((data: any) => {
        if (data?.access_token) {
          localStorage.setItem("token", data.access_token);
          window.location.href = dest;
        } else {
          setStatus("Login failed");
        }
      })
      .catch(() => setStatus("Login failed"))
      .finally(() => {});
  }, [location.search]);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div style={{ fontSize: 16 }}>{status}</div>
    </div>
  );
}
