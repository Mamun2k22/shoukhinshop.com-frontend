import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import {
  FiSearch,
  FiRefreshCw,
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiPhone,
  FiMapPin,
  FiX,
  FiPackage,
} from "react-icons/fi";

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
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function ConfirmOrders() {
  const [orders, setOrders] = useState([]);
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState(null);

  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  // ✅ Confirm page should show "processing" orders (confirmed)
  const fetchConfirmed = async () => {
    const url = getBaseUrl();
    try {
      // 1) try dedicated confirmed endpoint
      const res = await axios.get(`${url}api/orders/confirmed`, {
        headers: getAuthHeaders(),
      });

      const list = (res.data || [])
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setOrders(list);
      return list;
    } catch (e) {
      // 2) fallback: get all then filter processing
      try {
        const res2 = await axios.get(`${url}api/orders`, {
          headers: getAuthHeaders(),
        });

        const list = (res2.data || [])
          .filter((o) => String(o?.orderStatus || "").toLowerCase() === "processing")
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setOrders(list);
        return list;
      } catch (e2) {
        toast.error("Failed to load confirmed orders");
        console.error(e2);
        setOrders([]);
        return [];
      }
    }
  };

  useEffect(() => {
    fetchConfirmed();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return orders;

    return orders.filter((o) => {
      const mobile = String(o?.customer?.mobile || "").toLowerCase();
      const addr = String(o?.address || "").toLowerCase();
      const products = (o?.products || [])
        .map((p) => `${p?.product?.productName || ""} ${p?.product?.sku || ""}`)
        .join(" ")
        .toLowerCase();
      return mobile.includes(s) || addr.includes(s) || products.includes(s);
    });
  }, [orders, q]);

  const openDetails = (order) => {
    setSelected(order);
    setOpen(true);
  };
  const closeDetails = () => {
    setOpen(false);
    setSelected(null);
  };

  // ✅ Delivered: processing -> delivered
  const deliverOrder = async (orderId) => {
    try {
      setBusyId(orderId);
      const url = getBaseUrl();

      await axios.put(
        `${url}api/order/${orderId}`,
        { orderStatus: "delivered" },
        { headers: getAuthHeaders() }
      );

      toast.success("Order delivered");
      await fetchConfirmed(); // ✅ delivered হলে confirm list থেকে চলে যাবে
      closeDetails();
    } catch (e) {
      toast.error("Deliver failed");
      console.error(e);
    } finally {
      setBusyId(null);
    }
  };

  // ✅ Cancel (soft): processing -> cancelled (your delete route does it)
  const cancelOrder = async (orderId) => {
    try {
      setBusyId(orderId);
      const url = getBaseUrl();

      await axios.delete(`${url}api/order/${orderId}`, {
        headers: getAuthHeaders(),
      });

      toast.success("Order cancelled");
      await fetchConfirmed(); // ✅ cancelled হলে confirm list থেকে চলে যাবে
      closeDetails();
    } catch (e) {
      toast.error("Cancel failed");
      console.error(e);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Confirm Orders
          </h1>
          <p className="text-sm text-gray-500">
            Processing (confirmed) orders এখানে দেখাবে — এখান থেকে Delivered করুন।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by mobile, address, product..."
              className="pl-9 pr-3 py-2 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm w-72"
            />
          </div>
          <button
            onClick={fetchConfirmed}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-gray-700 bg-white hover:bg-gray-50"
          >
            <FiRefreshCw className="text-gray-500" />
            Refresh
          </button>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left font-medium">Customer</th>
                <th className="px-6 py-3 text-left font-medium">Products</th>
                <th className="px-6 py-3 text-left font-medium">Shipping</th>
                <th className="px-6 py-3 text-left font-medium">Total</th>
                <th className="px-6 py-3 text-left font-medium">Created</th>
                <th className="px-6 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filtered.map((o) => {
                const prodCount = (o?.products || []).reduce(
                  (s, it) => s + (Number(it?.quantity) || 0),
                  0
                );

                return (
                  <tr key={o._id} className="hover:bg-indigo-50/30 transition">
                    <td className="px-6 py-3 align-top">
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900">
                          {o?.customer?.name || "—"}
                        </div>
                        <div className="text-sm text-gray-700 flex items-center gap-1.5">
                          <FiPhone className="text-indigo-500" />
                          {o?.customer?.mobile || "—"}
                        </div>
                        <div className="text-xs text-gray-500 flex items-start gap-1.5">
                          <FiMapPin className="mt-[2px]" />
                          <span className="max-w-[340px] truncate">
                            {o?.address || "—"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-3">
                      <div className="text-gray-900 font-medium">
                        {prodCount} items
                      </div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {(o?.products || [])
                          .map((p) => p?.product?.productName || "N/A")
                          .slice(0, 3)
                          .join(", ")}
                        {(o?.products || []).length > 3 ? "..." : ""}
                      </div>
                    </td>

                    <td className="px-6 py-3 text-gray-700">
                      <div className="text-sm">
                        {o?.shippingOption || "—"} • {fmtBDT(o?.shippingCost || 0)}
                      </div>
                    </td>

                    <td className="px-6 py-3 font-semibold text-gray-900">
                      {fmtBDT(o?.totalPrice || 0)}
                    </td>

                    <td className="px-6 py-3 text-gray-600">
                      <div className="text-xs flex items-center gap-1.5">
                        <FiClock />
                        {fmtBDDateTime(o?.createdAt)}
                      </div>
                    </td>

                    <td className="px-6 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openDetails(o)}
                          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs bg-white hover:bg-gray-50 text-gray-700"
                          title="View details"
                        >
                          <FiEye className="text-indigo-600" />
                          View
                        </button>

                        <button
                          disabled={busyId === o._id}
                          onClick={() => deliverOrder(o._id)}
                          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 disabled:opacity-50"
                          title="Mark Delivered"
                        >
                          <FiCheckCircle />
                          Delivered
                        </button>

                        <button
                          disabled={busyId === o._id}
                          onClick={() => cancelOrder(o._id)}
                          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 disabled:opacity-50"
                          title="Cancel"
                        >
                          <FiXCircle />
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                    No confirmed (processing) orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {open && selected && (
        <DetailsModal
          order={selected}
          busy={busyId === selected._id}
          onClose={closeDetails}
          onDeliver={() => deliverOrder(selected._id)}
          onCancel={() => cancelOrder(selected._id)}
        />
      )}

      <ToastContainer position="top-center" autoClose={900} hideProgressBar />
    </div>
  );
}

function DetailsModal({ order, onClose, onDeliver, onCancel, busy }) {
  const productTotal = (order?.products || []).reduce(
    (s, it) => s + (Number(it?.price) || 0) * (Number(it?.quantity) || 0),
    0
  );

  const status = String(order?.orderStatus || "").toLowerCase();
  const canDeliver = status === "processing";
  const canCancel = status === "processing";

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-xl border">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
            <p className="text-xs text-gray-500 font-mono">ID: {order?._id}</p>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 grid place-items-center rounded-lg hover:bg-gray-100"
            aria-label="Close"
          >
            <FiX />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-xl border p-4">
              <p className="text-xs text-gray-500 mb-1">Customer</p>
              <p className="font-medium text-gray-900">{order?.customer?.name || "—"}</p>
              <p className="text-sm text-gray-700">{order?.customer?.mobile || "—"}</p>
              <p className="text-xs text-gray-500 mt-2">Created</p>
              <p className="text-sm text-gray-700">{fmtBDDateTime(order?.createdAt)}</p>
            </div>

            <div className="rounded-xl border p-4">
              <p className="text-xs text-gray-500 mb-1">Shipping</p>
              <p className="text-sm text-gray-700">
                {order?.shippingOption || "—"} • {fmtBDT(order?.shippingCost || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-2">Address</p>
              <p className="text-sm text-gray-700">{order?.address || "—"}</p>
            </div>
          </div>

          <div className="rounded-xl border overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-700 uppercase">
              Products
            </div>
            <div className="divide-y">
              {(order?.products || []).map((it, idx) => {
                const name = it?.product?.productName || "N/A";
                const sku = it?.product?.sku || "—";
                const img = it?.product?.productImage?.[0] || it?.product?.productImage || null;
                const qty = Number(it?.quantity) || 0;
                const unit = Number(it?.price) || 0;
                const sub = qty * unit;

                return (
                  <div key={idx} className="p-4 flex gap-3 items-start">
                    <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden grid place-items-center shrink-0">
                      {img ? (
                        <img src={img} alt={name} className="h-full w-full object-cover" />
                      ) : (
                        <FiPackage className="text-gray-400" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900">{name}</p>
                      <p className="text-xs text-gray-500">SKU: {sku}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Qty: <span className="font-medium text-gray-800">{qty}</span> • Unit:{" "}
                        <span className="font-medium text-gray-800">{fmtBDT(unit)}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-500">Subtotal</p>
                      <p className="font-semibold text-gray-900">{fmtBDT(sub)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="text-sm text-gray-600">
              Status: <span className="font-medium text-gray-900">{status}</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Products Total</p>
              <p className="text-sm font-semibold text-gray-900">{fmtBDT(productTotal)}</p>
              <p className="text-xs text-gray-500 mt-1">Grand Total</p>
              <p className="text-lg font-bold text-gray-900">{fmtBDT(order?.totalPrice || 0)}</p>
            </div>
          </div>

          {!canDeliver && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              ℹ️ This order is already <b>{status}</b>. Delivered/Cancel disabled.
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t flex flex-col sm:flex-row gap-2 sm:justify-end">
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm bg-white hover:bg-gray-50"
          >
            Close
          </button>

          <button
            disabled={!canCancel || busy}
            onClick={onCancel}
            className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm bg-rose-50 hover:bg-rose-100 text-rose-700 disabled:opacity-50"
          >
            <FiXCircle />
            Cancel
          </button>

          <button
            disabled={!canDeliver || busy}
            onClick={onDeliver}
            className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm bg-emerald-50 hover:bg-emerald-100 text-emerald-700 disabled:opacity-50"
          >
            <FiCheckCircle />
            Delivered
          </button>
        </div>
      </div>
    </div>
  );
}
