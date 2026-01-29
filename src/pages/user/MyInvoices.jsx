import React, { useEffect, useState, useMemo } from "react";
import { api, BASE } from "../../api/http";
import { printBrandedInvoice } from "../../utils/invoiceTemplate"; // ✅ branded template

export default function MyInvoices() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const baseUrl = useMemo(() => {
    const u = BASE || "";
    return u.endsWith("/") ? u : `${u}/`;
  }, []);

  const currency = (n) =>
    new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      maximumFractionDigits: 0,
    }).format(Number(n || 0));

  const dateBD = (d) =>
    new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Dhaka",
    }).format(new Date(d));

  const load = async () => {
    setLoading(true);
    try {
      const data = await api("/api/my/invoices");
      setItems(Array.isArray(data) ? data : data?.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // CSV download for the table
  const downloadCSV = () => {
    const header = ["Invoice", "Total (BDT)", "Status", "Issued (BD)"];
    const rows = items.map((inv) => [
      inv._id?.slice(-6) || "",
      (inv.totalAmount ?? 0).toString(),
      inv.status || "",
      dateBD(inv.issuedAt),
    ]);
    const csv =
      [header, ...rows]
        .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
        .join("\n") + "\n";

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoices_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // ✅ Branded print / Save as PDF
  const printInvoice = (inv) => {
    printBrandedInvoice(inv, {
      brand: {
        phone: "01742612032",
        email: "support@mmtradingcenter.com",
        website: "www.mmtradingcenter.com",
        logo: "/logo-mm-trading.png", // public/ এ ইমেজ রাখুন, না হলে আপলোডস/CDN URL দিন
        // color: "#F57C00", // চাইলে ওভাররাইড
      },
    });
  };

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-lg font-semibold">My Invoices</h2>
        <button onClick={load} className="ml-auto border px-3 py-2 rounded">
          Refresh
        </button>
        <button onClick={downloadCSV} className="border px-3 py-2 rounded">
          Download CSV
        </button>
      </div>

      {loading ? (
        <div>Loading…</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-3 text-left">Invoice</th>
                <th className="p-3 text-left">Total</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Issued</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((inv) => (
                <tr key={inv._id} className="border-t">
                  <td className="p-3">#{inv._id?.slice(-6)}</td>
                  <td className="p-3">{currency(inv.totalAmount ?? 0)}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        (inv.status || "").toLowerCase() === "paid"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {inv.status || "unpaid"}
                    </span>
                  </td>
                  <td className="p-3">{dateBD(inv.issuedAt)}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => printInvoice(inv)}
                      className="px-3 py-1 rounded border"
                    >
                      Download / Print
                    </button>
                  </td>
                </tr>
              ))}
              {!items.length && (
                <tr>
                  <td className="p-6 text-center text-slate-500" colSpan={5}>
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
