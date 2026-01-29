import React, { useMemo, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useUser } from "../../../hooks/userContext";

export default function ChangePassword() {
  const { user } = useUser();
  const token = useMemo(() => localStorage.getItem("token"), []);
  const [saving, setSaving] = useState(false);

  const [show, setShow] = useState({
  current: false,
  new: false,
  confirm: false,
});

const toggleShow = (field) =>
  setShow((prev) => ({ ...prev, [field]: !prev[field] }));


  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.currentPassword || !form.newPassword || !form.confirmNewPassword) {
      toast.error("Please fill in all fields");
      return false;
    }

    if (form.newPassword.length < 6) {
      toast.error("New password should be at least 6 characters");
      return false;
    }

    if (form.newPassword !== form.confirmNewPassword) {
      toast.error("New password and confirm password do not match");
      return false;
    }

    if (form.newPassword === form.currentPassword) {
      toast.error("New password must be different from current password");
      return false;
    }

    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);

      const res = await fetch(
        `${import.meta.env.VITE_APP_SERVER_URL}api/users/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: form.currentPassword,
            newPassword: form.newPassword,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Password change failed");
      }

      if (data?.token) {
        localStorage.setItem("token", data.token);
      }

      toast.success("Password updated successfully");

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-full px-0 md:px-2 md:py-6 py-2 mt-4 md:mt-0">
      <div className="bg-white rounded-md shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-1">Change Password</h2>
        <p className="text-sm text-slate-500 mb-5">
          Update your account password securely{user?.email ? ` for ${user.email}` : ""}.
        </p>

        <form onSubmit={onSubmit} className="space-y-5">
     <div>
  <Label>Current Password</Label>
  <div className="mt-1 relative">
    <input
      type={show.current ? "text" : "password"}
      name="currentPassword"
      value={form.currentPassword}
      onChange={onChange}
      autoComplete="current-password"
      className="w-full rounded-sm border border-slate-300 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
    />
    <button
      type="button"
      onClick={() => toggleShow("current")}
      className="absolute inset-y-0 right-0 px-3 text-xs text-slate-500"
    >
      {show.current ? "Hide" : "Show"}
    </button>
  </div>
</div>


          <div className="grid sm:grid-cols-2 gap-4">
   <div>
  <Label>New Password</Label>
  <div className="mt-1 relative">
    <input
      type={show.new ? "text" : "password"}
      name="newPassword"
      value={form.newPassword}
      onChange={onChange}
      autoComplete="new-password"
      className="w-full rounded-sm border border-slate-300 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
    />
    <button
      type="button"
      onClick={() => toggleShow("new")}
      className="absolute inset-y-0 right-0 px-3 text-xs text-slate-500"
    >
      {show.new ? "Hide" : "Show"}
    </button>
  </div>
</div>


      <div>
  <Label>Confirm New Password</Label>
  <div className="mt-1 relative">
    <input
      type={show.confirm ? "text" : "password"}
      name="confirmNewPassword"
      value={form.confirmNewPassword}
      onChange={onChange}
      autoComplete="new-password"
      className="w-full rounded-sm border border-slate-300 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
    />
    <button
      type="button"
      onClick={() => toggleShow("confirm")}
      className="absolute inset-y-0 right-0 px-3 text-xs text-slate-500"
    >
      {show.confirm ? "Hide" : "Show"}
    </button>
  </div>
</div>

          </div>

          <p className="text-xs text-slate-500">
            Use at least 6 characters. Avoid reusing passwords from other sites.
          </p>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl text-white text-sm font-medium bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Updating…" : "Change Password"}
            </button>
          </div>
        </form>
      </div>

      {/* যদি already root App এ ToastContainer থাকে, এটা remove করতে পারো */}
      <ToastContainer />
    </div>
  );
}

/* small UI atom */
function Label({ children }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {children}
    </label>
  );
}
