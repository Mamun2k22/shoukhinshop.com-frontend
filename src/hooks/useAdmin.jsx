import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/admin-login" replace />;

  try {
    const decoded = jwtDecode(token);
    if (["admin", "superadmin"].includes(decoded.role)) return children;

    return <Navigate to="/" replace />;
  } catch {
    return <Navigate to="/admin-login" replace />;
  }
};
