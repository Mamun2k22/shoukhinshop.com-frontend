// src/pages/CategoryDetails.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import MenSubCategories from "./MenSubCategories";

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
export default function SectionCategoriDetails() {
  const { slug } = useParams();

  // dropdown open states (SIZE removed)
  const [openPrice, setOpenPrice] = useState(false);
  const [openSort, setOpenSort] = useState(false);

  const priceRef = useRef(null);
  const sortRef = useRef(null);

  useClickOutside(priceRef, () => setOpenPrice(false));
  useClickOutside(sortRef, () => setOpenSort(false));

  // filters (SIZE removed)
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(0);
  const [sortBy, setSortBy] = useState("dateNew");

  // ✅ fetch category’s products from /api/categories/:slug
  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["productsByCategory", slug],
    queryFn: async () => {
      const url = `${import.meta.env.VITE_APP_SERVER_URL}api/categories/${encodeURIComponent(
        slug || ""
      )}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load products");
      return res.json();
    },
  });

  // derive price bounds (SIZE removed)
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

  // initialize price slider bounds
  useEffect(() => {
    if (products.length) {
      setPriceMin(minP);
      setPriceMax(maxP);
    }
  }, [products, minP, maxP]);

  // apply filters (SIZE removed)
  const filtered = useMemo(() => {
    const inPrice = (p) => {
      const val = Number(p.price || 0);
      return val >= priceMin && val <= priceMax;
    };

    return sortProducts(products.filter((p) => inPrice(p)), sortBy);
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
      {/* <MenSubCategories /> */}
      <div className="max-w-full xl:px-8 mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Title */}
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-wide uppercase">
            {decodeURIComponent(slug || "Category")}
          </h1>
        </div>

        {/* Filter bar */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b">
          {/* Left: PRICE (SIZE removed) */}
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

        {/* Results count */}
        <div className="text-sm text-gray-600 mt-3 mb-4">
          Showing <span className="font-semibold">{filtered.length}</span> items
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5 mt-2 md:mt-8">
          {filtered.map((p) => {
            const oldPrice = Number(p.price || 0);
            const discount = Number(p.discount || 0);

            const newPrice =
              discount > 0
                ? Math.round(oldPrice - (oldPrice * discount) / 100)
                : oldPrice;

            const firstImage =
              Array.isArray(p.productImage) && p.productImage.length > 0
                ? p.productImage[0]
                : p.productImage || p.image || "";

            return (
              <div
                key={p._id}
                className="bg-white rounded-md overflow-hidden shadow relative group hover:shadow-lg transition-shadow duration-300"
              >
                <Link to={`/product-details/${p._id}`} className="block h-full">
                  <div className="relative overflow-hidden">
                    {discount > 0 && (
                      <span className="absolute top-2 left-2 z-10 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                        {discount}%
                      </span>
                    )}

                    <span className="absolute top-2 right-2 z-10 bg-teal-400 text-white text-xs font-semibold px-2 py-1 rounded">
                      NEW
                    </span>

                    <img
                      src={firstImage}
                      alt={p.productName || p.name}
                      className="w-full h-64 object-cover"
                      loading="lazy"
                    />

                    <div className="absolute bottom-0 py-2 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-all duration-300 bg-black bg-opacity-80 text-center">
                      <Link
                        to={`/product-details/${p._id}`}
                        className="w-full  text-white font-semibold  transition-colors duration-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Add to Cart
                      </Link>
                    </div>
                  </div>

                  <div className="md:p-2 p-1.5 text-center">
                    <h3 className="text-sm font-normal md:font-medium text-gray-800 mb-1 line-clamp-2">
                      {p.productName || p.name}
                    </h3>
                    <div className="flex justify-center items-center gap-2">
                      {discount > 0 && (
                        <div className="text-gray-500 line-through text-xs">
                          Tk. {oldPrice.toLocaleString()}
                        </div>
                      )}
                      <div className="text-red-600 font-semibold text-sm">
                        Tk. {newPrice.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
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