import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import useLoading from "../../../../hooks/useLoading";
import Loader from "../../../../Spinner/Loader";

const bgColors = [
  "bg-white",
];
// const bgColors = [
//   "bg-green-50", "bg-yellow-50", "bg-red-50", "bg-orange-50", "bg-purple-50",
//   "bg-pink-50", "bg-lime-50", "bg-indigo-50", "bg-rose-50", "bg-teal-50",
// ];

const ProductCategory = () => {
  const { isLoading, showLoader, hideLoader } = useLoading();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const { data: categories = [], error, isFetching } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      showLoader();
      const res = await fetch(`${import.meta.env.VITE_APP_SERVER_URL}api/categories`);
      const data = await res.json();
      hideLoader();
      return data;
    },
    onError: hideLoader,
  });

  const scrollAmount = 300;

  const updateScrollButtons = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  const scrollLeft = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    setTimeout(updateScrollButtons, 350);
  };

  const scrollRight = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    setTimeout(updateScrollButtons, 350);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", updateScrollButtons);
      updateScrollButtons(); // Ensure button state is correct initially
    }
    return () => {
      if (el) el.removeEventListener("scroll", updateScrollButtons);
    };
  }, [categories]);

  if (isLoading || isFetching) return <Loader />;
  if (error) return <div>Error loading categories</div>;

  return (
    <div className="relative px-4 py-6 bg-white rounded-md shadow-sm">
      <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold font-quicksand text-[20px] md:text-[26px] -tracking-tight leading-[24px] md:leading-[40px] text-[#253D4E] mx-4 mt-4">
            Featured Categories
          </h2>
        <div className="flex space-x-2">
          <button
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className={`p-2 rounded-full border shadow transition ${
              !canScrollLeft ? "cursor-not-allowed bg-gray-200" : "bg-white hover:bg-gray-100"
            }`}
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={scrollRight}
            disabled={!canScrollRight}
            className={`p-2 rounded-full border shadow transition ${
              !canScrollRight ? "cursor-not-allowed bg-gray-200" : "bg-white hover:bg-gray-100"
            }`}
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex overflow-x-auto no-scrollbar space-x-4 scroll-smooth"
      >
        {categories.map((cat, index) => (
          <Link
            key={cat._id || index}
            to={`/category/${cat.name}`}
            className={`flex flex-col items-center w-[120px] sm:w-[140px] shrink-0 p-4 rounded-lg hover:shadow transition border border-orange-300 ${
              bgColors[index % bgColors.length]
            }`}
          >
            <img
              src={cat.image}
              alt={cat.name}
              className="w-16 h-16 object-contain mb-2"
            />
            <h3 className="text-sm font-semibold text-gray-800 text-center">
              {cat.name}
            </h3>
            <p className="text-xs text-gray-500 text-center">
              {cat.productCount} items
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProductCategory;
