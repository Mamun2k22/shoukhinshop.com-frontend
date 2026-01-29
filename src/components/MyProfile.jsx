import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useUser } from "../hooks/userContext";

const IMGBB_KEY =
  import.meta.env.VITE_IMGBB_KEY || "31cbdc0f8e62b64424c515941a8bfd73";

export default function MyProfile() {
  const { user, updateUser } = useUser();
  const token = useMemo(() => localStorage.getItem("token"), []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || "",
    mobile: user?.mobile || "",
    bio: user?.bio || "",
    email: user?.email || "",
    profileImage:
      user?.profileImage || "https://preline.co/assets/img/160x160/img1.jpg",
    gender: user?.gender || "",
    dateOfBirth: "",
    address: user?.address || "",
  });

  const [file, setFile] = useState(null);
  const inputRef = useRef(null);

  // load profile
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_APP_SERVER_URL}api/users/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        const u = data?.user || {};

        setForm((p) => ({
          ...p,
          name: u.name || "",
          mobile: u.mobile || "",
          bio: u.bio || "",
          email: u.email || "",
          profileImage:
            u.profileImage || "https://preline.co/assets/img/160x160/img1.jpg",
          gender: u.gender || "",
          // backend থেকে "2025-12-24T00:00:00.000Z" এলে
          dateOfBirth: u.dateOfBirth
            ? String(u.dateOfBirth).substring(0, 10)
            : "",
          address: u.address || "",
        }));
      } catch (e) {
        console.error(e);
        toast.error("Couldn't load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const chooseFile = () => inputRef.current?.click();

  const onPick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setForm((p) => ({ ...p, profileImage: URL.createObjectURL(f) }));
  };

  const uploadToImgbb = async (blob) => {
    const fd = new FormData();
    fd.append("image", blob);
    const res = await fetch(
      `https://api.imgbb.com/1/upload?key=${encodeURIComponent(IMGBB_KEY)}`,
      { method: "POST", body: fd }
    );
    if (!res.ok) throw new Error("Image upload failed");
    const j = await res.json();
    return j?.data?.url;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      let imageUrl;
      if (file) {
        imageUrl = await uploadToImgbb(file);
      }

      const payload = {
        ...(form.name && { name: form.name }),
        ...(form.mobile && { mobile: form.mobile }),
        ...(form.bio && { bio: form.bio }),
        ...(form.gender && { gender: form.gender }),
        ...(form.address && { address: form.address }),
        ...(imageUrl && { profileImage: imageUrl }),
      };

      // DOB optional
      if (form.dateOfBirth) {
        payload.dateOfBirth = form.dateOfBirth; // "YYYY-MM-DD"
      }

      if (!Object.keys(payload).length) {
        toast.info("Nothing to update");
        setSaving(false);
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_APP_SERVER_URL}api/users/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Profile update failed");
      const data = await res.json();

      if (data?.token) localStorage.setItem("token", data.token);
      if (data?.user) {
        updateUser(data.user);
        setForm((p) => ({
          ...p,
          profileImage:
            data.user.profileImage ||
            p.profileImage ||
            "https://preline.co/assets/img/160x160/img1.jpg",
          gender: data.user.gender || p.gender || "",
          dateOfBirth: data.user.dateOfBirth
            ? String(data.user.dateOfBirth).substring(0, 10)
            : p.dateOfBirth || "",
          address: data.user.address || p.address || "",
        }));
      }

      toast.success("Profile updated successfully");
      setFile(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const onCancel = () => {
    setFile(null);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl md:p-6 p-4">
        <div className="animate-pulse h-36 rounded-2xl bg-slate-100 mb-6" />
        <div className="h-64 rounded-2xl bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-full px-0 md:px-2 md:py-6 py-2 mt-3 md:mt-0">
      {/* শুধু একটাই card, ডান দিকেরটাই */}
      <div className="bg-white rounded-md shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-1">Edit Profile</h2>
        <p className="text-sm text-slate-500 mb-5">
          Update your personal information and profile photo.
        </p>

        {/* Avatar + Upload photo */}
      <div className="flex items-center gap-4 mb-6">
  <div className="relative">
    {/* Avatar wrapper ensures no "alt text" shows and looks premium */}
    <div className="h-16 w-16 rounded-full ring-4 ring-white shadow overflow-hidden bg-slate-100">
      <img
        src={form.profileImage}
        alt={`${form.name || "User"} profile photo`}
        className="h-full w-full object-cover"
        onError={(e) => {
          e.currentTarget.src = "https://preline.co/assets/img/160x160/img1.jpg";
        }}
      />
    </div>

    <button
      type="button"
      onClick={chooseFile}
      className="group absolute -bottom-1 left-1/2 -translate-x-1/2 inline-flex items-center justify-center h-6 w-6 rounded-full
                 bg-white/90 backdrop-blur border border-slate-200 shadow-sm
                 hover:bg-white hover:shadow-md hover:border-slate-300
                 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      title="Change photo"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4 text-slate-600 group-hover:text-slate-800"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20 20H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-2h6l2 2h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2Z" />
        <path d="M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      </svg>
    </button>

    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={onPick}
    />
  </div>

  <div className="flex flex-col gap-1">
    <span className="text-sm font-medium">{form.name || "User"}</span>
    <span className="text-xs text-slate-500">{form.email}</span>
    {file && <span className="text-xs text-slate-500">{file.name} selected</span>}
  </div>
</div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="Full Name"
              name="name"
              value={form.name}
              onChange={onChange}
              autoComplete="name"
            />
            <Field label="Email (read-only)" value={form.email} readOnly />
            <Field
              label="Phone Number"
              name="mobile"
              value={form.mobile}
              onChange={onChange}
              autoComplete="tel"
            />

            {/* Gender (optional) */}
            <div>
              <Label>Gender (optional)</Label>
              <select
                name="gender"
                value={form.gender}
                onChange={onChange}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Date of Birth */}
            <div>
              <Label>Date of Birth (optional)</Label>
              <input
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={onChange}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Address */}
            <Field
              label="Address (optional)"
              name="address"
              value={form.address}
              onChange={onChange}
            />
          </div>

          <div>
            <Label>About me</Label>
            <textarea
              name="bio"
              rows={4}
              value={form.bio}
              onChange={onChange}
              placeholder="Write something about yourself"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded text-white text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Update Profile"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2 rounded border text-sm hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <ToastContainer />
    </div>
  );
}

/* ---------- tiny UI atoms ---------- */
function Label({ children }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {children}
    </label>
  );
}

function Field({ label, readOnly, ...rest }) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type="text"
        readOnly={readOnly}
        {...rest}
        className={`mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
          readOnly ? "bg-slate-50 text-slate-500" : ""
        }`}
      />
    </div>
  );
}
