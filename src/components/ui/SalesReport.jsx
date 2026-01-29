import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FiRefreshCw, FiDownload } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";

const fmtBDT = (n) =>
  new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 })
    .format(Number(n || 0));

const getBaseUrl = () => {
  const base = import.meta.env.VITE_APP_SERVER_URL || "";
  return base.endsWith("/") ? base : `${base}/`;
};
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function SalesReport() {
  const [from, setFrom] = useState(() => new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10));
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState("delivered"); // common for sales
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [groupBy, setGroupBy] = useState("day");

  const [summary, setSummary] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const url = getBaseUrl();
      const res = await axios.get(`${url}api/reports/sales`, {
        headers: getAuthHeaders(),
        params: { from, to, status, paymentStatus, groupBy },
      });
      setSummary(res.data?.summary || null);
      setRows(res.data?.rows || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load sales report");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReport(); }, []);

  const safeSummary = summary || { orders: 0, grossSales: 0, shipping: 0, itemsSold: 0, uniqueCustomers: 0 };

  // -------- CSV Export Helpers --------
  const csvEscape = (v) => {
    const s = String(v ?? "");
    if (s.includes(",") || s.includes("\n") || s.includes('"')) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const buildCSV = (arr) => {
    if (!arr?.length) return "";
    const headers = Object.keys(arr[0]);
    return [
      headers.join(","),
      ...arr.map((r) => headers.map((h) => csvEscape(r[h])).join(",")),
    ].join("\n");
  };

  const downloadCSV = (filename, csvText) => {
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (!rows?.length) {
      toast.info("No data to export");
      return;
    }

    // 1) Summary/meta row
    const metaRows = [
      {
        report: "Sales Report",
        from,
        to,
        orderStatus: status,
        paymentStatus,
        groupBy,
        orders: safeSummary.orders,
        grossSales: safeSummary.grossSales,
        shipping: safeSummary.shipping,
        itemsSold: safeSummary.itemsSold,
        uniqueCustomers: safeSummary.uniqueCustomers,
      },
    ];

    // 2) Period rows (table rows)
    const periodRows = rows.map((r) => ({
      period: r.period,
      orders: r.orders,
      itemsSold: r.itemsSold,
      uniqueCustomers: r.uniqueCustomers,
      shipping: r.shipping,
      grossSales: r.grossSales,
    }));

    const csv =
      buildCSV(metaRows) +
      "\n\n" +
      buildCSV(periodRows);

    const fileName = `sales_report_${from}_${to}_${status}_${paymentStatus}_${groupBy}.csv`;
    downloadCSV(fileName, csv);
  };
  // -------- /CSV Export Helpers --------

  return (
    <div className="p-6">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Sales Report</h1>
          <p className="text-sm text-gray-500">Date range + status filter দিয়ে sales দেখুন।</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchReport}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-gray-700 bg-white hover:bg-gray-50"
            disabled={loading}
          >
            <FiRefreshCw className="text-gray-500" />
            {loading ? "Loading..." : "Refresh"}
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-gray-700 bg-white hover:bg-gray-50"
            disabled={loading || rows.length === 0}
            title={rows.length === 0 ? "No data to export" : "Export CSV"}
          >
            <FiDownload className="text-gray-500" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5 grid grid-cols-1 md:grid-cols-5 gap-3 rounded-xl border bg-white p-4">
        <div>
          <label className="text-xs text-gray-500">From</label>
          <input value={from} onChange={(e) => setFrom(e.target.value)} type="date"
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-500">To</label>
          <input value={to} onChange={(e) => setTo(e.target.value)} type="date"
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-500">Order Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm">
            <option value="all">All</option>
            <option value="pending">pending</option>
            <option value="processing">processing</option>
            <option value="delivered">delivered</option>
            <option value="cancelled">cancelled</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">Payment</label>
          <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm">
            <option value="all">All</option>
            <option value="paid">paid</option>
            <option value="unpaid">unpaid</option>
            <option value="partial">partial</option>
            <option value="refunded">refunded</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">Group By</label>
          <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm">
            <option value="day">day</option>
            <option value="month">month</option>
          </select>
        </div>

        <div className="md:col-span-5">
          <button
            onClick={fetchReport}
            className="w-full rounded-lg bg-indigo-600 text-white py-2 text-sm hover:bg-indigo-700"
            disabled={loading}
          >
            Apply Filter
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <SummaryCard label="Orders" value={safeSummary.orders} />
        <SummaryCard label="Gross Sales" value={fmtBDT(safeSummary.grossSales)} />
        <SummaryCard label="Shipping" value={fmtBDT(safeSummary.shipping)} />
        <SummaryCard label="Items Sold" value={safeSummary.itemsSold} />
        <SummaryCard label="Unique Customers" value={safeSummary.uniqueCustomers} />
      </div>

      {/* Breakdown table */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Period</th>
                <th className="px-6 py-3 text-left">Orders</th>
                <th className="px-6 py-3 text-left">Items</th>
                <th className="px-6 py-3 text-left">Customers</th>
                <th className="px-6 py-3 text-left">Shipping</th>
                <th className="px-6 py-3 text-left">Gross</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((r) => (
                <tr key={r.period} className="hover:bg-indigo-50/30">
                  <td className="px-6 py-3 font-medium text-gray-900">{r.period}</td>
                  <td className="px-6 py-3">{r.orders}</td>
                  <td className="px-6 py-3">{r.itemsSold}</td>
                  <td className="px-6 py-3">{r.uniqueCustomers}</td>
                  <td className="px-6 py-3">{fmtBDT(r.shipping)}</td>
                  <td className="px-6 py-3 font-semibold">{fmtBDT(r.grossSales)}</td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                    No data found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ToastContainer position="top-center" autoClose={900} hideProgressBar />
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-xl border bg-white shadow-sm p-4">
      <p className="text-[11px] uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-gray-900 mt-1">{value}</p>
    </div>
  );
}
