import React, { useMemo, useState } from "react";
import { FaStar } from "react-icons/fa";
import { toast } from "react-toastify";
import useReviews from "../../hooks/useReviews";
import { useUser } from "../../hooks/userContext";

const pct = (n) => `${Math.round(n)}%`;

function Stars({ value = 0, size = 18, className = "" }) {
  const v = Number(value || 0);
  return (
    <div className={`flex items-center gap-0.5 text-orange-500 ${className}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <FaStar
          key={i}
          size={size}
          className={i <= Math.round(v) ? "" : "opacity-30"}
        />
      ))}
    </div>
  );
}

// fallback avatar
const initials = (name = "User") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0]?.toUpperCase())
    .join("");

const timeAgo = (date) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
};

export default function ProductReviews({ productId }) {
  const { user } = useUser();
  const { data, isLoading, addReview } = useReviews(productId);

  const [openForm, setOpenForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState([]);


  const summary = data?.summary || { ratingAvg: 0, ratingCount: 0 };
  const reviews = data?.reviews || [];

  // rating distribution (UI bar)
  const distribution = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of reviews) {
      const rr = Math.min(5, Math.max(1, Number(r?.rating || 0)));
      counts[rr] += 1;
    }
    const total = Math.max(1, reviews.length);
    const toPercent = (n) => (n / total) * 100;
    return {
      counts,
      percents: {
        5: toPercent(counts[5]),
        4: toPercent(counts[4]),
        3: toPercent(counts[3]),
        2: toPercent(counts[2]),
        1: toPercent(counts[1]),
      },
      total: reviews.length,
    };
  }, [reviews]);

  const images = useMemo(() => {
    const arr = [];
    for (const r of reviews) {
      if (Array.isArray(r?.images)) {
        r.images.forEach((src) => src && arr.push(src));
      }
    }
    return arr.slice(0, 12);
  }, [reviews]);

const submit = () => {
  if (!user) return toast.error("Please login to write a review");
  if (!rating) return toast.error("Please select rating");
  if (!comment.trim()) return toast.error("Please write your review");

  const fd = new FormData();
  fd.append("productId", productId);
  fd.append("rating", String(rating));
  fd.append("title", title);
  fd.append("comment", comment);

  files.slice(0, 6).forEach((file) => fd.append("images", file)); // key must be "images"

  addReview.mutate(fd, {
    onSuccess: () => {
      toast.success("Review submitted");
      setOpenForm(false);
      setRating(0);
      setTitle("");
      setComment("");
      setFiles([]);
    },
    onError: (e) => {
      toast.error(e?.response?.data?.message || "Failed to submit review");
    },
  });
};


  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-screen-xl mx-auto">
          <div className="h-6 w-40 bg-slate-200 rounded animate-pulse mb-4" />
          <div className="h-28 w-full bg-slate-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex max-lg:flex-col gap-12">
          {/* LEFT */}
          <div className="max-w-sm w-full">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 !leading-tight mb-2">
                Customer reviews
              </h2>

              <div className="flex items-center gap-2">
                <Stars value={summary.ratingAvg} />
                <p className="text-slate-900 font-semibold text-sm">
                  {Number(summary.ratingAvg || 0).toFixed(1)} out of 5
                </p>
              </div>

              <p className="mt-4 text-slate-600 text-sm">
                global ratings (
                {Number(
                  summary.ratingCount || distribution.total || 0
                ).toLocaleString()}
                )
              </p>
            </div>

            {/* Rating Bars */}
            <div className="space-y-1 mt-6">
              {[5, 4, 3, 2, 1].map((r) => (
                <div key={r} className="flex items-center">
                  <div className="min-w-9">
                    <p className="text-sm text-slate-900">{r}.0</p>
                  </div>

                  <div className="bg-gray-300 rounded w-full h-3">
                    <div
                      className="h-full rounded bg-orange-500"
                      style={{ width: `${distribution.percents[r]}%` }}
                    />
                  </div>

                  <div className="min-w-14">
                    <p className="text-sm text-slate-900 ml-4">
                      {pct(distribution.percents[r])}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <hr className="border-gray-300 my-6" />

            {/* By feature (static for now) */}
            {/* <div>
              <h3 className="text-lg font-semibold text-slate-900 !leading-tight mb-6">
                By feature
              </h3>

              <ul className="space-y-3">
                {[
                  { label: "Picture quality", value: 5.0 },
                  { label: "Value for money", value: 4.8 },
                  { label: "Screen quality", value: 4.8 },
                ].map((x) => (
                  <li
                    key={x.label}
                    className="flex sm:items-center justify-between max-sm:flex-col gap-2 text-slate-900 text-sm"
                  >
                    <span>{x.label}</span>
                    <span className="flex items-center gap-0.5">
                      <Stars value={x.value} />
                      <p className="pl-1">{x.value.toFixed(1)}</p>
                    </span>
                  </li>
                ))}
              </ul>
            </div> */}

            <hr className="border-gray-300 my-6" />

            {/* Write review */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 !leading-tight mb-4">
                Review this product
              </h3>
              <p className="mt-4 text-slate-600 text-sm">
                Share your thoughts with other customers
              </p>

              <button
                type="button"
                onClick={() => setOpenForm((s) => !s)}
                className="cursor-pointer px-4 py-2 text-white font-medium text-sm rounded-md mt-6 bg-orange-500 hover:bg-orange-600"
              >
                Write a customer review
              </button>

              {openForm && (
                <div className="mt-4 bg-white border border-slate-200 rounded-xl p-4">
                  <p className="font-semibold text-slate-900 mb-2">
                    Your rating
                  </p>
                  <div className="flex items-center gap-1 text-orange-500">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRating(n)}
                        className="p-1"
                        aria-label={`Rate ${n}`}
                      >
                        <FaStar className={n <= rating ? "" : "opacity-30"} />
                      </button>
                    ))}
                    <span className="text-sm text-slate-600 ml-2">
                      {rating ? `${rating}.0` : ""}
                    </span>
                  </div>

                  <div className="mt-3">
                    <label className="text-sm text-slate-700 font-medium">
                      Title (optional)
                    </label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mt-1 w-full border border-slate-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-200"
                      placeholder="Quick and Easy Experience"
                    />
                  </div>

                  <div className="mt-3">
                    <label className="text-sm text-slate-700 font-medium">
                      Review
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="mt-1 w-full border border-slate-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-200"
                      rows={4}
                      placeholder="Share your experience..."
                    />
                  </div>
                  <div className="mt-3">
  <label className="text-sm text-slate-700 font-medium">
    Add images (optional)
  </label>

  <input
    type="file"
    accept="image/*"
    multiple
    onChange={(e) => setFiles(Array.from(e.target.files || []))}
    className="mt-1 w-full text-sm"
  />

  {files.length > 0 && (
    <div className="flex gap-3 mt-3 overflow-auto">
      {files.slice(0, 6).map((f, i) => (
        <img
          key={i}
          src={URL.createObjectURL(f)}
          className="w-24 h-24 object-cover rounded border"
          alt="preview"
        />
      ))}
    </div>
  )}

  <p className="text-xs text-slate-500 mt-2">Max 6 images</p>
</div>


                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={submit}
                      disabled={addReview.isPending}
                      className="px-4 py-2 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold disabled:opacity-60"
                    >
                      {addReview.isPending ? "Submitting..." : "Submit"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpenForm(false)}
                      className="px-4 py-2 rounded-md border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 mt-2">
                    Note: Review submit করতে আপনার delivered order থাকতে হবে।
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex-1">
            {/* Images row */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 !leading-tight mb-4">
                Reviews with Images
              </h3>

              {images.length ? (
                <div className="flex items-center gap-4 overflow-auto">
                  {images.map((src, i) => (
              <img
  key={i}
  src={src.startsWith("http") ? src : `${import.meta.env.VITE_APP_SERVER_URL}${src}`}
  className="bg-gray-100 object-cover p-2 w-[232px] h-[232px]"
  alt={`review-img-${i}`}
  loading="lazy"
/>

                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No review images yet.</p>
              )}
            </div>

            {/* Reviews list */}
            <div className="divide-y divide-gray-300 mt-8">
              {reviews.length === 0 ? (
                <div className="py-6">
                  <p className="text-slate-500 text-sm">No reviews yet.</p>
                </div>
              ) : (
                reviews.map((r) => {
                  const name = r?.user?.name || "User";
                  const when = timeAgo(r?.createdAt);
                  const avatarRaw = r?.user?.profileImage || "";
                  const avatar =
                    avatarRaw && avatarRaw.startsWith("http")
                      ? avatarRaw
                      : avatarRaw
                      ? `${
                          import.meta.env.VITE_APP_SERVER_URL
                        }uploads/${avatarRaw}`
                      : "";

                  return (
                    <div key={r._id} className="py-6">
                      <div className="flex items-center gap-4">
                        <div className="shrink-0">
                          {avatar ? (
                            <img
                              src={avatar}
                              className="object-cover rounded-full w-11 h-11 border-2 border-gray-400"
                              alt="customer"
                              loading="lazy"
                            />
                          ) : (
                            <div className="object-cover rounded-full w-11 h-11 border-2 border-gray-300 bg-slate-100 grid place-items-center text-slate-700 font-bold">
                              {initials(name)}
                            </div>
                          )}
                        </div>

                        <div>
                          <p className="text-sm text-slate-900 font-semibold">
                            {name}
                          </p>

                          <div className="flex items-center gap-2 mt-2">
                            {r?.isVerifiedPurchase && (
                              <>
                                <span className="w-4 h-4 flex items-center justify-center rounded-full bg-green-600/20">
                                  <span className="w-2 h-2 rounded-full bg-green-700" />
                                </span>
                                <p className="text-slate-600 text-xs">
                                  Verified Buyer
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h6 className="text-slate-900 text-[15px] font-semibold">
                          {r?.title || "Customer review"}
                        </h6>

                        <div className="flex items-center space-x-0.5 text-orange-500 mt-2">
                          <Stars value={r?.rating} />
                          <p className="text-slate-600 text-sm !ml-2">{when}</p>
                        </div>

                        <div className="mt-4">
                          <p className="text-slate-600 text-sm leading-relaxed">
                            {r?.comment}
                          </p>
                        </div>

                        {/* review images */}
                        {Array.isArray(r?.images) && r.images.length > 0 && (
                          <div className="flex items-center gap-4 mt-4 overflow-auto">
                            {r.images.slice(0, 8).map((src, i) => (
                              <img
                                key={i}
                                src={src}
                                className="bg-gray-100 object-cover p-2 w-48 h-48"
                                alt={`review-img-${i}`}
                                loading="lazy"
                              />
                            ))}
                          </div>
                        )}

                        {/* vendor reply */}
                        {r?.reply?.text && (
                          <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-4">
                            <p className="text-slate-900 font-semibold text-sm">
                              Vendor reply
                            </p>
                            <p className="text-slate-600 text-sm mt-1">
                              {r.reply.text}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {reviews.length > 0 && (
                <div className="py-6">
                  <button
                    type="button"
                    className="cursor-pointer text-blue-700 font-medium border-0 outline-0 bg-transparent text-sm leading-relaxed"
                    onClick={() => toast.info("Pagination can be added here")}
                  >
                    See all reviews
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* RIGHT end */}
        </div>
      </div>
    </div>
  );
}
