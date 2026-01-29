// src/pages/seller/SellerVerificationForm.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, BASE } from "../../api/verifyClient";

const KIND_LABEL = {
  nid_front: "NID Front",
  nid_back: "NID Back",
  trade_license: "Trade License",
  vat_cert: "VAT Certificate",
  other: "Other",
};
const MAX_FILES = 6;

export default function SellerVerificationForm() {
  const qc = useQueryClient();

  const { data: me, isFetching } = useQuery({
    queryKey: ["kyc", "me"],
    queryFn: ({ signal }) => api("/api/seller/verification/me", { signal }),
    placeholderData: { status: "none", documents: [] },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });

  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [rows, setRows] = useState([
    { file: null, kind: "nid_front", note: "", preview: "" },
  ]);

  // revoke previews on unmount
  useEffect(() => {
    return () => rows.forEach((r) => r.preview && URL.revokeObjectURL(r.preview));
  }, [rows]);

  const addRow = () =>
    setRows((p) =>
      p.length >= MAX_FILES ? p : [...p, { file: null, kind: "other", note: "", preview: "" }]
    );

  const removeRow = (i) =>
    setRows((p) => {
      const copy = [...p];
      const t = copy[i];
      if (t?.preview) URL.revokeObjectURL(t.preview);
      copy.splice(i, 1);
      return copy;
    });

  const onFile = (i, file) => {
    setRows((p) =>
      p.map((r, idx) =>
        idx !== i
          ? r
          : { ...r, file, preview: file ? URL.createObjectURL(file) : "" }
      )
    );
  };
  const onKind = (i, kind) =>
    setRows((p) => p.map((r, idx) => (idx === i ? { ...r, kind } : r)));
  const onNote = (i, note) =>
    setRows((p) => p.map((r, idx) => (idx === i ? { ...r, note } : r)));

  const canSubmit = useMemo(
    () => businessName.trim().length > 1 && rows.some((r) => r.file instanceof File),
    [businessName, rows]
  );

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append("businessName", businessName.trim());
      if (email) fd.append("contactEmail", email.trim());
      if (phone) fd.append("contactPhone", phone.trim());

      const meta = rows
        .filter((r) => r.file)
        .map((r) => ({ kind: r.kind, note: r.note || "" }));

      rows.forEach((r) => r.file && fd.append("files", r.file));
      fd.append("docsMeta", JSON.stringify(meta));

      return api("/api/seller/verification", { method: "POST", body: fd });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["kyc", "me"] });
      setRows([{ file: null, kind: "nid_front", note: "", preview: "" }]);
    },
  });

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      {/* Page header */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-50 via-white to-emerald-50 border border-gray-200 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Seller Verification
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Submit your business info and KYC documents to activate selling features.
            </p>
          </div>
          <StatusChip me={me} fetching={isFetching} />
        </div>
      </div>

      {/* Content cards */}
      <div className="mt-6 grid gap-6">
        {/* Business Info */}
        <section className="bg-white rounded-xl border shadow-sm">
          <header className="px-5 py-4 border-b flex items-center justify-between">
            <div>
              <h2 className="font-medium">Business information</h2>
              <p className="text-xs text-gray-500">Tell us how we can reach you.</p>
            </div>
          </header>

          <div className="p-5 grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label text="Business Name *" />
              <Input
                placeholder="Example Corp"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
              {!businessName.trim() && (
                <Hint text="Required. Your registered shop or company name." />
              )}
            </div>

            <div>
              <Label text="Contact Email" />
              <Input
                type="email"
                placeholder="business@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Hint text="We’ll send status updates here." />
            </div>

            <div>
              <Label text="Contact Phone" />
              <Input
                placeholder="+8801XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Hint text="Include country code." />
            </div>
          </div>
        </section>

        {/* Documents */}
        <section className="bg-white rounded-xl border shadow-sm">
          <header className="px-5 py-4 border-b flex items-center justify-between">
            <div>
              <h2 className="font-medium">Documents</h2>
              <p className="text-xs text-gray-500">
                Upload clear photos/PDFs. Max {MAX_FILES} files.
              </p>
            </div>
            <button
              onClick={addRow}
              disabled={rows.length >= MAX_FILES}
              className="text-sm px-3 py-1.5 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
            >
              + Add Row
            </button>
          </header>

          <div className="p-5 space-y-4">
            {rows.map((r, i) => (
              <DocRow
                key={i}
                row={r}
                index={i}
                onKind={onKind}
                onNote={onNote}
                onFile={onFile}
                onRemove={removeRow}
              />
            ))}

            {/* small guideline */}
            <ul className="mt-2 text-xs text-gray-500 list-disc pl-5">
              <li>Make sure text is readable (no blur / glare).</li>
              <li>Accepts JPG/PNG/PDF. File size up to ~10MB each (server limit applies).</li>
            </ul>
          </div>
        </section>
      </div>

      {/* Sticky submit */}
      <div className="sticky bottom-3 mt-6">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-xl bg-white/90 backdrop-blur border shadow flex items-center justify-between px-4 py-3">
            <div className="text-sm text-gray-600">
              {rows.filter((r) => r.file).length} / {MAX_FILES} file
              {rows.filter((r) => r.file).length === 1 ? "" : "s"} selected
            </div>
            <button
              disabled={!canSubmit || isPending}
              onClick={() => mutate()}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isPending && (
                <span className="h-4 w-4 rounded-full border-2 border-white/50 border-t-transparent animate-spin" />
              )}
              {isPending ? "Submitting…" : me?.status === "pending" ? "Resubmit" : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Subcomponents ---------- */

function StatusChip({ me, fetching }) {
  let label = "NOT SUBMITTED";
  let cls = "bg-gray-100 text-gray-700";
  if (me?.status === "pending") {
    label = "PENDING REVIEW";
    cls = "bg-blue-100 text-blue-700";
  } else if (me?.status === "approved") {
    label = "APPROVED";
    cls = "bg-emerald-100 text-emerald-700";
  } else if (me?.status === "rejected") {
    label = "REJECTED";
    cls = "bg-rose-100 text-rose-700";
  }

  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cls}`}>
        {label}
      </span>
      {fetching && (
        <span className="text-xs text-gray-500">Refreshing…</span>
      )}
    </div>
  );
}

function Label({ text }) {
  return <label className="text-sm font-medium text-gray-800">{text}</label>;
}
function Hint({ text }) {
  return <p className="mt-1 text-xs text-gray-500">{text}</p>;
}
function Input(props) {
  return (
    <input
      {...props}
      className={`mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${props.className || ""}`}
    />
  );
}

function DocRow({ row, index, onKind, onNote, onFile, onRemove }) {
  const inputRef = useRef(null);
  const openPicker = () => inputRef.current?.click();
  const sizeText =
    row.file ? (row.file.size > 1024 * 1024
      ? (row.file.size / (1024 * 1024)).toFixed(1) + " MB"
      : Math.ceil(row.file.size / 1024) + " KB") : "";

  return (
    <div className="rounded-xl border p-3 sm:p-4">
      <div className="grid lg:grid-cols-[180px_1fr_200px_40px] gap-3 items-start">
        <div>
          <Label text="Type" />
          <select
            value={row.kind}
            onChange={(e) => onKind(index, e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2"
          >
            {Object.entries(KIND_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label text="Note (optional)" />
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2"
            placeholder="Any note for reviewer…"
            value={row.note || ""}
            onChange={(e) => onNote(index, e.target.value)}
          />
        </div>

        {/* uploader */}
        <div>
          <Label text="Document" />
          <div
            onClick={openPicker}
            className={`mt-1 rounded-lg border px-3 py-2 cursor-pointer group transition bg-gray-50 hover:bg-gray-100 ${
              row.file ? "border-indigo-300 bg-white" : ""
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => onFile(index, e.target.files?.[0] || null)}
            />
            {!row.file ? (
              <div className="flex items-center justify-between">
              
                 <span className="text-indigo-600 font-medium">Browse</span>
               
                <span className="text-xs text-gray-500">JPG/PNG/PDF</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Thumb preview={row.preview} />
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{row.file.name}</div>
                  <div className="text-xs text-gray-500">{sizeText}</div>
                </div>
                <button
                  type="button"
                  className="ml-auto text-xs px-2 py-1 rounded border hover:bg-gray-50"
                  onClick={openPicker}
                >
                  Change
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="pt-[26px]">
          <button
            onClick={() => onRemove(index)}
            className="w-10 h-10 rounded-lg border hover:bg-gray-50"
            title="Remove row"
            aria-label="Remove row"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

function Thumb({ preview }) {
  if (!preview) {
    return (
      <div className="h-10 w-10 rounded-md bg-gray-100 border flex items-center justify-center text-gray-400">
        ⬆
      </div>
    );
  }
  return <img src={preview} alt="preview" className="h-10 w-10 rounded-md object-cover border" />;
}
