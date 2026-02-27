import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./HeroSection.css";

const FALLBACK_RIGHT_BANNERS = [
  {
    id: "rb-15",
    img: "https://nest-frontend-v6.vercel.app/assets/imgs/banner/banner-15.png",
    to: "/shop",
    title: "Everyday Fresh & Clean",
    subtitle: "with Our Products",
    cta: "Shop Now",
  },
  {
    id: "rb-14",
    img: "https://nest-frontend-v6.vercel.app/assets/imgs/banner/banner-14.png",
    to: "/shop",
    title: "The best Organic",
    subtitle: "Products Online",
    cta: "Shop Now",
  },
];

function normalizeApiArray(payload) {
  // supports: []  OR  {data: []}  OR  {result: []}
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.result)) return payload.result;
  return [];
}

function resolveImageUrl(API_BASE, raw) {
  const val = (raw || "").trim();
  if (!val) return "";
  if (val.startsWith("http://") || val.startsWith("https://")) return val;
  // remove leading slashes to avoid double //
  return `${API_BASE}/${val.replace(/^\/+/, "")}`;
}

export default function HeroSlider() {
  const [slides, setSlides] = useState([]);
  const [categories, setCategories] = useState([]);
  const [rightBanners, setRightBanners] = useState(FALLBACK_RIGHT_BANNERS);

  const API_BASE = useMemo(() => {
    const base = import.meta.env.VITE_APP_SERVER_URL || "http://localhost:5000";
    return base.replace(/\/$/, "");
  }, []);

  const MAX_CATS = 8;
const [catExpanded, setCatExpanded] = useState(false);
  // =========================
  // 1) MAIN HERO SLIDES (UNCHANGED functionality, fixed mapping)
  // =========================
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/banners`);
        const payload = await res.json();
        const arr = normalizeApiArray(payload);

        const mapped = arr
          .map((b) => {
            const img = resolveImageUrl(API_BASE, b.imageUrl);
            return {
              id: b._id || b.id || img,
              img,
              to: b.to || "/shop",
              title: b.title || "",
            };
          })
          .filter((x) => x.img); // prevent empty images

        setSlides(mapped);
      } catch (err) {
        console.error("Banner fetch error:", err);
        setSlides([]);
      }
    };

    fetchBanners();
  }, [API_BASE]);

  // =========================
  // 2) LEFT CATEGORIES
  // =========================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // ✅ যদি আপনার endpoint নাম আলাদা হয় এখানেই বদলাবেন
        const res = await fetch(`${API_BASE}/api/categories`);
        const payload = await res.json();
        const arr = normalizeApiArray(payload);

        const mapped = arr.map((c, idx) => ({
          id: c._id || c.id || c.slug || `${c.name}-${idx}`,
          name: c.name || "Category",
          slug: c.slug || c._id || c.name,
          icon: resolveImageUrl(API_BASE, c.icon || c.image || ""),
        }));

        setCategories(mapped);
      } catch (e) {
        console.error("Category fetch error:", e);
        setCategories([]);
      }
    };

    fetchCategories();
  }, [API_BASE]);

  // =========================
  // 3) RIGHT BANNERS (dynamic > fallback)
  // =========================
  useEffect(() => {
    const fetchRightBanners = async () => {
      try {
        // Recommended dynamic endpoint: /api/side-banners
        const res = await fetch(`${API_BASE}/api/side-banners`);
        if (!res.ok) {
          // keep fallback
          return;
        }

        const payload = await res.json();
        const arr = normalizeApiArray(payload);

        const mapped = arr
          .slice(0, 3)
          .map((b) => ({
            id: b._id || b.id || b.imageUrl,
            img: resolveImageUrl(API_BASE, b.imageUrl),
            to: b.to || "/shop",
            title: b.title || "Shop fresh items",
            subtitle: b.subtitle || "",
            cta: b.cta || "Shop Now",
          }))
          .filter((x) => x.img);

        if (mapped.length) setRightBanners(mapped);
      } catch (e) {
        console.error("Right banners fetch error:", e);
        // keep fallback
      }
    };

    fetchRightBanners();
  }, [API_BASE]);

  // if no slides, don't break layout; show nothing
  if (!slides.length) return null;

  // ======= arrows (UNCHANGED) =======
  const NextArrow = ({ onClick }) => (
    <button
      className="hero-arrow hero-arrow--next hidden md:flex"
      onClick={onClick}
      aria-label="Next"
      type="button"
    >
      ›
    </button>
  );

  const PrevArrow = ({ onClick }) => (
    <button
      className="hero-arrow hero-arrow--prev hidden md:flex"
      onClick={onClick}
      aria-label="Prev"
      type="button"
    >
      ‹
    </button>
  );

  // ======= slider settings (UNCHANGED) =======
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
    responsive: [
      { breakpoint: 640, settings: { fade: false, speed: 380, arrows: false } },
    ],
  };

  return (
    <section className="hero-wrap">
      <div className="grid grid-cols-1 lg:grid-cols-[200px_minmax(0,1fr)_340px] gap-5 items-stretch lg:min-h-[460px]">
        {/* ================= LEFT: CATEGORY LIST ================= */}
        <aside className="hero-left hidden lg:block min-w-0">
          <div className="hero-cat-box">
            <div className="hero-cat-list">
              {(catExpanded ? (categories || []) : (categories || []).slice(0, MAX_CATS)).map((c) => (
                <Link
                  key={c.id}
                  to={`/category/${c.slug}`}
                  className="hero-cat-item"
                >
                  <span className="hero-cat-icon">
                    {c.icon ? (
                      <img
                        src={c.icon}
                        alt={c.name}
                        loading="lazy"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    ) : (
                      <span className="hero-dot" />
                    )}
                  </span>

                  <span className="hero-cat-name">{c.name}</span>
                </Link>
              ))}
            </div>

         <div className="mt-3 pt-3 border-t border-dashed border-emerald-100">
  <button
    type="button"
    className="
      inline-flex items-center gap-2
      text-[12px] font-semibold
      text-emerald-600
      hover:text-emerald-700
      hover:bg-emerald-50
      px-3 py-2 rounded-lg
      transition
    "
  >
    <span className="text-[14px] leading-none">+</span>
    <span>Show more</span>
  </button>
</div>
          </div>
        </aside>

        {/* ================= MIDDLE: HERO SLIDER ================= */}
        <main className="hero-middle">
          <div className="bg-white rounded-xl overflow-hidden md:h-[460px] h-[200px]">
            <Slider {...settings}>
              {slides.map((s, i) => (
                <div key={s.id} className="hero-slide">
                  <Link to={s.to} aria-label={s.title || `Banner ${i + 1}`}>
                    <img
                      src={s.img}
                      alt={s.title || `Banner ${i + 1}`}
                      className="w-full h-[240px] lg:h-[460px] object-cover"
                      loading={i === 0 ? "eager" : "lazy"}
                      onError={(e) => {
                        // if broken, hide image to avoid ugly icon
                        e.currentTarget.style.opacity = "0";
                      }}
                    />
                  </Link>
                </div>
              ))}
            </Slider>
          </div>
        </main>

        {/* ================= RIGHT: 2 SMALL BANNERS (like screenshot) ================= */}
        <aside className="hidden lg:flex flex-col h-full">
          <div className="flex flex-col gap-4 h-full">
            {(rightBanners || []).slice(0, 2).map((b, idx) => (
              <Link key={b.id || idx} to={b.to} className="flex-1 flex items-stretch justify-between gap-3 rounded-xl p-5 border border-gray-200">
                <div className="hero-side-text">
                  <h4 className="hero-side-title">{b.title}</h4>
                  {b.subtitle ? (
                    <p className="hero-side-subtitle">{b.subtitle}</p>
                  ) : null}

                  <span className="hero-side-btn">{b.cta || "Shop Now"} →</span>
                </div>

                <div className="hero-side-imgWrap">
                  <img
                    src={b.img}
                    alt={b.title || `Right banner ${idx + 1}`}
                    loading="lazy"
                  />
                </div>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}