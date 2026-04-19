import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface Props {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/employer-login" replace />;
  }

  return <>{children}</>;
}
