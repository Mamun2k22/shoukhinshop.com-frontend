import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiTrash2 } from "react-icons/fi";

/**
 * Modern admin layout combining "Post Banner" + "All Banners"
 * - Functionality preserved: same fetch + delete logic.
 * - Added a presentational Post form (title + image) styled only. If you already
 *   have a separate post handler, replace onSubmit with yours; the fields/markup stay.
 */
const BannerList = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // local ui state for the Post card (does not change listing logic)
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_SERVER_URL}api/banners`
      );
      setBanners(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching banners:", error);
      setMessage("Failed to load banners.");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this banner?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_APP_SERVER_URL}api/banners/${id}`
      );
      setBanners(banners.filter((banner) => banner._id !== id));
      setMessage("Banner deleted successfully.");
    } catch (error) {
      console.error("Error deleting banner:", error);
      setMessage("Failed to delete banner.");
    }
  };

  // OPTIONAL: basic submit keeping the same endpoint shape (title + image)
  const handlePost = async (e) => {
    e.preventDefault();
    if (!file) return;
    setPosting(true);
    try {
      const form = new FormData();
      if (title) form.append("title", title);
      form.append("image", file);
      await axios.post(
        `${import.meta.env.VITE_APP_SERVER_URL}api/banners`,
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setTitle("");
      setFile(null);
      setMessage("Banner posted successfully.");
      fetchBanners();
    } catch (err) {
      console.error(err);
      setMessage("Failed to post banner.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="relative">
      {/* Subtle app background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-slate-50 via-white to-indigo-50" />

      <div className="mx-auto max-w-full px-0 md:px-2 py-6 ">
        {/* Page heading */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">
              Banner Studio
            </h2>
            <p className="text-sm text-gray-500">
              Post a new banner and manage all existing artwork.
            </p>
          </div>
          <span className="inline-flex h-8 items-center rounded-full border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-sm">
            Total: <span className="ml-1 font-medium">{banners.length}</span>
          </span>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm">
            {message}
          </div>
        )}

        {/* 2-column layout: Post (sticky) + All Banners grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Post Banner Card */}
          <aside className="lg:col-span-4">
            <div className="sticky top-6 rounded-2xl border border-gray-200 bg-white/80 p-5 shadow-sm backdrop-blur">
              <h3 className="mb-1 text-lg font-semibold">Post Banner</h3>
              <p className="mb-4 text-xs text-gray-500">
                Add a title (optional) and upload an image.
              </p>

              <form
                onSubmit={handlePost}
                className="space-y-4"
                encType="multipart/form-data"
              >
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Banner title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Summer Sale 2025"
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Upload image
                  </label>
                  <label className="group flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600 transition hover:border-indigo-300 hover:bg-indigo-50">
                    <span className="truncate">
                      {file ? file.name : "Choose an image (JPG/PNG)"}
                    </span>
                    <span className="rounded-lg bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm">
                      Browse
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="reset"
                    onClick={() => {
                      setTitle("");
                      setFile(null);
                    }}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm hover:bg-gray-50"
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    disabled={posting || !file}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {posting ? "Posting…" : "Post"}
                  </button>
                </div>
              </form>
            </div>
          </aside>

          {/* All Banners Grid */}
          <section className="lg:col-span-8">
            {loading ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm">
                Loading banners...
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {banners.map((banner) => (
                  <div
                    key={banner._id}
                    className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-lg"
                  >
                    <div className="relative h-52 w-full overflow-hidden">
                      <img
                        src={`${import.meta.env.VITE_APP_SERVER_URL}${
                          banner.imageUrl
                        }`}
                        alt={banner.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                        loading="lazy"
                      />

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />

                      <button
                        onClick={() => handleDelete(banner._id)}
                        className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-white/80"
                        title="Delete banner"
                      >
                        <FiTrash2 />
                      </button>
                    </div>

                    {(banner.title || "").trim() && (
                      <div className="border-t border-gray-100 p-3">
                        <p className="line-clamp-1 text-sm font-medium text-gray-800">
                          {banner.title}
                        </p>
                      </div>
                    )}
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

export default BannerList;
