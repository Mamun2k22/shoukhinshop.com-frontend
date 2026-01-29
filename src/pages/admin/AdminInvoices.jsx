import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../api/http";
import { printBrandedInvoice } from "../../utils/invoiceTemplate"; // ✅ use template

export default function AdminInvoices() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [selected, setSelected] = useState({}); // id:boolean

  const currency = (n) =>
    new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      maximumFractionDigits: 0,
    }).format(Number(n || 0));

  const dateBD = (d, withTime = true) =>
    new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      ...(withTime && { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      hour12: false,
      timeZone: "Asia/Dhaka",
    }).format(new Date(d));

  const load = async () => {
    setLoading(true);
    try {
      const data = await api("/api/invoices");
      setItems(Array.isArray(data) ? data : data?.items || []);
      setSelected({});
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const markPaid = async (id) => {
    await api(`/api/invoices/${id}/paid`, { method: "PATCH" });
    load();
  };

  const createFromOrder = async (e) => {
    e.preventDefault();
    const oid = orderId.trim();
    if (!oid) return;
    if (oid.length !== 24) {
      alert("Enter a valid 24-char Order ID");
      return;
    }
    setCreating(true);
    try {
      await api("/api/invoices", {
        method: "POST",
        body: JSON.stringify({ orderId: oid }),
      });
      setOrderId("");
      await load();
    } catch (err) {
      alert(err.message || "Failed to create invoice");
    } finally {
      setCreating(false);
    }
  };

  // ------- Print / CSV helpers -------
  // ⬇️ ব্র্যান্ডেড টেমপ্লেট কল
  const printInvoice = (inv) => {
    printBrandedInvoice(inv, {
      brand: {
        phone: "01742612032",
        email: "support@mmtradingcenter.com",
        website: "www.mmtradingcenter.com",
        // লোগো: public/ ফোল্ডারে রাখলে শুধু এই path দিন
        logo: "/logo-mm-trading.png",
        // চাইলে color ওভাররাইড করতে পারেন:
        // color: "#F57C00",
      },
    });
  };

  const downloadCSV = (onlySelected = false) => {
    const list = onlySelected ? items.filter((x) => selected[x._id]) : items;

    const header = ["Invoice", "User", "Total (BDT)", "Status", "Issued (BD)"];
    const rows = list.map((inv) => [
      inv._id?.slice(-6) || "",
      inv.userId?.name || "",
      String(inv.totalAmount ?? 0),
      inv.status || "",
      dateBD(inv.issuedAt, true),
    ]);
    const csv =
      [header, ...rows]
        .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
        .join("\n") + "\n";

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `admin_invoices_${new Date().toISOString().slice(0, 10)}${
      onlySelected ? "_selected" : ""
    }.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const allChecked = useMemo(
    () => items.length > 0 && items.every((x) => selected[x._id]),
    [items, selected]
  );
  const toggleAll = (checked) => {
    if (checked) {
      const next = {};
      items.forEach((x) => (next[x._id] = true));
      setSelected(next);
    } else setSelected({});
  };

  return (
    <div className="p-5">
      {/* header */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center gap-3">
        <form onSubmit={createFromOrder} className="flex items-center gap-2">
          <input
            className="border rounded-lg px-3 py-2 w-56 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Order ID / Code"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />
          <button
            disabled={creating}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {creating ? "Creating…" : "Create Invoice"}
          </button>
        </form>

        <div className="flex items-center gap-2 md:ml-auto">
          <button
            onClick={() => downloadCSV(false)}
            className="border px-3 py-2 rounded-lg hover:bg-slate-50"
          >
            Download CSV (All)
          </button>
          <button
            onClick={() => downloadCSV(true)}
            className="border px-3 py-2 rounded-lg hover:bg-slate-50 disabled:opacity-50"
            disabled={!Object.values(selected).some(Boolean)}
          >
            Download CSV (Selected)
          </button>
          <button onClick={load} className="border px-3 py-2 rounded-lg hover:bg-slate-50">
            Refresh
          </button>
        </div>
      </div>

      {/* table */}
      {loading ? (
        <div className="p-6 text-slate-500">Loading…</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="p-3">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={(e) => toggleAll(e.target.checked)}
                  />
                </th>
                <th className="p-3 text-left">Invoice</th>
                <th className="p-3 text-left">User</th>
                <th className="p-3 text-left">Total</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Issued</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((inv) => (
                <tr key={inv._id} className="border-t">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={!!selected[inv._id]}
                      onChange={(e) =>
                        setSelected((s) => ({ ...s, [inv._id]: e.target.checked }))
                      }
                    />
                  </td>
                  <td className="p-3 font-medium">#{inv._id.slice(-6)}</td>
                  <td className="p-3">
                    {inv.userId?.name || "User"}
                    <div className="text-xs text-slate-500">{inv.userId?.mobile}</div>
                  </td>
                  <td className="p-3">{currency(inv.totalAmount ?? 0)}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        inv.status === "paid"
                          ? "bg-emerald-100 text-emerald-700"
                          : inv.status === "void"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-3">{inv.issuedAt ? dateBD(inv.issuedAt, true) : "-"}</td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => printInvoice(inv)} // ✅ branded print
                      className="px-3 py-1.5 rounded-lg border hover:bg-slate-50"
                      title="Print / Save PDF"
                    >
                      Print
                    </button>
                    {inv.status !== "paid" && (
                      <button
                        onClick={() => markPaid(inv._id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!items.length && (
                <tr>
                  <td className="p-8 text-center text-slate-500" colSpan={7}>
                    No invoices
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
