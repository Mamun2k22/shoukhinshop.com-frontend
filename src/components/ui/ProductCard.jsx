import React from "react";
import { Link } from "react-router-dom";

const ProductCard = ({ product, to }) => {
  const oldPrice = Number(product?.price || 0);

  const discount = Number(product?.discount || 0);
  const newPrice =
    discount > 0 ? Math.round(oldPrice - (oldPrice * discount) / 100) : oldPrice;

  // men collection এর মতো productImage array handle + all products এর string handle
  const firstImage = Array.isArray(product?.productImage)
    ? product.productImage?.[0]
    : product?.productImage || "";

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm relative group hover:shadow-lg transition-shadow duration-300 border border-slate-100">
      <Link to={to} className="block h-full">
        {/* Image */}
        <div className="relative overflow-hidden bg-slate-50">
          {discount > 0 && (
            <span className="absolute top-2 left-2 z-10 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-md">
              {discount}%
            </span>
          )}

          <span className="absolute top-2 right-2 z-10 bg-teal-400 text-white text-xs font-semibold px-2 py-1 rounded-md">
            NEW
          </span>

          <img
            src={firstImage}
            alt={product?.productName || "Product"}
            className="w-full h-56 md:h-64 object-cover"
            loading="lazy"
          />

          {/* hover bar */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-all duration-300 bg-black/80">
            <div className="w-full py-2 text-center text-white font-semibold hover:bg-black/90 transition-colors duration-200">
              Add to Cart
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-2 text-center">
          <h3 className="text-sm font-medium text-slate-800 line-clamp-2 min-h-[2.5rem]">
            {product?.productName}
          </h3>

          <div className="mt-1 flex justify-center items-center gap-2">
            {discount > 0 && (
              <div className="text-slate-500 line-through text-xs">
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
};

export default ProductCard;
