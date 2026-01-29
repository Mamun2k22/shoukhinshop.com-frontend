import React from "react";

const ProductLoader = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="relative flex flex-col items-center">
        {/* Spinning gradient ring */}
        <div className="h-20 w-20 rounded-full border-4 border-transparent border-t-blue-500 border-r-purple-500 animate-spin"></div>

        {/* Inner pulse dot */}
        <div className="absolute h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-ping"></div>

        {/* Loader text */}
        <p className="mt-6 text-sm font-medium text-gray-600 dark:text-gray-300 animate-pulse">
          Loading products, please wait...
        </p>
      </div>
    </div>
  );
};

export default ProductLoader;
