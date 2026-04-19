import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/* Landing Page Components */
import { Hero } from "./components/Hero";
import { LoginCards } from "./components/LoginCards";
import { TransactionsShowcase } from "./components/TransactionsShowcase";
import { Features } from "./components/Features";
import { Footer } from "./components/Footer";

/* Auth Pages */
import EmployerLogin from "../pages/Auth/EmployerLogin";
import EmployeeLogin from "../pages/Auth/EmployeeLogin";
import SetToken from "../pages/Auth/SetToken";
import AutoLogin from "../pages/Auth/AutoLogin";

/* Employer Dashboard Layout */
import EmployerLayout from "../pages/EmployerLayout/Layout/EmployerDashboard";

/* Employer Pages */
import Overview from "../pages/EmployerLayout/Overview";
import Employees from "../pages/EmployerLayout/Employees";
import EmployeeDetails from "../pages/EmployerLayout/Layout/EmployeeDetails";
import Treasury from "../pages/EmployerLayout/Treasury";
import Bonuses from "../pages/EmployerLayout/Bonuses";
import Settings from "../pages/EmployerLayout/Settings";

/* Protected Route */
import ProtectedRoute from "./components/ProtectedRoute";


/* Landing Page */
function LandingPage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <LoginCards />
      <TransactionsShowcase />
      <Features />
      <Footer />
    </div>
  );
}

/* App */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/employer-login" element={<EmployerLogin />} />
        <Route path="/employee-login" element={<EmployeeLogin />} />
        <Route path="/set-token" element={<SetToken />} />
        <Route path="/auto-login" element={<AutoLogin />} />

        {/* Employee portal is served by a separate app; frontpage does not host /employee */}

        {/* Employer Dashboard (Protected + Nested Routes) */}
        <Route
          path="/employer-dashboard"
          element={
            <ProtectedRoute>
              <EmployerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="employees" element={<Employees />} />
          <Route path="employees/:id" element={<EmployeeDetails />} />
          <Route path="treasury" element={<Treasury />} />
          <Route path="bonuses" element={<Bonuses />} />
          <Route path="settings" element={<Settings />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

