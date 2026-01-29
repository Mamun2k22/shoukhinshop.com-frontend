import React, { useEffect, useMemo, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import {
  FiSearch,
  FiRefreshCw,
  FiPackage,
  FiDollarSign,
  FiPhone,
  FiMapPin,
  FiClock,
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiX,
} from "react-icons/fi";

const badgeClass = (s = "") => {
  const v = String(s || "").toLowerCase();
  if (v === "paid") return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  if (v === "partial") return "bg-indigo-50 text-indigo-700 border border-indigo-200";
  if (v === "refunded") return "bg-rose-50 text-rose-700 border border-rose-200";
  return "bg-amber-50 text-amber-700 border border-amber-200";
};

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

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [q, setQ] = useState("");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const url = getBaseUrl();
      const res = await axios.get(`${url}api/orders`, {
        headers: getAuthHeaders(),
      });

      const list = (res.data || [])
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // newest first

      setOrders(list);
      return list;
    } catch (err) {
      console.error("fetchOrders error:", err?.response?.status, err?.response?.data || err);
      toast.error(err?.response?.data?.message || "Failed to fetch orders");
      setOrders([]);
      return [];
    }
  };

  const filteredOrders = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return orders;

    return orders.filter((o) => {
      const mobile = String(o?.customer?.mobile || "").toLowerCase();
      const addr = String(o?.address || "").toLowerCase();
      const products = (o?.products || [])
        .map((p) => `${p?.product?.productName || ""} ${p?.product?.sku || ""}`)
        .join(" ")
        .toLowerCase();

      const status = String(o?.paymentStatus || "").toLowerCase();
      const orderStatus = String(o?.orderStatus || "").toLowerCase();

      return (
        mobile.includes(s) ||
        addr.includes(s) ||
        products.includes(s) ||
        status.includes(s) ||
        orderStatus.includes(s)
      );
    });
  }, [orders, q]);

  const { orderCount, totalAmount, uniqueCustomers, itemsSold } = useMemo(() => {
    const count = orders.length;
    const amount = orders.reduce((sum, o) => sum + (Number(o?.totalPrice) || 0), 0);

    const customers = new Set(
      orders.map((o) => (o?.customer?.mobile ? String(o.customer.mobile) : ""))
    );

    const qty = orders.reduce((sum, o) => {
      return sum + (o.products || []).reduce((s, it) => s + (Number(it?.quantity) || 0), 0);
    }, 0);

    return {
      orderCount: count,
      totalAmount: amount,
      uniqueCustomers: [...customers].filter(Boolean).length,
      itemsSold: qty,
    };
  }, [orders]);

  const openDetails = (order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setSelectedOrder(null);
  };

  // ✅ All Orders -> Confirm (pending -> processing)
  const confirmOrder = async (orderId) => {
    try {
      setBusyId(orderId);
      const url = getBaseUrl();

      await axios.put(
        `${url}api/order/${orderId}`,
        { orderStatus: "processing" },
        { headers: getAuthHeaders() }
      );

      toast.success("Order confirmed (processing)");
      await fetchOrders();
      closeDetails(); // ✅ important: refresh + close (UI becomes consistent)
    } catch (e) {
      toast.error("Failed to confirm order");
      console.error(e);
    } finally {
      setBusyId(null);
    }
  };

  // ✅ All Orders -> Cancel (soft cancel)
  const cancelOrder = async (orderId) => {
    try {
      setBusyId(orderId);
      const url = getBaseUrl();

      await axios.delete(`${url}api/order/${orderId}`, {
        headers: getAuthHeaders(),
      });

      toast.success("Order cancelled");
      await fetchOrders();
      closeDetails();
    } catch (e) {
      toast.error("Failed to cancel order");
      console.error(e);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-poppins text-gray-800">
            All Orders
          </h1>
          <p className="text-sm text-gray-500">
            Manage & review every order from one place.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by product, mobile, address, status..."
              className="pl-9 pr-3 py-2 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm w-72"
            />
          </div>

          <button
            onClick={fetchOrders}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-gray-700 bg-white hover:bg-gray-50"
          >
            <FiRefreshCw className="text-gray-500" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<FiPackage />} label="Orders" value={orderCount.toLocaleString()} />
        <StatCard icon={<FiDollarSign />} label="Total Amount" value={fmtBDT(totalAmount)} />
        <StatCard icon={<FiPhone />} label="Unique Customers" value={uniqueCustomers.toLocaleString()} />
        <StatCard icon={<FiMapPin />} label="Items Sold" value={itemsSold.toLocaleString()} />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs sticky top-0 z-10">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left font-medium">Customer & Contact</th>
                <th className="px-4 sm:px-6 py-3 text-left font-medium">Product</th>
                <th className="px-4 sm:px-6 py-3 text-left font-medium">SKU</th>
                <th className="px-4 sm:px-6 py-3 text-left font-medium">Qty</th>
                <th className="px-4 sm:px-6 py-3 text-left font-medium">Price</th>
                <th className="px-4 sm:px-6 py-3 text-right font-medium">Payment</th>
                <th className="px-4 sm:px-6 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredOrders?.map((order) =>
                (order.products || []).map((item, pi) => {
                  const status = (order?.paymentStatus || "unpaid").toLowerCase();
                  const showActionOnce = pi === 0;

                  return (
                    <tr key={`${order._id}-${pi}`} className="hover:bg-indigo-50/30 transition">
                      <td className="px-4 sm:px-6 py-3 align-top">
                        <div className="min-w-0 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 font-medium text-slate-900">
                              <FiPhone className="text-indigo-500 w-4 h-4" />
                              {order?.customer?.mobile || "N/A"}
                            </span>
                            <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                              Customer
                            </span>
                          </div>

                          <div className="flex items-start gap-1.5 text-slate-600 text-sm">
                            <FiMapPin className="mt-[2px] h-4 w-4 opacity-70" />
                            <span className="max-w-[320px] truncate">{order?.address || "—"}</span>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <FiClock className="h-4 w-4 opacity-70" />
                            <span>{fmtBDDateTime(order?.createdAt)}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 sm:px-6 py-3 text-gray-700">
                        <div className="font-medium">{item?.product?.productName || "N/A"}</div>
                      </td>

                      <td className="px-4 sm:px-6 py-3 text-gray-500">{item?.product?.sku || "—"}</td>
                      <td className="px-4 sm:px-6 py-3 text-gray-800">{item?.quantity || 0}</td>
                      <td className="px-4 sm:px-6 py-3 text-gray-800">{fmtBDT(item?.price || 0)}</td>

                      <td className="px-4 sm:px-6 py-3">
                        <div className="flex justify-end">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${badgeClass(status)}`}>
                            {status}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 sm:px-6 py-3">
                        <div className="flex justify-end">
                          {showActionOnce ? (
                            <button
                              onClick={() => openDetails(order)}
                              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs bg-white hover:bg-gray-50 text-gray-700"
                            >
                              <FiEye className="text-indigo-600" />
                              View
                            </button>
                          ) : (
                            <span className="text-transparent select-none">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {detailsOpen && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          busy={busyId === selectedOrder._id}
          onClose={closeDetails}
          onConfirm={() => confirmOrder(selectedOrder._id)}
          onCancel={() => cancelOrder(selectedOrder._id)}
          fmtBDT={fmtBDT}
          fmtBDDateTime={fmtBDDateTime}
        />
      )}

      <ToastContainer position="top-center" autoClose={900} hideProgressBar />
    </div>
  );
};

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="flex items-center gap-3 p-4">
        <div className="h-9 w-9 grid place-items-center rounded-lg bg-indigo-100 text-indigo-600">
          <span className="text-lg">{icon}</span>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-500">{label}</p>
          <p className="text-lg font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function OrderDetailsModal({ order, busy, onClose, onConfirm, onCancel, fmtBDT, fmtBDDateTime }) {
  const productTotal = (order.products || []).reduce(
    (s, it) => s + (Number(it?.price) || 0) * (Number(it?.quantity) || 0),
    0
  );

  const status = String(order?.orderStatus || "pending").toLowerCase();

  // ✅ FIXED RULES:
  // confirm only if pending
  const canConfirm = status === "pending";
  // cancel if pending or processing (you said cancel is OK)
  const canCancel = status === "pending" || status === "processing";

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-xl border">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
            <p className="text-xs text-gray-500">
              Order ID: <span className="font-mono">{order?._id}</span>
            </p>
          </div>
          <button onClick={onClose} className="h-9 w-9 grid place-items-center rounded-lg hover:bg-gray-100" aria-label="Close">
            <FiX />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-xl border p-4">
              <p className="text-xs text-gray-500 mb-1">Customer</p>
              <p className="font-medium text-gray-900">{order?.customer?.name || "—"}</p>
              <p className="text-sm text-gray-600">{order?.customer?.mobile || "—"}</p>
              <p className="text-xs text-gray-500 mt-2">Created</p>
              <p className="text-sm text-gray-700">{fmtBDDateTime(order?.createdAt)}</p>
            </div>

            <div className="rounded-xl border p-4">
              <p className="text-xs text-gray-500 mb-1">Shipping</p>
              <p className="text-sm text-gray-700">
                Option: <span className="font-medium">{order?.shippingOption || "—"}</span>
              </p>
              <p className="text-sm text-gray-700">
                Cost: <span className="font-medium">{fmtBDT(order?.shippingCost || 0)}</span>
              </p>
              <p className="text-xs text-gray-500 mt-2">Address</p>
              <p className="text-sm text-gray-700">{order?.address || "—"}</p>
            </div>
          </div>

          <div className="rounded-xl border overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-700 uppercase">Products</div>
            <div className="divide-y">
              {(order.products || []).map((it, idx) => {
                const name = it?.product?.productName || "N/A";
                const img = it?.product?.productImage?.[0] || it?.product?.productImage || null;
                const qty = Number(it?.quantity) || 0;
                const unit = Number(it?.price) || 0;
                const sub = qty * unit;

                const options = [
                  it?.selectedSize ? `Size: ${it.selectedSize}` : null,
                  it?.selectedColor ? `Color: ${it.selectedColor}` : null,
                  it?.selectedWeight ? `Weight: ${it.selectedWeight}` : null,
                ].filter(Boolean);

                return (
                  <div key={idx} className="p-4 flex gap-3 items-start">
                    <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden grid place-items-center shrink-0">
                      {img ? <img src={img} alt={name} className="h-full w-full object-cover" /> : <FiPackage className="text-gray-400" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900">{name}</p>
                      {options.length > 0 && <p className="text-xs text-gray-500 mt-0.5">{options.join(" • ")}</p>}
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
              Order Status: <span className="font-medium text-gray-900">{order?.orderStatus || "pending"}</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Products Total</p>
              <p className="text-sm font-semibold text-gray-900">{fmtBDT(productTotal)}</p>
              <p className="text-xs text-gray-500 mt-1">Grand Total (server)</p>
              <p className="text-lg font-bold text-gray-900">{fmtBDT(order?.totalPrice || 0)}</p>
            </div>
          </div>
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
            Cancel Order
          </button>

          <button
            disabled={!canConfirm || busy}
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm bg-emerald-50 hover:bg-emerald-100 text-emerald-700 disabled:opacity-50"
          >
            <FiCheckCircle />
            Confirm Order
          </button>
        </div>
      </div>
    </div>
  );
}

export default AllOrders;
