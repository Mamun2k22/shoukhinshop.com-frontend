// src/components/DashboardProductStock.jsx
import React, { useEffect, useMemo, useState } from "react";

const BASE = `${import.meta.env.VITE_APP_SERVER_URL}api/products/admin/stock-table`;

function formatDate(d) {
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
  } catch { return "-"; }
}
function formatPrice(v, symbol = "TK ") {
  const n = Number(v || 0);
  return `${symbol}${n.toLocaleString()}`;
}

function normalizeStatus(s = "") {
  const t = String(s).trim();
  const low = t.toLowerCase();
  if (!t) return { key: "unknown", label: "—" };
  if (low.includes("out")) return { key: "out", label: "Out of stock" };
  if (low.includes("low")) return { key: "low", label: "Low stock" };
  if (low.includes("in")) return { key: "in", label: "In stock" };
  return { key: "other", label: t };
}
function StatusPill({ status }) {
  const { key, label } = normalizeStatus(status);
  const styles = {
    out: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
    low: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
    in: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
    other: "bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200",
    unknown: "bg-gray-100 text-gray-500 ring-1 ring-inset ring-gray-200",
  }[key || "unknown"];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${styles}`}
      role="status"
      aria-label={label}
      title={label}
    >
      <svg viewBox="0 0 8 8" className="h-2.5 w-2.5" aria-hidden="true"><circle cx="4" cy="4" r="4" fill="currentColor" /></svg>
      {label}
    </span>
  );
}

export default function DashboardProductStock() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, Math.max(total || 0, rows.length));
  const pageCount = Math.max(1, Math.ceil((total || rows.length) / limit));

  useEffect(() => {
    let isAlive = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const url = new URL(BASE);
        url.searchParams.set("limit", String(limit));
        url.searchParams.set("page", String(page));

        const res = await fetch(url.toString(), {
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.message || "Failed to load stock table");
        }
        const data = await res.json();
        if (!isAlive) return;
        setRows(Array.isArray(data.items) ? data.items : []);
        setMeta(data.thresholds || null);
        const t = Number(data.total) || Number(data.count) || Number(data.meta?.total) || 0;
        setTotal(t);
      } catch (e) {
        if (!isAlive) return;
        setErr(e.message || "Something went wrong");
      } finally {
        if (isAlive) setLoading(false);
      }
    })();
    return () => { isAlive = false; };
  }, [page, limit]);

  const subtitle = useMemo(() => {
    if (!meta) return null;
    return `• Low ≤ ${meta.low}, Out = ${meta.out}`;
  }, [meta]);

  const canPrev = page > 1;
  const canNext = page < pageCount;

  // ← / → keyboard navigation
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "ArrowLeft" && canPrev) setPage(p => Math.max(1, p - 1));
      if (e.key === "ArrowRight" && canNext) setPage(p => p + 1);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [canPrev, canNext]);

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm ring-1 ring-gray-100 border border-indigo-400">
      <div className="flex items-center justify-between mb-4  ">
        <h2 className="text-lg font-semibold text-gray-800">Products Stock</h2>
        {subtitle && <span className="text-xs text-gray-500">{subtitle}</span>}
      </div>

      {loading ? (
        <div className="p-6 text-sm text-gray-500">Loading…</div>
      ) : err ? (
        <div className="p-6 text-sm text-red-600">Error: {err}</div>
      ) : rows.length === 0 ? (
        <div className="p-6 text-sm text-gray-500">No products found.</div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto rounded-lg ring-1 ring-gray-100 ">
            <table className="w-full text-left border-collapse ">
         <thead className="sticky top-0 z-10  bg-gradient-to-r from-rose-600 via-red-600 to-orange-600
                   text-white shadow-sm">
  <tr className="text-[11px] sm:text-xs uppercase tracking-wide">
    <th className="p-3">Product Item</th>
    <th className="p-3">Product Code</th>
    <th className="p-3">Date Added</th>
    <th className="p-3">Price</th>
    <th className="p-3">Status</th>
    <th className="p-3 text-right pr-5">QTY</th>
  </tr>
</thead>

              <tbody className="divide-y divide-gray-100 ">
                {rows.map((p, idx) => (
                  <tr
                    key={p.id ?? idx}
                    className="text-sm odd:bg-white even:bg-gray-50/50 hover:bg-indigo-50/40 transition-colors "
                  >
                    <td className="p-3 font-medium text-gray-800">
                      <div
                        className="max-w-[260px] md:max-w-[320px] truncate whitespace-nowrap overflow-hidden text-ellipsis"
                        title={p.name || ""}
                      >
                        {p.name}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-indigo-600 hover:underline cursor-pointer">{p.sku || "#PFR-1045"}</span>
                    </td>
                    <td className="p-3 text-gray-700">{formatDate(p.createdAt)}</td>
                    <td className="p-3 text-gray-800">{formatPrice(p.price)}</td>
                    <td className="p-3"><StatusPill status={p.status} /></td>
                    <td className="p-3 text-gray-700 text-right pr-5">
                      {Number(p.qty || 0).toLocaleString()} <span className="text-gray-500">Pics</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer / Pagination */}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-gray-600">
              Showing <span className="font-semibold text-gray-800">{startIndex}</span>–
              <span className="font-semibold text-gray-800">{endIndex}</span> of{" "}
              <span className="font-semibold text-gray-800">{total || rows.length}</span>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs text-gray-600">
                Rows:&nbsp;
                <select
                  className="border rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  value={limit}
                  onChange={(e) => { setPage(1); setLimit(Number(e.target.value)); }}
                >
                  {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm ring-1 transition
                    ${canPrev
                      ? "text-gray-700 ring-gray-300 hover:bg-gray-50 active:scale-[.98] focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      : "text-gray-400 ring-gray-200 cursor-not-allowed bg-white"
                    }`}
                  onClick={() => canPrev && setPage(p => Math.max(1, p - 1))}
                  disabled={!canPrev}
                  aria-label="Previous page"
                >
                  {/* Left Arrow */}
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Prev</span>
                </button>

                <span className="text-xs text-gray-600">
                  Page <strong className="text-gray-800">{page}</strong> / {pageCount}
                </span>

                <button
                  type="button"
                  className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm ring-1 transition
                    ${canNext
                      ? "text-gray-700 ring-gray-300 hover:bg-gray-50 active:scale-[.98] focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      : "text-gray-400 ring-gray-200 cursor-not-allowed bg-white"
                    }`}
                  onClick={() => canNext && setPage(p => p + 1)}
                  disabled={!canNext}
                  aria-label="Next page"
                >
                  <span>Next</span>
                  {/* Right Arrow */}
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
