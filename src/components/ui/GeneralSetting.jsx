import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import useGeneralSettings from "../../hooks/useGeneralSettings";

export default function GeneralSetting() {
  const { data, isLoading, updateGeneralSettings } = useGeneralSettings();

  const [form, setForm] = useState({
    phone: "",
    email: "",
    address: "",
    description: "", // ✅ added
  });

  useEffect(() => {
    if (data) {
      setForm({
        phone: data.phone || "",
        email: data.email || "",
        address: data.address || "",
        description: data.description || "", // ✅ added
      });
    }
  }, [data]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    updateGeneralSettings.mutate(form, {
      onSuccess: (res) => {
        toast.success(res?.message || "Updated");
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || "Update failed");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="h-6 w-40 bg-slate-200 rounded animate-pulse mb-4" />
        <div className="h-10 w-full bg-slate-200 rounded animate-pulse mb-3" />
        <div className="h-10 w-full bg-slate-200 rounded animate-pulse mb-3" />
        <div className="h-24 w-full bg-slate-200 rounded animate-pulse mb-3" />
        <div className="h-24 w-full bg-slate-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-100 shadow-sm p-6 mt-2 lg:mt-6">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900">General Setting</h2>
        <p className="text-sm text-slate-500">
          Admin can update phone, email, address and description shown on site.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-slate-700">Phone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={onChange}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-200"
            placeholder="017xxxxxxxx"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700">Email</label>
          <input
            name="email"
            value={form.email}
            onChange={onChange}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-200"
            placeholder="support@shoukhinshop.com"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700">Address</label>
          <textarea
            name="address"
            value={form.address}
            onChange={onChange}
            rows={4}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-200"
            placeholder="Dhaka, Bangladesh"
          />
        </div>

        {/* ✅ NEW FIELD */}
        <div>
          <label className="text-sm font-semibold text-slate-700">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={onChange}
            rows={4}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-200"
            placeholder="Short description shown on site..."
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={updateGeneralSettings.isPending}
            className="px-5 py-2.5 rounded-md font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-60"
          >
            {updateGeneralSettings.isPending ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={() => {
              setForm({
                phone: data?.phone || "",
                email: data?.email || "",
                address: data?.address || "",
                description: data?.description || "", // ✅ added
              });
              toast.info("Reset done");
            }}
            className="px-5 py-2.5 rounded-md font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
