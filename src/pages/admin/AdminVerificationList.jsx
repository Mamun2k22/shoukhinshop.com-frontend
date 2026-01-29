// src/pages/admin/AdminVerificationList.jsx
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, BASE } from "../../api/verifyClient";

function Badge({ children, tone="blue" }) {
  const tones = {
    blue:   "bg-blue-100 text-blue-700",
    green:  "bg-emerald-100 text-emerald-700",
    red:    "bg-rose-100 text-rose-700",
    gray:   "bg-gray-100 text-gray-700",
  };
  return (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${tones[tone] || tones.gray}`}>
      {children}
    </span>
  );
}

export default function AdminVerificationList() {
  const qc = useQueryClient();

  // 🔄 pending list
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["kyc", "pending"],
    queryFn: () => api("/api/seller/verification/pending"),
    staleTime: 10_000,
  });

  // ✅ approve
  const approveMut = useMutation({
    mutationFn: (id) => api(`/api/seller/verification/${id}/approve`, { method: "PATCH" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["kyc", "pending"] }),
  });

  // ❌ reject
  const rejectMut = useMutation({
    mutationFn: ({ id, reason }) =>
      api(`/api/seller/verification/${id}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["kyc", "pending"] }),
  });

  const onReject = async (id) => {
    const reason = window.prompt("Reason for rejection?");
    if (reason == null) return;
    rejectMut.mutate({ id, reason });
  };

  if (isLoading) return <div className="p-6">Loading pending verifications…</div>;
  if (isError)   return <div className="p-6 text-rose-600">Failed to load. <button onClick={() => refetch()} className="underline">Retry</button></div>;

  const items = data || [];

  return (
    <div className="bg-white rounded-xl border shadow-sm">
      <div className="p-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Seller Verification — Pending</h2>
          <p className="text-sm text-slate-500">Review and approve legitimate sellers.</p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50"
        >
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
              <th className="px-4 py-3 text-left">Submitted</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  No pending requests 🎉
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
                  {row.createdAt ? new Date(row.createdAt).toLocaleString() : "-"}
                </td>

                <td className="px-4 py-3"><Badge>pending</Badge></td>

                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => approveMut.mutate(row._id)}
                      disabled={approveMut.isPending}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {approveMut.isPending ? "Approving…" : "Approve"}
                    </button>
                    <button
                      onClick={() => onReject(row._id)}
                      disabled={rejectMut.isPending}
                      className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                    >
                      {rejectMut.isPending ? "Rejecting…" : "Reject"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
