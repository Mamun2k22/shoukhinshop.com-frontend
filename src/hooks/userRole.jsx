import { Navigate } from "react-router-dom";
import { useUser } from "./userContext";


export const UserRoute = ({ children }) => {
    
    const { user } = useUser();
    return user && user.role === "user" ? children : <Navigate to="/login" />;
};
