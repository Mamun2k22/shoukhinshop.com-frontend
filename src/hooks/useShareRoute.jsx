import { Navigate } from "react-router-dom";
import { useUser } from "./userContext";

export const ShareRoute = ({ children }) => {
  const { user } = useUser();

  // Check if the user exists and has a valid role
  if (user && (user.role === "user" || user.role === "admin")) {
    return children; // Allow access for both users and admins
  }

  // Redirect to login if not authenticated
  return <Navigate to="/login" replace />;
};
