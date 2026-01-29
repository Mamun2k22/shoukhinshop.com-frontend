import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import useLoading from "../../hooks/useLoading";
import Loader from "../../Spinner/Loader";
import { motion } from "framer-motion";

const ProductCategory = () => {
  const { isLoading, showLoader, hideLoader } = useLoading();
  const BASE = import.meta.env.VITE_APP_SERVER_URL;

  const toAbsoluteUrl = (baseUrl, path) => {
    if (!path) return "";
    const s = String(path);
    if (s.startsWith("http://") || s.startsWith("https://")) return s;

    const baseClean = String(baseUrl || "").replace(/\/$/, "");
    if (s.startsWith("/")) return `${baseClean}${s}`;
    return `${baseClean}/${s}`;
  };

  const {
    data: categories = [],
    error,
    isFetching,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      showLoader();
      const res = await fetch(`${BASE}api/categories`);
      const data = await res.json();
      hideLoader();
      return data;
    },
    onError: hideLoader,
  });

  useEffect(() => {
    if (!isFetching) hideLoader();
  }, [isFetching, hideLoader]);

  if (isLoading || isFetching) return <Loader />;
  if (error)
    return (
      <div className="py-10 text-center text-red-500 font-medium">
        Error loading categories
      </div>
    );

  const containerVariants = {
    hidden: { opacity: 0, y: 6 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: "easeOut" },
    },
  };

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 md:mb-12"
        >
          <p className="text-xs md:text-sm font-semibold tracking-widest text-gray-500 uppercase">
            Browse Collections
          </p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-900">
            Top Categories
          </h2>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto text-base md:text-lg">
            Explore curated collections designed for every style and occasion
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6"
        >
          {categories.map((cat, idx) => {
            const to = `/category/${encodeURIComponent(cat?.slug || cat?.name)}`;
            const imgSrc = toAbsoluteUrl(BASE, cat?.image);

            return (
              <motion.div
                key={cat._id || idx}
                variants={itemVariants}
                className="group"
              >
                <Link to={to} className="block">
                  <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    {/* Image */}
                    <div className="relative aspect-[4/5] bg-gray-50">
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt={cat?.name || "Category"}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">
                          No Image
                        </div>
                      )}

                      {/* Subtle overlay for readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-90" />
                    </div>

                    {/* Content */}
                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                      <div className="flex items-end justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-lg sm:text-xl font-semibold text-white">
                            {cat?.name}
                          </h3>
                          <p className="mt-1 text-xs sm:text-sm text-white/85">
                            Shop now
                          </p>
                        </div>

                        {/* Arrow chip */}
                        <div className="shrink-0 rounded-full bg-white/15 backdrop-blur px-3 py-2 border border-white/15 transition-all duration-300 group-hover:bg-white/20 group-hover:translate-x-0.5">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M14 5l7 7m0 0l-7 7m7-7H3"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Focus ring */}
                    <div className="pointer-events-none absolute inset-0 rounded-2xl ring-0 ring-gray-900/5 transition group-hover:ring-4" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ✅ Removed: View All Categories button */}
      </div>
    </section>
  );
};

export default ProductCategory;
