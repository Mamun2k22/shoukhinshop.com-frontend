import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "${import.meta.env.VITE_APP_SERVER_URL}api/auth/reset-password",
        { token, newPassword }
      );
      toast.success(response.data.message); // Show success message
      setTimeout(() => navigate("/login"), 3000); // Redirect to login after 3 seconds
    } catch (error) {
      toast.error(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    }
  };

  return (
    <main className="w-full max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold">Reset Password</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Enter your new password"
          required
          className="py-3 px-4 w-full border-2 rounded-md mt-4"
        />
        <button
          type="submit"
          className="py-3 px-4 bg-blue-500 text-white rounded-md mt-4"
        >
          Reset Password
        </button>
      </form>
      {/* Toast notifications container */}
      <ToastContainer position="top-center" autoClose={3000} />
    </main>
  );
}

export default ResetPassword;
