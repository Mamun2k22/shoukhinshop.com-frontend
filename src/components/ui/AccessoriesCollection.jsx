import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const AccessoriesCollection= () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);

  const baseURL = import.meta.env.VITE_APP_SERVER_URL;

  useEffect(() => {
    const fetchMenProducts = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_APP_SERVER_URL}api/products/public/home/men?limit=12`
        );
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Error loading men collection:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenProducts();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="bg-gradient-to-br from-gray-100 via-gray-200 to-blue-100 min-h-screen py-7 px-5">
      <div className="max-w-full mx-auto text-center px-0 xl:px-3">
        <h2 className="text-2xl font-semibold mb-2">Accessories Collection</h2>
        <p className="text-gray-800 mb-8">
          Grab these new items before they are gone!
        </p>

      {/* Product Grid */}
<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5 mt-2 md:mt-8">
  {products.map((product) => {
    const oldPrice = product.price;
    // dhore nilam discount = percentage
    const newPrice =
      product.discount && product.discount > 0
        ? Math.round(oldPrice - (oldPrice * product.discount) / 100)
        : oldPrice;

    const firstImage =
      Array.isArray(product.productImage) &&
      product.productImage.length > 0
        ? product.productImage[0]
        : "";

    return (
      <div
        key={product._id}
        className="bg-white rounded-md overflow-hidden shadow relative group hover:shadow-lg transition-shadow duration-300"
      >
        {/* পুরো card content টি Link এর ভিতরে */}
        <Link
          to={`/product-details/${product._id}`}
          className="block h-full"
        >
          {/* Image wrapper (relative) */}
          <div className="relative overflow-hidden">
            {/* Discount badge */}
            {product.discount > 0 && (
              <span className="absolute top-2 left-2 z-10 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                {product.discount}%
              </span>
            )}

            {/* New label */}
            <span className="absolute top-2 right-2 z-10 bg-teal-400 text-white text-xs font-semibold px-2 py-1 rounded">
              NEW
            </span>

            {/* Product Image */}
            <img
              src={firstImage}
              alt={product.productName}
              className="w-full h-64 object-cover"
            />

            {/* Add to Cart Button (appears on hover) */}
            <div className="absolute bottom-0 py-2 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-all duration-300 bg-black bg-opacity-80">
               <Link
                      to={`/product-details/${product._id}`}
                        className="w-full  text-white font-semibold  transition-colors duration-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Add to Cart
                      </Link>
              
              {/* <button
                className="w-full py-2 text-white font-semibold hover:bg-gray-800 transition-colors duration-200"
                onClick={(e) => e.preventDefault()} // চাইলে এখানে cart logic বসাবে
              >
                Add to Cart
              </button> */}
            </div>
          </div>

          {/* Product info */}
          <div className="md:p-2 p-1.5 text-center">
            <h3 className="text-sm font-normal md:font-medium text-gray-800 mb-1">
              {product.productName}
            </h3>
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
      </div>
    );
  })}
</div>


        {/* View All button */}
        <Link to={"/accessories"}>
          <div className="mt-8">
            <button className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors duration-200">
              VIEW ALL
            </button>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AccessoriesCollection;
