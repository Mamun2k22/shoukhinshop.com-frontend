import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import axios from "axios";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import "./HeroSection.css";

function HeroSection() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  const NextArrow = ({ onClick }) => (
    <div className="arrow next hidden md:block" onClick={onClick}>
      &#10095;
    </div>
  );

  const PrevArrow = ({ onClick }) => (
    <div className="arrow prev hidden md:block" onClick={onClick}>
      &#10094;
    </div>
  );

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    fade: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_APP_SERVER_URL}api/banners`
        );
        setBanners(response.data);
      } catch (error) {
        console.error("Error fetching banners:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  return (
    <div className="slider-container py-1 md:py-[30px] px-3 md:px-[45px]">
      {loading ? (
        <p className="text-center">Loading banners...</p>
      ) : (
        <Slider {...settings}>
          {banners.map((banner, index) => (
            <div
              key={banner._id}
              className="rounded-[10px] md:rounded-[14px] overflow-hidden relative"
            >
              <img
                className="h-[30vh] md:h-[40vh] lg:h-full object-cover w-full"
                src={`${import.meta.env.VITE_APP_SERVER_URL}${banner.imageUrl}`}
                alt={banner.title || `Banner ${index + 1}`}
              />
              {/* <img
                className="h-[30vh] md:h-[40vh] lg:h-full object-cover w-full"
                src="https://cdn2.arogga.com/eyJidWNrZXQiOiJhcm9nZ2EiLCJrZXkiOiJCbG9jay1iX2NvbmZpZ1wvMFwvMTEzLUJsb29kLUdsdWNvc2UtTWV0ZXItRnJlZS1XZWIteXdyMm9pLnBuZyIsImVkaXRzIjpbXX0="
                alt={banner.title || `Banner ${index + 1}`}
              /> */}
              {/* Optional title overlay */}
              {banner.title && (
                <div className="absolute bottom-4 left-4 text-white text-lg font-bold bg-black bg-opacity-50 px-3 py-1 rounded">
                  {banner.title}
                </div>
              )}
            </div>
          ))}
        </Slider>
      )}
    </div>
  );
}

export default HeroSection;
