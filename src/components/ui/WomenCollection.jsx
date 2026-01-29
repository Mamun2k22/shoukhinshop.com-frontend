import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const WomenCollection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Dynamic title/subtitle states
  const [sectionTitle, setSectionTitle] = useState("Women's Collection");
  const [subtitles, setSubtitles] = useState([
    "New arrivals tailored just for you!",
    "Trending styles inside!",
    "Limited stock—shop now!",
  ]);
  const [subIndex, setSubIndex] = useState(0);

  const baseURL = import.meta.env.VITE_APP_SERVER_URL;

  // 1) Fetch women section settings
  useEffect(() => {
    const fetchWomenSectionSettings = async () => {
      try {
        const res = await fetch(`${baseURL}api/home-section-settings/women`);
        const json = await res.json();

        const doc = json?.data;
        if (doc?.sectionTitle) setSectionTitle(doc.sectionTitle);

        const list = Array.isArray(doc?.subtitles) ? doc.subtitles : [];
        const activeSortedTexts = list
          .filter((s) => s?.isActive !== false && (s?.text || "").trim())
          .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))
          .map((s) => s.text);

        if (activeSortedTexts.length >= 1) setSubtitles(activeSortedTexts);
      } catch (err) {
        console.error("Error loading women section settings:", err);
        // fallback থাকবে
      }
    };

    fetchWomenSectionSettings();
  }, [baseURL]);

  // 2) Subtitle carousel auto-rotate
  useEffect(() => {
    if (!subtitles?.length) return;
    const t = setInterval(() => {
      setSubIndex((p) => (p + 1) % subtitles.length);
    }, 2500);
    return () => clearInterval(t);
  }, [subtitles]);

  // 3) Fetch products (your existing)
  useEffect(() => {
    const fetchWomenProducts = async () => {
      try {
        const res = await fetch(
          `${baseURL}api/products/public/home/women?limit=12`
        );
        const data = await res.json();
        console.log("women api response =>", data);

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.products)
          ? data.products
          : [];

        setProducts(list);
      } catch (err) {
        console.error("Error loading women collection:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWomenProducts();
  }, [baseURL]);
useEffect(() => {
  if (!subtitles?.length || subtitles.length <= 1) return;

  const t = setInterval(() => {
    setSubIndex((p) => (p + 1) % subtitles.length);
  }, 2500);

  return () => clearInterval(t);
}, [subtitles]);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="bg-gradient-to-br from-gray-100 via-gray-200 to-blue-100 min-h-screen py-7 px-5">
      <div className="max-w-full mx-auto text-center px-0 xl:px-3">
        {/* ✅ Only these two are dynamic */}
        <h2 className="text-2xl font-semibold mb-2">{sectionTitle}</h2>
        {/* <p className="text-gray-800 mb-8">{subtitles[subIndex] || ""}</p> */}
        <div className="w-full flex justify-center mb-8">
  <div className="relative h-7 md:h-8 overflow-hidden w-full max-w-xl">
    <div
      className="absolute inset-0 flex transition-transform duration-700 ease-in-out"
      style={{ transform: `translateX(-${subIndex * 100}%)` }}
    >
      {subtitles.map((text, i) => (
        <div
          key={i}
          className="w-full flex-shrink-0 flex items-center justify-center"
        >
          <p className="text-gray-800">{text}</p>
        </div>
      ))}
    </div>
  </div>
</div>


        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5 mt-2 md:mt-8">
          {products.map((product) => {
            const oldPrice = product.price;
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
                <Link
                  to={`/product-details/${product._id}`}
                  className="block h-full"
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
                        onClick={(e) => e.preventDefault()}
                      >
                        Add to Cart
                      </button> */}
                    </div>
                  </div>

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
        <Link to={"/womensub"}>
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

export default WomenCollection;
