import React from 'react';
import honey from '../../src/assets/images/honey.png'
import gh from '../../src/assets/images/gh.png'

const BannerSection = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 mt-0 lg:mt-3">
      {/* Lemon Juice Banner */}
      <div className="flex flex-col md:flex-row items-center justify-between bg-[#f9f8f6] rounded-xl p-6 border border-orange-400">
        {/* Text */}
        <div className="mb-4 md:mb-0 md:mr-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            Healthy <br /> Lemon Juices
          </h2>
          <p className="text-gray-600 mt-2">
            Big Sale 39% When Buying <br /> From The Collection
          </p>
          <a href="#" className="text-red-500 font-semibold mt-3 inline-block">
            VIEW MORE
          </a>
        </div>
        {/* Image */}
        <img
          src={gh}
          className="w-full md:w-1/2 max-w-[280px]"
        />
      </div>

      {/* Veggies & Fruit Banner */}
   <div className="flex flex-col md:flex-row items-center justify-between bg-orange-50 rounded-xl p-6 border border-orange-400">
  {/* Text */}
  <div className="mb-4 md:mb-0 md:mr-6">
    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight">
      Healthy <br /> Lemon Juices
    </h2>
    <p className="text-gray-600 mt-2">
      Big Sale 39% When Buying <br /> From The Collection
    </p>
    <a href="#" className="text-red-500 font-semibold mt-3 inline-block">
      VIEW MORE
    </a>
  </div>

  {/* Image */}
  <img
    src={honey}
    alt="Lemon Juice"
    className="w-full md:w-1/2 lg:w-[250px] xl:w-[300px] max-w-full"
  />
</div>

    </div>
  );
};

export default BannerSection;
