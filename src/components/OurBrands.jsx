import React, { useEffect, useMemo, useState } from "react";

/** Build absolute URL for /uploads/... coming from backend */
function buildAssetUrl(apiBase, maybePath) {
  if (!maybePath) return "";
  const s = String(maybePath);

  // already absolute
  if (s.startsWith("http://") || s.startsWith("https://")) return s;

  // normalize base (remove trailing slash)
  const base = String(apiBase || "").replace(/\/$/, "");

  // if it starts with /uploads or /something, prefix with base
  if (s.startsWith("/")) return `${base}${s}`;

  // fallback
  return `${base}/${s}`;
}

function makePlaceholderDataUri(name) {
  const initials = (name || "Brand")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    "data:image/svg+xml;utf8," +
    encodeURIComponent(`
      <svg xmlns='http://www.w3.org/2000/svg' width='500' height='300'>
        <defs>
          <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0' stop-color='#f1f5f9'/>
            <stop offset='1' stop-color='#e2e8f0'/>
          </linearGradient>
        </defs>
        <rect width='100%' height='100%' fill='url(#g)'/>
        <rect x='24' y='24' width='452' height='252' rx='18' fill='#ffffff' opacity='0.55'/>
        <text x='50%' y='52%' text-anchor='middle' dominant-baseline='middle'
          font-family='Arial, sans-serif' font-size='42' fill='#94a3b8'>
          ${initials || "BR"}
        </text>
        <text x='50%' y='70%' text-anchor='middle' dominant-baseline='middle'
          font-family='Arial, sans-serif' font-size='16' fill='#94a3b8'>
          ${String(name || "Brand").slice(0, 18)}
        </text>
      </svg>
    `)
  );
}

function BrandCard({ name, logoUrl, href = "#" }) {
  const placeholder = useMemo(() => makePlaceholderDataUri(name), [name]);

  return (
    <a
      href={href}
      className="
        group block rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-100 transition
        hover:-translate-y-0.5 hover:shadow-md hover:ring-2 hover:ring-sky-500
        active:ring-2 active:ring-sky-600 focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-sky-500 border border-sky-400
      "
      title={name || "Brand"}
    >
      <div className="flex aspect-[5/3] items-center justify-center overflow-hidden rounded-xl bg-slate-50">
        <img
          src={logoUrl || placeholder}
          alt={name || "brand"}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = placeholder;
          }}
          className="h-full w-full object-contain  transition
                     group-hover:grayscale-0 group-hover:opacity-100"
        />
      </div>
    </a>
  );
}

export default function OurBrands() {
  const API = import.meta.env.VITE_APP_SERVER_URL; // e.g. http://localhost:5000/
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await fetch(`${API}api/brands`);
        if (!res.ok) throw new Error("Failed to fetch brands");

        const data = await res.json();

        // Your backend returns array directly: res.json(brands)
        const list = Array.isArray(data) ? data : data?.brands || [];

        if (!alive) return;
        setBrands(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error(e);
        if (alive) setBrands([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [API]);

  const activeBrands = useMemo(() => {
    // hide inactive
    return (brands || []).filter((b) => b?.isActive !== false);
  }, [brands]);

  const mapped = useMemo(() => {
    return activeBrands.map((b) => ({
      id: b?._id || b?.id || b?.name,
      name: b?.name || "Brand",
      href: b?.website || "#",
      logoUrl: buildAssetUrl(API, b?.logo), // ✅ KEY FIX
    }));
  }, [activeBrands, API]);

  return (
    <section className="mx-auto max-w-full px-2 md:px-6 py-10 sm:py-14 font-inter bg-white">
      {/* Heading */}
      <div className="mb-8 text-center sm:mb-10">
        <div className="text-lg font-semibold tracking-[0.2em] text-sky-500">
          POPULAR BRANDS
        </div>
        <h2 className="mt-3 text-2xl font-bold leading-tight text-slate-900 md:text-3xl">
          Let's Check Popular{" "}
          <span className="bg-gradient-to-r from-sky-500 to-blue-500 bg-clip-text text-transparent">
            Brands
          </span>
        </h2>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 ">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="aspect-[5/3] rounded-xl bg-slate-100 animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {/* Grid */}
      {!loading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {mapped.map((b) => (
            <BrandCard key={b.id} name={b.name} logoUrl={b.logoUrl} href={b.href} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && mapped.length === 0 && (
        <div className="mx-auto mt-10 max-w-md rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
          No brands found.
        </div>
      )}
    </section>
  );
}
