import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaPhoneAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useUser } from "../hooks/userContext";
import { Link } from "react-router-dom";

const Signup = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const [step, setStep] = useState(1); // signup: 1=form, 2=otp
  const [mode, setMode] = useState("signup"); // 'signup' | 'login'
  const [contact, setContact] = useState({ type: "", value: "" });

  const navigate = useNavigate();
  const { updateUser } = useUser();

  // ---------- Google callback ----------
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const userData = urlParams.get("user");

    if (token && userData) {
      const user = JSON.parse(decodeURIComponent(userData));

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      updateUser(user);
      toast.success("Google login successful!");
      navigate("/");
    }
  }, [navigate, updateUser]);

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_APP_SERVER_URL}api/auth/google`;
  };

  const isEmail = (value) => /.+@.+\..+/.test(value);
  const isBdPhone = (value) =>
    /^(?:\+88|88)?01[3-9]\d{8}$/.test(value.trim());

  /* =========================
     SIGNUP: Step–1 => Send OTP
  ========================== */
  const handleSendOtp = async (data) => {
    try {
      const { signupName, signupContact, signupPassword } = data;
      const trimmed = signupContact.trim();

      let payload = {
        name: signupName,
        password: signupPassword,
      };
      let type = "";

      if (isEmail(trimmed)) {
        type = "email";
        payload.email = trimmed.toLowerCase();
      } else if (isBdPhone(trimmed)) {
        type = "mobile";
        payload.mobile = trimmed;
      } else {
        toast.error("Enter a valid email or Bangladeshi phone number");
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_APP_SERVER_URL}api/auth/send-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        toast.info(
          type === "email"
            ? "OTP sent to your email"
            : "OTP sent to your phone"
        );
        setContact({
          type,
          value: type === "email" ? payload.email : payload.mobile,
        });
        setStep(2);
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error("🌐 Network error while sending OTP:", err);
      toast.error("Network error while sending OTP");
    }
  };

  /* =========================
     SIGNUP: Step–2 => Verify OTP
  ========================== */
  const handleVerifyOtp = async (data) => {
    try {
      const otpPayload =
        contact.type === "mobile"
          ? { mobile: contact.value, otp: String(data.otp) }
          : { email: contact.value, otp: String(data.otp) };

      const res = await fetch(
        `${import.meta.env.VITE_APP_SERVER_URL}api/auth/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(otpPayload),
        }
      );

      if (res.ok) {
        const result = await res.json();

        toast.success("Signup successful");

        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));

        updateUser(result.user);
        reset();
        setStep(1);
        navigate("/");
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to verify OTP");
      }
    } catch (err) {
      console.error("🌐 Network error while verifying OTP:", err);
      toast.error("Network error while verifying OTP");
    }
  };

  /* =========================
     LOGIN: Email/Phone + Password
  ========================== */
  const handlePasswordLogin = async (data) => {
    try {
      const { loginContact, loginPassword } = data;
      const trimmed = loginContact.trim();

      let identifier = "";

      if (isEmail(trimmed)) {
        identifier = trimmed.toLowerCase();
      } else if (isBdPhone(trimmed)) {
        identifier = trimmed;
      } else {
        toast.error("Enter a valid email or Bangladeshi phone number");
        return;
      }

      const payload = { identifier, password: loginPassword };

      const res = await fetch(
        `${import.meta.env.VITE_APP_SERVER_URL}api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        const result = await res.json();

        toast.success("Login successful");

        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));

        updateUser(result.user);
        reset();
        navigate("/");
      } else {
        const error = await res.json();
        toast.error(error.message || "Login failed");
      }
    } catch (err) {
      console.error("🌐 Network error during login:", err);
      toast.error("Network error during login");
    }
  };

  // tab change করলে সব reset
  const switchMode = (nextMode) => {
    setMode(nextMode);
    setStep(1);
    setContact({ type: "", value: "" });
    reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="container mx-auto">
        <div className="max-w-md mx-auto bg-white rounded-lg overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
          {/* Header */}
          <div className="text-center py-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <h1 className="text-3xl font-bold">Welcome</h1>
            <p className="mt-2">
              {mode === "signup"
                ? step === 1
                  ? "Join our amazing community"
                  : `Verify OTP sent to your ${contact.type}`
                : "Login with your account"}
            </p>
          </div>

          <div className="px-8 py-6">
            {/* Tabs */}
            <div className="flex justify-center mb-6">
              <button
                type="button"
                onClick={() => switchMode("signup")}
                className={`px-4 py-2 rounded-l-md focus:outline-none transition-colors duration-300 text-sm font-medium ${
                  mode === "signup"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => switchMode("login")}
                className={`px-4 py-2 rounded-r-md focus:outline-none transition-colors duration-300 text-sm font-medium ${
                  mode === "login"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Login
              </button>
            </div>

            {/* ================= SIGNUP UI ================= */}
            {mode === "signup" && (
              <>
                {step === 1 && (
                  <form
                    onSubmit={handleSubmit(handleSendOtp)}
                    className="space-y-4"
                  >
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        {...register("signupName", {
                          required: "Name is required",
                        })}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Enter your name"
                      />
                      {errors.signupName && (
                        <span className="text-red-500 text-sm">
                          {errors.signupName.message}
                        </span>
                      )}
                    </div>

                    {/* Email or Phone */}
                    <div className="relative">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Email or Phone
                      </label>
                      <input
                        type="text"
                        {...register("signupContact", {
                          required: "Email or phone is required",
                          validate: (value) =>
                            isEmail(value) ||
                            isBdPhone(value) ||
                            "Enter a valid email or Bangladeshi phone number",
                        })}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 pl-10"
                        placeholder="Enter email or phone"
                      />
                      <FaPhoneAlt className="absolute left-3 top-9 text-gray-400" />
                      {errors.signupContact && (
                        <span className="text-red-500 text-sm">
                          {errors.signupContact.message}
                        </span>
                      )}
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        {...register("signupPassword", {
                          required: "Password is required",
                          minLength: {
                            value: 6,
                            message:
                              "Password must be at least 6 characters",
                          },
                        })}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Create a password"
                      />
                      {errors.signupPassword && (
                        <span className="text-red-500 text-sm">
                          {errors.signupPassword.message}
                        </span>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-md hover:opacity-90 transition-opacity duration-300 transform hover:scale-105"
                    >
                      Send OTP to Sign Up
                    </button>
                  </form>
                )}

                {step === 2 && (
                  <form
                    onSubmit={handleSubmit(handleVerifyOtp)}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Enter OTP
                      </label>
                      <input
                        type="text"
                        {...register("otp", {
                          required: "OTP is required",
                          pattern: {
                            value: /^[0-9]{4}$/,
                            message: "Enter a valid 4-digit OTP",
                          },
                        })}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Enter OTP"
                      />
                      {errors.otp && (
                        <span className="text-red-500 text-sm">
                          {errors.otp.message}
                        </span>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-md hover:opacity-90 transition-opacity duration-300 transform hover:scale-105"
                    >
                      Verify & Sign Up
                    </button>
                  </form>
                )}
              </>
            )}

            {/* ================= LOGIN UI ================= */}
            {mode === "login" && (
              <form
                onSubmit={handleSubmit(handlePasswordLogin)}
                className="space-y-4"
              >
                {/* Email or Phone */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Email or Phone
                  </label>
                  <input
                    type="text"
                    {...register("loginContact", {
                      required: "Email or phone is required",
                      validate: (value) =>
                        isEmail(value) ||
                        isBdPhone(value) ||
                        "Enter a valid email or Bangladeshi phone number",
                    })}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 pl-10"
                    placeholder="Enter email or phone"
                  />
                  <FaPhoneAlt className="absolute left-3 top-9 text-gray-400" />
                  {errors.loginContact && (
                    <span className="text-red-500 text-sm">
                      {errors.loginContact.message}
                    </span>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    {...register("loginPassword", {
                      required: "Password is required",
                    })}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Your password"
                  />
                  {errors.loginPassword && (
                    <span className="text-red-500 text-sm">
                      {errors.loginPassword.message}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-md hover:opacity-90 transition-opacity duration-300 transform hover:scale-105"
                >
                  Login
                </button>
                <div className="text-right">
  <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
    Forgot password?
  </Link>
</div>

              </form>
            )}

            {/* Social login (only Google এখন) */}
            {/* <div className="mt-6">
              <p className="text-center text-gray-600 mb-4 text-sm">
                Or continue with
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleGoogleLogin}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors duration-300 text-sm"
                >
                  Google
                </button>
              </div>
            </div> */}
          </div>
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default Signup;
