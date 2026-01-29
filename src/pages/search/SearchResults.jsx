import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

const withBase = (p) => {
  const base = import.meta.env.VITE_APP_SERVER_URL || "";
  return `${base.replace(/\/$/,"")}/${String(p).replace(/^\//,"")}`;
};

const pickImg = (p) =>
  Array.isArray(p?.productImage) ? p.productImage[0] : p?.productImage || "/placeholder.png";

export default function SearchResults() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";

  const { data, isLoading, error } = useQuery({
    queryKey: ["search", q],
    queryFn: async () => {
      if (!q) return [];
      const res = await fetch(withBase(`api/products/search?q=${encodeURIComponent(q)}`), {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to search");
      return res.json();
    },
    enabled: !!q,
    staleTime: 15_000,
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">
        Search results {q ? `for "${q}"` : ""}
      </h1>

      {isLoading && <div className="py-8">Searching…</div>}
      {error && <div className="py-8 text-red-600">Error: {error.message}</div>}

      {!isLoading && !error && (
        <>
          {(!data || data.length === 0) ? (
            <div className="py-8 text-gray-600">No products found.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {data.map((p) => (
                <Link
                  key={p._id}
                  to={`/product-details/${p._id}`}
                  className="bg-white border rounded-lg p-3 hover:shadow transition"
                >
                  <img
                    src={pickImg(p)}
                    alt={p.productName}
                    className="w-full h-40 object-contain mb-2"
                  />
                  <div className="text-sm text-gray-500">{p.brand || "\u00A0"}</div>
                  <div className="font-medium line-clamp-2">{p.productName}</div>
                  <div className="text-indigo-600 font-bold mt-1">৳ {p.price}</div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
