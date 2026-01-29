// src/pages/admin/AdminVerificationApproved.jsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api, BASE } from "../../api/verifyClient";

function Badge({ children }) {
  return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">{children}</span>;
}

export default function AdminVerificationApproved() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["kyc", "approved"],
    queryFn: () => api("/api/seller/verification/approved"),
    staleTime: 10_000,
  });

  if (isLoading) return <div className="p-6">Loading approved sellers…</div>;
  if (isError)   return <div className="p-6 text-rose-600">Failed to load. <button onClick={() => refetch()} className="underline">Retry</button></div>;

  const items = data || [];

  return (
    <div className="bg-white rounded-xl border shadow-sm">
      <div className="p-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Seller Verification — Approved</h2>
          <p className="text-sm text-slate-500">All approved seller accounts.</p>
        </div>
        <button onClick={() => refetch()} className="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50">
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">Business</th>
              <th className="px-4 py-3 text-left">Contact</th>
              <th className="px-4 py-3 text-left">Documents</th>
              <th className="px-4 py-3 text-left">Decided At</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  No approved sellers yet.
                </td>
              </tr>
            )}
            {items.map((row) => (
              <tr key={row._id} className="border-t">
                <td className="px-4 py-3">
                  <div className="font-medium">{row.businessName || "-"}</div>
                  <div className="text-xs text-slate-500">User: {String(row.userId).slice(-6)}</div>
                </td>
                <td className="px-4 py-3">
                  <div>{row.contactEmail || "-"}</div>
                  <div className="text-xs text-slate-500">{row.contactPhone || "-"}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {(row.documents || []).map((d, i) => (
                      <a
                        key={i}
                        href={`${BASE}/${String(d.url || "").replace(/^\/+/, "")}`}
                        target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border hover:bg-gray-50"
                        title={d.note || ""}
                      >
                        <span className="text-xs">{d.kind}</span>
                      </a>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {row.decidedAt ? new Date(row.decidedAt).toLocaleString() : "-"}
                </td>
                <td className="px-4 py-3"><Badge>approved</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
