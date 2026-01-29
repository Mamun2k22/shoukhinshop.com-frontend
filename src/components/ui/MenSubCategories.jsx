import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const withBase = (path) => {
  const base = import.meta.env.VITE_APP_SERVER_URL || "";
  const needsSlash = base.endsWith("/") ? "" : "/";
  return `${base}${needsSlash}${String(path).replace(/^\/+/, "")}`;
};

// LEFT arrow
const ArrowLeftIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-6 h-6 text-gray-700"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 19l-7-7 7-7"
    />
  </svg>
);

// RIGHT arrow
const ArrowRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-6 h-6 text-gray-700"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 5l7 7-7 7"
    />
  </svg>
);

// generic image container
const ImgIcon = ({ src, alt }) => (
  <img
    src={src}
    alt={alt}
    loading="lazy"
    className="w-16 h-16 md:w-48 md:h-40 object-cover"
  />
);

// একসাথে কয়টা টাইল দেখাবো
const VISIBLE_SUB_TILES = 6;

const MenSubCategories = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [subTiles, setSubTiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subsLoading, setSubsLoading] = useState(true);
  const [activeSubId, setActiveSubId] = useState(null);

  // visible window start index
  const [startIndex, setStartIndex] = useState(0);

  // 👉 MEN products
  useEffect(() => {
    const fetchAllMenProducts = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_APP_SERVER_URL}api/products/public/home/men?all=true`
        );
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setAllProducts(list);
        setProducts(list); // শুরুতে সব MEN product
      } catch (err) {
        console.error("Error loading men products:", err);
        setAllProducts([]);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllMenProducts();
  }, []);

  // 👉 MEN subcategories
  useEffect(() => {
    const fetchMenSubs = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_APP_SERVER_URL}api/subcategories`
        );
        const data = await res.json();

        const menSubs = (Array.isArray(data) ? data : []).filter(
          (sub) => sub.parentCategory?.name === "Men"
        );

        setSubTiles(menSubs);
      } catch (err) {
        console.error("Error loading men subcategories:", err);
        setSubTiles([]);
      } finally {
        setSubsLoading(false);
      }
    };

    fetchMenSubs();
  }, []);
  


  return (
    <>


      {/* নিচের products অংশ – আগের মতোই */}
      <div className="bg-gradient-to-br from-gray-100 via-gray-200 to-blue-100 py-10">
        <div className="max-w-full xl:px-8 mx-auto">
          <h3 className="text-2xl font-semibold mb-6 text-center md:text-left">
            All Men&apos;s Products
          </h3>

          {loading ? (
            <div className="text-center py-10">Loading...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-10 text-gray-600">
              No products found for this category.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mx-4 md:mx-0">
              {products.map((product) => {
                const oldPrice = product.price;
                const newPrice =
                  product.discount && product.discount > 0
                    ? Math.round(
                        oldPrice - (oldPrice * product.discount) / 100
                      )
                    : oldPrice;

                const firstImage =
                  Array.isArray(product.productImage) &&
                  product.productImage.length > 0
                    ? product.productImage[0]
                    : "";

                return (
                  <Link
                    to={`/product-details/${product._id}`}
                    key={product._id}
                    className="bg-white rounded-md overflow-hidden shadow relative group hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="relative overflow-hidden">
                      {product.discount > 0 && (
                        <span className="absolute top-2 left-2 z-10 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                          {product.discount}%
                        </span>
                      )}

                      <span className="absolute top-2 right-2 z-10 bg-teal-400 text-white text-xs font-semibold px-2 py-1 rounded">
                        NEW
                      </span>

                      <img
                        src={firstImage}
                        alt={product.productName}
                        className="w-full h-64 object-cover"
                      />

                      <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-all duration-300 bg-black bg-opacity-80">
                        <button className="w-full py-2 text-white font-semibold hover:bg-gray-800 transition-colors duration-200">
                          Add to Cart
                        </button>
                      </div>
                    </div>

                    <div className="md:p-2 p-1.5 text-center">
                      <h4 className="text-sm font-semibold text-gray-800 mb-1">
                        {product.productName}
                      </h4>
                      <div className="flex justify-center items-center gap-2">
                        {product.discount > 0 && (
                          <div className="text-gray-500 line-through text-xs">
                            Tk. {oldPrice}
                          </div>
                        )}
                        <div className="text-red-600 font-semibold text-sm">
                          Tk. {newPrice}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MenSubCategories;
