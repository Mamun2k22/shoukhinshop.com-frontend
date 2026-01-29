// src/pages/Brand/AdminBrands.jsx
import React, { useEffect, useState } from "react";
import {
  FiPlus,
  FiRefreshCw,
  FiEdit2,
  FiTrash2,
  FiExternalLink,
} from "react-icons/fi";
import { toast } from "react-toastify";
import BrandModal from "../ui/BrandModal";

const AdminBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
  const [selectedBrand, setSelectedBrand] = useState(null);

  const base = import.meta.env.VITE_APP_SERVER_URL; // e.g. http://localhost:5000/

  // ✅ convert "/uploads/.." => "http://localhost:5000/uploads/.."
  const toAbsoluteUrl = (baseUrl, path) => {
    if (!path) return "";
    const s = String(path);

    if (s.startsWith("http://") || s.startsWith("https://")) return s;

    const baseClean = String(baseUrl || "").replace(/\/$/, "");
    if (s.startsWith("/")) return `${baseClean}${s}`;
    return `${baseClean}/${s}`;
  };

  // ✅ nice placeholder (no broken image icon)
  const makePlaceholder = (name = "Brand") =>
    "data:image/svg+xml;utf8," +
    encodeURIComponent(`
      <svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'>
        <defs>
          <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0' stop-color='#eef2ff'/>
            <stop offset='1' stop-color='#e0f2fe'/>
          </linearGradient>
        </defs>
        <rect width='100%' height='100%' rx='60' fill='url(#g)'/>
        <text x='50%' y='52%' text-anchor='middle' dominant-baseline='middle'
          font-family='Arial, sans-serif' font-size='28' fill='#4f46e5'>
          ${(String(name || "B").trim()[0] || "B").toUpperCase()}
        </text>
      </svg>
    `);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${base}api/brands`);
      const data = await res.json();

      // backend returns array -> safe handling
      setBrands(Array.isArray(data) ? data : data?.brands || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load brands");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAddModal = () => {
    setModalMode("add");
    setSelectedBrand(null);
    setIsModalOpen(true);
  };

  const openEditModal = (brand) => {
    setModalMode("edit");
    setSelectedBrand(brand);
    setIsModalOpen(true);
  };

  const handleModalSuccess = (brand) => {
    if (modalMode === "add") {
      setBrands((prev) => [brand, ...prev]);
      toast.success("Brand added");
    } else {
      setBrands((prev) => prev.map((b) => (b._id === brand._id ? brand : b)));
      toast.success("Brand updated");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this brand?")) return;

    try {
      const res = await fetch(`${base}api/brands/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");

      setBrands((prev) => prev.filter((b) => b._id !== id));
      toast.info("Brand deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete brand");
    }
  };

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-slate-50 via-white to-indigo-50" />

      <div className="mx-auto max-w-full px-0 md:px-2 py-6">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-gray-800">
              Brands
            </h2>
            <p className="text-sm text-gray-500">
              Manage homepage brands & partners from here.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 items-center rounded-full border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-sm">
              Total: <span className="ml-1 font-medium">{brands.length}</span>
            </span>
            <button
              onClick={fetchBrands}
              className="inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <FiRefreshCw />
              Refresh
            </button>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              <FiPlus />
              Add Brand
            </button>
          </div>
        </div>

        {/* Brand Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-xl bg-white shadow-sm border border-gray-200 animate-pulse"
              />
            ))}
          </div>
        ) : brands.length === 0 ? (
          <div className="rounded-2xl border bg-white p-10 text-center text-gray-500 shadow-sm">
            No brands added yet. Click{" "}
            <span className="font-semibold">Add Brand</span> to create one.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {brands.map((brand) => {
              const logoUrl =
                toAbsoluteUrl(base, brand.logo) || makePlaceholder(brand.name);

              return (
                <div
                  key={brand._id}
                  className="group relative flex items-center gap-3 rounded-md border border-gray-200 bg-white px-4 py-3 shadow-sm transition hover:shadow-md"
                >
                  {/* Logo circle */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-indigo-100 bg-indigo-50 overflow-hidden">
                    <img
                      src={logoUrl}
                      alt={brand.name}
                      className="h-10 w-10 object-contain"
                      onError={(e) => {
                        e.currentTarget.src = makePlaceholder(brand.name);
                      }}
                    />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-800">
                      {brand.name}
                    </p>

                    {brand.website ? (
                      <a
                        href={brand.website}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-0.5 inline-flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-600"
                      >
                        <FiExternalLink className="h-3 w-3" />
                        <span className="truncate max-w-[160px]">
                          {brand.website.replace(/^https?:\/\//, "")}
                        </span>
                      </a>
                    ) : (
                      <p className="text-xs text-gray-400">No website added</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => openEditModal(brand)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                      title="Edit"
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(brand._id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                      title="Delete"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Active status pill */}
                  <span
                    className={`absolute -top-2 left-4 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      brand.isActive
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}
                  >
                    {brand.isActive ? "Visible" : "Hidden"}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal */}
        <BrandModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          mode={modalMode}
          initialData={selectedBrand}
          onSuccess={handleModalSuccess}
        />
      </div>
    </div>
  );
};

export default AdminBrands;
