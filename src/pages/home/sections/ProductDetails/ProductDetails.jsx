import React, { useEffect, useMemo, useState } from "react";
import { FaStar, FaRegStar } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Slider from "react-slick";
import "./productDetails.css";
import { useLoaderData, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import RelatedProduct from "../RelatedProduct";
import useCart from "../../../../hooks/useCart";
import { useUser } from "../../../../hooks/userContext";
import { useMutation } from "@tanstack/react-query";
import Swal from "sweetalert2";
import axios from "axios";
import DealsOffer from "../../../../components/DealsOffer";
import { addRecentlyViewed } from "../../../../utils/recentlyViewed";
import ProductReviews from "../../../../components/reviews/ProductReviews";

/* ---------- helpers ---------- */
const money = (n) => `৳ ${Number(n || 0).toLocaleString()}`;
const isHex = (s) =>
  typeof s === "string" && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s);

export default function ProductDetails() {
  const [activeTab, setActiveTab] = useState("description");
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const qc = useQueryClient();
const API = import.meta.env.VITE_APP_SERVER_URL;


  const product = useLoaderData();
  const navigate = useNavigate();
  const [, refetchCart] = useCart();
  const { user } = useUser();
  const userId = user?.id;

  const {
    _id,
    sku,
    productName,
    brand,
    price = 0,
    discount = 0,
    ratings = 0,
    status,
    stock,
    categoryName,
    details = "",
    longDetails = "",
    productImage = [],
    sizeWeight = [],
    color = [],
  } = product || {};

  useEffect(() => window.scrollTo(0, 0), []);

  useEffect(() => {
    if (product?._id) addRecentlyViewed(product);
  }, [product?._id]);

  useEffect(() => {
  if (!_id) return;

  // ✅ Reviews আগেই load হয়ে যাবে
  qc.prefetchQuery({
    queryKey: ["reviews", _id],
    queryFn: async () => {
      const res = await axios.get(`${API}api/reviews/product/${_id}`);
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}, [_id, qc]);

  /* ---------- derived ---------- */
  const finalPrice = useMemo(
    () => Math.max(0, Number(price) - Number(discount || 0)),
    [price, discount]
  );

  const sizes = useMemo(
    () =>
      Array.isArray(sizeWeight)
        ? sizeWeight.filter((x) => x?.size).map((x) => x.size)
        : [],
    [sizeWeight]
  );

  const specs = useMemo(() => {
    const rows = [];
    if (brand) rows.push(["Brand", brand]);
    if (sku) rows.push(["SKU", sku]);
    if (categoryName) rows.push(["Category", categoryName]);
    if (typeof stock === "number")
      rows.push(["Stock", stock > 0 ? `${stock} pcs` : "Out of stock"]);
    if (status) rows.push(["Status", status.replace(/_/g, " ")]);
    if (sizes.length) rows.push(["Available Sizes", sizes.join(", ")]);
    if (Array.isArray(color) && color.length) {
      rows.push([
        "Colors",
        color.map((c, i) => (
          <span key={i} className="inline-flex items-center gap-1 mr-2">
            <span className="text-slate-700">{isHex(c) ? "" : c}</span>
            <span
              className="inline-block w-3.5 h-3.5 rounded-full border border-slate-200"
              title={c}
              style={{ background: c }}
            />
          </span>
        )),
      ]);
    }
    return rows;
  }, [brand, sku, categoryName, stock, status, sizes, color]);

  /* ---------- add to cart ---------- */
  const { mutate: addToCart } = useMutation({
    mutationFn: async (payload) => {
      const res = await axios.post(
        `${import.meta.env.VITE_APP_SERVER_URL}api/cart`,
        payload
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
    onError: () =>
      toast.error("Failed to add product to cart. Please try again."),
  });

  const ensureSelections = () => {
    if (sizes.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return false;
    }
    if (color.length > 0 && !selectedColor) {
      toast.error("Please select a color");
      return false;
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!ensureSelections()) return;
    if (!userId) {
      Swal.fire({
        icon: "warning",
        title: "Please Login",
        text: "You need to log in to add products to your cart.",
        confirmButtonText: "Go to Login",
      }).then((r) => r.isConfirmed && navigate("/login"));
      return;
    }
    addToCart({
      userId,
      productId: _id,
      quantity,
      selectedSize,
      selectedColor,
    });
  };

  const handleBuyNowClick = () => {
    if (!ensureSelections()) return;
    if (!userId) {
      Swal.fire({
        icon: "warning",
        title: "Please Login",
        text: "You need to log in to add products to your cart.",
        confirmButtonText: "Go to Login",
      }).then((r) => r.isConfirmed && navigate("/login"));
      return;
    }
    navigate("/buy-checkout", {
      state: {
        productDetails: {
          userId,
          productId: _id,
          quantity,
          selectedSize,
          selectedColor,
          price: finalPrice,
          productImage,
          productName,
        },
      },
    });
  };

  /* ---------- slider ---------- */
  const settings = {
    customPaging: (i) => (
      <a>
        <img
          className="w-full h-full object-cover"
          src={productImage[i]}
          alt={`Thumb ${i}`}
        />
      </a>
    ),
    dots: true,
    dotsClass: "slick-dots slick-thumb",
    infinite: true,
    speed: 450,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  const ratingValue = Number(ratings || 0);
  const inStock = typeof stock === "number" ? stock > 0 : true;

  /* ---------- inline highlights (chips) ---------- */
  const highlightPairs = useMemo(() => {
    // only show these 4 up top
    const wanted = new Set(["Brand", "SKU", "Category", "Stock"]);
    return specs.filter(([k]) => wanted.has(k)).slice(0, 4);
  }, [specs]);

  return (
    <>
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-5 sm:py-8 lg:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
            {/* Gallery */}
            <div className="lg:col-span-6 xl:col-span-5">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="relative">
                  <div className="absolute z-10 top-3 left-3 flex gap-2">
                    {discount > 0 && (
                      <span className="rounded-full bg-blue-600 text-white text-xs font-bold px-3 py-1">
                        Save {money(discount)}
                      </span>
                    )}
                    {!inStock && (
                      <span className="rounded-full bg-rose-600 text-white text-xs font-bold px-3 py-1">
                        Out of stock
                      </span>
                    )}
                  </div>

                  {productImage?.length <= 1 ? (
                    <div className="p-3 sm:p-4">
                      <img
                        className="w-full aspect-square object-contain rounded-xl bg-slate-50"
                        src={productImage?.[0]}
                        alt={productName || "Product"}
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="p-3 sm:p-4">
                      <Slider {...settings}>
                        {productImage.map((src, idx) => (
                          <div key={idx} className="px-1 sm:px-2">
                            <img
                              className="w-full aspect-square object-contain rounded-xl bg-slate-50"
                              src={src}
                              alt={`Product ${idx}`}
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </Slider>
                    </div>
                  )}
                </div>
              </div>

              {/* mobile short details */}
              {details && (
                <p className="mt-4 text-sm text-slate-700 leading-relaxed lg:hidden">
                  {details}
                </p>
              )}
            </div>

            {/* Right Info */}
            <div className="lg:col-span-6 xl:col-span-7">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6 lg:p-7">
                <div className="flex flex-col gap-2">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-slate-900 leading-snug">
                    {productName}
                  </h1>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    {sku && (
                      <span className="text-slate-500">
                        SKU:{" "}
                        <span className="font-medium text-slate-700">
                          {sku}
                        </span>
                      </span>
                    )}
                    {brand && (
                      <span className="text-slate-500">
                        Brand:{" "}
                        <span className="font-medium text-slate-700">
                          {brand}
                        </span>
                      </span>
                    )}
                    {categoryName && (
                      <span className="text-slate-500">
                        Category:{" "}
                        <span className="font-semibold text-blue-600">
                          {categoryName}
                        </span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center text-yellow-400 text-sm">
                      {[...Array(5)].map((_, i) =>
                        i < Math.round(ratingValue) ? (
                          <FaStar key={i} />
                        ) : (
                          <FaRegStar key={i} />
                        )
                      )}
                    </div>
                    <span className="text-slate-600 text-sm">
                      {ratingValue.toFixed(1)} rating
                    </span>
                    {inStock ? (
                      <span className="ml-2 inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1">
                        In stock
                      </span>
                    ) : (
                      <span className="ml-2 inline-flex items-center rounded-full bg-rose-50 text-rose-700 text-xs font-semibold px-2.5 py-1">
                        Out of stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="mt-5 flex items-end gap-3">
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900">
                    {money(finalPrice)}
                  </div>
                  {discount > 0 && (
                    <div className="text-base sm:text-lg font-semibold text-slate-400 line-through">
                      {money(price)}
                    </div>
                  )}
                </div>

                {/* ✅ Highlights upore (chips) */}
                {highlightPairs.length > 0 && (
                  <div className="mt-5">
                    <p className="text-sm font-semibold text-slate-900 mb-2">
                      Highlights
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {highlightPairs.map(([k, v], i) => {
                        const isStockLabel = k === "Stock";
                        const stockOut =
                          typeof v === "string" &&
                          v.toLowerCase().includes("out");
                        const chipClass =
                          isStockLabel && stockOut
                            ? "border-rose-200 bg-rose-50 text-rose-700"
                            : "border-slate-200 bg-slate-50 text-slate-700";

                        return (
                          <span
                            key={i}
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs sm:text-sm ${chipClass}`}
                          >
                            <span className="text-slate-500">{k}:</span>
                            <span className="font-semibold text-slate-900">
                              {Array.isArray(v) ? v : v}
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* desktop short details */}
                {details && (
                  <p className="mt-4 text-sm text-slate-700 leading-relaxed hidden lg:block">
                    {details}
                  </p>
                )}

                {/* options */}
                <div className="mt-6 space-y-5">
                  {/* Colors */}
                  {Array.isArray(color) && color.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Select Color
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2.5">
                        {color.map((c, i) => {
                          const active = selectedColor === c;
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setSelectedColor(c)}
                              title={c}
                              className={`h-8 w-8 rounded-full border transition
                                ${
                                  active
                                    ? "ring-2 ring-blue-500 ring-offset-2 border-transparent"
                                    : "border-slate-200 hover:scale-105"
                                }`}
                              style={{ backgroundColor: c }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Sizes */}
                  {sizes.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Select Size
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {sizes.map((sz) => {
                          const active = selectedSize === sz;
                          return (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => setSelectedSize(sz)}
                              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition
                                ${
                                  active
                                    ? "bg-slate-900 text-white border-slate-900"
                                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                }`}
                            >
                              {sz}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Quantity */}
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Quantity
                    </p>
                    <div className="mt-2 inline-flex items-center rounded-md border border-slate-200 overflow-hidden bg-white">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-9 h-9 grid place-items-center bg-slate-50 text-lg font-bold text-slate-800 hover:bg-slate-100 transition"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        }
                        className="w-16 h-11 text-center outline-none border-x border-slate-200 text-slate-900 font-semibold"
                      />
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => q + 1)}
                        className="w-11 h-11 grid place-items-center bg-slate-50 text-sm font-bold text-slate-800 hover:bg-slate-100 transition"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Actions (desktop/tablet) */}
                <div className="mt-7 hidden sm:flex flex-wrap gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="px-4 py-[8px] rounded-md font-semibold text-white
                               bg-gradient-to-r from-fuchsia-600 to-indigo-600
                               shadow-sm hover:shadow-md hover:opacity-95 active:scale-[.99]
                               transition"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={handleBuyNowClick}
                    className="px-4 py-[8px] rounded-md font-semibold text-white
                               bg-gradient-to-r from-blue-600 to-cyan-600
                               shadow-sm hover:shadow-md hover:opacity-95 active:scale-[.99]
                               transition"
                  >
                    Buy Now
                  </button>
                </div>

                <p className="mt-4 text-xs text-slate-500 sm:hidden">
                  Tip: Choose size/color before checkout.
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-8 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex flex-wrap gap-2 p-3 sm:p-4 border-b border-slate-100 bg-slate-50">
              {[
                { key: "description", label: "Description" },
                { key: "additional", label: "Additional info" },
                { key: "vendor", label: "Vendor" },
                { key: "reviews", label: "Reviews" },
              ].map((t) => {
                const active = activeTab === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className={`px-4 py-2 rounded text-sm font-semibold transition
                      ${
                        active
                          ? "bg-slate-900 text-white"
                          : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                      }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            <div className="p-4 sm:p-6 text-slate-700 text-sm sm:text-base leading-7">
              {activeTab === "description" && (
                <>
                  {longDetails ? (
                    <p className="mb-4">{longDetails}</p>
                  ) : (
                    <p className="mb-4 text-slate-500">
                      No additional description.
                    </p>
                  )}
                </>
              )}

              {activeTab === "additional" &&
                (specs.length ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-[420px] w-full border border-slate-200 rounded-xl overflow-hidden">
                      <tbody>
                        {specs.map(([label, value], i) => (
                          <tr
                            key={i}
                            className="border-b last:border-0 border-slate-200"
                          >
                            <th className="w-48 text-left bg-slate-50 px-3 py-3 font-semibold text-slate-700">
                              {label}
                            </th>
                            <td className="px-3 py-3 text-slate-800">
                              {Array.isArray(value) ? value : value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-slate-500">No additional information.</p>
                ))}

              {activeTab === "vendor" && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-900">
                    Vendor Information
                  </h4>
                  <p className="mb-2">Sold By: shoukhinshop</p>
                  <p className="mb-2">Country: Bangladesh</p>
                  <p className="mb-2">Contact: info@shoukhinshop.com</p>
                </div>
              )}
              {activeTab === "reviews" && <ProductReviews productId={_id} />}
            </div>
          </div>
        </div>

        {/* Mobile sticky action bar */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-slate-200">
          <div className="mx-auto max-w-full px-4 py-3 flex items-center gap-3">
            <div className="min-w-[90px]">
              <div className="text-base text-slate-500">Total</div>
              <div className="text-base font-bold text-slate-900">
                {money(finalPrice)}
              </div>
            </div>
            <button
              onClick={handleAddToCart}
              className="flex-1 py-3 px-2 rounded-md font-semibold text-white
                         bg-gradient-to-r from-fuchsia-600 to-indigo-600
                         shadow-sm active:scale-[.99] transition text-[14px]"
            >
              Add to Cart
            </button>
            <button
              onClick={handleBuyNowClick}
              className="flex-1 px-3 py-3 rounded-md font-semibold text-white
                         bg-gradient-to-r from-blue-600 to-cyan-600
                         shadow-sm active:scale-[.99] transition text-[14px]"
            >
              Buy Now
            </button>
          </div>
        </div>

        {/* bottom padding for sticky bar */}
        <div className="sm:hidden h-8" />
      </div>

      <div>
        <RelatedProduct categoryName={categoryName} excludeId={_id} />
        <ToastContainer />
      </div>

      <DealsOffer />
    </>
  );
}
