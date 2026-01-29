// src/pages/CategoryDetails.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

/* --- tiny helpers ------------------------------------------------------- */
const useClickOutside = (ref, onClose) => {
  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose?.();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, onClose]);
};

const SORT_LABELS = {
  "availability": "Availability",
  "best": "Best Selling",
  "az": "Alphabetically, A–Z",
  "za": "Alphabetically, Z–A",
  "priceLow": "Price, low to high",
  "priceHigh": "Price, high to low",
  "dateNew": "Date, new to old",
  "dateOld": "Date, old to new",
};

const sortProducts = (arr, how) => {
  const a = [...arr];
  switch (how) {
    case "best":
      // fallback: by rating or sales if present, else keep as-is
      return a.sort((x, y) => (y.sales || 0) - (x.sales || 0));
    case "az":
      return a.sort((x, y) =>
        (x.productName || "").localeCompare(y.productName || "")
      );
    case "za":
      return a.sort((x, y) =>
        (y.productName || "").localeCompare(x.productName || "")
      );
    case "priceLow":
      return a.sort((x, y) => (x.price || 0) - (y.price || 0));
    case "priceHigh":
      return a.sort((x, y) => (y.price || 0) - (x.price || 0));
    case "dateNew":
      return a.sort(
        (x, y) => new Date(y.createdAt || 0) - new Date(x.createdAt || 0)
      );
    case "dateOld":
      return a.sort(
        (x, y) => new Date(x.createdAt || 0) - new Date(y.createdAt || 0)
      );
    default:
      return a;
  }
};

/* --- main page ---------------------------------------------------------- */
export default function CategoryFilterProduct() {
  const { slug } = useParams(); // category slug or name from route

  // dropdown open states
  const [openSize, setOpenSize] = useState(false);
  const [openPrice, setOpenPrice] = useState(false);
  const [openSort, setOpenSort] = useState(false);

  const sizeRef = useRef(null);
  const priceRef = useRef(null);
  const sortRef = useRef(null);

  useClickOutside(sizeRef, () => setOpenSize(false));
  useClickOutside(priceRef, () => setOpenPrice(false));
  useClickOutside(sortRef, () => setOpenSort(false));

  // filters
  const [sizeQuery, setSizeQuery] = useState("");
  const [selectedSizes, setSelectedSizes] = useState(new Set());
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(0);
  const [sortBy, setSortBy] = useState("dateNew");

  // fetch category’s products (public endpoint; adjust if your API differs)
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ["productsByCategory", slug],
    queryFn: async () => {
      const url = `${import.meta.env.VITE_APP_SERVER_URL}api/products/public?limit=200&category=${encodeURIComponent(
        slug || ""
      )}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load products");
      return res.json();
    },
  });

  // derive size options and price bounds
  const { allSizes, minP, maxP } = useMemo(() => {
    const prices = [];
    const sizeCounter = new Map(); // size -> count
    for (const p of products) {
      const price = Number(p.price || 0);
      if (!Number.isNaN(price)) prices.push(price);
      // assume p.size can be array or comma string or single string
      let sizes = p.size;
      if (Array.isArray(sizes)) {
        sizes.forEach((s) => {
          const key = String(s).trim();
          if (!key) return;
          sizeCounter.set(key, (sizeCounter.get(key) || 0) + 1);
        });
      } else if (typeof sizes === "string") {
        sizes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .forEach((s) => sizeCounter.set(s, (sizeCounter.get(s) || 0) + 1));
      }
    }
    const allSizes = [...sizeCounter.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ name, count }));
    const minP = prices.length ? Math.min(...prices) : 0;
    const maxP = prices.length ? Math.max(...prices) : 0;
    return { allSizes, minP, maxP };
  }, [products]);

  // initialize price slider bounds
  useEffect(() => {
    if (products.length) {
      setPriceMin(minP);
      setPriceMax(maxP);
    }
  }, [products, minP, maxP]);

  // apply filters
  const filtered = useMemo(() => {
    const inSize =
      selectedSizes.size === 0
        ? () => true
        : (p) => {
            let sizes = p.size;
            let hit = false;
            if (Array.isArray(sizes)) {
              for (const s of sizes) {
                if (selectedSizes.has(String(s).trim())) {
                  hit = true;
                  break;
                }
              }
            } else if (typeof sizes === "string") {
              for (const s of sizes.split(",").map((x) => x.trim())) {
                if (selectedSizes.has(s)) {
                  hit = true;
                  break;
                }
              }
            }
            return hit;
          };

    const inPrice = (p) => {
      const val = Number(p.price || 0);
      return val >= priceMin && val <= priceMax;
    };

    return sortProducts(products.filter((p) => inSize(p) && inPrice(p)), sortBy);
  }, [products, selectedSizes, priceMin, priceMax, sortBy]);

  const visibleSizes = useMemo(() => {
    const q = sizeQuery.trim().toLowerCase();
    return q
      ? allSizes.filter((s) => s.name.toLowerCase().includes(q))
      : allSizes;
  }, [allSizes, sizeQuery]);

  if (isLoading)
    return (
      <section className="max-w-7xl mx-auto px-4 py-10">
        <p>Loading…</p>
      </section>
    );

  if (error)
    return (
      <section className="max-w-7xl mx-auto px-4 py-10">
        <p className="text-red-600">Failed to load products.</p>
      </section>
    );

  return (
    <section className="bg-white">
      <div className="max-w-full xl:px-8 mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Title */}
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-wide uppercase">
            {decodeURIComponent(slug || "Category")}
          </h1>
        </div>

        {/* Filter bar */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b">
          {/* Left: SIZE & PRICE */}
          <div className="flex items-center gap-3">
            {/* SIZE */}
            <div className="relative" ref={sizeRef}>
              <button
                onClick={() => {
                  setOpenSize((v) => !v);
                  setOpenPrice(false);
                  setOpenSort(false);
                }}
                className="h-9 px-3 border rounded text-[12px] font-semibold uppercase tracking-wide hover:bg-gray-50"
              >
                Size
                <span className="ml-1">▾</span>
              </button>

              {openSize && (
                <div className="absolute z-30 mt-2 w-64 bg-white border rounded shadow-lg p-2">
                  <div className="mb-2">
                    <input
                      value={sizeQuery}
                      onChange={(e) => setSizeQuery(e.target.value)}
                      className="w-full h-9 px-3 border rounded text-sm"
                      placeholder="Search options"
                    />
                  </div>
                  <div className="max-h-64 overflow-auto pr-1">
                    {visibleSizes.map((s) => {
                      const checked = selectedSizes.has(s.name);
                      return (
                        <label
                          key={s.name}
                          className="flex items-center gap-2 py-1 text-sm cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={checked}
                            onChange={(e) => {
                              const next = new Set(selectedSizes);
                              if (e.target.checked) next.add(s.name);
                              else next.delete(s.name);
                              setSelectedSizes(next);
                            }}
                          />
                          <span className="flex-1">
                            {s.name}
                            <span className="text-gray-500 ml-1">({s.count})</span>
                          </span>
                        </label>
                      );
                    })}
                    {!visibleSizes.length && (
                      <div className="py-6 text-center text-sm text-gray-500">
                        No match
                      </div>
                    )}
                  </div>
                  {!!selectedSizes.size && (
                    <div className="pt-2 mt-2 border-t">
                      <button
                        onClick={() => setSelectedSizes(new Set())}
                        className="text-xs text-gray-600 hover:text-black"
                      >
                        Clear sizes
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* PRICE */}
            <div className="relative" ref={priceRef}>
              <button
                onClick={() => {
                  setOpenPrice((v) => !v);
                  setOpenSize(false);
                  setOpenSort(false);
                }}
                className="h-9 px-3 border rounded text-[12px] font-semibold uppercase tracking-wide hover:bg-gray-50"
              >
                Price
                <span className="ml-1">▾</span>
              </button>

              {openPrice && (
                <div className="absolute z-30 mt-2 w-80 max-w-[90vw] bg-white border rounded shadow-lg p-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={Math.floor(priceMin)}
                      onChange={(e) =>
                        setPriceMin(
                          Math.min(Number(e.target.value || 0), priceMax)
                        )
                      }
                      className="w-28 h-8 px-2 border rounded text-sm"
                    />
                    <span className="px-1">–</span>
                    <input
                      type="number"
                      value={Math.ceil(priceMax)}
                      onChange={(e) =>
                        setPriceMax(
                          Math.max(Number(e.target.value || 0), priceMin)
                        )
                      }
                      className="w-28 h-8 px-2 border rounded text-sm"
                    />
                  </div>

                  {/* dual slider (two range inputs) */}
                  <div className="mt-3 px-1">
                    <div className="relative h-5">
                      <input
                        type="range"
                        min={minP}
                        max={maxP}
                        value={priceMin}
                        onChange={(e) =>
                          setPriceMin(
                            Math.min(Number(e.target.value), priceMax)
                          )
                        }
                        className="absolute inset-0 w-full pointer-events-auto"
                      />
                      <input
                        type="range"
                        min={minP}
                        max={maxP}
                        value={priceMax}
                        onChange={(e) =>
                          setPriceMax(
                            Math.max(Number(e.target.value), priceMin)
                          )
                        }
                        className="absolute inset-0 w-full pointer-events-auto"
                      />
                    </div>
                    <div className="mt-2 flex justify-between text-[12px] text-gray-600">
                      <span>Tk {Math.floor(priceMin).toLocaleString()}</span>
                      <span>Tk {Math.ceil(priceMax).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="pt-2 mt-3 border-t flex gap-3">
                    <button
                      onClick={() => {
                        setPriceMin(minP);
                        setPriceMax(maxP);
                      }}
                      className="text-xs text-gray-600 hover:text-black"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => setOpenPrice(false)}
                      className="ml-auto px-3 h-8 rounded bg-black text-white text-xs"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: SORT */}
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => {
                setOpenSort((v) => !v);
                setOpenSize(false);
                setOpenPrice(false);
              }}
              className="h-9 px-3 border rounded text-[12px] font-semibold uppercase tracking-wide hover:bg-gray-50"
            >
              {SORT_LABELS[sortBy]}
              <span className="ml-1">▾</span>
            </button>

            {openSort && (
              <div className="absolute right-0 z-30 mt-2 w-64 bg-white border rounded shadow-lg py-1">
                {Object.entries(SORT_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSortBy(key);
                      setOpenSort(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                      sortBy === key ? "font-semibold text-black" : "text-gray-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-600 mt-3 mb-4">
          Showing <span className="font-semibold">{filtered.length}</span> items
        </div>

        {/* Product grid (kept clean; swap with your card if you want) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filtered.map((p) => (
            <article key={p._id} className="group bg-white border rounded-sm">
              <Link to={`/product-details/${p._id}`}>
                <div className="relative">
                  <img
                    src={p.productImage}
                    alt={p.productName}
                    className="w-full aspect-[3/4] object-contain bg-white transition-transform duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                </div>
              </Link>

              <div className="px-4 pt-3 pb-5">
                <p className="text-[11px] uppercase text-gray-500 tracking-wide">
                  {p.brand || "—"}
                </p>
                <Link to={`/product-details/${p._id}`}>
                  <h3 className="mt-1 text-[15px] leading-6 text-gray-900 line-clamp-2">
                    {p.productName}
                  </h3>
                </Link>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-[15px] font-semibold">
                    Tk {Number(p.price || 0).toLocaleString()}
                  </span>
                  {p.oldPrice && (
                    <span className="text-xs text-gray-400 line-through">
                      Tk {Number(p.oldPrice).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {!filtered.length && (
          <div className="py-16 text-center text-gray-500">No products found</div>
        )}
      </div>
    </section>
  );
}
