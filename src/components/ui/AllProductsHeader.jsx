import React, { useEffect, useState } from "react";
import ProductCard from "../ui/ProductCard"; // path ঠিক করে নিও

const BASE_URL = import.meta.env.VITE_APP_SERVER_URL;

const AllProductsHeader = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch(`${BASE_URL}api/products/public?limit=100`);
        const data = await res.json();

        // safe list extract (men collection এর মতো)
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.products)
          ? data.products
          : [];

        setProducts(list);
      } catch (err) {
        console.error("Error loading products", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) return <div className="container py-10">Loading...</div>;

  return (
    <div className="max-w-full xl:px-6 mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold mb-6">All Products</h1>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5 mt-2 md:mt-8">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} to={`/product-details/${p._id}`} />
        ))}
      </div>
    </div>
  );
};

export default AllProductsHeader;
