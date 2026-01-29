import React, { useEffect, useState } from "react";
import settingsApi from "../../hooks/settingsApi.jsx";

const AdminShippingSettings = () => {
  const [form, setForm] = useState({
    insideDhakaRate: 60,
    outsideDhakaRate: 120,
    freeThreshold: 0,
    freeForDistricts: [],
    campaign: { active: false, startAt: "", endAt: "", freeThreshold: 0 },
  });

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await settingsApi.fetchAdminShippingSettings(); // {success,data}
        const data = res?.data || {};
        setForm((prev) => ({
          ...prev,
          ...data,
          freeForDistricts: Array.isArray(data.freeForDistricts) ? data.freeForDistricts : [],
          campaign: { ...prev.campaign, ...(data.campaign || {}) },
        }));
      } catch (e) {
        setMsg(e?.message || "Failed to load shipping settings.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    try {
      setMsg("");
      await settingsApi.updateShippingSettings(form);
      setMsg("Saved ✅");
    } catch (e) {
      setMsg(e?.message || "Save failed ❌");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 font-poppins">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Delivery Charge Settings</h2>
        <button
          onClick={save}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          Save Changes
        </button>
      </div>

      {msg && <div className="mt-3 text-sm">{msg}</div>}

      <div className="mt-6 grid md:grid-cols-2 gap-6">
        <div className="border rounded-xl p-4">
          <h3 className="font-semibold">Inside Dhaka</h3>
          <input
            type="number"
            className="mt-2 w-full border rounded-lg px-3 py-2"
            value={form.insideDhakaRate}
            onChange={(e) => setForm({ ...form, insideDhakaRate: Number(e.target.value) })}
          />
        </div>

        <div className="border rounded-xl p-4">
          <h3 className="font-semibold">Outside Dhaka</h3>
          <input
            type="number"
            className="mt-2 w-full border rounded-lg px-3 py-2"
            value={form.outsideDhakaRate}
            onChange={(e) => setForm({ ...form, outsideDhakaRate: Number(e.target.value) })}
          />
        </div>

        <div className="border rounded-xl p-4 md:col-span-2">
          <h3 className="font-semibold">Free Shipping Threshold (Global)</h3>
          <input
            type="number"
            className="mt-2 w-full border rounded-lg px-3 py-2"
            value={form.freeThreshold}
            onChange={(e) => setForm({ ...form, freeThreshold: Number(e.target.value) })}
          />
          <p className="text-xs text-gray-500 mt-1">
            subtotal = threshold হলে shipping free (0 দিলে off)
          </p>
        </div>
{/* 
        <div className="border rounded-xl p-4 md:col-span-2">
          <h3 className="font-semibold">Always Free Districts</h3>
          <input
            type="text"
            className="mt-2 w-full border rounded-lg px-3 py-2"
            placeholder='Comma separated e.g. "Dhaka, Gazipur"'
            value={form.freeForDistricts.join(", ")}
            onChange={(e) =>
              setForm({
                ...form,
                freeForDistricts: e.target.value
                  .split(",")
                  .map((x) => x.trim())
                  .filter(Boolean),
              })
            }
          />
        </div>

        <div className="border rounded-xl p-4 md:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Campaign Free Shipping</h3>
            <label className="flex items-center gap-2">
              <span className="text-sm">Active</span>
              <input
                type="checkbox"
                checked={!!form.campaign.active}
                onChange={(e) =>
                  setForm({ ...form, campaign: { ...form.campaign, active: e.target.checked } })
                }
              />
            </label>
          </div>

          <div className="mt-3 grid md:grid-cols-3 gap-3">
            <input
              type="datetime-local"
              className="border rounded-lg px-3 py-2"
              value={form.campaign.startAt ? String(form.campaign.startAt).slice(0, 16) : ""}
              onChange={(e) =>
                setForm({ ...form, campaign: { ...form.campaign, startAt: e.target.value } })
              }
            />
            <input
              type="datetime-local"
              className="border rounded-lg px-3 py-2"
              value={form.campaign.endAt ? String(form.campaign.endAt).slice(0, 16) : ""}
              onChange={(e) =>
                setForm({ ...form, campaign: { ...form.campaign, endAt: e.target.value } })
              }
            />
            <input
              type="number"
              className="border rounded-lg px-3 py-2"
              placeholder="Campaign freeThreshold"
              value={form.campaign.freeThreshold || 0}
              onChange={(e) =>
                setForm({
                  ...form,
                  campaign: { ...form.campaign, freeThreshold: Number(e.target.value) },
                })
              }
            />
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default AdminShippingSettings;
