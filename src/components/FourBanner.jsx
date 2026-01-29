import React from "react";

import b1 from "../../src/assets/images/b1.png";
import b2 from "../../src/assets/images/b2.png";
import b3 from "../../src/assets/images/b3.png";
import b4 from "../../src/assets/images/b4.png";
const FourBanner = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 justify-items-center gap-2.5 mx-4">
      <div className="max-w-[340px] 2xl:w-full mx-auto m-4">
      
         <div className="w-11/12"> 
         <img  src="https://i.ibb.co.com/M5HGCGt/Brown-Minimalist-Fashion-Product-Banner-756-x-332-px.png" className="w-full p-0 rounded-md" />
         </div>
        
      </div>
      <div className="max-w-[3400px] 2xl:w- mx-auto m-4">
        <div className="flex items-center  bg-[#EAEEFE] rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out text-[15px] pr-1.5">
          <img src={b1} className="w-36 h-32 p-0 rounded-md" />
          <div className="">
            <h3 className="text-gray-800 font-semibold w-40">
              100% guaranteed all Fresh items
            </h3>
            <p className="text-sm bg-gradient-to-r from-blue-500 to-blue-700  bg-clip-text text-transparent hover:underline cursor-pointer">
              Go to Order
            </p>
          </div>
        </div>
      </div>
      <div className="max-w-[340px] mx-auto m-4 2xl:w-full">
        <div className="flex items-center  bg-[#FEF4D5] rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out pr-2 text-[15px] ">
          <img src={b3} className="w-40 p-0 rounded-md" />
          <div className="">
            <h3 className="text-gray-800 font-semibold w-40">
              100% guaranteed * Fresh items
            </h3>
            <p className="text-sm bg-gradient-to-r from-blue-500 to-blue-700  bg-clip-text text-transparent hover:underline cursor-pointer">
              Go to Order
            </p>
          </div>
        </div>
      </div>
      <div className="max-w-[340px] 2xl:w-full mx-auto m-4">
      
         <div className="w-11/12"> 
         <img  src="https://i.ibb.co.com/FVZXZh9/Untitled-756-x-332-px.png" className="w-full p-0 rounded-md" />
         </div>
        
      </div>
    </div>
  );
};

export default FourBanner;
