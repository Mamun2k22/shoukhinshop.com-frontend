import React from "react";

const Loader = () => {
  return (
    // ফুল স্ক্রিন কন্টেইনার (আপনার প্রয়োজন অনুযায়ী h-screen পরিবর্তন করতে পারেন)
    <div className="flex justify-center items-center h-screen bg-gray-50"> 
      
      {/* স্পিনিং রিং লোডার */}
      <div className="relative">
        <div 
          className="w-16 h-16 rounded-full border-4 border-t-4 border-t-blue-500 border-gray-200 animate-spin"
     
        ></div>
        
        
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
      </div>
      
    </div>
  );
};

export default Loader;

