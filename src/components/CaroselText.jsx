import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

/**
 * Women caption text carousel with center title and side widgets
 * - Title: "Women Collection"
 * - Captions rotate automatically
 */
export default function CaroselText() {
  // Change / translate captions as you like
  const CAPTIONS = [
    "Elegance in Every Thread",
    "New Arrivals for Her",
    "Festive & Everyday Essentials",
    "Comfort Meets Style",
  ];

  const settings = {
    dots: false,
    arrows: false,
    infinite: true,
    fade: true,
    autoplay: true,
    speed: 600,
    autoplaySpeed: 2300,
    pauseOnHover: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0 font-poppins">
      {/* Caption text carousel (centered) */}
      <div className="flex justify-center">
        <div className="w-full max-w-3xl">
          <Slider {...settings}>
            {CAPTIONS.map((txt, i) => (
              <div key={i}>
                <p className="text-center text-[13px] md:text-[16px] leading-snug font-medium text-gray-800">
                  {txt}
                </p>
              </div>
            ))}
          </Slider>
        </div>
      </div>
      {/* Header with left/right widgets + centered title */}
      {/* <div className="flex items-center justify-center mt-4">
     
          <div className="flex-1 hidden sm:flex items-center">
            <span className="h-px w-full bg-gray-300"></span>
            <span className="ml-2 h-2 w-2 rounded-full bg-gray-400"></span>
          </div>

     
          <div className="flex-1 hidden sm:flex items-center">
            <span className="mr-2 h-2 w-2 rounded-full bg-gray-400"></span>
            <span className="h-px w-full bg-gray-300"></span>
          </div>
        </div> */}

      {/* Optional CTA button under captions */}
      {/* <div className="mt-4 flex justify-center">
          <a
            href="/category/women"
            className="inline-block px-5 py-2 text-sm font-semibold rounded border border-gray-800 hover:bg-gray-900 hover:text-white transition"
          >
            Shop Now
          </a>
        </div> */}
    </div>
  );
}
