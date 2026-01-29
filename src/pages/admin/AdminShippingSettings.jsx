import React, { useEffect, useState } from "react";
import axios from "axios";
import districts from "../../data/districts"; // same list you already use

const initial = {
  insideDhakaRate: 60,
  outsideDhakaRate: 120,
  freeThreshold: 0,
  freeForDistricts: [],
  campaign: {
    active: false,
    startAt: "",
    endAt: "",
    freeThreshold: 0,
  },
};

export default function AdminShippingSettings () {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_APP_SERVER_URL}api/admin/shipping-settings`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        setForm({ ...initial, ...data });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));
  const setCamp = (k, v) =>
    setForm((s) => ({ ...s, campaign: { ...s.campaign, [k]: v } }));

  const toggleDistrict = (name) => {
    setForm((s) => {
      const exists = s.freeForDistricts.includes(name);
      const freeForDistricts = exists
        ? s.freeForDistricts.filter((d) => d !== name)
        : [...s.freeForDistricts, name];
      return { ...s, freeForDistricts };
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_APP_SERVER_URL}api/admin/shipping-settings`,
        form,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      alert("Settings saved ✅");
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Shipping & Free Delivery</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Base rates */}
        <div className="rounded-lg border bg-white p-4">
          <h2 className="font-semibold mb-3">Base Rates</h2>
          <label className="block text-sm mb-1">Inside Dhaka (Tk)</label>
          <input
            type="number"
            value={form.insideDhakaRate}
            onChange={(e) => set("insideDhakaRate", Number(e.target.value))}
            className="w-full border rounded px-3 py-2 mb-3"
            min={0}
          />
          <label className="block text-sm mb-1">Outside Dhaka (Tk)</label>
          <input
            type="number"
            value={form.outsideDhakaRate}
            onChange={(e) => set("outsideDhakaRate", Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
            min={0}
          />
        </div>

        {/* Global free threshold */}
        <div className="rounded-lg border bg-white p-4">
          <h2 className="font-semibold mb-3">Global Free Delivery</h2>
          <label className="block text-sm mb-1">
            Free if subtotal ≥ (Tk)
          </label>
          <input
            type="number"
            value={form.freeThreshold}
            onChange={(e) => set("freeThreshold", Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
            min={0}
            placeholder="e.g. 1000"
          />
          <p className="text-xs text-gray-500 mt-2">
            Subtotal after coupons/discounts.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        {/* District based */}
        <div className="rounded-lg border bg-white p-4">
          <h2 className="font-semibold mb-3">District-based Free Delivery</h2>
          <p className="text-xs text-gray-500 mb-3">
            These districts will always get free shipping.
          </p>
          <div className="h-64 overflow-y-auto border rounded p-3">
            {districts.map((d) => {
              const checked = form.freeForDistricts.includes(d.name);
              return (
                <label
                  key={d.name}
                  className="flex items-center gap-2 py-1 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleDistrict(d.name)}
                  />
                  <span>
                    {d.name} ({d.nameBn})
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Campaign window */}
        <div className="rounded-lg border bg-white p-4">
          <h2 className="font-semibold mb-3">Campaign Window</h2>
          <label className="inline-flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              checked={form.campaign.active}
              onChange={(e) => setCamp("active", e.target.checked)}
            />
            <span>Enable campaign</span>
          </label>

          <label className="block text-sm mb-1">Campaign Free Threshold (Tk)</label>
          <input
            type="number"
            value={form.campaign.freeThreshold}
            onChange={(e) => setCamp("freeThreshold", Number(e.target.value))}
            className="w-full border rounded px-3 py-2 mb-3"
            min={0}
            disabled={!form.campaign.active}
          />

          <label className="block text-sm mb-1">Start</label>
          <input
            type="datetime-local"
            value={form.campaign.startAt?.slice(0, 16) || ""}
            onChange={(e) => setCamp("startAt", e.target.value)}
            className="w-full border rounded px-3 py-2 mb-3"
            disabled={!form.campaign.active}
          />
          <label className="block text-sm mb-1">End</label>
          <input
            type="datetime-local"
            value={form.campaign.endAt?.slice(0, 16) || ""}
            onChange={(e) => setCamp("endAt", e.target.value)}
            className="w-full border rounded px-3 py-2"
            disabled={!form.campaign.active}
          />
          <p className="text-xs text-gray-500 mt-2">
            When active, campaign threshold overrides global threshold.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={save}
          disabled={saving}
          className="px-5 py-2 rounded bg-indigo-600 text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
