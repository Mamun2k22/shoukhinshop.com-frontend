import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Loader from "../../Spinner/Loader";

const ProductCategory = () => {
  const BASE = import.meta.env.VITE_APP_SERVER_URL;

  const toAbsoluteUrl = (baseUrl, path) => {
    if (!path) return "";
    const s = String(path);
    if (s.startsWith("http://") || s.startsWith("https://")) return s;

    const baseClean = String(baseUrl || "").replace(/\/$/, "");
    if (s.startsWith("/")) return `${baseClean}${s}`;
    return `${baseClean}/${s}`;
  };

  const fallback =
    "https://via.placeholder.com/300x300?text=Category";

  const {
    data: categories = [],
    error,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch(`${BASE}api/categories`);
      if (!res.ok) throw new Error("Failed to load categories");
      return res.json();
    },
  });

  if (isLoading || isFetching) return <Loader />;
  if (error)
    return (
      <div className="py-10 text-center text-red-500 font-medium">
        Error loading categories
      </div>
    );

  return (
    <section className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-slate-900">
            Top Categories
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Browse popular categories
          </p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
          {categories.map((cat, idx) => {
            const to = `/category/${encodeURIComponent(cat?.slug || cat?.name)}`;
            const imgSrc = toAbsoluteUrl(BASE, cat?.image);

            return (
              <Link
                key={cat?._id || idx}
                to={to}
                className="group text-center"
              >
                {/* Circle Image */}
                <div className="mx-auto w-24 h-24 rounded-full overflow-hidden bg-white shadow-sm border border-[#f890bc] 
                                flex items-center justify-center transition 
                                group-hover:shadow-md group-hover:scale-105 duration-300">
                  <img
                    src={imgSrc || fallback}
                    alt={cat?.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.src = fallback)}
                  />
                </div>

                {/* Title */}
                <h3 className="mt-3 text-sm font-semibold text-slate-900 truncate">
                  {cat?.name}
                </h3>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProductCategory;
