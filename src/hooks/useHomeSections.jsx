import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_APP_SERVER_URL?.replace(/\/$/, "") || "http://localhost:5000";
// ^ আপনার env use করবে, শেষের slash remove করে

export function useHomeSections() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const refresh = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API_BASE}/api/home-section-settings`);
      setData(res.data?.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  const updateSection = async (key, payload) => {
    try {
      setSaving(true);
      setError("");
      const res = await axios.put(`${API_BASE}/api/home-section-settings/${key}`, payload, {
        headers: { "Content-Type": "application/json" },
        // credentials/session লাগলে:
        // withCredentials: true,
      });
      // update local state instantly
      const updated = res.data?.data;
      setData((prev) => {
        const others = prev.filter((x) => x.key !== key);
        return [...others, updated];
      });
      return updated;
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "Save failed";
      setError(msg);
      throw new Error(msg);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const byKey = useMemo(() => {
    const map = {};
    for (const item of data) map[item.key] = item;
    return map;
  }, [data]);

  return { data, byKey, loading, saving, error, refresh, updateSection };
}
