import { useState } from "react";
import { FiShoppingCart } from "react-icons/fi";

const products = [
  {
    id: 1,
    title: "Details Profitable business makes your profit",
    image: "https://angro.modeltheme.com/wp-content/uploads/2018/09/Angro-Product10-150x150.jpg",
    price: 29,
    oldPrice: 36,
  },
  {
    id: 2,
    title: "Firebase business makes your profit",
    image: "https://ekomart-nextjs.vercel.app/assets/images/grocery/16.jpg",
    price: 50,
    oldPrice: 36,
  },
  {
    id: 3,
    title: "Netlify business makes your profit",
    image: "https://ekomart-nextjs.vercel.app/assets/images/grocery/19.jpg",
    price: 19,
    oldPrice: 36,
  },
  {
    id: 4,
    title: "Details business makes your profit",
    image: "https://ekomart-nextjs.vercel.app/assets/images/grocery/02.jpg",
    price: 90,
    oldPrice: 36,
  },
];

const ProductCard = ({ product }) => {
  const [qty, setQty] = useState(1);

  return (
    <div className="flex p-4 rounded-lg shadow bg-white relative border border-pink-100">
      {/* Discount Tag */}
      <div className="absolute top-2 left-2 bg-yellow-400 text-white text-xs px-2 py-1 rounded">
        25% Off
      </div>

      {/* Image */}
      <img
        src={product.image}
        alt={product.title}
        className="w-28 h-28 object-contain"
      />

      {/* Content */}
      <div className="ml-4 flex-1">
        <h3 className="font-semibold text-sm text-gray-800">{product.title}</h3>
        <p className="text-xs text-gray-500">500g Pack</p>

        <div className="mt-1 flex items-center space-x-2">
          <span className="text-red-600 font-semibold text-lg">
            ${product.price}.00
          </span>
          <span className="line-through text-sm text-gray-400">
            ${product.oldPrice}.00
          </span>
        </div>

        {/* Controls */}
        <div className="mt-3 flex items-center gap-2">
          <select
            className="border rounded px-2 py-1 text-sm"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <button className="flex items-center px-3 py-1 text-sm bg-green-100 text-green-600 border border-green-500 rounded hover:bg-green-500 hover:text-white transition-all">
            Add <FiShoppingCart className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};


const PromoCard = ({ color, title, price, image }) => (
  <div className={`rounded-md p-5 text-white ${color} flex items-center`}>
    <div>
      <h3 className="font-bold text-lg mb-1">{title}</h3>
      <p className="text-sm">Only</p>
      <p className="text-2xl font-bold">${price}</p>
    </div>
    <img src={image} alt={title} className="w-24 h-24 object-contain ml-auto" />
  </div>
);

export const DiscountProducts = () => {
  return (
    <div className="p-5 max-w-7xl mx-auto ">
      <div className="flex justify-between items-center mb-3 ">
        <h2 className="text-2xl font-bold text-gray-800">Products With Discounts</h2>
        <div className="flex gap-1 text-sm">
          <span className="bg-green-600 text-white px-2 py-1 rounded">136 Days</span>
          <span className="bg-green-600 text-white px-2 py-1 rounded">10 Hour</span>
          <span className="bg-green-600 text-white px-2 py-1 rounded">02 Min</span>
          <span className="bg-green-600 text-white px-2 py-1 rounded">45 Sec</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 border rounded-md p-4 bg-[#f4fafb]">
        {/* Promo Cards */}
        <div className="flex flex-col gap-4">
          <PromoCard
            color="bg-orange-500"
            title="Alpro Organic Flavored Fresh Juice"
            price={15}
            image="https://ekomart-nextjs.vercel.app/assets/images/grocery/02.jpg"
          />
          <PromoCard
            color="bg-green-600"
            title="Alpro Organic Flavored Fresh Juice"
            price={15}
            image="https://ekomart-nextjs.vercel.app/assets/images/grocery/02.jpg"
          />
        </div>

        {/* Product Cards */}
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product}
             />
          ))}
        </div>
      </div>
    </div>
  );
};

