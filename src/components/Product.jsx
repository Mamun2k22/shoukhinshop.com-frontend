// Product.jsx
import React, { useMemo, useState, lazy, Suspense, useEffect } from "react";
import {
  FaPlus, FaSearch, FaTrash, FaEdit,
  FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight
} from "react-icons/fa";
import AddProduct from "./AddProduct";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import useLoading from "../hooks/useLoading";
import Loader from "../Spinner/Loader";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const ProductEdit = lazy(() => import("./ProductEdit"));

const PAGE_SIZE_OPTIONS = [10, 20, 50];

// ---------- small helpers ----------
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

function usePageWindow(page, totalPages, windowSize = 1) {
  return useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = new Set([1, totalPages, 2, totalPages - 1]);
    for (let i = page - windowSize; i <= page + windowSize; i++) {
      if (i > 1 && i < totalPages) pages.add(i);
    }
    const sorted = Array.from(pages).sort((a, b) => a - b);
    const out = [];
    for (let i = 0; i < sorted.length; i++) {
      out.push(sorted[i]);
      if (sorted[i + 1] && sorted[i + 1] - sorted[i] > 1) out.push("…");
    }
    return out;
  }, [page, totalPages, windowSize]);
}

export default function Product() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // pagination + search
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [query, setQuery] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  // debounce search (300ms)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const { isLoading: deleting, showLoader, hideLoader } = useLoading();
  const queryClient = useQueryClient();

  // --- API: list
  const fetchProducts = async ({ queryKey }) => {
    const [, { page, limit, q }] = queryKey;
    const res = await fetch(
      `${import.meta.env.VITE_APP_SERVER_URL}api/products?page=${page}&limit=${limit}&q=${encodeURIComponent(q || "")}`,
      { credentials: "include" }
    );
    if (!res.ok) throw new Error("Failed to load products");
    return res.json();
  };

  const {
    data,
    isLoading,
    isFetching,
    refetch,
    error,
    isPreviousData,
  } = useQuery({
    queryKey: ["products", { page, limit, q: debouncedQ }],
    queryFn: fetchProducts,
    keepPreviousData: true,
    staleTime: 10_000,
    placeholderData: (prev) => prev,
  });

  const items      = data?.items || [];
  const total      = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  // যদি কোনো পেজে শেষ আইটেমটা ডিলিট হয়, আগের পেজে নেমে যাও (safer)
  useEffect(() => {
    if (!isFetching && page > 1 && items.length === 0 && total > 0) {
      setPage(p => p - 1);
    }
  }, [items.length, isFetching, page, total]);

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedProduct(null);
  };

  // --- SweetAlert2 confirm
  const confirmDelete = () =>
    Swal.fire({
      title: "Delete product?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      buttonsStyling: true,
      heightAuto: false,
    }).then((r) => r.isConfirmed);

  // --- Delete mutation (optimistic update on exact key)
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(
        `${import.meta.env.VITE_APP_SERVER_URL}api/products/${id}`,
        { method: "DELETE", credentials: "include" }
      );
      if (!response.ok) {
        let msg = "Failed to delete the product";
        try {
          const j = await response.json();
          msg = j?.message || msg;
        } catch {}
        throw new Error(msg);
      }
      return await response.json();
    },

    onMutate: async (id) => {
      showLoader();

      // exact key: current table view
      const currentKey = ["products", { page, limit, q: debouncedQ }];
      await queryClient.cancelQueries({ queryKey: currentKey });

      const previous = queryClient.getQueryData(currentKey);

      if (previous?.items) {
        const nextTotal = Math.max(0, (previous.total ?? 0) - 1);
        const nextTotalPages = Math.max(1, Math.ceil(nextTotal / limit));
        queryClient.setQueryData(currentKey, {
          ...previous,
          items: previous.items.filter((p) => p._id !== id),
          total: nextTotal,
          totalPages: nextTotalPages,
        });
      }

      // (optional) অন্য variants-এও প্রয়োগ
      const snapshotsAll = queryClient.getQueriesData({ queryKey: ["products"] });
      snapshotsAll.forEach(([key, old]) => {
        if (!old?.items) return;
        queryClient.setQueryData(key, {
          ...old,
          items: old.items.filter((p) => p._id !== id),
          total: Math.max(0, (old.total || 0) - 1),
        });
      });

      return { previous, currentKey, snapshotsAll };
    },

    onError: (err, _id, ctx) => {
      if (ctx?.currentKey && ctx?.previous) {
        queryClient.setQueryData(ctx.currentKey, ctx.previous);
      }
      ctx?.snapshotsAll?.forEach(([key, data]) => queryClient.setQueryData(key, data));
      Swal.fire({ icon: "error", title: err?.message || "Delete failed", timer: 1500, showConfirmButton: false });
    },

    onSettled: () => {
      hideLoader();
      // server truth-sync (current + other pages)
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const handleDelete = async (id) => {
    const ok = await confirmDelete();
    if (!ok) return;
    deleteMutation.mutate(id);
  };

  if (isLoading) return <Loader />;
  if (error) return <div className="p-4 text-red-600">Error: {error.message}</div>;

  return (
    <div className="p-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <h1 className="font-medium text-2xl">All Products</h1>

        {/* Search */}
        <div className="flex items-center bg-white rounded-lg shadow-md border border-gray-200 px-3 py-2.5 w-full md:w-1/3">
          <FaSearch className="text-gray-400 mr-2" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            type="text"
            placeholder="Search by name or SKU..."
            className="flex-1 outline-none text-sm text-gray-600 placeholder-gray-400"
          />
        </div>

        {/* Add product */}
        <div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-white gap-2 bg-blue-500 px-4 py-2.5 rounded-lg text-sm font-bold cursor-pointer flex items-center"
          >
            <FaPlus />
            Add Product
          </button>

          {/* Add modal: সফল হলে products invalidate */}
          <AddProduct
            isOpen={isModalOpen}
            isClose={() => setIsModalOpen(false)}
            refetch={() => queryClient.invalidateQueries({ queryKey: ["products"] })}
          />
        </div>
      </div>

      {/* Table */}
      <div className="mt-5 overflow-x-auto border rounded-lg border-gray-300 bg-white">
        <table className="table-auto min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <Th>Product Image</Th>
              <Th>Product Name</Th>
              <Th>SKU</Th>
              <Th>Updated</Th>
              <Th>Price</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {isFetching && items.length === 0
              ? [...Array(limit)].map((_, i) => <SkeletonRow key={i} />)
              : items.map((product) => {
                  const img =
                    Array.isArray(product.productImage) && product.productImage.length > 0
                      ? product.productImage[0]
                      : typeof product.productImage === "string"
                        ? product.productImage
                        : "/placeholder.png";

                  return (
                    <tr key={product._id} className="bg-white hover:bg-gray-50">
                      <td className="py-3">
                        <div className="flex justify-center">
                          <img
                            alt={product.productName}
                            src={img}
                            className="object-cover w-24 h-20 mx-auto rounded-md"
                            loading="lazy"
                          />
                        </div>
                      </td>

                      <td className="px-5 py-3">
                        <div className="w-48">
                          <p className="font-normal text-sm text-gray-900">
                            {product.productName}
                          </p>
                        </div>
                      </td>

                      <td className="p-5 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.sku || "—"}
                      </td>

                      <td className="p-5 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.updatedAt
                          ? new Date(product.updatedAt).toISOString().slice(0, 10)
                          : "—"}
                      </td>

                      <td className="p-5 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.price}
                      </td>

                      <td className="p-5 whitespace-nowrap text-sm font-medium text-gray-900">
                        <span className="py-1.5 px-2.5 bg-emerald-50 rounded-full inline-flex items-center gap-1">
                          <span className="inline-block w-2 h-2 bg-emerald-600 rounded-full" />
                          <span className="font-medium text-xs text-emerald-600">
                            Active
                          </span>
                        </span>
                      </td>

                      <td className="p-5 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditClick(product)}
                            title="Update"
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-white border hover:bg-indigo-600 group"
                          >
                            <FaEdit className="text-indigo-600 group-hover:text-white" />
                          </button>

                          <button
                            onClick={() => handleDelete(product._id)}
                            title="Delete"
                            disabled={deleteMutation.isPending || deleting}
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-white border hover:bg-red-600 disabled:opacity-50 group"
                          >
                            <FaTrash className="text-red-600 group-hover:text-white" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
            }
          </tbody>
        </table>
      </div>

      {/* Edit Modal (table-এর বাইরে, single instance) */}
      {isEditModalOpen && (
        <Suspense fallback={<Loader />}>
          <ProductEdit
            product={selectedProduct}
            isOpen={isEditModalOpen}
            isClose={handleCloseModal}
            refetch={() => queryClient.invalidateQueries({ queryKey: ["products"] })}
          />
        </Suspense>
      )}

      {/* Pagination */}
      <ProductsPagination
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        total={total}
        totalPages={totalPages}
        isFetching={isFetching}
        isPreviousData={isPreviousData}
        PAGE_SIZE_OPTIONS={PAGE_SIZE_OPTIONS}
      />

      <ToastContainer position="top-center" autoClose={2000} hideProgressBar />
    </div>
  );
}

/* ---------- Sub-components ---------- */
const Th = ({ children }) => (
  <th className="p-5 text-left whitespace-nowrap text-sm leading-6 font-semibold text-gray-900 capitalize">
    {children}
  </th>
);

const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="py-4"><div className="mx-auto w-24 h-20 bg-gray-200 rounded" /></td>
    <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-40" /></td>
    <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-20" /></td>
    <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
    <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-16" /></td>
    <td className="px-5 py-4"><div className="h-6 bg-gray-200 rounded w-20" /></td>
    <td className="px-5 py-4"><div className="h-8 bg-gray-200 rounded w-24" /></td>
  </tr>
);

/* ---------- Pagination ---------- */
function ProductsPagination({
  page,
  setPage,
  limit,
  setLimit,
  total,
  totalPages,
  isFetching,
  isPreviousData,
  PAGE_SIZE_OPTIONS = [10, 20, 50],
}) {
  const canPrev = page > 1;
  const canNext = page < totalPages;
  const windowPages = usePageWindow(page, totalPages, 1);

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="mt-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Left: meta info */}
        <div className="text-sm text-gray-600">
          {total > 0 ? (
            <>
              Showing <span className="font-medium">{from}</span>–<span className="font-medium">{to}</span>{" "}
              of <span className="font-semibold">{total}</span>
            </>
          ) : (
            "No results"
          )}
          {isFetching && <span className="ml-2 animate-pulse text-gray-400">Updating…</span>}
        </div>

        {/* Right: controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Rows per page */}
          <label className="flex items-center gap-2 text-sm text-gray-600 bg-white border rounded-xl px-3 py-1.5">
            <span className="hidden sm:inline">Rows:</span>
            <select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              className="bg-transparent outline-none text-gray-900"
            >
              {PAGE_SIZE_OPTIONS.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>

          {/* Pagination buttons */}
          <nav
            className="flex items-center gap-1 bg-white border rounded-xl px-1.5 py-1 shadow-sm"
            aria-label="Pagination"
          >
            <button
              className="px-2 py-1 rounded-lg hover:bg-gray-100 disabled:opacity-40"
              onClick={() => setPage(1)}
              disabled={!canPrev || isFetching}
              aria-label="First page"
              title="First"
            >
              <FaAngleDoubleLeft />
            </button>
            <button
              className="px-2 py-1 rounded-lg hover:bg-gray-100 disabled:opacity-40"
              onClick={() => setPage(p => clamp(p - 1, 1, totalPages))}
              disabled={!canPrev || isFetching}
              aria-label="Previous page"
              title="Previous"
            >
              <FaChevronLeft />
            </button>

            {/* Page numbers */}
            <div className="hidden sm:flex items-center gap-1">
              {windowPages.map((p, idx) =>
                p === "…" ? (
                  <span key={`dots-${idx}`} className="px-2 text-gray-400">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    disabled={isFetching}
                    aria-current={p === page ? "page" : undefined}
                    className={`px-3 py-1.5 rounded-lg text-sm transition
                      ${p === page
                        ? "bg-blue-600 text-white shadow"
                        : "hover:bg-gray-100 text-gray-700"
                      }`}
                  >
                    {p}
                  </button>
                )
              )}
            </div>

            <button
              className="px-2 py-1 rounded-lg hover:bg-gray-100 disabled:opacity-40"
              onClick={() => setPage(p => clamp(p + 1, 1, totalPages))}
              disabled={!canNext || isFetching || isPreviousData}
              aria-label="Next page"
              title="Next"
            >
              <FaChevronRight />
            </button>
            <button
              className="px-2 py-1 rounded-lg hover:bg-gray-100 disabled:opacity-40"
              onClick={() => setPage(totalPages)}
              disabled={!canNext || isFetching}
              aria-label="Last page"
              title="Last"
            >
              <FaAngleDoubleRight />
            </button>
          </nav>

          {/* Go to page */}
          <form
            className="hidden md:flex items-center gap-2 bg-white border rounded-xl px-3 py-1.5"
            onSubmit={(e) => {
              e.preventDefault();
              const n = Number(e.currentTarget.elements.targetPage.value);
              if (!Number.isNaN(n)) setPage(clamp(n, 1, totalPages));
            }}
          >
            <span className="text-sm text-gray-600">Go to</span>
            <input
              name="targetPage"
              type="number"
              min={1}
              max={totalPages}
              defaultValue={page}
              className="w-16 text-sm border rounded-lg px-2 py-1"
            />
          </form>
        </div>
      </div>
    </div>
  );
}
