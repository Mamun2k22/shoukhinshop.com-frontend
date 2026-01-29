import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useLoading from "../../../../hooks/useLoading";
import "./DailyProduct.css";

// ✅ Step 1: Tailwind breakpoints অনুযায়ী function
const getCardsToShow = (width) => {
  if (width >= 1536) return 6; // 2xl
  if (width >= 1280) return 5; // xl
  if (width >= 1024) return 4; // lg
  if (width >= 640) return 3; // sm & md
  return 2; // mobile
};

const DailyBestSeller = () => {
  const [products, setProducts] = useState([]);
  const [bestSellProducts, setBestSellProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { isLoading, showLoader, hideLoader } = useLoading();

  // ✅ Step 2: Initial cardsToShow with screen width
  const [cardsToShow, setCardsToShow] = useState(
    getCardsToShow(window.innerWidth)
  );

  // ✅ Step 3: Update cardsToShow when screen resizes
  useEffect(() => {
    const handleResize = () => {
      setCardsToShow(getCardsToShow(window.innerWidth));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_APP_SERVER_URL}api/products`
        );
        setProducts(response.data);

        const bestSell = response.data.filter(
          (product) => product.categoryName === "Best sell"
        );
        setBestSellProducts(bestSell);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + cardsToShow;
      // যদি আর পরের গ্রুপ না থাকে, তাহলে আগানো যাবে না
      if (nextIndex >= bestSellProducts.length) return prevIndex;
      return nextIndex;
    });
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => {
      const prevIndexCalc = prevIndex - cardsToShow;
      // যদি আগের গ্রুপ না থাকে, তাহলে আগানো যাবে না
      if (prevIndexCalc < 0) return prevIndex;
      return prevIndexCalc;
    });
  };

  return (
    <div className="py-2 md:py-7 mx-3">
      <h2 className="font-bold font-quicksand text-[26px] -tracking-tight leading-[24px] md:leading-[40px] text-[#253D4E] lg:mt-0 mt-5 lg:text-left text-center">
        Groceries
      </h2>
      {/* Decorative line with icon */}
      <div className="flex items-center justify-start mt-0 ml-1">
        <span className="w-10 h-[2px] bg-indigo-500 rounded-full"></span>
        {/* Shopping-related icon in circle */}
        <div className="flex items-center justify-center w-7 h-7 mx-2 bg-indigo-100 rounded-full shadow-md border border-indigo-300">
          <svg
            className="w-4 h-4 text-indigo-500 "
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M6 6h15l-1.5 9h-13zM6 6L4 3H0v2h2l3 13h12v-2H6z" />{" "}
            {/* simple cart icon */}
          </svg>
        </div>
        <span className="w-10 h-[2px] bg-indigo-500 rounded-full"></span>
      </div>

      <div className=" gap-5 mt-5">
        {/* <div className="hidden lg:block w-1/3">
          <img
            className="w-full h-auto object-cover rounded-lg"
            src="https://i.ibb.co.com/9ZrhyB8/White-Minimal-Summer-Sale-Discount-Clothes-Instagram-Story-291-x-402-px-1.png"
            alt="Sale"
          />
        </div> */}

        <div className="relative w-full">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className={`absolute z-10 -left-4 sm:-left-5 md:-left-2 top-1/2 transform -translate-y-1/2 
      p-3 rounded-full shadow-md flex justify-center items-center
      ${
        currentIndex === 0
          ? "bg-gray-300 cursor-not-allowed"
          : "bg-blue-500 hover:bg-blue-600 text-white transition-all"
      }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Carousel Items */}
          <div className="flex gap-2 md:gap-4 scrollbar-hide scroll-smooth">
            {bestSellProducts
              .slice(currentIndex, currentIndex + cardsToShow)
              .map((product) => (
                <Link
                  key={product._id}
                  to={`/product-details/${product._id}`}
                  className="flex-shrink-0 w-[48%] sm:w-[31%] md:w-[23%] xl:w-[19%] 2xl:w-[15.5%] pb-4 bg-white border hover:border-purple-400 rounded-xl shadow-md transition-all duration-300"
                >
                  <div>
                    <span className="bg-gradient-to-r from-blue-500 to-blue-700 text-white text-xs font-medium px-5 py-1.5 rounded-tl-xl rounded-br-2xl">
                      Top
                    </span>
                  </div>

                  <div className="px-3 py-1">
                    <div className="flex justify-center mb-2">
                      <img
                        src={product.productImage}
                        alt={product.productName}
                        className="w-full h-48 sm:h-44 md:h-40 object-cover rounded-md"
                      />
                    </div>
                    <p className="text-gray-500 text-xs font-sans">
                      {product.category}
                    </p>
                    <h2 className="text-[15px] font-semibold text-gray-800 mb-2">
                      {product.productName}
                    </h2>

                    <div className="flex items-center mb-2">
                      {[...Array(4)].map((_, i) => (
                        <span key={i} className="text-yellow-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                            />
                          </svg>
                        </span>
                      ))}
                      <span className="text-gray-300">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-2 w-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                          />
                        </svg>
                      </span>
                      <span className="text-gray-500 text-sm ml-2">(5.0)</span>
                    </div>

                    <div className="flex justify-between items-center mb-4">
                      <div className="text-base font-bold text-gray-800">
                        ৳ {product.price}
                      </div>
                      <button className="bg-gradient-to-r from-blue-500 to-blue-700 py-0.5 px-2.5 rounded-xl text-xs text-white">
                        {product.stock > 0 ? "In Stock" : "Out of Stock"}
                      </button>
                    </div>

                    <div className="flex">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-700 h-1 w-[50%] rounded-l-lg"></div>
                      <div className="bg-gray-300 h-1 w-[50%] rounded-r-lg"></div>
                    </div>

                    <button className="mt-3 w-full flex justify-center items-center bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold px-0 py-2 rounded-md text-sm hover:scale-105 transition-transform duration-300">
                      <svg
                        className="h-3 w-3 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 3h18l-1.5 9H4.5L3 3zm6 13a2 2 0 114 0 2 2 0 01-4 0zm10 2a2 2 0 110-4 2 2 0 010 4z"
                        />
                      </svg>
                      Order now
                    </button>
                  </div>
                </Link>
              ))}
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={currentIndex + cardsToShow >= bestSellProducts.length}
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full shadow-md flex justify-center items-center
      ${
        currentIndex + cardsToShow >= bestSellProducts.length
          ? "bg-gray-300 cursor-not-allowed"
          : "bg-blue-500 hover:bg-blue-600 text-white transition-all"
      }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyBestSeller;
