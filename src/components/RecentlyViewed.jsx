import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { getRecentlyViewed, clearRecentlyViewed } from "../utils/recentlyViewed";

const fmtBDT = (n) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

export default function RecentlyViewed({ title = "Recently Viewed" }) {
  const [items, setItems] = useState(() => getRecentlyViewed());
  const trackRef = useRef(null);

  const canShow = items?.length > 0;

  useEffect(() => {
    const sync = () => setItems(getRecentlyViewed());
    window.addEventListener("recentlyViewedUpdated", sync);
    window.addEventListener("storage", sync); // other tabs
    return () => {
      window.removeEventListener("recentlyViewedUpdated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const scrollByCard = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    // scroll by container width (nice UX)
    const amount = Math.max(280, el.clientWidth * 0.8);
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  const list = useMemo(() => items || [], [items]);

  if (!canShow) return null;

  return (
    <div className="my-6 rounded-sm border bg-white">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <button
          onClick={() => clearRecentlyViewed()}
          className="text-xs text-gray-500 hover:text-rose-600"
          title="Clear"
        >
          Clear
        </button>
      </div>

      <div className="relative">
        {/* Left */}
        <button
          onClick={() => scrollByCard(-1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full border bg-white shadow-sm hover:bg-gray-50 grid place-items-center"
          aria-label="Scroll left"
        >
          <FiChevronLeft />
        </button>

        {/* Track */}
        <div
          ref={trackRef}
          className="flex gap-4 overflow-x-auto scroll-smooth px-14 py-5"
          style={{ scrollbarWidth: "none" }}
        >
          {list.map((p) => {
            const img = p?.productImage;
            const to = p?.slug ? `/product-details/${p._id}` : `/product-details/${p._id}`;
            return (
              <Link
                to={to}
                key={p._id}
                className="w-[170px] shrink-0 rounded-xl border hover:shadow-md transition bg-white"
                title={p?.productName}
              >
                <div className="h-28 w-full rounded-t-xl bg-gray-50 overflow-hidden grid place-items-center">
                  {img ? (
                    <img src={img} alt={p.productName} className="h-full w-full object-contain" />
                  ) : (
                    <div className="text-xs text-gray-400">No image</div>
                  )}
                </div>

                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 line-clamp-2">
                    {p?.productName || "Unnamed"}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-indigo-600">
                    {fmtBDT(p?.price || 0)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Right */}
        <button
          onClick={() => scrollByCard(1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full border bg-white shadow-sm hover:bg-gray-50 grid place-items-center"
          aria-label="Scroll right"
        >
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
}
