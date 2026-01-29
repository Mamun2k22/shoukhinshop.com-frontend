import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiTrash2, FiEdit2 } from "react-icons/fi";

const AdminSubCategory = () => {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [form, setForm] = useState({ name: "", parentCategory: "", image: null });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null); // ✅ which subcategory is being edited

  const base = import.meta.env.VITE_APP_SERVER_URL;

  // Fetch categories + subcategories
  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const catRes = await axios.get(`${base}api/categories`);
      const subRes = await axios.get(`${base}api/subcategories`);
      setCategories(catRes.data || []);
      setSubCategories(subRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load data");
    }
  };

  // Handle image preview
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  // ✅ Start editing
  const handleEdit = (sub) => {
    setEditingId(sub._id);
    setForm({
      name: sub.name,
      parentCategory: sub.parentCategory?._id || sub.parentCategory,
      image: null, // new file nai ekhono
    });
    setPreview(
      sub.image ? `${base.replace(/\/$/, "")}${sub.image}` : null
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ name: "", parentCategory: "", image: null });
    setPreview(null);
  };

  // Submit handler (add + edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.parentCategory)
      return toast.warn("Please fill required fields");

    const data = new FormData();
    data.append("name", form.name);
    data.append("parentCategory", form.parentCategory);
    if (form.image) data.append("image", form.image); // optional

    try {
      setLoading(true);

      if (editingId) {
        // ✅ UPDATE
        await axios.put(`${base}api/subcategories/${editingId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Subcategory updated successfully!");
      } else {
        // ✅ CREATE
        await axios.post(`${base}api/subcategories`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Subcategory added successfully!");
      }

      setForm({ name: "", parentCategory: "", image: null });
      setPreview(null);
      setEditingId(null);
      fetchAll();
    } catch (err) {
      console.error(err);
      toast.error(
        editingId ? "Error updating subcategory" : "Error adding subcategory"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this subcategory?")) return;
    try {
      await axios.delete(`${base}api/subcategories/${id}`);
      setSubCategories(subCategories.filter((s) => s._id !== id));
      toast.info("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-slate-50 via-white to-indigo-50" />

      <div className="mx-auto max-w-full px-0 md:px-2 py-6 ">
        {/* Page Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-gray-800">
              Subcategories
            </h2>
            <p className="text-sm text-gray-500">
              Add new subcategories or manage existing ones.
            </p>
          </div>
          <span className="inline-flex h-8 items-center rounded-full border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-sm">
            Total:{" "}
            <span className="ml-1 font-medium">{subCategories.length}</span>
          </span>
        </div>

        {/* Form + List */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Add / Edit Form */}
          <aside className="lg:col-span-4">
            <div className="sticky top-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="mb-2 text-lg font-semibold text-gray-800">
                {editingId ? "Edit Subcategory" : "Add Subcategory"}
              </h3>
              <p className="mb-4 text-xs text-gray-500">
                Upload optional image and select parent category.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    placeholder="Subcategory name"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Parent Category
                  </label>
                  <select
                    value={form.parentCategory}
                    onChange={(e) =>
                      setForm({ ...form, parentCategory: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Upload Image (optional)
                  </label>
                  <label className="group flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600 hover:border-indigo-300 hover:bg-indigo-50 transition">
                    <span className="truncate">
                      {form.image ? form.image.name : "Choose an image"}
                    </span>
                    <span className="rounded-lg bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm">
                      Browse
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImage}
                    />
                  </label>
                  {preview && (
                    <div className="mt-3 rounded-xl overflow-hidden border">
                      <img
                        src={preview}
                        alt="preview"
                        className="w-full h-40 object-cover"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-2 justify-end">
                  {editingId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="w-1/2 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition font-medium text-sm shadow disabled:opacity-60"
                  >
                    {loading
                      ? "Saving..."
                      : editingId
                      ? "Update Subcategory"
                      : "Add Subcategory"}
                  </button>
                </div>
              </form>
            </div>
          </aside>

          {/* Subcategory Grid */}
          <section className="lg:col-span-8">
            {subCategories.length === 0 ? (
              <div className="rounded-2xl border bg-white p-8 text-center text-gray-500 shadow-sm">
                No subcategories found.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {subCategories.map((sub) => (
                  <div
                    key={sub._id}
                    className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-lg"
                  >
                    <div className="relative h-48 w-full overflow-hidden">
                      {sub.image ? (
                        <img
                          src={`${base.replace(/\/$/, "")}${sub.image}`}
                          alt={sub.name}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400 text-sm">
                          No image
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />

                      {/* ✅ Edit button */}
                      <button
                        onClick={() => handleEdit(sub)}
                        className="absolute left-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-800 shadow hover:bg-gray-100"
                        title="Edit subcategory"
                      >
                        <FiEdit2 />
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDelete(sub._id)}
                        className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700"
                        title="Delete subcategory"
                      >
                        <FiTrash2 />
                      </button>
                    </div>

                    <div className="border-t border-gray-100 p-3 text-center">
                      <h4 className="font-medium text-gray-800 line-clamp-1">
                        {sub.name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        Parent: {sub.parentCategory?.name || "—"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminSubCategory;
