import { useEffect, useMemo, useRef, useState } from "react";
import {
  API_BASE,
  fetchPublicSettings,
  uploadLogo,
  deleteLogo,
  updateBrandName,
} from "../../hooks/settingsApi.jsx";

export default function LogoSettings() {
  const fileRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const [logoUrl, setLogoUrl] = useState("");
  const [brandName, setBrandName] = useState("shoukhinshop");
  const [newBrandName, setNewBrandName] = useState("shoukhinshop");

  const logoSrc = useMemo(() => {
    if (!logoUrl) return "";
    return logoUrl.startsWith("http") ? logoUrl : `${API_BASE}${logoUrl}`;
  }, [logoUrl]);

  async function load() {
    setLoading(true);
    setError("");
    setMsg("");
    try {
      const res = await fetchPublicSettings();
      const data = res?.data || {};
      setLogoUrl(data.logoUrl || "");
      setBrandName(data.brandName || "shoukhinshop");
      setNewBrandName(data.brandName || "shoukhinshop");
    } catch (e) {
      setError(e.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const onPickFile = () => fileRef.current?.click();

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBusy(true);
    setError("");
    setMsg("");

    try {
      if (!file.type.startsWith("image/")) throw new Error("Please select an image file");
      if (file.size > 5 * 1024 * 1024) throw new Error("Max file size is 5MB");

      await uploadLogo(file);
      setMsg("Logo updated ✅");
      await load();
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  const onDelete = async () => {
    if (!confirm("Are you sure you want to delete the logo?")) return;
    setBusy(true);
    setError("");
    setMsg("");
    try {
      await deleteLogo();
      setMsg("Logo deleted ✅");
      await load();
    } catch (e) {
      setError(e.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  const onSaveBrand = async () => {
    setBusy(true);
    setError("");
    setMsg("");
    try {
      const v = (newBrandName || "").trim();
      if (!v) throw new Error("Brand name can't be empty");
      await updateBrandName(v);
      setMsg("Brand name updated ✅");
      await load();
    } catch (e) {
      setError(e.message || "Update failed");
    } finally {
      setBusy(false);
    }
  };

  const status = error ? "error" : msg ? "success" : "";

  return (
    <div className="min-h-full bg-gradient-to-b from-zinc-50 to-white">
      {/* small local CSS only for spinner keyframes (tailwind doesn't ship keyframes by default) */}
      <style>{`@keyframes logoSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>

      <div className="mx-auto max-w-full px-0 md:px-2 py-6 xl:px-4">
        {/* Header */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-1 text-xs font-extrabold tracking-widest text-zinc-500">
              ADMIN
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">
              Site Settings
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-zinc-600">
              Update website logo (navbar) and optional brand name.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-3 py-2 text-xs font-extrabold text-zinc-700 shadow-sm backdrop-blur">
              <span
                className={[
                  "h-2 w-2 rounded-full",
                  loading
                    ? "bg-zinc-400"
                    : busy
                    ? "bg-zinc-900"
                    : "bg-emerald-500",
                ].join(" ")}
              />
              {loading ? "Loading" : busy ? "Working" : "Ready"}
            </span>
          </div>
        </div>

        {/* Alert */}
        {(error || msg) && (
          <div
            className={[
              "mb-5 flex items-start gap-3 rounded-lg border px-4 py-3 shadow-sm",
              status === "error"
                ? "border-rose-200 bg-rose-50"
                : "border-emerald-200 bg-emerald-50",
            ].join(" ")}
            role="status"
            aria-live="polite"
          >
            <div
              className={[
                "grid h-8 w-8 place-items-center rounded-xl border text-sm font-black",
                status === "error"
                  ? "border-rose-200 bg-white text-rose-700"
                  : "border-emerald-200 bg-white text-emerald-700",
              ].join(" ")}
            >
              {status === "error" ? "!" : "✓"}
            </div>
            <div className="flex-1">
              <div className="text-sm font-extrabold text-zinc-900">
                {status === "error" ? "Something went wrong" : "Success"}
              </div>
              <div className="text-sm text-zinc-700">{error ? error : msg}</div>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="h-3 w-44 animate-pulse rounded-full bg-zinc-100" />
              <div className="h-8 w-24 animate-pulse rounded-full bg-zinc-100" />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl border border-zinc-200 bg-white p-4">
                <div className="h-3 w-32 animate-pulse rounded-full bg-zinc-100" />
                <div className="mt-3 h-44 animate-pulse rounded-2xl border border-zinc-200 bg-zinc-50" />
                <div className="mt-4 flex gap-2">
                  <div className="h-10 w-32 animate-pulse rounded-2xl bg-zinc-100" />
                  <div className="h-10 w-24 animate-pulse rounded-2xl bg-zinc-100" />
                </div>
              </div>
              <div className="rounded-3xl border border-zinc-200 bg-white p-4">
                <div className="h-3 w-40 animate-pulse rounded-full bg-zinc-100" />
                <div className="mt-3 h-12 animate-pulse rounded-2xl border border-zinc-200 bg-zinc-50" />
                <div className="mt-4 flex gap-2">
                  <div className="h-10 w-28 animate-pulse rounded-2xl bg-zinc-100" />
                  <div className="h-10 w-28 animate-pulse rounded-2xl bg-zinc-100" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Logo Card */}
            <section className="relative overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
              {/* subtle corner glow */}
              <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-zinc-100 blur-3xl" />
              <div className="pointer-events-none absolute -right-24 -bottom-24 h-64 w-64 rounded-full bg-zinc-50 blur-3xl" />

              <div className="relative p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-extrabold tracking-tight text-zinc-900">
                      Logo
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-600">
                      Upload a PNG/JPG/WebP/SVG (max 5MB)
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-extrabold text-zinc-800">
                    <span
                      className={[
                        "h-2 w-2 rounded-full",
                        logoSrc ? "bg-emerald-500" : "bg-zinc-300",
                      ].join(" ")}
                    />
                    {logoSrc ? "Set" : "Empty"}
                  </span>
                </div>

                {/* Preview */}
                <div className="overflow-hidden rounded-md border border-zinc-200">
                  <div className="flex items-center justify-between border-b border-zinc-200 bg-white/80 px-3 py-2 backdrop-blur">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-extrabold text-zinc-800">
                        Preview
                      </span>
                      <span className="hidden text-xs text-zinc-500 sm:inline">
                        Transparent logos look best
                      </span>
                    </div>
                  </div>

                  <div className="relative grid min-h-[168px] place-items-center bg-gradient-to-b from-zinc-50 to-white p-4">
                    {logoSrc ? (
                      <img
                        src={logoSrc}
                        alt="Current Logo"
                        className="max-h-24 w-auto max-w-full select-none object-contain drop-shadow-[0_16px_22px_rgba(0,0,0,0.12)]"
                        draggable={false}
                      />
                    ) : (
                      <div className="text-center">
                        <div className="mx-auto mb-2 grid h-11 w-11 place-items-center rounded-2xl bg-zinc-100 text-lg font-black text-zinc-700">
                          ⭡
                        </div>
                        <div className="text-sm font-extrabold text-zinc-900">
                          No logo uploaded
                        </div>
                        <div className="mt-1 text-xs text-zinc-600">
                          Click <b>Upload Logo</b> to add one.
                        </div>
                      </div>
                    )}

                    {busy && (
                      <div className="absolute inset-0 grid place-items-center bg-white/65 backdrop-blur-[2px]">
                        <div
                          className="h-7 w-7 rounded-full border-[3px] border-zinc-300 border-t-zinc-900"
                          style={{ animation: "logoSpin 0.9s linear infinite" }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
                  className="hidden"
                />

                {/* Actions */}
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={onPickFile}
                    disabled={busy}
                    className={[
                      "inline-flex items-center justify-center rounded-full px-4 py-1.5 text-sm font-semibold shadow-sm transition",
                      busy
                        ? "cursor-not-allowed bg-zinc-900/60 text-white"
                        : "bg-zinc-900 text-white hover:-translate-y-[1px] hover:shadow-md active:translate-y-0",
                    ].join(" ")}
                  >
                    {busy ? "Working..." : logoSrc ? "Replace Logo" : "Upload Logo"}
                  </button>

                  <button
                    onClick={onDelete}
                    disabled={busy || !logoSrc}
                    className={[
                      "inline-flex items-center justify-center rounded-full border px-4 py-1.5 text-sm font-extrabold transition",
                      busy || !logoSrc
                        ? "cursor-not-allowed border-rose-200 bg-white text-rose-500/60"
                        : "border-rose-200 bg-rose-50 text-rose-700 hover:-translate-y-[1px] hover:shadow-sm active:translate-y-0",
                    ].join(" ")}
                  >
                    Delete
                  </button>
                </div>

                {/* Meta */}
                <div className="mt-4 border-t border-dashed border-zinc-200 pt-4">
                  <div className="mb-2 text-xs font-extrabold text-zinc-600">
                    Current URL
                  </div>
                  <code className="block overflow-x-auto rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-800">
                    {logoUrl || "(empty)"}
                  </code>
                </div>
              </div>
            </section>

            {/* Brand Name Card */}
            <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold tracking-tight text-zinc-900">
                    Brand Name
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-600">
                    Optional. If you only want image logo, you can ignore this section.
                  </p>
                </div>

                <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-extrabold text-zinc-800">
                  <span className="h-2 w-2 rounded-full bg-zinc-300" />
                  Text
                </span>
              </div>

              <div className="mb-3 flex items-baseline gap-2">
                <span className="text-sm text-zinc-600">Current</span>
                <span className="text-sm font-extrabold text-zinc-900">{brandName}</span>
              </div>

              <label className="block text-xs font-extrabold text-zinc-600">
                New brand name
              </label>
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-sm">
                <span className="rounded-xl border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-black text-zinc-600">
                  Aa
                </span>
                <input
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="Brand name"
                  className="w-full border-0 bg-transparent p-1 text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
                />
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button
                  onClick={onSaveBrand}
                  disabled={busy}
                  className={[
                    "inline-flex items-center justify-center rounded-lg px-4 py-1.5 text-sm font-extrabold shadow-sm transition",
                    busy
                      ? "cursor-not-allowed bg-zinc-900/60 text-white"
                      : "bg-zinc-900 text-white hover:-translate-y-[1px] hover:shadow-md active:translate-y-0",
                  ].join(" ")}
                >
                  {busy ? "Working..." : "Save"}
                </button>

                <button
                  onClick={() => setNewBrandName(brandName)}
                  disabled={busy}
                  className={[
                    "inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-1.5 text-sm font-extrabold text-zinc-900 shadow-sm transition",
                    busy
                      ? "cursor-not-allowed opacity-60"
                      : "hover:-translate-y-[1px] hover:shadow-md active:translate-y-0",
                  ].join(" ")}
                >
                  Reset
                </button>
              </div>

              <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs leading-relaxed text-zinc-700">
                Tip: Keep it short (e.g., <b>shoukhinshop</b>) for clean navbar alignment.
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
