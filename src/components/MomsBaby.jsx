import React, { useMemo } from "react";
import { FaStar, FaRegStar } from "react-icons/fa";
import { FiHeart, FiSearch } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import Swal from "sweetalert2";

import { useUser } from "../hooks/userContext";
import useCart from "../hooks/useCart";
import useLoading from "../hooks/useLoading";
import ProductLoader from "../Spinner/ProductLoader";

/* ---------------- helpers ---------------- */
const fmtBDT = (n) =>
  typeof n === "number" ? `৳${n.toFixed(2)}` : `৳${Number(n || 0).toFixed(2)}`;

const pickImg = (p) =>
  Array.isArray(p?.productImage)
    ? p.productImage[0]
    : typeof p?.productImage === "string"
    ? p.productImage
    : p?.image || "/placeholder.png";

const pickTitle = (p) => p?.productName || p?.title || "—";

/* ---------------- main ---------------- */
export default function GroceryShowcase() {
  const { isLoading: loadingUi, showLoader, hideLoader } = useLoading();
  const { user } = useUser();
  const userId = user?.id;
  const navigate = useNavigate();
  const [, refetchCart] = useCart();

  // fetch public products
  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products", "grocery-ui"],
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

  // featured -> Special Offer (বাম দিকের বড় কার্ড)
  const featured = useMemo(() => {
    if (!products?.length) return null;
    return (
      products.find(
        (p) => pickImg(p) && pickTitle(p) && typeof p?.price !== "undefined"
      ) || products[0]
    );
  }, [products]);

  /* ----------- mutations ----------- */
  const { mutate: addToCart } = useMutation({
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
        timer: 1300,
        showConfirmButton: false,
      });
    },
    onError: () => {
      Swal.fire({
        icon: "error",
        title: "Could not add to cart",
        timer: 1500,
        showConfirmButton: false,
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

  const handleCompare = (title) => {
    Swal.fire({
      icon: "info",
      title: "Added to Compare",
      text: title,
      timer: 1100,
      showConfirmButton: false,
    });
  };

  if (loadingUi || isLoading) return <ProductLoader />;
  if (error)
    return (
      <div className="py-10 text-center text-red-600">
        Error: {error.message}
      </div>
    );
  if (!products.length)
    return <div className="py-10 text-center">No products found.</div>;

  // ডান পাশের গ্রিডের জন্য তালিকা
  const list = products.filter((p) => p !== featured);
  const safe = (i) => list[i] || products[i] || featured;

  return (
    <div className="max-w-[1240px] mx-auto px-0 py-10">
     <div className="flex flex-col sm:flex-row items-center justify-center mt-6 sm:mt-8 space-y-3 sm:space-y-0">
  {/* left widget */}
  <div className="flex-1 flex items-center w-full sm:w-auto">
    <span className="h-px w-full bg-gray-300"></span>
    <span className="ml-2 h-2 w-2 rounded-full bg-gray-400"></span>
  </div>

  {/* centered title */}
  <h1
    className="mx-4 text-3xl  md:text-3xl font-bold tracking-wide
               drop-shadow-md text-center font-arneFreytag"
  >
    Mom&apos;s &amp; Baby Care
  </h1>

  {/* right widget */}
  <div className="flex-1 flex items-center w-full sm:w-auto">
    <span className="mr-2 h-2 w-2 rounded-full bg-gray-400"></span>
    <span className="h-px w-full bg-gray-300"></span>
  </div>
</div>


      {/* পুরো ব্লক: বামে special offer, ডানে 4x2 গ্রিড */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-8">
        {/* -------- Special Offer (Left) -------- */}
        <SpecialOfferCard featured={featured} />

        {/* -------- Right Grid (4 x 2) -------- */}
        <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* উপরের সারি */}
          <Tile
            product={safe(0)}
            onAdd={handleAddToCart}
            onCompare={handleCompare}
          />
          <Tile
            product={safe(1)}
            onAdd={handleAddToCart}
            onCompare={handleCompare}
          />
          <Tile
            product={safe(2)}
            onAdd={handleAddToCart}
            onCompare={handleCompare}
          />
          <Tile
            product={safe(3)}
            onAdd={handleAddToCart}
            onCompare={handleCompare}
          />
          {/* নিচের সারি */}
          <Tile
            product={safe(4)}
            onAdd={handleAddToCart}
            onCompare={handleCompare}
          />
          <Tile
            product={safe(5)}
            onAdd={handleAddToCart}
            onCompare={handleCompare}
          />
          <Tile
            product={safe(6)}
            onAdd={handleAddToCart}
            onCompare={handleCompare}
          />
          <Tile
            product={safe(7)}
            onAdd={handleAddToCart}
            onCompare={handleCompare}
          />
        </div>
      </div>
    </div>
  );
}

/* ---------------- Special Offer (left big card) ---------------- */
function SpecialOfferCard({ featured }) {
  const id = featured?._id || featured?.id;
  const img = pickImg(featured);
  const title = pickTitle(featured);

  const price = Number(featured?.price || 0);
  // ডেমো oldPrice—তোমার চাইলে API-র ফিল্ড ব্যবহার করো
  const oldPrice =
    typeof featured?.oldPrice !== "undefined"
      ? Number(featured.oldPrice)
      : price > 0
      ? price + 5
      : null;

  return (
    <div className="rounded-md shadow-sm bg-white px-6 pt-6 pb-0 flex flex-col">
      <h3 className="text-[24px] font-semibold text-center">Special Offer</h3>
      <div className="h-px bg-gray-200 mt-4 mb-6" />

      <Link to={`/product-details/${id}`} className="block">
        <img
          src={img}
          alt={title}
          className="w-full max-w-[260px] mx-auto object-contain"
        />
      </Link>

      <Link to={`/product-details/${id}`} className="mt-5">
        <h4 className="text-sm font-semibold text-center hover:text-orange-600">
          {title}
        </h4>
      </Link>

      <div className="text-center mt-2">
        {oldPrice && (
          <span className="text-gray-400 line-through mr-2">
            {fmtBDT(oldPrice)}
          </span>
        )}
        <span className="text-orange-600 font-bold">{fmtBDT(price)}</span>
      </div>

      <p className="text-[12.5px] text-gray-500 text-center px-3 mt-3 mb-6">
        {featured?.shortDescription ||
          "Lorem Khaled Ipsum is a major key to success. Elliptical talk many variations passage."}
      </p>

      <Link to={`/product-details/${id}`}>
        <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-b-md">
          SELECT OPTIONS
        </button>
      </Link>
    </div>
  );
}

/* ---------------- Single tile (screenshot design) ---------------- */
function Tile({ product, onAdd, onCompare }) {
  const id = product?._id || product?.id;
  const img = pickImg(product);
  const title = pickTitle(product);
  const rating = Number(product?.rating || 0);
  const price = Number(product?.price || 0);
  const oldPrice = product?.oldPrice ? Number(product.oldPrice) : null;
  const sale = !!product?.sale || (oldPrice && oldPrice > price);

  return (
    <div className="relative border rounded-md shadow-sm bg-white p-3 hover:shadow-md transition">
      {/* wishlist + quick-view (সবসময় দৃশ্যমান) */}
      <div className="absolute left-2 top-2 flex gap-1">
        <button
          title="Wishlist"
          className="w-8 h-8 rounded-full bg-white border flex items-center justify-center text-gray-600 hover:text-red-500"
        >
          <FiHeart />
        </button>
        <Link
          to={`/product-details/${id}`}
          title="Quick view"
          className="w-8 h-8 rounded-full bg-white border flex items-center justify-center text-gray-600 hover:text-blue-600"
        >
          <FiSearch />
        </Link>
      </div>

      {/* SALE badge (ডান উপরে) */}
      {sale && (
        <span className="absolute right-2 top-2 text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded">
          SALE
        </span>
      )}

      {/* image */}
      <Link to={`/product-details/${id}`} className="block pt-6">
        <img src={img} alt={title} className="w-full h-32 object-contain" />
      </Link>

      {/* title */}
      <Link to={`/product-details/${id}`}>
        <h4 className="mt-2 text-[15px] font-medium leading-snug hover:text-orange-600 line-clamp-2">
          {title}
        </h4>
      </Link>

      {/* rating */}
      <div className="flex text-yellow-500 text-xs my-1">
        {[...Array(5)].map((_, i) =>
          i < Math.round(rating) ? <FaStar key={i} /> : <FaRegStar key={i} />
        )}
      </div>

      {/* price */}
      <div className="mt-1">
        {oldPrice && (
          <span className="text-gray-400 line-through mr-2">
            {fmtBDT(oldPrice)}
          </span>
        )}
        <span className="text-orange-600 font-bold">{fmtBDT(price)}</span>
      </div>

      {/* bottom actions: Add to Cart (orange) + Compare (outline) */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => onAdd?.(id)}
          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2 rounded"
        >
          Add To Cart
        </button>
      </div>
    </div>
  );
}
