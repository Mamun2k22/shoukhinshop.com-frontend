import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api, BASE } from "../../api/verifyClient";

export default function SellerVerificationStatus() {
  const { data } = useQuery({
    queryKey: ["kyc", "me"],
    queryFn: () => api("/api/seller/verification/me"),
    staleTime: 10_000,
  });

  if (!data || data.status === "none") return null;

  const color =
    data.status === "approved"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : data.status === "pending"
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : "bg-rose-50 text-rose-700 border-rose-200";

  return (
    <div className={`border ${color} rounded-lg p-3 text-sm`}>
      Verification status: <b className="uppercase">{data.status}</b>
      {data.status === "rejected" && data.adminNote && (
        <> — Reason: {data.adminNote}</>
      )}
      {!!(data.documents || []).length && (
        <div className="mt-2 flex flex-wrap gap-2">
          {data.documents.map((d, i) => (
            <a
              key={i}
              target="_blank"
              rel="noreferrer"
              className="underline"
              href={`${BASE}/${String(d.url || "").replace(/^\/+/, "")}`}
            >
              {d.kind}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
