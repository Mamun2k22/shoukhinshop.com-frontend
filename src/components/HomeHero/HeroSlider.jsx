import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./HeroSection.css";

export default function HeroSlider() {
  const [slides, setSlides] = useState([]);

  const API_BASE = useMemo(() => {
    const base = import.meta.env.VITE_APP_SERVER_URL || "http://localhost:5000";
    return base.replace(/\/$/, ""); // remove trailing slash
  }, []);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/banners`);
        const data = await res.json();

        const mapped = (Array.isArray(data) ? data : []).map((b) => {
          const raw = b.imageUrl || "";
          const img = raw.startsWith("http")
            ? raw
            : `${API_BASE}/${raw.replace(/^\/+/, "")}`; // ensure exactly one slash

          return {
            id: b._id,
            img,
            to: b.to || "/shop-category",
            title: b.title || "",
          };
        });

        setSlides(mapped);
      } catch (err) {
        console.error("Banner fetch error:", err);
        setSlides([]);
      }
    };

    fetchBanners();
  }, [API_BASE]);

  if (!slides.length) return null;

  const NextArrow = ({ onClick }) => (
    <button className="hero-arrow hero-arrow--next hidden md:flex" onClick={onClick} aria-label="Next">›</button>
  );
  const PrevArrow = ({ onClick }) => (
    <button className="hero-arrow hero-arrow--prev hidden md:flex" onClick={onClick} aria-label="Prev">‹</button>
  );

  const settings = {
    dots: true,
    infinite: slides.length > 1,
    speed: 500,
    fade: true,
    autoplay: slides.length > 1,
    autoplaySpeed: 3200,
    pauseOnHover: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [{ breakpoint: 640, settings: { fade: false, speed: 380, arrows: false } }],
  };

  return (
    <div className="hero-wrap px-6 py-4">
    <div className="hero-full">
      <Slider {...settings}>
        {slides.map((s, i) => (
          <div key={s.id} className="hero-slide">
            <Link to={s.to} aria-label={s.title || `Banner ${i + 1}`}>
              <img
                src={s.img}
                alt={s.title || `Banner ${i + 1}`}
                className="hero-img"
                loading={i === 0 ? "eager" : "lazy"}
              />
            </Link>
          </div>
        ))}
      </Slider>
    </div>
  </div>
  );
}
