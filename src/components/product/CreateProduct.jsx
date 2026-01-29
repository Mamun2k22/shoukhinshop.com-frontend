// CreateProductModern.jsx
import React, { useState, useRef } from "react";
import { FaArrowLeft, FaInfoCircle, FaImages, FaTags } from "react-icons/fa";
import { motion } from "framer-motion";
import { FiPlus, FiX } from "react-icons/fi";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function CreateProductModern() {
  // general states
  const [description, setDescription] = useState("");
  const [sku, setSku] = useState("");
  const [images, setImages] = useState([]);
  const [productType, setProductType] = useState("single");
  const [manufacturedDate, setManufacturedDate] = useState(null);
  const [expiryDate, setExpiryDate] = useState(null);
  const [customFields, setCustomFields] = useState({
    warranties: false,
    manufacturer: false,
    expiry: false,
  });

  const fileInputRef = useRef(null);

  // form values (you can expand to controlled inputs as needed)
  const [form, setForm] = useState({
    store: "",
    warehouse: "",
    productName: "",
    slug: "",
    sellingType: "",
    category: "",
    subCategory: "",
    brand: "",
    unit: "",
    barcodeSymbology: "",
    itemBarcode: "",
    quantity: "",
    price: "",
    taxType: "",
    discountType: "",
    discountValue: "",
    quantityAlert: "",
    manufacturerText: "",
    warranty: "",
  });

  const generateSKU = () => {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    setSku(`SKU-${random}`);
    setForm((s) => ({ ...s, sku: `SKU-${random}` }));
  };

  // Images: drag & drop + previews
  const handleImageFiles = (files) => {
    const incoming = Array.from(files).map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...incoming]);
  };

  const handleImageChange = (e) => {
    if (!e.target.files) return;
    handleImageFiles(e.target.files);
  };

  const onDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer?.files?.length) {
      handleImageFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (index) => {
    const updated = [...images];
    // revoke object URL for cleanup
    if (updated[index]?.url) URL.revokeObjectURL(updated[index].url);
    updated.splice(index, 1);
    setImages(updated);
  };

  const toggleCustomField = (key) => {
    setCustomFields((c) => ({ ...c, [key]: !c[key] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // build FormData or JSON to send to API
    // Omitted actual API call for brevity
    alert("Product submitted (this is a demo).");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f7f9] via-white to-[#ececec] p-4 md:p-8 font-inter">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
            Create Product
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Add product details and images. Preview on the right panel.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-md text-sm text-gray-700 hover:shadow-sm"
            aria-label="Back to products"
          >
            <FaArrowLeft /> Back to Products
          </button>
          <button
            onClick={() => alert("Open POS (demo)")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 shadow"
          >
            Save Draft
          </button>
        </div>
      </div>

      {/* Main container: 2-column responsive */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* LEFT: main form (takes 8/12 on large) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card: Product Information */}
          <section className="bg-white border border-indigo-400 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-3">
                <FaInfoCircle className="text-blue-500" />
                <h2 className="text-lg font-medium text-gray-800">
                  Product Information
                </h2>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Product Name and Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-700">
                    Product Name *
                  </label>
                  <input
                    value={form.productName}
                    onChange={(e) =>
                      setForm({ ...form, productName: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 
               focus:ring-2 focus:ring-blue-300 focus:border-transparent shadow-sm"
                    placeholder="Enter product name"
                    required
                  />
                </div>

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700">Slug</label>
                  <input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-transparent"
                    placeholder="product-name-slug"
                  />
                </div> */}
              </div>

              {/* Grid fields - keep many fields as original */}
              <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-white rounded-xl shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {[
        { label: "Store *", value: form.store, key: "store" },
        { label: "Warehouse *", value: form.warehouse, key: "warehouse" },
        { label: "SKU *", value: form.sku, key: "sku" },
        { label: "Category *", value: form.category, key: "category" },
        { label: "Sub Category *", value: form.subCategory, key: "subCategory" },
        { label: "Brand *", value: form.brand, key: "brand" },
        { label: "Unit *", value: form.unit, key: "unit" },
        { label: "Size *", value: form.size, key: "size" },
        { label: "Color *", value: form.color, key: "color" },
      ].map((field, index) => (
        <motion.div
          key={field.key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {field.label}
          </label>
          <select
            value={field.value}
            onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
            className="mt-1 block w-full border border-gray-200 rounded-lg px-4 py-2 bg-white text-gray-700 shadow-sm transition-all duration-300
                       focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                       hover:border-blue-300 hover:shadow-md"
          >
            <option value="">Select</option>
            <option value="main">Main Store</option>
          </select>
        </motion.div>
      ))}
    </motion.div>
              {/* Description editor */}
              <div className="mt-8">
                <label className="block text-base font-semibold text-gray-800 mb-3">
                  📝 Description
                </label>

                <div className="border border-gray-300 rounded-xl overflow-hidden shadow-sm focus-within:shadow-md focus-within:border-blue-400 transition">
                  <ReactQuill
                    theme="snow"
                    value={description}
                    onChange={setDescription}
                    placeholder="Maximum 60 words..."
                    className="custom-quill min-h-[220px] text-gray-800"
                  />
                </div>

                <p className="mt-2 text-sm text-gray-500">
                  Keep your product description clear, short, and attractive.
                </p>
              </div>
            </div>
          </section>

          {/* Pricing & Stocks */}
          <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 flex items-center gap-3 border-b border-gray-100">
              <FaTags className="text-green-500" />
              <h3 className="text-lg font-medium text-gray-800">
                Pricing & Stocks
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Product Type *
                </label>
                <div className="mt-2 flex items-center gap-6">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="productType"
                      checked={productType === "single"}
                      onChange={() => setProductType("single")}
                      className="accent-orange-500"
                    />
                    <span className="text-sm text-gray-700">
                      Single Product
                    </span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="productType"
                      checked={productType === "variable"}
                      onChange={() => setProductType("variable")}
                      className="accent-orange-500"
                    />
                    <span className="text-sm text-gray-700">
                      Variable Product
                    </span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Quantity *
                  </label>
                  <input
                    value={form.quantity}
                    onChange={(e) =>
                      setForm({ ...form, quantity: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2"
                    placeholder="Enter quantity"
                    type="number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Price *
                  </label>
                  <input
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2"
                    placeholder="Enter price"
                    type="number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tax Type *
                  </label>
                  <select
                    value={form.taxType}
                    onChange={(e) =>
                      setForm({ ...form, taxType: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2"
                  >
                    <option value="">Select</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Discount Type *
                  </label>
                  <select
                    value={form.discountType}
                    onChange={(e) =>
                      setForm({ ...form, discountType: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2"
                  >
                    <option value="">Select</option>
                    <option value="percent">Percent</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Discount Value *
                  </label>
                  <input
                    value={form.discountValue}
                    onChange={(e) =>
                      setForm({ ...form, discountValue: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2"
                    placeholder="Enter discount"
                    type="number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Quantity Alert
                  </label>
                  <input
                    value={form.quantityAlert}
                    onChange={(e) =>
                      setForm({ ...form, quantityAlert: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2"
                    type="number"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Custom Fields */}
          <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-medium text-gray-800">
                Custom Fields
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex gap-4 items-center">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={customFields.warranties}
                    onChange={() => toggleCustomField("warranties")}
                    className="accent-blue-500"
                  />
                  <span className="text-sm text-gray-700">Warranties</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={customFields.manufacturer}
                    onChange={() => toggleCustomField("manufacturer")}
                    className="accent-blue-500"
                  />
                  <span className="text-sm text-gray-700">Manufacturer</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={customFields.expiry}
                    onChange={() => toggleCustomField("expiry")}
                    className="accent-blue-500"
                  />
                  <span className="text-sm text-gray-700">Expiry</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Warranty
                  </label>
                  <select
                    value={form.warranty}
                    onChange={(e) =>
                      setForm({ ...form, warranty: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2"
                  >
                    <option value="">Select</option>
                    <option>6 months</option>
                    <option>1 year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Manufacturer
                  </label>
                  <input
                    value={form.manufacturerText}
                    onChange={(e) =>
                      setForm({ ...form, manufacturerText: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2"
                    placeholder="Manufacturer name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Manufactured Date
                  </label>
                  <DatePicker
                    selected={manufacturedDate}
                    onChange={(date) => setManufacturedDate(date)}
                    className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2"
                    dateFormat="dd/MM/yyyy"
                    placeholderText="dd/mm/yyyy"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Expiry On
                  </label>
                  <DatePicker
                    selected={expiryDate}
                    onChange={(date) => setExpiryDate(date)}
                    className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2"
                    dateFormat="dd/MM/yyyy"
                    placeholderText="dd/mm/yyyy"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-5 py-2 border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Product
            </button>
          </div>
        </div>

        {/* RIGHT: Image uploader + preview + quick options (takes 4/12 on large) */}
        <aside className="lg:col-span-4">
          <div className="sticky top-6 space-y-6">
         {/* Image upload card */}
<div className="bg-white border border-purple-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
  {/* Header */}
  <div className="flex items-center justify-between mb-4">
    <h4 className="text-md font-semibold text-gray-800 flex items-center gap-2">
      <span className="bg-purple-100 text-purple-600 p-2 rounded-lg">
        <FaImages className="text-lg" />
      </span>
      Upload Images
    </h4>
    <span className="text-sm text-gray-500">Supports multiple</span>
  </div>

  {/* Drag & drop area */}
  <div
    onDrop={onDrop}
    onDragOver={(e) => e.preventDefault()}
    className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer 
               hover:border-purple-400 hover:bg-purple-50/50 transition-colors duration-300"
    onClick={() => fileInputRef.current?.click()}
  >
    <div className="flex items-center justify-center gap-3">
      <div className="p-3 rounded-full border border-gray-300 bg-white shadow-sm">
        <FiPlus className="text-2xl text-gray-400" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">
          Drop your images here or click to browse
        </p>
        <p className="text-xs text-gray-400 mt-1">Recommended: 1000×1000px</p>
      </div>
    </div>
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      multiple
      onChange={handleImageChange}
      className="hidden"
    />
  </div>

  {/* Previews */}
  <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
    {images.length === 0 && (
      <div className="col-span-full text-sm text-gray-400 text-center">
        No images uploaded yet.
      </div>
    )}
    {images.map((img, idx) => (
      <div
        key={idx}
        className="relative rounded-lg overflow-hidden border border-gray-100 group"
      >
        <img
          src={img.url}
          alt={`preview-${idx}`}
          className="w-full h-28 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <button
          type="button"
          onClick={() => removeImage(idx)}
          className="absolute top-1 right-1 bg-white/90 text-red-600 rounded-full p-1 shadow 
                     hover:bg-red-50 transition-colors"
          aria-label={`Remove image ${idx + 1}`}
        >
          <FiX />
        </button>
      </div>
    ))}
  </div>

  {images.length > 0 && (
    <p className="text-xs text-gray-500 mt-3 text-right">
      {images.length} image(s) selected
    </p>
  )}
</div>

            {/* Help / Notes */}
            <div className="bg-white border border-purple-200 rounded-xl p-4 text-sm text-gray-600">
              <strong className="block text-gray-800 mb-2">Tips</strong>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use clear product images (1000×1000 recommended).</li>
                <li>Fill category & brand to improve filtering.</li>
                <li>Use the SKU generator for unique product codes.</li>
              </ul>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
