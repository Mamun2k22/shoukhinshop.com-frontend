import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";

import { HiOutlineShoppingCart } from "react-icons/hi";
import { FiEye, FiHeart, FiShuffle } from "react-icons/fi";

import useCart from "../../../../hooks/useCart";
import useLoading from "../../../../hooks/useLoading";
import ProductLoader from "../../../../Spinner/ProductLoader";

// ✅ Only number formatting (৳ will be styled separately)
const formatMoney = (n) => Number(n || 0).toLocaleString();

// ✅ Guest ID generator (no login required)
const getGuestId = () => {
  let id = localStorage.getItem("guestId");
  if (!id) {
    id = (crypto?.randomUUID?.() || `guest_${Date.now()}_${Math.random()}`)
      .toString()
      .replace(/\./g, "");
    localStorage.setItem("guestId", id);
  }
  return id;
};

// ⭐ Rating (simple)
const Rating = ({ value = 4.5 }) => {
  const stars = 5;
  const full = Math.floor(value);
  const hasHalf = value - full >= 0.5;

  return (
    <div className="flex items-center gap-1 text-amber-500">
      {Array.from({ length: stars }).map((_, i) => {
        const filled = i < full;
        const half = i === full && hasHalf;

        return (
          <svg
            key={i}
            className="w-4 h-4"
            viewBox="0 0 20 20"
            fill={filled || half ? "currentColor" : "none"}
            stroke="currentColor"
          >
            <path
              d="M10 15l-5.878 3.09 1.122-6.545L.49 6.91l6.564-.955L10 .5l2.946 5.455 6.564.955-4.754 4.635 1.122 6.545z"
              strokeWidth="1"
            />
          </svg>
        );
      })}
    </div>
  );
};

const PopularProduct = () => {
  const [visibleProducts, setVisibleProducts] = useState(20);
  const showMoreProducts = () => setVisibleProducts((prev) => prev + 10);

  const { isLoading, showLoader, hideLoader } = useLoading();
  const navigate = useNavigate();
  const [, refetch] = useCart();

  const BASE = import.meta.env.VITE_APP_SERVER_URL;

  const {
    data: products = [],
    isLoading: queryLoading,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      showLoader();
      try {
        const response = await fetch(`${BASE}api/products/public?limit=60`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Network response was not ok");
        return await response.json();
      } finally {
        hideLoader();
      }
    },
  });

  useEffect(() => {
    if (!isFetching) hideLoader();
  }, [isFetching, hideLoader]);

  const { mutate: addToCart } = useMutation({
    mutationFn: async ({ productId, quantity }) => {
      const guestId = getGuestId();

      const response = await axios.post(`${BASE}api/cart`, {
        productId,
        quantity,
        customerId: guestId, // যদি backend userId চায় => userId: guestId
      });

      return response.data;
    },
    onSuccess: () => {
      refetch();
      Swal.fire({
        icon: "success",
        title: "Added to Cart",
        text: "Product has been added to your cart!",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
      });
    },
    onError: (err) => {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text:
          err?.response?.data?.message ||
          err?.message ||
          "Could not add to cart.",
      });
    },
  });

  const handleAddToCart = (productId) => addToCart({ productId, quantity: 1 });

  if (isLoading || queryLoading) return <ProductLoader />;

  if (error)
    return (
      <div className="text-center py-10 text-red-500">
        Error loading products: {error.message}
      </div>
    );

  return (
    <>
      {/* Header */}
<div className="bg-white pt-16 pb-8">
  <div className="max-w-7xl mx-auto px-4 text-center">
    {/* small label */}
    <p className="text-xs font-extrabold tracking-[0.35em] text-sky-500 uppercase">
      FEATURED
    </p>

    {/* big title (like template) */}
    <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-gray-900">
      Our ALL <span className="text-sky-500">Items</span>
    </h2>

    {/* subtle separator line */}
    <div className="mt-6 flex items-center justify-center gap-3">
      <span className="h-[2px] w-10 bg-sky-500/70 rounded-full" />
      <span className="h-2 w-2 rounded-full bg-sky-500" />
      <span className="h-[2px] w-10 bg-sky-500/20 rounded-full" />
    </div>
  </div>
</div>


      <section className="max-w-full mx-auto px-3 md:px-4 pb-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 ">
          {products.slice(0, visibleProducts).map((product) => {
            const price = Number(product?.price || 0);
            const regularPrice = Number(product?.regularPrice || 0);

            const discount =
              regularPrice > price
                ? Math.round(((regularPrice - price) / regularPrice) * 100)
                : 0;

            // ✅ Out-of-stock check (adjust if your backend uses different field)
            const isOutOfStock =
              product?.stock === 0 ||
              product?.status === "out_of_stock" ||
              product?.isOutOfStock === true;

            // ✅ Badge logic (NO HOOK)
            let badgeText = "NEW";
            let badgeCls = "bg-sky-500";

            if (isOutOfStock) {
              badgeText = "OUT OF STOCK";
              badgeCls = "bg-red-500";
            } else if (discount > 0) {
              badgeText = `${discount}% OFF`;
              badgeCls = "bg-amber-500";
            } else if (
              String(product?.tag || "").toLowerCase() === "hot" ||
              product?.isHot === true
            ) {
              badgeText = "HOT";
              badgeCls = "bg-sky-500";
            }

            return (
             <div
  key={product._id}
  className="group relative rounded-2xl bg-white border border-[#F77426] shadow-sm hover:shadow-xl transition-all duration-300"
>
  {/* Badge */}
  <div
    className={`absolute top-3 left-3 z-20 ${badgeCls} text-white text-[10px] font-bold px-3 py-1 rounded-full`}
  >
    {badgeText}
  </div>

  {/* Image area */}
  <Link
    to={`/product-details/${product._id}`}
    className="block relative overflow-hidden rounded-2xl pt-3"
  >
    <div className="h-44 sm:h-48 md:h-52 flex items-center justify-center px-4">
      <img
        src={product.productImage}
        alt={product.productName}
        loading="lazy"
        className="max-h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
      />
    </div>

    {/* Hover Actions */}
    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          navigate(`/product-details/${product._id}`);
        }}
        className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-lg hover:scale-105 transition"
        title="Quick View"
      >
        <FiEye />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          Swal.fire({
            icon: "info",
            title: "Wishlist",
            text: "Wishlist feature will be added soon!",
            timer: 1400,
            showConfirmButton: false,
          });
        }}
        className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-lg hover:scale-105 transition"
        title="Wishlist"
      >
        <FiHeart />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          Swal.fire({
            icon: "info",
            title: "Compare",
            text: "Compare feature will be added soon!",
            timer: 1400,
            showConfirmButton: false,
          });
        }}
        className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-lg hover:scale-105 transition"
        title="Compare"
      >
        <FiShuffle />
      </button>
    </div>
  </Link>

  {/* Content */}
  <div className="px-4 pb-4 pt-2">
    {/* ✅ Name now clickable (link added) */}
    <Link to={`/product-details/${product._id}`} className="block">
      <h3 className="text-[15px] font-semibold text-gray-900 line-clamp-2 min-h-[42px] hover:text-sky-600 transition">
        {product.productName}
      </h3>
    </Link>

    {/* Rating */}
    <div className="mt-2">
      <Rating value={product?.rating || 4.5} />
    </div>

    {/* Price + Cart (same row) */}
    <div className="mt-3 flex items-center justify-between gap-3">
      {/* Price */}
      <div className="flex items-end gap-2">
        <span className="text-base font-extrabold text-rose-500 leading-none">
          ৳{formatMoney(price)}
        </span>

        {regularPrice > price && (
          <span className="text-sm text-gray-400 line-through leading-none">
            ৳{formatMoney(regularPrice)}
          </span>
        )}
      </div>

      {/* Cart button (no navigation) */}
      <button
        disabled={isOutOfStock}
        onClick={() => {
          if (isOutOfStock) {
            Swal.fire({
              icon: "warning",
              title: "Out of stock",
              text: "This product is currently unavailable.",
              timer: 1600,
              showConfirmButton: false,
            });
            return;
          }
          handleAddToCart(product._id);
        }}
        className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all
          ${
            isOutOfStock
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-[#F77426] text-white hover:scale-105 hover:bg-sky-600"
          }`}
        title="Add to cart"
      >
        <HiOutlineShoppingCart className="text-lg" />
      </button>
    </div>
  </div>
</div>

            );
          })}
        </div>

        {/* Show More */}
        {visibleProducts < products.length && (
          <div className="mt-12 text-center">
            <button
              onClick={showMoreProducts}
              className="px-10 py-3 bg-white border border-sky-500 text-sky-600 font-bold rounded-full hover:bg-sky-500 hover:text-white transition-all duration-300 shadow-sm"
            >
              আরও দেখুন
            </button>
          </div>
        )}
      </section>
    </>
  );
};

export default PopularProduct;
