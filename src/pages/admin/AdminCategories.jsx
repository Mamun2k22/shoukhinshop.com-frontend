// AdminSubcategories.jsx - Professional Subcategory Management Component
import React, { useEffect, useMemo, useState } from "react";
import {
  FiRefreshCw,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiGrid,
  FiLayers,
  FiSearch,
  FiChevronDown,
  FiChevronUp,
  FiFolder,
  FiImage,
  FiX,
  FiUploadCloud,
  FiCheckCircle,
} from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminSubcategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'
  const [selectedParent, setSelectedParent] = useState(null);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [subFormData, setSubFormData] = useState({ name: "", image: null, imagePreview: "" });
  const [saving, setSaving] = useState(false);

  const API_BASE = import.meta.env.VITE_APP_SERVER_URL || "http://localhost:5000/";

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}api/categories`);
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Toggle expand/collapse for category subcategories
  const toggleExpand = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // Open add subcategory modal
  const openAddSubcategoryModal = (parentCategory) => {
    setModalMode("add");
    setSelectedParent(parentCategory);
    setEditingSubcategory(null);
    setSubFormData({ name: "", image: null, imagePreview: "" });
    setIsModalOpen(true);
  };

  // Open edit subcategory modal
  const openEditSubcategoryModal = (parentCategory, subcategory) => {
    setModalMode("edit");
    setSelectedParent(parentCategory);
    setEditingSubcategory(subcategory);
    setSubFormData({
      name: subcategory.name,
      image: null,
      imagePreview: subcategory.image,
    });
    setIsModalOpen(true);
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setSubFormData({ ...subFormData, image: file, imagePreview: previewUrl });
    }
  };

  // Upload image to ImgBB
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(
      "https://api.imgbb.com/1/upload?key=31cbdc0f8e62b64424c515941a8bfd73",
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();
    if (!response.ok) throw new Error("Image upload failed");
    return result.data.url;
  };

  // Save subcategory (add or edit)
  const handleSaveSubcategory = async (e) => {
    e.preventDefault();

    if (!subFormData.name.trim()) {
      toast.error("Subcategory name is required");
      return;
    }

    setSaving(true);

    try {
      let finalImageUrl = subFormData.imagePreview;

      // Upload new image if selected
      if (subFormData.image) {
        finalImageUrl = await uploadImage(subFormData.image);
      }

      const payload = {
        categoryName: subFormData.name,
        image: finalImageUrl,
        parent: selectedParent._id,
      };

      let url = `${API_BASE}api/categories/subcategory`;
      let method = "POST";

      if (modalMode === "edit" && editingSubcategory) {
        url = `${API_BASE}api/categories/${editingSubcategory._id}`;
        method = "PUT";
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save subcategory");

      toast.success(
        modalMode === "add"
          ? "Subcategory added successfully!"
          : "Subcategory updated successfully!"
      );

      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to save subcategory");
    } finally {
      setSaving(false);
    }
  };

  // Delete subcategory
  const handleDeleteSubcategory = async (parentCategory, subcategoryId) => {
    if (!window.confirm("Are you sure you want to delete this subcategory?"))
      return;

    try {
      const response = await fetch(`${API_BASE}api/categories/${subcategoryId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Delete failed");

      toast.success("Subcategory deleted successfully");
      fetchCategories();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete subcategory");
    }
  };

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return categories;

    return categories.filter((cat) => {
      const matchCategory =
        cat.name?.toLowerCase().includes(keyword) ||
        cat.slug?.toLowerCase().includes(keyword);

      const matchSubcategory = cat.subcategories?.some(
        (sub) =>
          sub.name?.toLowerCase().includes(keyword) ||
          sub.slug?.toLowerCase().includes(keyword)
      );

      return matchCategory || matchSubcategory;
    });
  }, [categories, searchTerm]);

  const totalSubcategories = useMemo(() => {
    return categories.reduce(
      (acc, cat) => acc + (cat.subcategories?.length || 0),
      0
    );
  }, [categories]);

  // Subcategory Modal Component
  const SubcategoryModal = () => (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-300 ${
        isModalOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
      onClick={() => setIsModalOpen(false)}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-md mx-4 shadow-2xl transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {modalMode === "add" ? "Add Subcategory" : "Edit Subcategory"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              in {selectedParent?.name}
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(false)}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition"
          >
            <FiX className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSaveSubcategory} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Subcategory Name
            </label>
            <input
              type="text"
              value={subFormData.name}
              onChange={(e) =>
                setSubFormData({ ...subFormData, name: e.target.value })
              }
              placeholder="e.g., Wireless Headphones"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Subcategory Image
            </label>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
              <FiUploadCloud className="text-2xl text-gray-400 mb-2" />
              <span className="text-xs text-gray-500">Click to upload image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {subFormData.imagePreview && (
              <div className="mt-3 flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <img
                  src={subFormData.imagePreview}
                  alt="Preview"
                  className="w-12 h-12 rounded-xl object-cover border"
                />
                <div className="text-xs text-gray-600 truncate">
                  {subFormData.image ? subFormData.image.name : "Current image"}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving && <FiRefreshCw className="animate-spin" />}
              {saving ? "Saving..." : modalMode === "add" ? "Add" : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Category Card Component
  const CategoryCard = ({ category }) => {
    const isExpanded = expandedCategories[category._id];
    const subcategories = category.subcategories || [];

    return (
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
        {/* Category Header */}
        <div className="relative h-40 overflow-hidden">
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white text-xl font-bold">{category.name}</h3>
            <p className="text-white/80 text-xs">Slug: {category.slug}</p>
          </div>
          <button
            onClick={() => openAddSubcategoryModal(category)}
            className="absolute top-3 right-3 bg-white/95 backdrop-blur text-indigo-600 text-sm font-semibold px-3 py-1.5 rounded-full shadow flex items-center gap-1 hover:bg-indigo-50 transition"
          >
            <FiPlus className="text-xs" />
            Add Sub
          </button>
        </div>

        {/* Subcategories Section */}
        <div className="p-5">
          <div
            className="flex items-center justify-between cursor-pointer mb-3"
            onClick={() => toggleExpand(category._id)}
          >
            <div className="flex items-center gap-2">
              <FiFolder className="text-indigo-400 text-sm" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Subcategories
              </span>
              <span className="bg-gray-100 text-gray-700 text-xs rounded-full px-2 py-0.5">
                {subcategories.length}
              </span>
            </div>
            {isExpanded ? (
              <FiChevronUp className="text-gray-400" />
            ) : (
              <FiChevronDown className="text-gray-400" />
            )}
          </div>

          {isExpanded && (
            <div className="space-y-3 mt-3 max-h-80 overflow-y-auto custom-scroll">
              {subcategories.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <FiImage className="text-gray-300 text-3xl mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No subcategories yet</p>
                  <button
                    onClick={() => openAddSubcategoryModal(category)}
                    className="mt-2 text-xs text-indigo-600 font-medium hover:text-indigo-700"
                  >
                    + Add first subcategory
                  </button>
                </div>
              ) : (
                subcategories.map((sub) => (
                  <div
                    key={sub._id}
                    className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <img
                        src={sub.image}
                        alt={sub.name}
                        className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm truncate">
                          {sub.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {sub.slug}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition">
                      <button
                        onClick={() => openEditSubcategoryModal(category, sub)}
                        className="w-8 h-8 rounded-lg bg-white text-indigo-600 hover:bg-indigo-50 flex items-center justify-center transition shadow-sm"
                        title="Edit"
                      >
                        <FiEdit className="text-sm" />
                      </button>
                      <button
                        onClick={() => handleDeleteSubcategory(category, sub._id)}
                        className="w-8 h-8 rounded-lg bg-white text-rose-500 hover:bg-rose-50 flex items-center justify-center transition shadow-sm"
                        title="Delete"
                      >
                        <FiTrash2 className="text-sm" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {!isExpanded && subcategories.length > 0 && (
            <div className="mt-3 space-y-2">
              {subcategories.slice(0, 2).map((sub) => (
                <div key={sub._id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                  <img src={sub.image} className="w-8 h-8 rounded-lg object-cover" />
                  <span className="text-sm font-medium text-gray-700">{sub.name}</span>
                </div>
              ))}
              {subcategories.length > 2 && (
                <button
                  onClick={() => toggleExpand(category._id)}
                  className="text-xs text-indigo-600 font-medium flex items-center gap-1 mt-1"
                >
                  + {subcategories.length - 2} more
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 lg:p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-3">
              <FiLayers />
              Subcategory Management
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Subcategories Overview
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage all subcategories across your categories
            </p>
          </div>
          <button
            onClick={fetchCategories}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition"
          >
            <FiRefreshCw />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                <FiGrid />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Categories</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                <FiLayers />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Subcategories</p>
                <p className="text-2xl font-bold text-gray-900">{totalSubcategories}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories or subcategories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition"
            />
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="h-40 bg-gray-100 animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-gray-100 rounded w-2/3 animate-pulse" />
                <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse" />
                <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
          <FiImage className="text-5xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700">No results found</h3>
          <p className="text-gray-400 text-sm mt-1">
            {searchTerm ? "Try a different search term" : "No categories available"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <CategoryCard key={category._id} category={category} />
          ))}
        </div>
      )}

      <SubcategoryModal />
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default AdminSubcategories;