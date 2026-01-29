import React, { useMemo } from "react";
import { FaStar, FaRegStar } from "react-icons/fa";
import { FiHeart } from "react-icons/fi";
import { useNavigate, Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import Swal from "sweetalert2";

import { useUser } from "../hooks/userContext";
import useCart from "../hooks/useCart";
import useLoading from "../hooks/useLoading";
import ProductLoader from "../Spinner/ProductLoader";

// ---------- helpers ----------
const fmtUSD = (n) =>
  typeof n === "number" ? `$${n.toFixed(2)}` : `$${Number(n || 0).toFixed(2)}`;

const pickImg = (p) =>
  Array.isArray(p?.productImage)
    ? p.productImage[0]
    : typeof p?.productImage === "string"
    ? p.productImage
    : p?.image || "/placeholder.png";

const pickTitle = (p) => p?.productName || p?.title || "—";

// ---------- main ----------
export default function GroceryItems() {
  const { isLoading: loadingUi, showLoader, hideLoader } = useLoading();
  const { user } = useUser();
  const userId = user?.id;
  const navigate = useNavigate();
  const [, refetchCart] = useCart();

  // fetch products (public)
  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products", "grocery"],
    queryFn: async () => {
      showLoader();
      const res = await fetch(
        `${import.meta.env.VITE_APP_SERVER_URL}api/products/public?limit=60`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Failed to load products");
      const data = await res.json();
      hideLoader();
      return data;
    },
    onError: hideLoader,
    staleTime: 15_000,
    keepPreviousData: true,
  });

  // pick a "featured" product (center tall card)
  const featured = useMemo(() => {
    if (!products?.length) return null;
    // যেটার image/price/title আছে—সেটাই
    return (
      products.find(
        (p) => pickImg(p) && pickTitle(p) && typeof p?.price !== "undefined"
      ) || products[0]
    );
  }, [products]);

  // Add to cart (same behavior as PopularProduct)
  const { mutate: addToCart, isPending: adding } = useMutation({
    mutationFn: async ({ productId, quantity }) => {
      const res = await axios.post(
        `${import.meta.env.VITE_APP_SERVER_URL}api/cart`,
        { productId, userId, quantity }
      );
      return res.data;
    },
    onSuccess: () => {
      refetchCart();
      Swal.fire({
        icon: "success",
        title: "Added to Cart",
        text: "Product has been added to your cart!",
      });
    },
    onError: () => {
      Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text: "Could not add to cart. Please try again.",
      });
    },
  });

  const handleAddToCart = (id) => {
    if (!userId) {
      Swal.fire({
        icon: "warning",
        title: "Please Login",
        text: "You need to log in to add products to your cart.",
        confirmButtonText: "Go to Login",
      }).then((r) => r.isConfirmed && navigate("/login"));
      return;
    }
    addToCart({ productId: id, quantity: 1 });
  };

  if (loadingUi || isLoading) return <ProductLoader />;
  if (error) return <div className="py-10 text-center text-red-600">Error: {error.message}</div>;
  if (!products.length) return <div className="py-10 text-center">No products found.</div>;

  // we want to mimic the screenshot's layout:
  // grid 5-cols on lg, 2-rows; center card spans 2 rows
  // For the surrounding cards, just take first few items (excluding featured)
  const list = products.filter((p) => p !== featured);
  const safe = (i) => list[i] || products[i] || featured;

  return (
   <div className="max-w-screen-xl mx-auto px-4 py-10">
  <h2 className="text-3xl font-semibold text-center mb-8">Grocery Items</h2>

  {/* 👇 mobile: 2 cols | md: 3 cols | lg: 5 cols + 2 rows */}
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 lg:grid-rows-2 gap-3 md:gap-4">
    {/* Row 1 - Col 1 & 2 */}
    <ProductCard product={safe(0)} onAdd={handleAddToCart} />
    <ProductCard product={safe(1)} onAdd={handleAddToCart} />

    {/* Center Feature (Row span 2 on lg only) */}
    <div className="lg:col-span-1 lg:row-span-2 border border-orange-400 p-3 md:p-4 rounded-md shadow bg-white text-center flex flex-col justify-between">
      <img
        src={pickImg(featured)}
        alt={pickTitle(featured)}
        className="w-full h-28 md:h-40 lg:max-h-[260px] object-contain mx-auto"
      />
      <h3 className="font-semibold text-sm md:text-lg mt-3 md:mt-4">{pickTitle(featured)}</h3>
      <p className="text-red-500 font-bold mt-1 md:mt-2">{fmtUSD(Number(featured?.price || 0))}</p>
      <p className="text-xs md:text-sm text-gray-500 my-2 line-clamp-3">
        {featured?.shortDescription || "Handpicked box with assorted goodies for quick snacking."}
      </p>
      <Link to={`/product-details/${featured?._id || featured?.id || ""}`}>
        <button className="bg-orange-500 hover:bg-orange-600 transition text-white font-semibold py-2 rounded w-full">
          SELECT OPTIONS
        </button>
      </Link>
    </div>

    {/* Row 1 - Col 4 & 5 */}
    <ProductCard product={safe(2)} onAdd={handleAddToCart} />
    <ProductCard product={safe(3)} onAdd={handleAddToCart} />

    {/* Row 2 - Col 1 & 2 & 4 & 5 */}
    <ProductCard product={safe(4)} onAdd={handleAddToCart} />
    <ProductCard product={safe(5)} onAdd={handleAddToCart} />
    <ProductCard product={safe(6)} onAdd={handleAddToCart} />
    <ProductCard product={safe(7)} onAdd={handleAddToCart} />
  </div>
</div>

  );
}

// ---------- card (UI fixed as screenshot, only dynamic data + actions) ----------
function ProductCard({ product, onAdd }) {
  const id = product?._id || product?.id;
  const img = pickImg(product);
  const title = pickTitle(product);
  const rating = Number(product?.rating || 0);
  const price = Number(product?.price || 0);
  const oldPrice = product?.oldPrice ? Number(product.oldPrice) : null;
  const sale = !!product?.sale || (oldPrice && oldPrice > price);

  return (
    <div className="relative border border-orange-200 p-3 rounded-md shadow hover:shadow-md transition bg-white flex flex-col">
      {/* Sale Badge */}
      {sale && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded font-bold">
          SALE!
        </div>
      )}

      {/* Wishlist (UI only) */}
      <div className="absolute top-2 left-2 flex gap-1 text-gray-500">
        <FiHeart className="hover:text-red-500 cursor-pointer" />
      </div>

      {/* Image */}
      <Link to={`/product-details/${id}`}>
        <img src={img} alt={title} className="w-full h-36 object-contain mb-2 mt-6" />
      </Link>

      {/* Title */}
      <Link to={`/product-details/${id}`}>
        <h4 className="text-sm font-medium line-clamp-2 hover:text-orange-600">{title}</h4>
      </Link>

      {/* Rating */}
      <div className="flex text-yellow-500 text-sm my-1">
        {[...Array(5)].map((_, i) =>
          i < Math.round(rating) ? <FaStar key={i} /> : <FaRegStar key={i} />
        )}
      </div>

      {/* Price */}
      <p className="text-sm mt-auto">
        {oldPrice ? <span className="line-through text-gray-400 mr-1">{fmtUSD(oldPrice)}</span> : null}
        <span className="text-orange-600 font-bold">{fmtUSD(price)}</span>
      </p>

      {/* Add to Cart */}
      <button
        onClick={() => onAdd?.(id)}
        className="bg-orange-500 hover:bg-orange-600 mt-2 text-white text-sm font-semibold py-1 rounded disabled:opacity-50"
      >
        Add To Cart
      </button>
    </div>
  );
}
