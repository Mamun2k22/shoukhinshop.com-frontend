// src/components/ShopByCategory.jsx
import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

const apiBase = import.meta.env.VITE_APP_SERVER_URL;

const FALLBACK_IMG =
  "https://via.placeholder.com/640x800?text=Category";

// make route like: /category/<encoded slug or name>
const makeCategoryPath = (item, fallbackName) => {
  const base = "/category/";
  if (item?.slug) {
    return base + encodeURIComponent(item.slug);
  }
  const safe = encodeURIComponent(fallbackName || "category");
  return base + safe;
};

const SkeletonCard = () => (
  <div className="animate-pulse bg-white rounded-md overflow-hidden shadow-sm">
    <div className="w-full h-56 md:h-60 lg:h-64 bg-gray-200" />
    <div className="p-3">
      <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
    </div>
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div className="text-center p-6 border rounded-md bg-red-50 border-red-200 text-red-700">
    <p className="mb-3 font-medium">{message || "Something went wrong."}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
      >
        Try again
      </button>
    )}
  </div>
);

const CarowselToCategories = () => {
  const {
    data: raw = [],
    error,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch(`${apiBase}api/categories`, {
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
      }
      return res.json();
    },
    staleTime: 60 * 1000, // 1 min cache
  });

  // normalize API data -> {id, name, img, to}
  const categories = useMemo(() => {
    const arr = Array.isArray(raw) ? raw : raw?.data || [];
    return (arr || []).map((item, idx) => {
      const name =
        item.name ||
        item.title ||
        item.label ||
        item.categoryName ||
        `Category ${idx + 1}`;

      return {
        id: item.id ?? item._id ?? idx,
        name,
        img:
          item.img ||
          item.image ||
          item.imageUrl ||
          item.photo ||
          item.thumbnail ||
          FALLBACK_IMG,
        to: makeCategoryPath(item, name),
      };
    });
  }, [raw]);

  const loading = isLoading || (isFetching && categories.length === 0);

  return (
    <section className="bg-white">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* header row – can rename title */}
     <div className="flex items-center gap-4 my-0 md:my-8">
  <div className="flex-1 h-[3px] bg-gray-300 rounded-full"></div>

  <span className="px-4 py-1 bg-[#6969AD] text-white text-lg font-semibold rounded-full shadow">
    Shop by Category
  </span>

  <div className="flex-1 h-[3px] bg-gray-300 rounded-full"></div>
</div>


        {/* error state */}
        {error && !loading && (
          <ErrorState message={error.message} onRetry={() => refetch()} />
        )}

        {/* grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 mt-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : categories.map((category) => (
                <Link
                  key={category.id}
                  to={category.to}
                  className="group relative overflow-hidden aspect-[775/747] bg-white rounded-md shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  {/* Image */}
                  <img
                    src={category.img}
                    alt={category.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_IMG;
                    }}
                  />

                  {/* dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

                  {/* label */}
                  <span className="absolute left-1/3 -translate-x-1/3 bottom-4 px-4 py-1.5 rounded text-white text-sm font-medium tracking-wide bg-black/40 backdrop-blur-sm">
                    {category.name}
                  </span>
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
};

export default CarowselToCategories;
