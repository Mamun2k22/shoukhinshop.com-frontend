import React, { useContext, useEffect } from "react";
import { SearchContext } from "../context/SearchContext";

const SearchInput = () => {
  const { searchTerm, setSearchTerm, searchResults, productSearch } = useContext(SearchContext);

  useEffect(() => {
    if (searchTerm.trim().length > 1) {
      const delayDebounce = setTimeout(() => {
        productSearch(searchTerm);
      }, 300);

      return () => clearTimeout(delayDebounce);
    }
  }, [searchTerm]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <input
        type="text"
        value={searchTerm}
        placeholder="Search products..."
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full border px-4 py-2 rounded shadow"
      />

      {searchResults.length > 0 && (
        <ul className="absolute z-10 bg-white w-full border rounded mt-1 max-h-60 overflow-y-auto shadow-lg">
          {searchResults.map((product) => (
            <li
              key={product._id}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                // You can redirect to product details here
                console.log("Product clicked:", product);
              }}
            >
              <img
                src={product.productImage[0]}
                alt={product.productName}
                className="w-10 h-10 object-cover rounded"
              />
              <span>{product.productName}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchInput;
