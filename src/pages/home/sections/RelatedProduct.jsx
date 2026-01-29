import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import React from "react";

const RelatedProduct = ({ categoryName, excludeId }) => {
  const {
    data: products,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["relatedProducts", categoryName, excludeId],
    queryFn: async () => {
      const url = excludeId
        ? `${
            import.meta.env.VITE_APP_SERVER_URL
          }api/products/related/${categoryName}?excludeId=${excludeId}`
        : `${
            import.meta.env.VITE_APP_SERVER_URL
          }api/products/related/${categoryName}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error)
    return (
      <div>Error loading related products: {error.message}</div>
    );

  // max 5 like before
  const relatedProducts = Array.isArray(products) ? products.slice(0, 5) : [];

  return (
    <div className="mt-2">
      <h2 className="font-bold font-quicksand 2xl:mx-4 xl:mx-7 text-[26px] -tracking-tight leading-[24px] md:leading-[40px] text-[#253D4E] text-center lg:text-left border border-blue-400 lg:border-none rounded-md mx-10 lg:mx-0 py-2 lg:py-0">
        Related Products
      </h2>

      {/* HOME PAGE STYLE GRID + CARD */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5 mt-3 mx-5 md:mx-4">
        {relatedProducts.map((product) => {
          const oldPrice = Number(product.price || 0);
          const discount = Number(product.discount || 0);

          const newPrice =
            discount > 0
              ? Math.round(oldPrice - (oldPrice * discount) / 100)
              : oldPrice;

          const firstImage =
            Array.isArray(product.productImage) &&
            product.productImage.length > 0
              ? product.productImage[0]
              : product.productImage || product.image || "";

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
                {/* Image wrapper */}
                <div className="relative overflow-hidden">
                  {discount > 0 && (
                    <span className="absolute top-2 left-2 z-10 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                      {discount}%
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

                  {/* hover এ Add to Cart bar */}
                  <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-all duration-300 bg-black bg-opacity-80">
                    <button
                      className="w-full py-2 text-white font-semibold hover:bg-gray-800 transition-colors duration-200"
                      onClick={(e) => e.preventDefault()} // চাইলে এখানে কার্ট action বসাতে পারো
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>

                {/* Product info */}
                <div className="md:p-2 p-1.5 text-center">
                  <h3 className="text-sm font-normal md:font-medium text-gray-800 mb-1 line-clamp-2">
                    {product.productName}
                  </h3>
                  <div className="flex justify-center items-center gap-2">
                    {discount > 0 && (
                      <div className="text-gray-500 line-through text-xs">
                        Tk. {oldPrice.toLocaleString()}
                      </div>
                    )}
                    <div className="text-red-600 font-semibold text-sm">
                      Tk. {newPrice.toLocaleString()}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RelatedProduct;
