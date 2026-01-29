export const getCurrentUserId = () => {
    return localStorage.getItem("userId"); // Ensure this returns a valid ObjectId
  };

  export const getUser = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  };
  
  export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };