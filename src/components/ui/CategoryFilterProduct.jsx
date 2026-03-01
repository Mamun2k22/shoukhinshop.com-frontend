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
  availability: "Availability",
  best: "Best Selling",
  az: "Alphabetically, A–Z",
  za: "Alphabetically, Z–A",
  priceLow: "Price, low to high",
  priceHigh: "Price, high to low",
  dateNew: "Date, new to old",
  dateOld: "Date, old to new",
};

const sortProducts = (arr, how) => {
  const a = [...arr];
  switch (how) {
    case "best":
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
  const { slug } = useParams();

  const [openPrice, setOpenPrice] = useState(false);
  const [openSort, setOpenSort] = useState(false);

  const priceRef = useRef(null);
  const sortRef = useRef(null);

  useClickOutside(priceRef, () => setOpenPrice(false));
  useClickOutside(sortRef, () => setOpenSort(false));

  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(0);
  const [sortBy, setSortBy] = useState("dateNew");

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

  const { minP, maxP } = useMemo(() => {
    const prices = [];
    for (const p of products) {
      const price = Number(p.price || 0);
      if (!Number.isNaN(price)) prices.push(price);
    }
    const minP = prices.length ? Math.min(...prices) : 0;
    const maxP = prices.length ? Math.max(...prices) : 0;
    return { minP, maxP };
  }, [products]);

  useEffect(() => {
    if (products.length) {
      setPriceMin(minP);
      setPriceMax(maxP);
    }
  }, [products, minP, maxP]);

  const filtered = useMemo(() => {
    const inPrice = (p) => {
      const val = Number(p.price || 0);
      return val >= priceMin && val <= priceMax;
    };

    return sortProducts(products.filter(inPrice), sortBy);
  }, [products, priceMin, priceMax, sortBy]);

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
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-wide uppercase">
            {decodeURIComponent(slug || "Category")}
          </h1>
        </div>

        <div className="flex items-center justify-between gap-3 pb-3 border-b">
          <div className="flex items-center gap-3">
            {/* PRICE */}
            <div className="relative" ref={priceRef}>
              <button
                onClick={() => {
                  setOpenPrice((v) => !v);
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
                </div>
              )}
            </div>
          </div>

          {/* SORT */}
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => {
                setOpenSort((v) => !v);
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
                      sortBy === key
                        ? "font-semibold text-black"
                        : "text-gray-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="text-sm text-gray-600 mt-3 mb-4">
          Showing <span className="font-semibold">{filtered.length}</span> items
        </div>

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
          <div className="py-16 text-center text-gray-500">
            No products found
          </div>
        )}
      </div>
    </section>
  );
}