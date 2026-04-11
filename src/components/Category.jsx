import React, { useEffect, useMemo, useState } from "react";
import { FiUploadCloud, FiX, FiImage, FiCheckCircle } from "react-icons/fi";

const Category = ({
  isOpen,
  onClose,
  onSuccess,
  mode = "add",
  initialData,
  categories = [],
}) => {
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageURL, setImageURL] = useState("");
  const [parentId, setParentId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const API_BASE =
    import.meta.env.VITE_APP_SERVER_URL || "http://localhost:5000/";

  const mainCategories = useMemo(() => {
    return Array.isArray(categories) ? categories.filter((c) => !c.parent) : [];
  }, [categories]);

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || "");
      setImageURL(initialData?.image || "");
      setImageFile(null);

      if (mode === "edit") {
        setParentId(initialData?.parent || "");
      } else {
        setParentId(initialData?.parentPreset || "");
      }

      setErrorMessage("");
      setSuccessMessage("");
    }
  }, [isOpen, initialData, mode]);

  if (!isOpen) return null;

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    setImageFile(file || null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!name.trim()) {
      setErrorMessage("Category name is required");
      return;
    }

    if (mode === "add" && !imageFile) {
      setErrorMessage("Please select an image");
      return;
    }

    setSaving(true);
    let finalImageURL = imageURL;

    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);

        const imgBBResponse = await fetch(
          "https://api.imgbb.com/1/upload?key=31cbdc0f8e62b64424c515941a8bfd73",
          {
            method: "POST",
            body: formData,
          }
        );

        const imgBBResult = await imgBBResponse.json();

        if (!imgBBResponse.ok) {
          throw new Error("Image upload failed");
        }

        finalImageURL = imgBBResult.data.url;
      }

      let url = `${API_BASE}api/categories`;
      let method = "POST";

      if (mode === "add" && parentId) {
        url = `${API_BASE}api/categories/subcategory`;
      }

      if (mode === "edit" && initialData?._id) {
        url = `${API_BASE}api/categories/${initialData._id}`;
        method = "PUT";
      }

      const payload =
        mode === "edit"
          ? {
              categoryName: name,
              image: finalImageURL,
            }
          : {
              categoryName: name,
              image: finalImageURL,
              ...(parentId ? { parent: parentId } : {}),
            };

      const backendResponse = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const backendResult = await backendResponse.json();

      if (!backendResponse.ok) {
        throw new Error(backendResult.message || "Failed to save category");
      }

      setSuccessMessage(
        mode === "add"
          ? parentId
            ? "Subcategory added successfully!"
            : "Category added successfully!"
          : "Category updated successfully!"
      );

      if (onSuccess) onSuccess(backendResult.category);

      if (mode === "add") {
        setName("");
        setImageFile(null);
        setImageURL("");
        setParentId("");
        event.target.reset();
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage(error.message || "An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  const title =
    mode === "add"
      ? parentId
        ? "Add Subcategory"
        : "Add Category"
      : "Edit Category";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-xl rounded-3xl bg-white border border-gray-200 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-100 px-6 py-5 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
              Category Manager
            </p>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500 mt-1">
              Fill the information below to continue.
            </p>
          </div>

          <button
            onClick={onClose}
            className="h-10 w-10 rounded-full hover:bg-gray-100 text-gray-500 flex items-center justify-center transition"
            type="button"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        <div className="p-6">
          {initialData?.parentName && mode === "add" && (
            <div className="mb-5 rounded-2xl bg-indigo-50 border border-indigo-100 p-4 text-sm text-indigo-700">
              Parent Category:{" "}
              <span className="font-semibold">{initialData.parentName}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 flex items-start gap-2 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">
              <FiCheckCircle className="mt-0.5 shrink-0" />
              <p className="text-sm">{successMessage}</p>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "add" && !initialData?.parentPreset && (
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Parent Category
                </label>
                <select
                  className="w-full h-12 px-4 rounded-2xl outline-none border border-gray-300 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                >
                  <option value="">None (Main Category)</option>
                  {mainCategories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  Parent select করলে এটা subcategory হিসেবে save হবে
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                {parentId ? "Subcategory Name" : "Category Name"}
              </label>
              <input
                type="text"
                name="categoryName"
                className="w-full h-12 px-4 rounded-2xl outline-none border border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                placeholder={parentId ? "e.g. Shirt" : "e.g. Men Fashion"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                {parentId ? "Subcategory Image" : "Category Image"}
              </label>

              <label className="flex flex-col items-center justify-center w-full min-h-[150px] px-5 py-6 border-2 border-dashed border-gray-300 rounded-3xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition text-center">
                <FiUploadCloud className="text-3xl text-gray-400 mb-3" />
                <span className="text-sm font-medium text-gray-700">
                  Click to upload image
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  PNG, JPG, WEBP supported
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>

              {(imageFile || imageURL) && (
                <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-3">
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
                      {imageFile || imageURL ? (
                        <img
                          src={imageFile ? URL.createObjectURL(imageFile) : imageURL}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FiImage className="text-gray-300 text-2xl" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800">
                        Image Preview
                      </p>
                      <p className="text-xs text-gray-500 mt-1 break-all">
                        {imageFile ? imageFile.name : "Existing image selected"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="h-12 px-5 rounded-2xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="h-12 px-5 rounded-2xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {saving
                  ? "Saving..."
                  : parentId
                  ? mode === "edit"
                    ? "Update Subcategory"
                    : "Add Subcategory"
                  : mode === "add"
                  ? "Add Category"
                  : "Update Category"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Category;