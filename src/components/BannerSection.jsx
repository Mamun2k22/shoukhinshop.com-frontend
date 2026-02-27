import React from "react";

const BannerSection = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 lg:mt-6">
      
      {/* Banner 1 */}
      <div className="relative bg-[#F0E8D5] rounded-2xl overflow-hidden h-[200px] md:h-[250px] p-8 flex flex-col justify-center">
        <div className="z-10 max-w-[60%]">
          <h2 className="text-lg md:text-xl font-bold text-gray-800 leading-tight">
            Everyday Fresh & <br /> Clean with Our Products
          </h2>
          <button className="mt-6 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md text-sm font-semibold">
            Shop Now →
          </button>
        </div>

        <img
          src="https://nest-frontend-v6.vercel.app/assets/imgs/banner/banner-1.png"
          alt=""
          className="absolute bottom-0 right-4 w-56 md:w-64 object-contain"
        />
      </div>

      {/* Banner 2 */}
      <div className="relative bg-[#f7eaea] rounded-2xl overflow-hidden h-[200px] md:h-[250px] p-8 flex flex-col justify-center">
        <div className="z-10 max-w-[60%]">
          <h2 className="text-lg md:text-xl font-bold text-gray-800 leading-tight">
            Make your Breakfast <br /> Healthy and Easy
          </h2>
          <button className="mt-6 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md text-sm font-semibold">
            Shop Now →
          </button>
        </div>

        <img
          src="https://nest-frontend-v6.vercel.app/assets/imgs/banner/banner-2.png"
          alt=""
          className="absolute bottom-0 right-4 w-52 md:w-60 object-contain"
        />
      </div>

      {/* Banner 3 */}
      <div className="relative bg-[#e9edf4] rounded-2xl overflow-hidden h-[200px] md:h-[250px] p-8 flex flex-col justify-center">
        <div className="z-10 max-w-[60%]">
          <h2 className="text-lg md:text-xl font-bold text-gray-800 leading-tight">
            The best Organic <br /> Products Online
          </h2>
          <button className="mt-6 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md text-sm font-semibold">
            Shop Now →
          </button>
        </div>

        <img
          src="https://nest-frontend-v6.vercel.app/assets/imgs/banner/banner-3.png"
          alt=""
          className="absolute bottom-0 right-4 w-56 md:w-64 object-contain"
        />
      </div>

    </div>
  );
};

export default BannerSection;