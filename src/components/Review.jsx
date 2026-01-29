import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";
import useAdminReviews from "../hooks/useAdminReviews";

const API = import.meta.env.VITE_APP_SERVER_URL;

const formatDate = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB"); // dd/mm/yyyy
};

const imgUrl = (src) => {
  if (!src) return "";
  if (src.startsWith("http")) return src;
  if (src.startsWith("/")) return `${API}${src}`;
  return `${API}uploads/${src}`;
};

const Stars = ({ value = 0 }) => {
  const v = Math.round(Number(value || 0));
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className="w-4 h-4" viewBox="0 0 14 13" fill="none">
          <path
            d="M7 0L9.4687 3.60213L13.6574 4.83688L10.9944 8.29787L11.1145 12.6631L7 11.2L2.8855 12.6631L3.00556 8.29787L0.342604 4.83688L4.5313 3.60213L7 0Z"
            fill={i <= v ? "#facc15" : "#e5e7eb"}
          />
        </svg>
      ))}
      <span className="text-xs text-slate-500 ml-2">{v}.0</span>
    </div>
  );
};

const Badge = ({ children, tone = "slate" }) => {
  const map = {
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    green: "bg-green-50 text-green-700 border-green-200",
    red: "bg-red-50 text-red-700 border-red-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
  };
  return (
    <span className={`px-2 py-0.5 text-xs rounded-full border ${map[tone]}`}>
      {children}
    </span>
  );
};

export default function Review() {
  const { data, isLoading, isError, error, deleteReview, toggleHide } =
    useAdminReviews();

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all"); // all | visible | hidden

  const reviews = data?.reviews || [];

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();

    return reviews.filter((r) => {
      const productName = (r?.product?.name || r?.product?.title || "").toLowerCase();
      const userName = (r?.user?.name || "").toLowerCase();
      const text = (r?.comment || "").toLowerCase();
      const title = (r?.title || "").toLowerCase();

      const matches =
        !term ||
        productName.includes(term) ||
        userName.includes(term) ||
        text.includes(term) ||
        title.includes(term);

      const passFilter =
        filter === "all"
          ? true
          : filter === "visible"
          ? !r?.isHidden
          : !!r?.isHidden;

      return matches && passFilter;
    });
  }, [reviews, q, filter]);

  const stats = useMemo(() => {
    const total = reviews.length;
    const hidden = reviews.filter((r) => r?.isHidden).length;
    const visible = total - hidden;
    return { total, hidden, visible };
  }, [reviews]);

  const onDelete = (id) => {
    if (!confirm("Delete this review?")) return;
    deleteReview.mutate(id, {
      onSuccess: () => toast.success("Review deleted"),
      onError: (e) => toast.error(e?.response?.data?.message || "Delete failed"),
    });
  };

  const onToggleHide = (reviewId, nextHidden) => {
    toggleHide.mutate(
      { reviewId, isHidden: nextHidden },
      {
        onSuccess: () =>
          toast.success(nextHidden ? "Review hidden" : "Review visible"),
        onError: (e) => toast.error(e?.response?.data?.message || "Failed"),
      }
    );
  };

  return (
    <div className="p-2">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">All Reviews</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage customer reviews (hide/unhide for public visibility)
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge tone="slate">Total: {stats.total}</Badge>
            <Badge tone="green">Visible: {stats.visible}</Badge>
            <Badge tone="red">Hidden: {stats.hidden}</Badge>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex-1">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by product, user, title, comment..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="all">All</option>
              <option value="visible">Visible (Public)</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
        </div>

        {/* States */}
        {isLoading && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 text-slate-500">
            Loading reviews...
          </div>
        )}

        {isError && (
          <div className="bg-white border border-red-200 rounded-xl p-6 text-red-600">
            {error?.response?.data?.message || error?.message || "Failed to load"}
          </div>
        )}

        {/* Table */}
        {!isLoading && !isError && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-4 text-left text-xs font-semibold text-slate-600 uppercase">
                      Product
                    </th>
                    <th className="p-4 text-left text-xs font-semibold text-slate-600 uppercase">
                      User
                    </th>
                    <th className="p-4 text-left text-xs font-semibold text-slate-600 uppercase">
                      Rating
                    </th>
                    <th className="p-4 text-left text-xs font-semibold text-slate-600 uppercase">
                      Date
                    </th>
                    <th className="p-4 text-left text-xs font-semibold text-slate-600 uppercase">
                      Status
                    </th>
                    <th className="p-4 text-right text-xs font-semibold text-slate-600 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-sm text-slate-500">
                        No reviews found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r) => {
                      const productName =
                        r?.product?.name || r?.product?.title || "Product";
                      const userName = r?.user?.name || "User";
                      const avatar = imgUrl(r?.user?.profileImage);
                      const hidden = !!r?.isHidden;

                      return (
                        <tr key={r._id} className="hover:bg-slate-50">
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-slate-900">
                                {productName}
                              </span>
                              <span className="text-xs text-slate-500 line-clamp-1">
                                {r?.title || "—"}
                              </span>
                            </div>
                          </td>

                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {avatar ? (
                                <img
                                  src={avatar}
                                  className="w-8 h-8 rounded-full object-cover border"
                                  alt="user"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-slate-200" />
                              )}
                              <div className="flex flex-col">
                                <span className="text-sm text-slate-900 font-medium">
                                  {userName}
                                </span>
                                {r?.isVerifiedPurchase ? (
                                  <span className="text-xs text-green-700">
                                    Verified Buyer
                                  </span>
                                ) : (
                                  <span className="text-xs text-slate-500">
                                    —
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="p-4">
                            <Stars value={r?.rating} />
                          </td>

                          <td className="p-4 text-sm text-slate-600">
                            {formatDate(r?.createdAt)}
                          </td>

                          <td className="p-4">
                            {hidden ? (
                              <Badge tone="red">Hidden</Badge>
                            ) : (
                              <Badge tone="green">Visible</Badge>
                            )}
                          </td>

                          <td className="p-4">
                            <div className="flex items-center justify-end gap-2">
                              {/* Hide/Show toggle */}
                              <button
                                onClick={() => onToggleHide(r._id, !hidden)}
                                disabled={toggleHide.isPending}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${
                                  hidden
                                    ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                    : "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                                } disabled:opacity-60`}
                              >
                                {hidden ? "Show" : "Hide"}
                              </button>

                              {/* Delete */}
                              <button
                                title="Delete"
                                onClick={() => onDelete(r._id)}
                                disabled={deleteReview.isPending}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg border bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 text-xs text-slate-500">
              Showing <span className="font-semibold">{filtered.length}</span> of{" "}
              <span className="font-semibold">{reviews.length}</span> reviews
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
