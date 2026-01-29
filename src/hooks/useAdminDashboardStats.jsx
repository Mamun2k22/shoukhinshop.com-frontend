import { useCallback, useEffect, useState } from "react";
import Cookies from "js-cookie";

const BASE_URL = import.meta.env.VITE_APP_SERVER_URL;

export default function useAdminDashboardStats() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalSales: 0,
  });
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = Cookies.get("token") || "";

      const res = await fetch(`${BASE_URL}api/admin/dashboard/stats`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ important
        },
      });

      const json = await res.json();

      if (!res.ok || json?.success !== true) {
        throw new Error(json?.message || "Failed to load dashboard stats");
      }

      const data = json?.data || {};
      setStats({
        totalProducts: Number(data?.totalProducts || 0),
        totalUsers: Number(data?.totalUsers || 0),
        totalOrders: Number(data?.totalOrders || 0),
        totalSales: Number(data?.totalSales || 0),
      });
    } catch (e) {
      console.log("useAdminDashboardStats error:", e);
      setError(e?.message || "Something went wrong");
      setStats({
        totalProducts: 0,
        totalUsers: 0,
        totalOrders: 0,
        totalSales: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { loading, stats, error, refresh: fetchStats };
}
