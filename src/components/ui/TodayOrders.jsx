import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiRefreshCw,
  FiClock,
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import { toast } from "react-toastify";

const fmtBDT = (n) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

const fmtBDDateTime = (d) =>
  d
    ? new Intl.DateTimeFormat("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Dhaka",
      }).format(new Date(d))
    : "—";

const getBaseUrl = () => {
  const base = import.meta.env.VITE_APP_SERVER_URL || "";
  return base.endsWith("/") ? base : `${base}/`;
};

const getAuthHeaders = () => {
  // তোমার সিস্টেমে যেটা ব্যবহার করছ (token/adminToken) সেটাই রাখো
  const token =
    localStorage.getItem("token") || localStorage.getItem("adminToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ✅ image absolute করে নেবে (relative হলে base url যোগ করবে)
const toImg = (src) => {
  if (!src) return null;
  const s = String(src);
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  const base = getBaseUrl();
  return `${base}${s.replace(/^\//, "")}`;
};

function Stat({ icon, label, value }) {
  return (
    <div className="rounded-xl border bg-white shadow-sm p-4">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 grid place-items-center rounded-lg bg-indigo-100 text-indigo-600">
          {icon}
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-500">
            {label}
          </p>
          <p className="text-lg font-semibold text-gray-900 mt-0.5">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function TodayOrders() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState([]);

  const fetchToday = async () => {
    try {
      setLoading(true);
      const url = getBaseUrl();
      const res = await axios.get(`${url}api/reports/today-orders`, {
        headers: getAuthHeaders(),
      });

      setSummary(res.data?.summary || null);
      setOrders(res.data?.orders || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load today orders");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToday();
  }, []);

  const safe = summary || {
    orders: 0,
    grossSales: 0,
    shipping: 0,
    itemsSold: 0,
    pending: 0,
    processing: 0,
    delivered: 0,
    cancelled: 0,
  };

  const top = useMemo(() => (orders || []).slice(0, 6), [orders]);

  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Today Orders</h3>
          <p className="text-sm text-gray-500">
            আজকের অর্ডার summary + latest list
          </p>
        </div>

        <button
          onClick={fetchToday}
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-gray-700 bg-white hover:bg-gray-50"
          disabled={loading}
        >
          <FiRefreshCw className="text-gray-500" />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Summary */}
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={<FiClock />} label="Orders" value={safe.orders} />
        <Stat icon={<FiPackage />} label="Items Sold" value={safe.itemsSold} />
        <Stat icon={<FiTruck />} label="Gross Sales" value={fmtBDT(safe.grossSales)} />
        <Stat icon={<FiTruck />} label="Shipping" value={fmtBDT(safe.shipping)} />
      </div>

      {/* Status pills */}
      <div className="px-5 pb-5 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 rounded-full border bg-amber-50 text-amber-700 border-amber-200 px-3 py-1 text-xs">
          <FiClock /> Pending: {safe.pending}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border bg-indigo-50 text-indigo-700 border-indigo-200 px-3 py-1 text-xs">
          <FiTruck /> Processing: {safe.processing}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1 text-xs">
          <FiCheckCircle /> Delivered: {safe.delivered}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border bg-rose-50 text-rose-700 border-rose-200 px-3 py-1 text-xs">
          <FiXCircle /> Cancelled: {safe.cancelled}
        </span>
      </div>

      {/* Latest list */}
      <div className="border-t">
        <div className="px-5 py-3 text-xs font-semibold text-gray-600 uppercase">
          Latest Orders (Today)
        </div>

        {top.length === 0 ? (
          <div className="px-5 pb-6 text-sm text-gray-500">
            আজকে কোনো অর্ডার নেই।
          </div>
        ) : (
          <div className="px-5 pb-5 space-y-3">
            {top.map((o) => {
              const items = o?.products || [];
              const qty = items.reduce(
                (s, it) => s + (Number(it?.quantity) || 0),
                0
              );

              const first = items[0]?.product;
              const firstName = first?.productName || "Product";
              const firstSku = first?.sku || "";
              const firstImg = toImg(
                first?.productImage?.[0] || first?.productImage || null
              );

              const moreCount = Math.max(0, items.length - 1);

              const otherNames = items
                .slice(1, 4)
                .map((it) => it?.product?.productName)
                .filter(Boolean);

              const name = o?.customer?.name || "Customer";
              const mobile = o?.customer?.mobile || "—";
              const status = o?.orderStatus || "pending";

              return (
                <div
                  key={o._id}
                  className="rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-indigo-50/20"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden grid place-items-center shrink-0">
                      {firstImg ? (
                        <img
                          src={firstImg}
                          alt={firstName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <FiPackage className="text-gray-400" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {name} • {mobile}
                      </p>

                      <p className="text-sm text-gray-800 mt-0.5 truncate">
                        {firstName}
                        {firstSku ? (
                          <span className="text-xs text-gray-500"> • {firstSku}</span>
                        ) : null}
                        {moreCount > 0 ? (
                          <span className="text-xs text-gray-500"> +{moreCount} more</span>
                        ) : null}
                      </p>

                      {otherNames.length > 0 && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          Also: {otherNames.join(", ")}
                          {items.length > 4 ? " ..." : ""}
                        </p>
                      )}

                      <p className="text-xs text-gray-500 mt-1">
                        {fmtBDDateTime(o?.createdAt)} • {qty} items •{" "}
                        {fmtBDT(o?.totalPrice || 0)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1 rounded-full border bg-gray-50 text-gray-700">
                      {status}
                    </span>
                    {/* চাইলে এখানে View বাটন/Modal attach করো */}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
