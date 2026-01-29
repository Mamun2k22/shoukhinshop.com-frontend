// useLogout.js
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useUser } from './userContext';


const useLogout = () => {
  const { updateUser } = useUser(); // Access user context to update user state
  const navigate = useNavigate(); // Hook to programmatically navigate

  const handleLogout = async () => {
    try {
      // Send POST request to backend API for logout
      const response = await fetch(`${import.meta.env.VITE_APP_SERVER_URL}api/auth/logout`, {
        method: 'POST', // Change to 'GET' if your backend uses a GET method
        credentials: 'include', // Include cookies for session-based authentication
      });

      if (response.ok) {
        // If logout is successful, clear token and user data from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        updateUser(null); // Reset user context to reflect logout

        toast.success('Logout successful'); // Show success notification
        navigate('/login'); // Redirect to the login page
      } else {
        // Handle any server-side errors
        const error = await response.json(); // Parse the error response
        toast.error(`Logout Failed: ${error.message}`); // Show error notification
      }
    } catch (error) {
      // Handle any network-related errors (e.g., no internet connection)
      toast.error('Network error during logout');
      console.error('Network error during logout:', error);
    }
  };

  return { handleLogout }; // Return the handleLogout function to use in components
};

export default useLogout;
