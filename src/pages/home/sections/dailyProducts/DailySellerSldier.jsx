import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./DailyProduct.css";

const getCardsToShow = (width) => {
  if (width >= 1536) return 4;
  if (width >= 1280) return 4;
  if (width >= 1024) return 3;
  if (width >= 640) return 2;
  return 1;
};

const DailyBestSeller = () => {
  const [bestSellProducts, setBestSellProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [cardsToShow, setCardsToShow] = useState(
    getCardsToShow(window.innerWidth)
  );
  const [activeTab, setActiveTab] = useState("featured");

  useEffect(() => {
    const handleResize = () => setCardsToShow(getCardsToShow(window.innerWidth));
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchBestSellProducts = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_APP_SERVER_URL}api/categories/best-sell`
        );
        setBestSellProducts(response.data || []);
      } catch (error) {
        console.error("Error fetching best sell products:", error);
      }
    };
    fetchBestSellProducts();
  }, []);

  const tabbedProducts = useMemo(() => {
    const arr = [...bestSellProducts];

    if (activeTab === "new") {
      return arr.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
    }
    if (activeTab === "popular") {
      return arr.sort(
        (a, b) =>
          (b.ratingAvg || b.ratings || 0) - (a.ratingAvg || a.ratings || 0)
      );
    }
    return arr;
  }, [bestSellProducts, activeTab]);

  const handleNext = () => {
    setCurrentIndex((prev) => {
      const next = prev + cardsToShow;
      if (next >= tabbedProducts.length) return prev;
      return next;
    });
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => {
      const next = prev - cardsToShow;
      if (next < 0) return prev;
      return next;
    });
  };

  const canPrev = currentIndex > 0;
  const canNext = currentIndex + cardsToShow < tabbedProducts.length;

  return (
    // ✅ overflow fix here
    <section className="py-6 overflow-x-hidden">
      {/* Header row */}
      <div className="mx-3 flex items-center justify-between gap-3">
        <h2 className="text-3xl font-extrabold text-[#253D4E]">
          Daily Best Sells
        </h2>

        <div className="hidden sm:flex items-center gap-5 text-sm">
          <button
            onClick={() => setActiveTab("featured")}
            className={`${
              activeTab === "featured"
                ? "text-green-600 font-semibold"
                : "text-gray-500"
            } hover:text-green-600`}
          >
            Featured
          </button>
          <button
            onClick={() => setActiveTab("popular")}
            className={`${
              activeTab === "popular"
                ? "text-green-600 font-semibold"
                : "text-gray-500"
            } hover:text-green-600`}
          >
            Popular
          </button>
          <button
            onClick={() => setActiveTab("new")}
            className={`${
              activeTab === "new"
                ? "text-green-600 font-semibold"
                : "text-gray-500"
            } hover:text-green-600`}
          >
            New added
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="mx-3 mt-6 flex gap-6">
        {/* Left banner */}
        <div className="hidden lg:block w-[280px] flex-shrink-0">
          <div className="relative bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl overflow-hidden h-full shadow-lg">
            <div className="absolute top-4 left-4 text-white">
              <span className="bg-yellow-400 text-red-600 px-3 py-1 rounded-full text-sm font-bold">
                Save 35%
              </span>
              <h3 className="text-4xl font-bold mt-4 leading-tight">
                Best <br /> sale
              </h3>
              <p className="text-lg mt-2">Bring nature</p>
              <p className="text-lg">into your</p>
              <p className="text-lg">home</p>
              <button className="mt-6 bg-white text-orange-500 px-6 py-2 rounded-full font-semibold hover:bg-orange-50 transition">
                Shop Now →
              </button>
            </div>
            <div className="absolute bottom-0 right-0 opacity-20">
              <svg
                className="w-48 h-48 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Right carousel area */}
        {/* ✅ extra safety overflow hidden */}
        <div className="relative flex-1 overflow-x-hidden">
          {/* Left Arrow */}
          <button
            onClick={handlePrevious}
            disabled={!canPrev}
            // ✅ -left-3 removed -> left-2
            className={`absolute z-10 left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full flex items-center justify-center shadow
              ${
                canPrev
                  ? "bg-white hover:bg-gray-50"
                  : "bg-gray-200 cursor-not-allowed"
              }`}
            aria-label="Previous"
          >
            ‹
          </button>

          {/* Cards row */}
          <div className="flex gap-5">
            {tabbedProducts
              .slice(currentIndex, currentIndex + cardsToShow)
              .map((p) => {
                const price = Number(p.price || 0);

                const img =
                  Array.isArray(p.productImage) && p.productImage.length
                    ? p.productImage[0]
                    : p.productImage || p.image || "";

                const badgeText = p.discount ? `Save ${p.discount}%` : "Bestsale";

                const sold = Number(p.sold || 90);
                const total = Number(p.total || 120);
                const pct =
                  total > 0
                    ? Math.min(100, Math.round((sold / total) * 100))
                    : 0;

                return (
                  <div
                    key={p._id}
                    className="flex-shrink-0 w-full sm:w-[48%] lg:w-[32%] xl:w-[24%]"
                  >
                    <div className="bg-white border rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden h-full">
                      <div className="px-4 pt-4">
                        <span
                          className={`inline-block text-xs font-semibold px-3 py-1 rounded-full
                          ${
                            p.discount
                              ? "bg-pink-500 text-white"
                              : "bg-orange-400 text-white"
                          }`}
                        >
                          {badgeText}
                        </span>
                      </div>

                      <Link
                        to={`/product-details/${p._id}`}
                        className="block px-6 pt-4"
                      >
                        <div className="h-40 flex items-center justify-center">
                          <img
                            src={img}
                            alt={p.productName}
                            className="max-h-40 w-auto object-contain"
                            loading="lazy"
                          />
                        </div>
                      </Link>

                      <div className="px-6 pb-5">
                        <p className="text-xs text-gray-400 mt-3">Hodo Foods</p>

                        <Link to={`/product-details/${p._id}`}>
                          <h3 className="mt-1 text-sm font-bold text-[#253D4E] line-clamp-2">
                            {p.productName}
                          </h3>
                        </Link>

                        <div className="flex items-center gap-1 mt-2">
                          <div className="text-yellow-400 text-sm">★★★★☆</div>
                          <span className="text-xs text-gray-400 ml-1">
                            (5.0)
                          </span>
                        </div>

                        <div className="mt-3 flex items-end gap-2">
                          <span className="text-green-600 font-extrabold">
                            ৳ {price.toLocaleString()}
                          </span>
                          {p.regularPrice && (
                            <span className="text-gray-400 text-xs line-through">
                              ৳ {Number(p.regularPrice).toLocaleString()}
                            </span>
                          )}
                        </div>

                        <div className="mt-3">
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Sold: {sold}/{total}
                          </p>
                        </div>

                        <Link
                          to={`/product-details/${p._id}`}
                          className="mt-4 inline-flex w-full items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-lg"
                        >
                          Add To Cart
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Right Arrow */}
          <button
            onClick={handleNext}
            disabled={!canNext}
            // ✅ -right-3 removed -> right-2
            className={`absolute z-10 right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full flex items-center justify-center shadow
              ${
                canNext
                  ? "bg-white hover:bg-gray-50"
                  : "bg-gray-200 cursor-not-allowed"
              }`}
            aria-label="Next"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
};

export default DailyBestSeller;