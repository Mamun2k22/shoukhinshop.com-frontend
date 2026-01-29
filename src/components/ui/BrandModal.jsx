// src/components/ui/BrandModal.jsx
import React, { useEffect, useState } from "react";

const BrandModal = ({
  isOpen,
  onClose,
  mode = "add", // "add" | "edit"
  initialData,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [logoFile, setLogoFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const base = import.meta.env.VITE_APP_SERVER_URL;

  // modal open হলে field গুলা set করব
  useEffect(() => {
    if (isOpen) {
      setErrorMessage("");
      setSaving(false);

      if (mode === "edit" && initialData) {
        setName(initialData.name || "");
        setWebsite(initialData.website || "");
        setIsActive(initialData.isActive ?? true);
        setLogoFile(null);
        setPreview(
          initialData.logo
            ? `${base.replace(/\/$/, "")}${initialData.logo}`
            : ""
        );
      } else {
        setName("");
        setWebsite("");
        setIsActive(true);
        setLogoFile(null);
        setPreview("");
      }
    }
  }, [isOpen, mode, initialData, base]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name) {
      setErrorMessage("Brand name is required");
      return;
    }

    if (mode === "add" && !logoFile) {
      setErrorMessage("Logo file is required");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("name", name);
      formData.append("website", website);
      formData.append("isActive", isActive);
      if (logoFile) {
        formData.append("logo", logoFile); // multer field name "logo"
      }

      let url = `${base}api/brands`;
      let method = "POST";

      if (mode === "edit" && initialData?._id) {
        url = `${base}api/brands/${initialData._id}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        body: formData, // multipart/form-data automatically
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to save brand");
      }

      if (onSuccess) onSuccess(data.brand);
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-800">
            {mode === "add" ? "Add Brand" : "Edit Brand"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {errorMessage && (
          <p className="mb-3 text-sm text-red-600">{errorMessage}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Brand name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Brand Name
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
              placeholder="e.g. Graygrids"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Logo upload */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Logo (upload)
            </label>
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-600 hover:border-indigo-300 hover:bg-indigo-50 transition">
              <span className="truncate">
                {logoFile ? logoFile.name : "Choose logo image"}
              </span>
              <span className="rounded-lg bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm">
                Browse
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            {preview && (
              <div className="mt-2 flex items-center gap-2 rounded-lg border bg-gray-50 px-2 py-2">
                <span className="text-xs text-gray-500">Preview:</span>
                <div className="h-10 w-28 flex items-center justify-center bg-white rounded-md border">
                  <img
                    src={preview}
                    alt="logo preview"
                    className="max-h-9 max-w-[100px] object-contain"
                  />
                </div>
              </div>
            )}
          </div>

          {/* website */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Website (optional)
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
              placeholder="https://brand.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          {/* active toggle */}
          <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
            <span className="text-sm text-gray-700">Show on homepage</span>
            <button
              type="button"
              onClick={() => setIsActive((prev) => !prev)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                isActive ? "bg-indigo-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
                  isActive ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : mode === "add"
                ? "Add Brand"
                : "Update Brand"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BrandModal;
