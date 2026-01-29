import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState("");
  const navigate = useNavigate();

  const isEmail = (value) => /.+@.+\..+/.test(value);
  const isBdPhone = (value) => /^(?:\+88|88)?01[3-9]\d{8}$/.test(value.trim());

  const sendOtp = async (data) => {
    const input = data.identifier.trim();
    if (!isEmail(input) && !isBdPhone(input)) {
      toast.error("Enter a valid email or Bangladeshi phone number");
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_APP_SERVER_URL}api/auth/forgot-password/send-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: isEmail(input) ? input.toLowerCase() : input }),
        }
      );

      const result = await res.json();
      if (!res.ok) {
        toast.error(result.message || "Failed to send OTP");
        return;
      }

      setIdentifier(isEmail(input) ? input.toLowerCase() : input);
      toast.info(result.message || "OTP sent");
      setStep(2);
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    }
  };

  const verifyOtp = async (data) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_APP_SERVER_URL}api/auth/forgot-password/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier, otp: String(data.otp) }),
        }
      );

      const result = await res.json();
      if (!res.ok) {
        toast.error(result.message || "Invalid OTP");
        return;
      }

      toast.success(result.message || "OTP verified");
      setStep(3);
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    }
  };

  const doResetPassword = async (data) => {
    if (data.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (data.newPassword !== data.confirmPassword) {
      toast.error("Password does not match");
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_APP_SERVER_URL}api/auth/forgot-password/reset`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier, newPassword: data.newPassword }),
        }
      );

      const result = await res.json();
      if (!res.ok) {
        toast.error(result.message || "Failed to reset password");
        return;
      }

      toast.success(result.message || "Password reset successful");
      reset();
      setStep(1);
      navigate("/login"); // বা তোমার login route
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg overflow-hidden shadow-2xl">
        <div className="text-center py-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <h1 className="text-2xl font-bold">Forgot Password</h1>
          <p className="mt-1 text-sm">
            {step === 1 && "Enter your email or phone"}
            {step === 2 && `Enter OTP sent to ${identifier}`}
            {step === 3 && "Set a new password"}
          </p>
        </div>

        <div className="px-8 py-6">
          {step === 1 && (
            <form onSubmit={handleSubmit(sendOtp)} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email or Phone
                </label>
                <input
                  type="text"
                  {...register("identifier", { required: "Email or phone is required" })}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter email or phone"
                />
                {errors.identifier && (
                  <span className="text-red-500 text-sm">{errors.identifier.message}</span>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-md hover:opacity-90"
              >
                Send OTP
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit(verifyOtp)} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  OTP (4 digit)
                </label>
                <input
                  type="text"
                  {...register("otp", {
                    required: "OTP is required",
                    pattern: { value: /^[0-9]{4}$/, message: "Enter a valid 4-digit OTP" },
                  })}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter OTP"
                />
                {errors.otp && (
                  <span className="text-red-500 text-sm">{errors.otp.message}</span>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-md hover:opacity-90"
              >
                Verify OTP
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full py-2 rounded-md border"
              >
                Change email/phone
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit(doResetPassword)} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  {...register("newPassword", { required: "New password is required" })}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter new password"
                />
                {errors.newPassword && (
                  <span className="text-red-500 text-sm">{errors.newPassword.message}</span>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  {...register("confirmPassword", { required: "Confirm password is required" })}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Confirm new password"
                />
                {errors.confirmPassword && (
                  <span className="text-red-500 text-sm">{errors.confirmPassword.message}</span>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-md hover:opacity-90"
              >
                Reset Password
              </button>
            </form>
          )}
        </div>
      </div>

      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default ForgotPassword;
