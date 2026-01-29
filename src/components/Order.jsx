import { useQuery } from "@tanstack/react-query";
import React, { useMemo, useState, useEffect } from "react";
import { useUser } from "../hooks/userContext";

const statusColor = (s) => {
  const v = (s || "").toLowerCase();
  if (v === "pending") return "bg-amber-100 text-amber-800 ring-1 ring-amber-200";
  if (v === "processing")
    return "bg-blue-100 text-blue-800 ring-1 ring-blue-200";
  if (v === "shipped")
    return "bg-indigo-100 text-indigo-800 ring-1 ring-indigo-200";
  if (v === "delivered")
    return "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200";
  if (v === "cancelled" || v === "canceled")
    return "bg-rose-100 text-rose-800 ring-1 ring-rose-200";
  return "bg-gray-100 text-gray-800 ring-1 ring-gray-200";
};

const formatDateBD = (dateString) => {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Dhaka",
    }).format(new Date(dateString));
  } catch {
    return "—";
  }
};

const formatBDTCurrency = (n) => {
  if (typeof n !== "number") return n ?? "—";
  try {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return n;
  }
};

const Toolbar = ({
  search,
  setSearch,
  sortBy,
  setSortBy,
  pageSize,
  setPageSize,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 mb-4">
      <div className="relative md:w-80">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by product or order ID…"
          className="w-80 max-w-full pl-10 pr-3 py-1 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Search orders"
        />
        <svg
          className="w-4 h-4 absolute left-3 top-2.5 text-gray-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-4.3-4.3m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.2 12.2z"
          />
        </svg>
      </div>

      <div className="flex items-center gap-3">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-1 rounded border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500"
          aria-label="Sort by"
        >
          <option value="date_desc">Sort: Date ↓</option>
          <option value="date_asc">Sort: Date ↑</option>
          <option value="price_desc">Sort: Price ↓</option>
          <option value="price_asc">Sort: Price ↑</option>
          <option value="status">Sort: Status</option>
        </select>

        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="px-3 py-1 rounded border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500"
          aria-label="Rows per page"
        >
          {[5, 10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n} / page
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-sm p-4">
    {[...Array(6)].map((_, i) => (
      <div
        key={i}
        className="grid grid-cols-7 gap-4 py-3 border-b last:border-0 animate-pulse"
      >
        <div className="h-4 bg-gray-200 rounded col-span-1" />
        <div className="h-24 w-20 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded col-span-2" />
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-6 bg-gray-200 rounded-full" />
      </div>
    ))}
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm">
    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-3">
      <svg
        className="w-8 h-8 text-blue-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 17v-6h13M9 7h13M4 7h.01M4 17h.01"
        />
      </svg>
    </div>
    <h3 className="text-lg font-semibold">No orders found</h3>
    <p className="text-sm text-gray-600 mt-1">
      You haven’t placed any orders yet. Browse products and start shopping!
    </p>
    <a
      href="/"
      className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
    >
      Go to Shop
    </a>
  </div>
);

const Order = () => {
  const { user, loading: isUserLoading } = useUser();
  const userId = user?.id;

  // UI state
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => setPage(1), [search, sortBy, pageSize]);

  const baseUrl = useMemo(() => {
    const u = import.meta.env.VITE_APP_SERVER_URL || "";
    return u.endsWith("/") ? u : `${u}/`;
  }, []);

  const {
    data: orders = [],
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["orders", userId],
    enabled: !!userId,
    queryFn: async ({ signal }) => {
      const res = await fetch(`${baseUrl}api/orders/${userId}`, { signal });
      if (!res.ok) throw new Error(`Failed to load orders (${res.status})`);
      return res.json();
    },
    staleTime: 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });

  // Flatten to row list (1 row per product)
  const rows = useMemo(() => {
    return (orders || []).flatMap((order) =>
      (order.products || []).map((p, idx) => {
        const product = p?.product || {};
        const rawImage = product.productImage;

        const firstImage = Array.isArray(rawImage)
          ? rawImage[0]
          : rawImage || null;

        return {
          key: `${order._id}-${product._id || idx}`,
          shortId: order._id?.substring(0, 4) || "—",
          image: firstImage,
          name: product.productName || "—",
          date: order.createdAt,
          price: order.totalPrice,
          status: order.orderStatus,
          qty: p?.quantity || 1,
          size: p?.selectedSize || p?.size || null,
          color: p?.selectedColor || p?.color || null,
        };
      })
    );
  }, [orders]);

  // Search
  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (r) =>
        (r.name || "").toLowerCase().includes(q) ||
        (r.shortId || "").toLowerCase().includes(q)
    );
  }, [rows, search]);

  // Sort
  const sorted = useMemo(() => {
    const list = [...filtered];
    if (sortBy === "date_desc")
      list.sort((a, b) => new Date(b.date) - new Date(a.date));
    else if (sortBy === "date_asc")
      list.sort((a, b) => new Date(a.date) - new Date(b.date));
    else if (sortBy === "price_desc")
      list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    else if (sortBy === "price_asc")
      list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    else if (sortBy === "status")
      list.sort((a, b) => (a.status || "").localeCompare(b.status || ""));
    return list;
  }, [filtered, sortBy]);

  // Pagination
  const total = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const current = sorted.slice((page - 1) * pageSize, page * pageSize);

  // UI states
  if (isUserLoading && !userId) {
    return (
      <div className="p-2 mt-6">
        <h1 className="text-2xl font-semibold mb-4">All Orders</h1>
        <LoadingSkeleton />
      </div>
    );
  }
  if (isLoading || isFetching) {
    return (
      <div className="p-2 mt-6">
        <h1 className="text-2xl font-semibold mb-4">All Orders</h1>
        <LoadingSkeleton />
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-6 mt-10 bg-white rounded-2xl shadow-sm text-center">
        <h2 className="text-xl font-semibold text-rose-600">
          Couldn’t load orders
        </h2>
        <p className="text-gray-600 mt-1">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
        <button
          onClick={() => location.reload()}
          className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }
  if (!orders || orders.length === 0 || current.length === 0) {
    return (
      <div className="p-2 mt-6">
        <h1 className="text-2xl font-semibold mb-4">All Orders</h1>
        <EmptyState />
      </div>
    );
  }

  const qtyBadge =
    "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-gray-100 text-gray-700 border border-gray-200";
  const sizeBadge =
    "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-blue-50 text-blue-700 border border-blue-100";
  const colorBadge =
    "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-purple-50 text-purple-700 border border-purple-100";

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-semibold ">All Orders</h1>
        <span className="text-sm text-gray-600">
          {total} item{total > 1 ? "s" : ""}
        </span>
      </div>

      <Toolbar
        search={search}
        setSearch={setSearch}
        sortBy={sortBy}
        setSortBy={setSortBy}
        pageSize={pageSize}
        setPageSize={setPageSize}
        className=""
      />

      {/* Desktop Table */}
      <div className="p-0 md:p-4 hidden md:block bg-white shadow-sm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[920px] w-full">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr className="text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Images</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Order Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {current.map((r) => (
                <tr key={r.key} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {r.shortId}
                  </td>
                  <td className="px-6 py-3">
                    {r.image ? (
                      <div className="w-16 h-14 rounded-sm bg-gray-50 border flex items-center justify-center overflow-hidden">
                        <img
                          src={r.image}
                          alt={r.name}
                          className="h-full w-full object-contain"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">No Image</span>
                    )}
                  </td>
                  <td
                    className="px-6 py-4 text-sm text-gray-700 max-w-[320px]"
                    title={r.name}
                  >
                    <div className="flex flex-col">
                      <span className="truncate">{r.name}</span>

                      {(r.size || r.color || r.qty) && (
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {r.qty && (
                            <span className={qtyBadge}>Qty: {r.qty}</span>
                          )}
                          {r.size && (
                            <span className={sizeBadge}>Size: {r.size}</span>
                          )}
                          {r.color && (
                            <span className={colorBadge}>
                              <span className="mr-1">Color: {r.color}</span>
                              <span
                                className="inline-block w-2.5 h-2.5 rounded-full border border-white/60"
                                style={{ background: r.color }}
                              />
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDateBD(r.date)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatBDTCurrency(r.price)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor(
                        r.status
                      )}`}
                    >
                      {r.status || "Unknown"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-white">
          <p className="text-sm text-gray-600">
            Page <span className="font-medium">{page}</span> of{" "}
            <span className="font-medium">{pageCount}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-300 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={page === pageCount}
              className="px-3 py-1.5 rounded-lg border border-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3 mt-4">
        {current.map((r) => (
          <div key={r.key} className="bg-white rounded shadow-sm p-2.5">
            <div className="flex gap-3">
              {r.image ? (
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
  <img
    src={r.image}
    alt={r.name}
    className="w-full h-full object-contain p-1"
    loading="lazy"
  />
</div>

              ) : (
                <div className="w-20 h-24 rounded-xl bg-gray-100" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">#{r.shortId}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColor(
                      r.status
                    )}`}
                  >
                    {r.status || "Unknown"}
                  </span>
                </div>
                <h3
                  className="text-sm font-medium text-gray-900 w-60 xl:w-full"
                  title={r.name}
                >
                  {r.name}
                </h3>
                <div className="mt-1 text-xs text-gray-600">
                  {formatDateBD(r.date)} • {formatBDTCurrency(r.price)}
                </div>

                {(r.size || r.color || r.qty) && (
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {r.qty && (
                      <span className={qtyBadge}>Qty: {r.qty}</span>
                    )}
                    {r.size && (
                      <span className={sizeBadge}>Size: {r.size}</span>
                    )}
                    {r.color && (
                      <span className={colorBadge}>
                        <span className="mr-1">Color: {r.color}</span>
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full border border-white/60"
                          style={{ background: r.color }}
                        />
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Pagination Mobile */}
        <div className="flex items-center justify_between px-1 py-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg border border-gray-300 disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">
            {page} / {pageCount}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={page === pageCount}
            className="px-3 py-1.5 rounded-lg border border-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Order;
