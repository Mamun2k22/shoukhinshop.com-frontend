import React, { createContext, useState, useEffect } from "react";

export const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Product search function
  const productSearch = async (term) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_SERVER_URL}api/products/search?query=${term}`
      );
      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error("Error fetching search results", error);
    }
  };
  
  useEffect(() => {
    console.log("🔍 Search Results:", searchResults);
  }, [searchResults]);

  return (
    <SearchContext.Provider
      value={{ searchTerm, setSearchTerm, searchResults, productSearch }}
    >
      {children}
    </SearchContext.Provider>
  );
};
