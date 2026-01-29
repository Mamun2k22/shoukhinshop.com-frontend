import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLoaderData, useParams } from "react-router-dom";

/* small helpers */
const useClickOutside = (ref, onClose) => {
  useEffect(() => {
    const h = (e) => ref.current && !ref.current.contains(e.target) && onClose?.();
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, onClose]);
};

const SORT_LABELS = {
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
      return a.sort((x, y) => (x.productName || "").localeCompare(y.productName || ""));
    case "za":
      return a.sort((x, y) => (y.productName || "").localeCompare(x.productName || ""));
    case "priceLow":
      return a.sort((x, y) => (Number(x.price) || 0) - (Number(y.price) || 0));
    case "priceHigh":
      return a.sort((x, y) => (Number(y.price) || 0) - (Number(x.price) || 0));
    case "dateNew":
      return a.sort((x, y) => new Date(y.createdAt || 0) - new Date(x.createdAt || 0));
    case "dateOld":
      return a.sort((x, y) => new Date(x.createdAt || 0) - new Date(y.createdAt || 0));
    default:
      return a;
  }
};

const norm = (v) =>
  String(v ?? "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

export default function CategoryProduct() {
  const raw = useLoaderData();
  const { name: routeName } = useParams();

  // --- normalize loader data safely (array / {data:[]} / {products:[]})
  const baseProducts = useMemo(() => {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.products)) return raw.products;
    // some APIs return {category, products:[...]}
    if (Array.isArray(raw?.category?.products)) return raw.category.products;
    return [];
  }, [raw]);

  // --- hard category guard (prevents mixed categories if backend returns more)
  const normRoute = norm(decodeURIComponent(routeName || ""));
  const slugVariants = new Set([
    normRoute,
    normRoute.replace(/\s+/g, "-"),
    normRoute.replace(/[-_]+/g, " "),
  ]);

  const inCategory = (p) => {
    if (!normRoute) return true; // if route is blank, show all from loader
    const candidates = [
      p.category,
      p.categorySlug,
      p.category_name,
      p.categoryName,
      p?.category?.slug,
      p?.category?.name,
      typeof p.category === "string" ? p.category : undefined,
    ].filter(Boolean);
    return candidates.some((v) => {
      const n = norm(v);
      return slugVariants.has(n) || slugVariants.has(n.replace(/\s+/g, "-"));
    });
  };

  const productsByCat = useMemo(
    () => baseProducts.filter(inCategory),
    [baseProducts, normRoute]
  );

  // ----- filters (Size / Price / Sort) -----
  const [openSize, setOpenSize] = useState(false);
  const [openPrice, setOpenPrice] = useState(false);
  const [openSort, setOpenSort] = useState(false);
  const sizeRef = useRef(null);
  const priceRef = useRef(null);
  const sortRef = useRef(null);
  useClickOutside(sizeRef, () => setOpenSize(false));
  useClickOutside(priceRef, () => setOpenPrice(false));
  useClickOutside(sortRef, () => setOpenSort(false));

  const [sizeQuery, setSizeQuery] = useState("");
  const [selectedSizes, setSelectedSizes] = useState(new Set());
  const [sortBy, setSortBy] = useState("dateNew");

  const { allSizes, minP, maxP } = useMemo(() => {
    const prices = [];
    const sizeCounter = new Map();
    for (const p of productsByCat) {
      const price = Number(p.price || 0);
      if (!Number.isNaN(price)) prices.push(price);
      const sizes = p.size;
      if (Array.isArray(sizes)) {
        sizes.forEach((s) => {
          const k = String(s).trim();
          if (k) sizeCounter.set(k, (sizeCounter.get(k) || 0) + 1);
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
  }, [productsByCat]);

  const [priceMin, setPriceMin] = useState(minP);
  const [priceMax, setPriceMax] = useState(maxP);

  // reset bounds & user filters when category changes
  useEffect(() => {
    setSelectedSizes(new Set());
    setSizeQuery("");
    setSortBy("dateNew");
    setPriceMin(minP);
    setPriceMax(maxP);
  }, [normRoute, minP, maxP]);

  const visibleSizes = useMemo(() => {
    const q = sizeQuery.trim().toLowerCase();
    return q ? allSizes.filter((s) => s.name.toLowerCase().includes(q)) : allSizes;
  }, [allSizes, sizeQuery]);

  const filtered = useMemo(() => {
    const inSize =
      selectedSizes.size === 0
        ? () => true
        : (p) => {
            const s = p.size;
            if (Array.isArray(s)) {
              return s.some((x) => selectedSizes.has(String(x).trim()));
            } else if (typeof s === "string") {
              return s
                .split(",")
                .map((x) => x.trim())
                .some((x) => selectedSizes.has(x));
            }
            return false;
          };
    const inPrice = (p) => {
      const val = Number(p.price || 0);
      return val >= priceMin && val <= priceMax;
    };
    return sortProducts(productsByCat.filter((p) => inSize(p) && inPrice(p)), sortBy);
  }, [productsByCat, selectedSizes, priceMin, priceMax, sortBy]);

  /* ---------------- UI ---------------- */
  return (
    <section className="bg-white w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4">

        {/* Title */}
        <div className="mb-3">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-wide">
            {decodeURIComponent(routeName || "Category")}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Showing <span className="font-semibold">{filtered.length}</span> items
          </p>
        </div>

        {/* ---- Filter bar (Size / Price / Sort) ---- */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b mb-4">

          {/* Left: SIZE & PRICE */}
          <div className="flex items-center gap-3">

            {/* SIZE */}
            <div className="relative" ref={sizeRef}>
              <button
                onClick={() => { setOpenSize((v) => !v); setOpenPrice(false); setOpenSort(false); }}
                className="h-9 px-3 border rounded text-[12px] font-semibold uppercase tracking-wide hover:bg-gray-50"
              >
                Size <span className="ml-1">▾</span>
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
                        <label key={s.name} className="flex items-center gap-2 py-1 text-sm cursor-pointer">
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
                            {s.name} <span className="text-gray-500 ml-1">({s.count})</span>
                          </span>
                        </label>
                      );
                    })}
                    {!visibleSizes.length && (
                      <div className="py-6 text-center text-sm text-gray-500">No match</div>
                    )}
                  </div>
                  {!!selectedSizes.size && (
                    <div className="pt-2 mt-2 border-t">
                      <button onClick={() => setSelectedSizes(new Set())} className="text-xs text-gray-600 hover:text-black">
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
                onClick={() => { setOpenPrice((v) => !v); setOpenSize(false); setOpenSort(false); }}
                className="h-9 px-3 border rounded text-[12px] font-semibold uppercase tracking-wide hover:bg-gray-50"
              >
                Price <span className="ml-1">▾</span>
              </button>

              {openPrice && (
                <div className="absolute z-30 mt-2 w-80 max-w-[90vw] bg-white border rounded shadow-lg p-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={Math.floor(priceMin)}
                      onChange={(e) => setPriceMin(Math.min(Number(e.target.value || 0), priceMax))}
                      className="w-28 h-8 px-2 border rounded text-sm"
                    />
                    <span className="px-1">–</span>
                    <input
                      type="number"
                      value={Math.ceil(priceMax)}
                      onChange={(e) => setPriceMax(Math.max(Number(e.target.value || 0), priceMin))}
                      className="w-28 h-8 px-2 border rounded text-sm"
                    />
                  </div>

                  {/* dual slider */}
                  <div className="mt-3 px-1">
                    <div className="relative h-5">
                      <input
                        type="range"
                        min={minP}
                        max={maxP}
                        value={priceMin}
                        onChange={(e) => setPriceMin(Math.min(Number(e.target.value), priceMax))}
                        className="absolute inset-0 w-full pointer-events-auto"
                      />
                      <input
                        type="range"
                        min={minP}
                        max={maxP}
                        value={priceMax}
                        onChange={(e) => setPriceMax(Math.max(Number(e.target.value), priceMin))}
                        className="absolute inset-0 w-full pointer-events-auto"
                      />
                    </div>
                    <div className="mt-2 flex justify-between text-[12px] text-gray-600">
                      <span>Tk {Math.floor(priceMin).toLocaleString()}</span>
                      <span>Tk {Math.ceil(priceMax).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="pt-2 mt-3 border-t flex gap-3">
                    <button onClick={() => { setPriceMin(minP); setPriceMax(maxP); }} className="text-xs text-gray-600 hover:text-black">
                      Reset
                    </button>
                    <button onClick={() => setOpenPrice(false)} className="ml-auto px-3 h-8 rounded bg-black text-white text-xs">
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
              onClick={() => { setOpenSort((v) => !v); setOpenSize(false); setOpenPrice(false); }}
              className="h-9 px-3 border rounded text-[12px] font-semibold uppercase tracking-wide hover:bg-gray-50"
            >
              {SORT_LABELS[sortBy]} <span className="ml-1">▾</span>
            </button>

            {openSort && (
              <div className="absolute right-0 z-30 mt-2 w-64 bg-white border rounded shadow-lg py-1">
                {Object.entries(SORT_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => { setSortBy(key); setOpenSort(false); }}
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

        {/* ---- Product grid (your same card UI, just uses filtered) ---- */}
        <div className="grid justify-items-center grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {filtered.length ? (
            filtered.map((product, index) => (
              <div key={product._id || index} className="">
                <div className="m-2 md:m-2 lg:m-3 bg-white border border-gray-200 hover:border-purple-400 rounded-xl shadow-md transition-all duration-300">
                  <div className="relative w-full">
                    <span className="absolute bg-gradient-to-r from-blue-500 to-blue-700 text-white text-xs font-medium px-5 py-1.5 rounded-tl-xl rounded-br-2xl transition-transform transition-opacity duration-300 ease-in-out transform hover:scale-105 hover:opacity-90 z-0">
                      Hot
                    </span>
                  </div>

                  <Link to={`/product-details/${product._id}`}>
                    <div className="overflow-hidden w-full relative mx-auto flex justify-center mb-4">
                      <img
                        src={product?.productImage}
                        alt={product?.productName}
                        className="w-full xl:h-[32vh] xl:w-screen h-[20vh] 2xl:h-[30vh] relative z-0 transition-all duration-500 hover:scale-110 ease-in rounded"
                        loading="lazy"
                      />
                    </div>

                    <div className="px-2 py-1.5 md:px-6 md:py-3">
                      <p className="text-gray-500 text-xs font-roboto">
                        {product?.brand || "\u00A0"}
                      </p>

                      <h2 className="text-[14px] md:text-[15px] font-normal md:font-medium text-gray-800 mb-0 mt-1 h-[50px] font-poppins">
                        {product?.productName?.length > 34
                          ? `${product.productName.substring(0, 34)}...`
                          : product?.productName || "\u00A0"}
                      </h2>

                      <div className="flex items-center mb-2 space-x-[4px]">
                        {[...Array(5)].map((_, i) => (
                          <button key={i} type="button" className="size-3 inline-flex justify-center items-center text-lg rounded-full text-yellow-400">
                            <svg className="shrink-0 size-3.5" xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                            </svg>
                          </button>
                        ))}
                        <span className="text-gray-500 text-sm ml-2">(5.0)</span>
                      </div>
                    </div>
                  </Link>

                  <div className="flex justify-between px-2 md:px-4 pb-2">
                    <div className="flex items-center justify-between gap-2.5 mb-0 md:mb-4">
                      <div className="text-base font-bold text-gray-800">
                        ৳ {product?.price}
                      </div>
                      <div className="text-xs line-through text-gray-400">৳32.8</div>
                    </div>

                    <Link to={`/product-details/${product._id}`} className="hidden sm:block">
                      <button className="font-poppins bg-gradient-to-r from-[#D425FE] to-[#7E15FC] text-white font-light px-1.5 py-1.5 rounded-md flex items-center text-sm transform transition-transform duration-300 ease-in-out hover:scale-105 hover:opacity-90">
                        Add cart
                      </button>
                    </Link>
                  </div>

                  <Link to={`/product-details/${product._id}`} className="block lg:hidden pb-2.5">
                    <div className="flex justify-center items-center h-12">
                      <button className="font-poppins bg-gradient-to-r from-[#D425FE] to-[#7E15FC] text-white font-light px-1.5 py-2 rounded-md flex justify-center items-center text-base transform transition-transform duration-300 ease-in-out hover:scale-105 hover:opacity-90 w-40">
                        Add to cart
                      </button>
                    </div>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="py-10 text-center">No products found</p>
          )}
        </div>
      </div>
    </section>
  );
}
