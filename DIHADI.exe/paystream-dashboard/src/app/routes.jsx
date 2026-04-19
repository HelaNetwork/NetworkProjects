import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Treasury from "../pages/Treasury";
import Streams from "../pages/Streams";
import Employee from "../pages/Employee";
import Admin from "../pages/Admin";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/treasury" element={<Treasury />} />
      <Route path="/streams" element={<Streams />} />
      <Route path="/employee" element={<Employee />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}