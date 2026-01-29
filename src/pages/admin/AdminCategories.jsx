import React, { useEffect, useState } from "react";
import { FiRefreshCw, FiImage, FiTrash2, FiPlus, FiEdit } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CategoryModal from "../../components/Category";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
  const [selectedCategory, setSelectedCategory] = useState(null);

  const API_BASE =
    import.meta.env.VITE_APP_SERVER_URL || "http://localhost:5000/";

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}api/categories`);
      const data = await res.json();
      setCategories(data || []);
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

  // delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      const res = await fetch(`${API_BASE}api/categories/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      toast.success("Category deleted successfully");
      setCategories((prev) => prev.filter((cat) => cat._id !== id));
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete category");
    }
  };

  // ✅ modal open for ADD
  const openAddModal = () => {
    setModalMode("add");
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  // ✅ modal open for EDIT
  const openEditModal = (cat) => {
    setModalMode("edit");
    setSelectedCategory(cat);
    setIsModalOpen(true);
  };

  // ✅ callback when modal succeeds
  const handleModalSuccess = (category) => {
    if (modalMode === "add") {
      setCategories((prev) => [category, ...prev]);
      toast.success("Category added successfully");
    } else {
      setCategories((prev) =>
        prev.map((c) => (c._id === category._id ? category : c))
      );
      toast.success("Category updated successfully");
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 font-poppins">
            Categories
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage all product categories from here.
          </p>
        </div>

        <div className="flex gap-3 mt-3 sm:mt-0">
          <button
            onClick={fetchCategories}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm text-gray-700 bg-white shadow-sm hover:bg-gray-50"
          >
            <FiRefreshCw className="text-gray-500" />
            Refresh
          </button>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
          >
            <FiPlus className="text-white" />
            Add Category
          </button>
        </div>
      </div>

      {/* Loading / Empty / Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-44 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <FiImage className="mx-auto text-4xl mb-2 text-gray-400" />
          No categories found.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="group relative bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="aspect-[4/4] w-full overflow-hidden bg-gray-100 relative">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Edit button */}
                <button
                  onClick={() => openEditModal(cat)}
                  className="absolute top-2 left-2 bg-sky-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Edit category"
                >
                  <FiEdit className="w-4 h-4" />
                </button>

                {/* Delete button */}
                <button
                  onClick={() => handleDelete(cat._id)}
                  className="absolute top-2 right-2 bg-rose-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete category"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 text-center">
                <h3 className="font-normal text-sm font-poppins text-gray-800 group-hover:text-indigo-600 truncate">
                  {cat.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✅ same modal for add + edit */}
      <CategoryModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialData={selectedCategory}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      <ToastContainer position="top-center" autoClose={1500} hideProgressBar />
    </div>
  );
};

export default AdminCategories;
