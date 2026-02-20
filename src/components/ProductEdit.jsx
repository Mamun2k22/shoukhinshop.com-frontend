import React, { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { FiX, FiUpload, FiTrash, FiCheckCircle } from "react-icons/fi";

const MAX_IMAGES = 4;

const withBase = (p) => {
  const base = import.meta.env.VITE_APP_SERVER_URL || "";
  const needsSlash = base.endsWith("/") ? "" : "/";
  return `${base}${needsSlash}${String(p).replace(/^\/+/, "")}`;
};

const cleanMultiline = (v) =>
  String(v || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .join("\n");

export default function ProductEdit({ isOpen, isClose, product: productToEdit, refetch }) {
  if (!isOpen) return null;

  const id = productToEdit?._id;

  // ---------------- state ----------------
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isColorOpen, setIsColorOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ✅ supplier fields
  const [supplier, setSupplier] = useState("local"); // "local" | "banggomart"
  const [banggoProductId, setBanggoProductId] = useState(""); // keep string in input

  // form state (controlled)
  const [sku, setSku] = useState("");
  const [productName, setProductName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState(""); // keep as string in inputs
  const [discount, setDiscount] = useState("");
  const [status, setStatus] = useState("available");
  const [stock, setStock] = useState("");
  const [details, setDetails] = useState("");
  const [longDetails, setLongDetails] = useState("");
  const [imageUrl, setImageUrl] = useState([]);

  // size only
  const [sizeWeights, setSizeWeights] = useState([{ size: "" }]);
  const [selectedColors, setSelectedColors] = useState([]);

  // keep original product for diffing
  const originalRef = useRef(null);

  // refs for outside click close
  const categoryRef = useRef(null);
  const colorRef = useRef(null);

  // ------------- fetch full product -------------
  const {
    data: fullProduct,
    isLoading: fullLoading,
    error: fullError,
  } = useQuery({
    queryKey: ["product-full", id],
    enabled: isOpen && !!id,
    queryFn: async () => {
      const r = await fetch(withBase(`api/products/${id}`), { credentials: "include" });
      if (!r.ok) throw new Error("Failed to fetch product");
      return r.json();
    },
    staleTime: 0,
  });

  // ------------- fetch dropdown data -------------
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    enabled: isOpen,
    queryFn: async () => {
      const r = await fetch(withBase("api/categories"), { credentials: "include" });
      if (!r.ok) throw new Error("Failed to fetch categories");
      return r.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: colorOptions = [] } = useQuery({
    queryKey: ["colors"],
    enabled: isOpen,
    queryFn: async () => {
      const r = await fetch(withBase("api/colors"), { credentials: "include" });
      if (!r.ok) throw new Error("Failed to fetch colors");
      return r.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const safeCategories = useMemo(() => categories ?? [], [categories]);
  const safeColors = useMemo(() => colorOptions ?? [], [colorOptions]);

  // ------------- hydrate form -------------
  useEffect(() => {
    if (!fullProduct) return;
    originalRef.current = fullProduct;

    setSku(fullProduct.sku ?? "");
    setProductName(fullProduct.productName ?? "");
    setCategoryName(
      typeof fullProduct.categoryName === "string"
        ? fullProduct.categoryName
        : fullProduct.categoryName?.name || ""
    );
    setBrand(fullProduct.brand ?? "");
    setPrice(fullProduct.price ?? "");
    setDiscount(fullProduct.discount ?? "");
    setStatus(fullProduct.status ?? "available");
    setStock(fullProduct.stock ?? "");
    setDetails(fullProduct.details ?? "");
    setLongDetails(fullProduct.longDetails ?? "");

    setImageUrl(
      Array.isArray(fullProduct.productImage)
        ? fullProduct.productImage
        : fullProduct.productImage
        ? [fullProduct.productImage]
        : []
    );

    const sw = Array.isArray(fullProduct.sizeWeight) ? fullProduct.sizeWeight : [];
    setSizeWeights(sw.length ? sw.map((x) => ({ size: x?.size ?? "" })) : [{ size: "" }]);

    setSelectedColors(Array.isArray(fullProduct.color) ? fullProduct.color : []);

    // supplier
    setSupplier(fullProduct?.supplier || "local");
    setBanggoProductId(
      fullProduct?.banggoProductId != null ? String(fullProduct.banggoProductId) : ""
    );
  }, [fullProduct]);

  // ✅ supplier local হলে clear
  useEffect(() => {
    if (supplier !== "banggomart") setBanggoProductId("");
  }, [supplier]);

  // ✅ close dropdowns on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (isDropdownOpen && categoryRef.current && !categoryRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
      if (isColorOpen && colorRef.current && !colorRef.current.contains(e.target)) {
        setIsColorOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [isDropdownOpen, isColorOpen]);

  // ------------- handlers -------------
  const handleCategorySelect = (c) => {
    setCategoryName(c?.name || "");
    setIsDropdownOpen(false);
  };

  const toggleColor = (value) => {
    setSelectedColors((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;

    if (imageUrl.length + files.length > MAX_IMAGES) {
      toast.warn(`Max ${MAX_IMAGES} images allowed.`);
      return;
    }

    setIsUploading(true);
    try {
      const uploads = [...files].map(async (file) => {
        const fd = new FormData();
        fd.append("image", file);

        const r = await fetch(
          "https://api.imgbb.com/1/upload?key=31cbdc0f8e62b64424c515941a8bfd73",
          { method: "POST", body: fd }
        );
        const data = await r.json();
        if (data?.success) return data.data.url;
        throw new Error("Upload failed");
      });

      const results = await Promise.allSettled(uploads);
      const ok = results
        .filter((x) => x.status === "fulfilled")
        .map((x) => x.value);

      if (ok.length) {
        setImageUrl((prev) => [...prev, ...ok].slice(0, MAX_IMAGES));
        toast.success(`${ok.length} image(s) uploaded`);
      }
    } catch {
      toast.error("Image upload failed");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (idx) => setImageUrl((prev) => prev.filter((_, i) => i !== idx));

  // size rows
  const addRow = () => setSizeWeights((p) => [...p, { size: "" }]);
  const changeSize = (i, v) =>
    setSizeWeights((p) => p.map((row, idx) => (idx === i ? { ...row, size: v } : row)));

  // helpers (numbers)
  const toNumOrUndef = (v) => {
    if (v === "" || v == null) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  const toNumOrNull = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  // build sparse payload (only changed)
  const buildPayload = () => {
    const orig = originalRef.current || {};
    const payload = {};

    const push = (key, val, compare = orig[key]) => {
      const isArray = Array.isArray(val);
      const changed = isArray
        ? JSON.stringify(val) !== JSON.stringify(compare ?? [])
        : val !== compare;
      if (changed) payload[key] = val;
    };

    // supplier fields
    push("supplier", supplier, orig.supplier || "local");
    if (supplier === "banggomart") {
      const idNum = toNumOrNull(banggoProductId);
      push("banggoProductId", idNum, orig.banggoProductId ?? null);
    } else {
      push("banggoProductId", null, orig.banggoProductId ?? null);
    }

    // strings (trim + compare)
    const skuTrim = (sku ?? "").trim();
    const pnTrim = (productName ?? "").trim();
    const catTrim = (categoryName ?? "").trim();
    const brandTrim = (brand ?? "").trim();

    if (skuTrim) push("sku", skuTrim, (orig.sku ?? "").trim());
    if (pnTrim) push("productName", pnTrim, (orig.productName ?? "").trim());
    if (catTrim) {
      const origCat =
        typeof orig.categoryName === "string"
          ? orig.categoryName
          : orig.categoryName?.name || "";
      push("categoryName", catTrim, String(origCat || "").trim());
    }
    push("brand", brandTrim, (orig.brand ?? "").trim());

    // numbers
    const p = toNumOrUndef(price);
    if (p !== undefined) push("price", p, orig.price);
    const d = toNumOrUndef(discount);
    if (d !== undefined) push("discount", d, orig.discount);
    const s = toNumOrUndef(stock);
    if (s !== undefined) push("stock", s, orig.stock);

    if ((status ?? "").trim()) push("status", status.trim(), orig.status ?? "available");

    // text (preserve bullet lines)
    const detClean = cleanMultiline(details);
    const longClean = cleanMultiline(longDetails);

    if (detClean) push("details", detClean, cleanMultiline(orig.details));
    if (longClean) push("longDetails", longClean, cleanMultiline(orig.longDetails));

    // arrays
    if (Array.isArray(imageUrl) && imageUrl.length > 0) {
      push("productImage", imageUrl, orig.productImage ?? []);
    }

    const filteredSW = (Array.isArray(sizeWeights) ? sizeWeights : [])
      .map((row) => ({ size: (row.size ?? "").trim() }))
      .filter((row) => row.size);

    if (filteredSW.length > 0) push("sizeWeight", filteredSW, orig.sizeWeight ?? []);

    if (Array.isArray(selectedColors)) push("color", selectedColors, orig.color ?? []);

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id) return;

    // required validation
    if (supplier === "banggomart" && !String(banggoProductId || "").trim()) {
      toast.warn("Banggomart Product ID is required");
      return;
    }

    const payload = buildPayload();
    if (Object.keys(payload).length === 0) {
      toast.info("Nothing to update");
      return;
    }

    setIsSaving(true);
    try {
      const r = await fetch(withBase(`api/products/${id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data?.message || "Failed to update product");

      toast.success("Product updated successfully!");
      refetch?.();
    } catch (err) {
      toast.error(err?.message || "Update failed");
    } finally {
      setIsSaving(false);
    }
  };

  // ------------- loading/error overlays -------------
  if (fullLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-xl shadow p-6 text-sm">Loading…</div>
      </div>
    );
  }
  if (fullError) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-xl shadow p-6 text-sm">Failed to load product.</div>
      </div>
    );
  }

  // ------------- UI -------------
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-[95%] max-w-4xl p-0 overflow-hidden max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50">
              <FiCheckCircle className="text-blue-600" />
            </span>
            <h2 className="text-lg font-semibold">Edit Product</h2>
          </div>
          <button
            onClick={isClose}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <FiX />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4 p-5">
          {/* Left */}
          <div className="space-y-4">
            {/* Supplier */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Supplier</label>
                <select
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full px-3 py-1.5 border rounded-lg"
                >
                  <option value="local">Local</option>
                  <option value="banggomart">Banggomart</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Banggomart Product ID</label>
                <input
                  value={banggoProductId}
                  onChange={(e) => setBanggoProductId(e.target.value)}
                  disabled={supplier !== "banggomart"}
                  placeholder={supplier === "banggomart" ? "e.g. 283" : "N/A"}
                  className="w-full px-3 py-1.5 border rounded-lg disabled:bg-gray-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">SKU</label>
              <input value={sku} onChange={(e) => setSku(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Product Name</label>
              <input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-3 py-1.5 border rounded-lg"
              />
            </div>

            {/* Category */}
            <div className="relative" ref={categoryRef}>
              <label className="block text-sm font-medium mb-1">Category</label>
              <div className="flex">
                <input
                  readOnly
                  value={categoryName}
                  onClick={() => setIsDropdownOpen((v) => !v)}
                  className="w-full px-3 py-1.5 border rounded-l-lg"
                  placeholder="Select category"
                />
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((v) => !v)}
                  className="px-3 border border-l-0 rounded-r-lg bg-gray-50"
                >
                  ▼
                </button>
              </div>

              {isDropdownOpen && (
                <div className="absolute z-10 bg-white border rounded-lg mt-1 w-full shadow max-h-64 overflow-y-auto">
                  {safeCategories.map((c) => (
                    <div
                      key={c._id}
                      onClick={() => handleCategorySelect(c)}
                      className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${
                        categoryName === c.name ? "bg-blue-50 text-blue-700" : ""
                      }`}
                    >
                      {c.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Brand</label>
              <input value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Discount</label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full px-3 py-1.5 border rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg">
                  <option value="available">Available</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg" />
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-4">
            {/* Images */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Product Images <span className="text-gray-500">(max {MAX_IMAGES})</span>
              </label>

              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiUpload />
                  <span>Click to upload</span>
                </div>
                <input
                  type="file"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={imageUrl.length >= MAX_IMAGES}
                />
              </label>

              {isUploading && <p className="text-xs text-gray-500 mt-1">Uploading…</p>}

              {!!imageUrl.length && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                  {imageUrl.map((url, idx) => (
                    <div key={idx} className="relative group">
                      <img src={url} alt="" className="w-full h-28 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 p-1.5 bg-white/90 rounded-full shadow"
                        title="Remove"
                      >
                        <FiTrash className="text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sizes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Sizes</label>
                <button type="button" onClick={addRow} className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700">
                  + Add Row
                </button>
              </div>

              <div className="space-y-2">
                {sizeWeights.map((sw, i) => (
                  <div key={i} className="grid grid-cols-1 gap-2">
                    <input
                      value={sw.size}
                      onChange={(e) => changeSize(i, e.target.value)}
                      placeholder="Size (e.g. S, M, L, XL)"
                      className="px-3 py-1.5 border rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="relative" ref={colorRef}>
              <label className="block text-sm font-medium mb-1">Colors</label>

              <div
                className="w-full px-3 py-2 border rounded-lg cursor-pointer bg-white"
                onClick={() => setIsColorOpen((v) => !v)}
              >
                {selectedColors.length ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedColors.map((c, i) => (
                      <span
                        key={`${c}-${i}`}
                        className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs bg-gray-100"
                      >
                        {!/^#/.test(c) && <span>{c}</span>}
                        <span className="w-3 h-3 rounded-full border" style={{ background: c }} />
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500 text-sm">Select colors</span>
                )}
              </div>

              {isColorOpen && (
                <div className="absolute z-10 w-full bg-white border rounded-lg mt-1 max-h-56 overflow-y-auto shadow">
                  {safeColors.map((clr) => {
                    const value = clr.name || clr.code;
                    const active = selectedColors.includes(value);
                    return (
                      <div
                        key={clr._id || value}
                        onClick={() => toggleColor(value)}
                        className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-50 ${
                          active ? "bg-blue-50" : ""
                        }`}
                      >
                        <span className="text-sm">{clr.name || clr.code}</span>
                        <span
                          className={`w-5 h-5 rounded-full border ${active ? "ring ring-blue-400" : ""}`}
                          style={{ background: clr.code || clr.name }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-2 grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Brief description <span className="text-xs text-gray-500">(optional bullets)</span>
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Short points:\nSoft material\nLightweight\nGood for daily use`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Full description <span className="text-xs text-gray-500">(one point per line)</span>
              </label>
              <textarea
                value={longDetails}
                onChange={(e) => setLongDetails(e.target.value)}
                rows={7}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`One point per line:\nBPA-free silicone\nEasy to sterilize\nAnti-colic valve reduces gas\nPack includes: 2 | Age: 0m+`}
              />
              <p className="mt-1 text-xs text-gray-500">
                Tip: Press <b>Enter</b> to add a new bullet line.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="md:col-span-2 flex items-center justify-between pt-2">
            <button type="button" onClick={isClose} className="px-4 py-2 rounded-lg border hover:bg-gray-50">
              Close
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-60"
            >
              {isSaving ? "Updating…" : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}