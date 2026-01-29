import React, { useMemo, useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import { FiX, FiUpload, FiTrash, FiCheckCircle } from "react-icons/fi";
import "react-toastify/dist/ReactToastify.css";
import { FaChevronDown } from "react-icons/fa";

const MAX_IMAGES = 4;

const withBase = (path) => {
  const base = import.meta.env.VITE_APP_SERVER_URL || "";
  const needsSlash = base.endsWith("/") ? "" : "/";
  return `${base}${needsSlash}${String(path).replace(/^\/+/, "")}`;
};

const isNonEmpty = (v) => typeof v === "string" && v.trim().length > 0;

const AddProduct = ({ isOpen, isClose, refetch }) => {
  if (!isOpen) return null;

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [imageUrl, setImageUrl] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // 🔥 এখন থেকে শুধু size রাখব
  const [sizeWeights, setSizeWeights] = useState([{ size: "" }]);

  const [selectedColors, setSelectedColors] = useState([]);
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  // ✅ Delivery system
  const USE_FREE_DELIVERY_ZONES = true;
  const [deliveryType, setDeliveryType] = useState("cash_on_delivery"); // default COD
  const [deliveryZone, setDeliveryZone] = useState("inside_dhaka"); // only when free_delivery

  const dropdownRef = useRef(null);

  // ---------- Data fetching ----------

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const r = await fetch(withBase("api/categories"), {
        credentials: "include",
      });
      if (!r.ok) throw new Error("Failed to fetch categories");
      return r.json();
    },
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const {
    data: subcategories = [],
    isLoading: subcategoriesLoading,
    error: subcategoriesError,
  } = useQuery({
    queryKey: ["subcategories"],
    queryFn: async () => {
      const r = await fetch(withBase("api/subcategories"), {
        credentials: "include",
      });
      if (!r.ok) throw new Error("Failed to fetch subcategories");
      return r.json();
    },
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const {
    data: colorOptions = [],
    isLoading: colorsLoading,
    error: colorError,
  } = useQuery({
    queryKey: ["colors"],
    queryFn: async () => {
      const r = await fetch(withBase("api/colors"), {
        credentials: "include",
      });
      if (!r.ok) throw new Error("Failed to fetch colors");
      return r.json();
    },
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const safeCategories = useMemo(() => categories ?? [], [categories]);
  const safeColors = useMemo(() => colorOptions ?? [], [colorOptions]);

  useEffect(() => {
    if (!isDropdownOpen) return;
    const onDocClick = (e) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target)) setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [isDropdownOpen]);

  useEffect(() => {
    if (deliveryType !== "free_delivery") {
      setDeliveryZone("inside_dhaka");
    }
  }, [deliveryType]);

  // ---------- UI handlers ----------

  const handleColorSelect = (colorName) => {
    setSelectedColors((prev) =>
      prev.includes(colorName)
        ? prev.filter((c) => c !== colorName)
        : [...prev, colorName]
    );
  };

  const handleCategorySelect = (category) => {
    setSelectedCategories((prev) => {
      const exists = prev.some((c) => c._id === category._id);
      if (exists) return prev.filter((c) => c._id !== category._id);
      return [...prev, category];
    });
  };

  const handleDropdownToggle = (e) => {
    e.stopPropagation();
    setIsDropdownOpen((prev) => !prev);
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
      const uploads = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("image", file);
        const resp = await fetch(
          "https://api.imgbb.com/1/upload?key=31cbdc0f8e62b64424c515941a8bfd73",
          { method: "POST", body: formData }
        );
        const data = await resp.json();
        if (data?.success) return data.data.url;
        throw new Error("Upload failed");
      });

      const results = await Promise.allSettled(uploads);
      const ok = results
        .filter((r) => r.status === "fulfilled")
        .map((r) => r.value);
      const fail = results.filter((r) => r.status === "rejected").length;

      if (ok.length) {
        setImageUrl((prev) => [...prev, ...ok].slice(0, MAX_IMAGES));
        toast.success(`${ok.length} image(s) uploaded`);
      }
      if (fail) toast.warn(`${fail} image(s) failed to upload`);
    } catch (err) {
      console.error(err);
      toast.error("Image upload error");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (idx) => setImageUrl((prev) => prev.filter((_, i) => i !== idx));

  const handleSizeChange = (index, value) => {
    setSizeWeights((prev) => {
      const copy = [...prev];
      copy[index].size = value;
      return copy;
    });
  };

  const handleAddSizeRow = () => setSizeWeights((prev) => [...prev, { size: "" }]);

  const parseNumber = (v, def = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : def;
  };

  // ---------- Submit ----------

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    const productName = form.productName.value.trim();
    const brand = form.brand.value.trim();

    // ✅ 3 prices
    const buyPrice = parseNumber(form.buyPrice.value, 0); // purchase/buying
    const regularPrice = parseNumber(form.regularPrice.value, 0);
    const price = parseNumber(form.price.value, 0); // ✅ Sell Price (existing backend key)

    const status = form.status.value;
    const stock = parseNumber(form.stock.value, 0);
    const sku = (form.sku?.value ?? "").trim();
    const details = form.details.value.trim();
    const longDetails = form.longDetails.value.trim();
    const categoryIds = selectedCategories.map((c) => c._id);
    const primaryCategory = selectedCategories[0] || null;

    // validations
    if (!isNonEmpty(productName)) return toast.warn("Product name is required");
    if (!selectedCategories.length) return toast.warn("Please select at least one category");
    if (!imageUrl.length) return toast.warn("Please upload at least 1 image");

    if (buyPrice < 0) return toast.warn("Buying price cannot be negative");
    if (regularPrice <= 0) return toast.warn("Regular price must be greater than 0");
    if (price <= 0) return toast.warn("Sell price must be greater than 0");

    if (!isNonEmpty(sku)) return toast.warn("SKU is required");
    if (!isNonEmpty(details)) return toast.warn("Product info is required");
    if (!isNonEmpty(longDetails)) return toast.warn("Additional info is required");
    if (stock < 0) return toast.warn("Stock cannot be negative");

    const sizeWeightArray = sizeWeights
      .map((sw) => ({ size: String(sw.size || "").trim() }))
      .filter((sw) => sw.size);

    const delivery = {
      type: deliveryType,
      area:
        deliveryType === "free_delivery"
          ? USE_FREE_DELIVERY_ZONES
            ? deliveryZone
            : "all_bangladesh"
          : null,
    };

    const payload = {
      productName,
      categoryIds,
      categoryName: primaryCategory?.name || "",
      productImage: imageUrl,
      brand,

      // ✅ prices
      buyPrice,
      regularPrice,
      price, // ✅ Sell Price (old field)

      delivery,

      status,
      stock,
      sku,
      sizeWeight: sizeWeightArray,
      color: selectedColors,
      details,
      longDetails,
    };

    setIsSaving(true);
    try {
      const resp = await fetch(withBase("api/products"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        let message = "Failed to add product";
        try {
          const data = await resp.json();
          if (data?.errors) {
            const firstKey = Object.keys(data.errors)[0];
            message = data.errors[firstKey]?.message || data?.message || message;
          } else if (data?.message) {
            message = data.message;
          }
        } catch {
          message = await resp.text();
        }
        throw new Error(message || "Failed to add product");
      }

      toast.success("Product added successfully!");
      if (typeof refetch === "function") refetch();

      form.reset();
      setSelectedCategories([]);
      setSelectedColors([]);
      setSizeWeights([{ size: "" }]);
      setImageUrl([]);

      setDeliveryType("cash_on_delivery");
      setDeliveryZone("inside_dhaka");
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to add product.");
    } finally {
      setIsSaving(false);
    }
  };

  if (categoriesLoading || subcategoriesLoading || colorsLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-xl shadow p-6 text-sm">Loading…</div>
      </div>
    );
  }

  if (categoriesError) return <div>Error loading categories: {categoriesError.message}</div>;
  if (subcategoriesError) return <div>Error loading subcategories: {subcategoriesError.message}</div>;
  if (colorError) return <div>Error loading colors: {colorError.message}</div>;

  return (
    <div>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-2xl shadow-xl w-[95%] max-w-4xl p-0 overflow-hidden max-h-[95vh] overflow-y-auto">
          {/* Header */}
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50">
                <FiCheckCircle className="text-blue-600" />
              </span>
              <h2 className="text-lg font-semibold">Add Product</h2>
            </div>
            <button onClick={isClose} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close">
              <FiX />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6 p-5">
            {/* Left column */}
            <div className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium mb-1">Product Name</label>
                <input
                  name="productName"
                  type="text"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Apple iMac 27''"
                />
              </div>

              {/* Category */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-medium mb-1">Category</label>
                <button
                  type="button"
                  onClick={handleDropdownToggle}
                  className="w-full inline-flex items-center justify-between px-3 py-2 rounded-lg border border-gray-300 bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <span className={`truncate ${selectedCategories.length ? "text-gray-900" : "text-gray-400"}`}>
                    {selectedCategories.length
                      ? selectedCategories.map((c) => c.name).join(", ")
                      : "Select categories"}
                  </span>
                  <FaChevronDown
                    className={`ml-2 h-4 w-4 text-gray-500 transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border bg-white shadow-xl">
                    <ul className="max-h-64 overflow-y-auto py-1">
                      {safeCategories.map((cat) => (
                        <React.Fragment key={cat._id}>
                          <li>
                            <button
                              type="button"
                              onClick={() => handleCategorySelect(cat)}
                              className={`w-full px-3 py-2 text-sm font-semibold ${
                                selectedCategories.some((c) => c._id === cat._id)
                                  ? "bg-blue-50 text-blue-700"
                                  : "text-gray-800"
                              }`}
                            >
                              {cat.name}
                            </button>
                          </li>

                          {subcategories
                            .filter((s) => s.parentCategory?._id === cat._id)
                            .map((sub) => (
                              <li key={sub._id}>
                                <button
                                  type="button"
                                  onClick={() => handleCategorySelect(sub)}
                                  className={`w-full px-5 py-2 text-sm ${
                                    selectedCategories.some((c) => c._id === sub._id)
                                      ? "bg-blue-100 text-blue-700"
                                      : "text-gray-600"
                                  }`}
                                >
                                  {sub.name}
                                </button>
                              </li>
                            ))}
                        </React.Fragment>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Brand */}
              <div>
                <label className="block text-sm font-medium mb-1">Brand</label>
                <input
                  name="brand"
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border border-gray-
300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Apple"
                />
              </div>

              {/* ✅ 3 Prices (Sell price keeps old name="price") */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                   Buying Price
                  </label>
                  <input
                    name="buyPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="৳2000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Regular Price
                  </label>
                  <input
                    name="regularPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="৳2300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Sell Price
                  </label>
                  <input
                    name="price" // ✅ আপনার বর্তমান price field = sell price
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="৳2500"
                  />
                </div>
              </div>

              {/* Delivery */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Delivery</label>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="deliveryType"
                      value="cash_on_delivery"
                      checked={deliveryType === "cash_on_delivery"}
                      onChange={() => setDeliveryType("cash_on_delivery")}
                    />
                    Cash On Delivery
                  </label>

                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="deliveryType"
                      value="free_delivery"
                      checked={deliveryType === "free_delivery"}
                      onChange={() => setDeliveryType("free_delivery")}
                    />
                    Free Delivery
                  </label>
                </div>

                {deliveryType === "free_delivery" && USE_FREE_DELIVERY_ZONES && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Free Delivery Area
                    </label>
                    <select
                      value={deliveryZone}
                      onChange={(e) => setDeliveryZone(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="inside_dhaka">Inside Dhaka</option>
                      <option value="outside_dhaka">Outside Dhaka</option>
                      <option value="all_bangladesh">All Bangladesh</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Status, Stock, SKU */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    name="status"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue="available"
                  >
                    <option value="available">Available</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">SKU</label>
                  <input
                    name="sku"
                    type="text"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="SKU-12345"
                  />
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              {/* Upload */}
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
                        <img
                          src={url}
                          alt={`Uploaded ${idx + 1}`}
                          className="w-full h-28 object-cover rounded-lg"
                          loading="lazy"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 p-1.5 bg-white/90 rounded-full shadow hover:bg-red-50"
                          title="Remove"
                        >
                          <FiTrash className="text-red-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Size */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">Select Size</label>
                  <button
                    type="button"
                    onClick={handleAddSizeRow}
                    className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100"
                  >
                    + Add Row
                  </button>
                </div>
                <div className="space-y-2">
                  {sizeWeights.map((sw, i) => (
                    <div key={i} className="grid grid-cols-1 gap-2">
                      <input
                        type="text"
                        className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Size (e.g. S, M, L, XL)"
                        value={sw.size}
                        onChange={(e) => handleSizeChange(i, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="relative">
                <label className="block text-sm font-medium mb-1">Colors</label>
                <div
                  className="w-full px-3 py-2 border rounded-lg cursor-pointer bg-white"
                  onClick={() => setIsOpenDropdown(!isOpenDropdown)}
                >
                  {selectedColors.length ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedColors.map((c) => (
                        <span
                          key={c}
                          className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs bg-gray-100"
                        >
                          {c}
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{
                              background:
                                safeColors.find((x) => x.name === c)?.code || "#999",
                            }}
                          />
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm">Select colors</span>
                  )}
                </div>

                {isOpenDropdown && (
                  <div className="absolute z-10 w-full bg-white border rounded-lg mt-1 max-h-44 overflow-y-auto shadow">
                    {safeColors.map((color) => {
                      const active = selectedColors.includes(color.name);
                      return (
                        <div
                          key={color._id}
                          onClick={() => handleColorSelect(color.name)}
                          className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-50 ${
                            active ? "bg-blue-50" : ""
                          }`}
                        >
                          <span className="text-sm">{color.name}</span>
                          <span
                            className={`w-5 h-5 rounded-full border ${
                              active ? "ring ring-blue-400" : ""
                            }`}
                            style={{ backgroundColor: color.code }}
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
                <label className="block text-sm font-medium mb-1">Product Info</label>
                <textarea
                  name="details"
                  rows="4"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Additional Info</label>
                <textarea
                  name="longDetails"
                  rows="4"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Full description"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="md:col-span-2 flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={isClose}
                className="px-4 py-2 rounded-lg border hover:bg-gray-50"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isSaving || isUploading}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {isSaving ? "Adding…" : "Add Product"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ToastContainer position="top-center" autoClose={2000} hideProgressBar />
    </div>
  );
};

export default AddProduct;
