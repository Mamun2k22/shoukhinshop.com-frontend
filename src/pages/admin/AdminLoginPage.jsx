import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FiLock, FiMail, FiLogIn } from "react-icons/fi";
import { useUser } from "../../hooks/userContext";

const getBaseUrl = () => {
  const base = import.meta.env.VITE_APP_SERVER_URL || "";
  return base.endsWith("/") ? base : `${base}/`;
};

// ✅ same token key everywhere (user/admin) – recommend: token
const getTokenKey = () => "token"; // or "adminToken" if you want, but keep consistent

const AdminLoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { updateUser } = useUser();
  // যদি আগে থেকেই লগইন থাকে → redirect করো
  useEffect(() => {
    const token = localStorage.getItem(getTokenKey());
    if (token) navigate("/dashboard");
  }, [navigate]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  const email = form.email.trim().toLowerCase();
  const password = form.password;

  if (!email || !password) return toast.warn("Email & password required");

  try {
    setLoading(true);
    const url = getBaseUrl();

    // ✅ এখানে res define করো
    const res = await axios.post(`${url}api/auth/admin/login`, { email, password });

    if (res.data?.token) {
      localStorage.setItem("token", res.data.token);

      const adminInfo = res.data.user || res.data.admin || null;

      if (adminInfo) {
        localStorage.setItem("user", JSON.stringify(adminInfo)); // ✅ context reads this
        updateUser(adminInfo); // ✅ no reload needed
      }

      toast.success("Login successful!");
      navigate("/dashboard", { replace: true });
    } else {
      toast.error("Token missing from server response");
    }
  } catch (err) {
    console.error(err);
    toast.error(err?.response?.data?.message || "Invalid credentials. Try again.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-lg border border-gray-200 p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-2">
            <FiLock className="text-3xl text-indigo-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-800">Admin Login</h1>
          <p className="text-sm text-gray-500">
            Enter your credentials to access the dashboard.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@example.com"
                className="w-full pl-10 pr-3 py-2 border rounded text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <FiLogIn className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2 border rounded text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-1.5 rounded-2xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mt-6">
          <p>© {new Date().getFullYear()} Web Defend IT</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
