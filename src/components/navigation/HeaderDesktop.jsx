// components/navigation/HeaderDesktop.jsx
import React, { useEffect, useRef, useState, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch, FiUser, FiHeart, FiShoppingBag } from "react-icons/fi";
import settingsApi, {
  fetchPublicSettings,
  fetchPublicHeaderSettings,
} from "../../hooks/settingsApi.jsx";

// fa6 icons
import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaThreads,
  FaYoutube,
  FaTwitter,
  FaLinkedinIn,
  FaTiktok,
  FaPinterestP,
  FaRedditAlien,
  FaGithub,
} from "react-icons/fa6";

// telegram + snapchat fa থেকে
import { FaTelegramPlane, FaSnapchatGhost } from "react-icons/fa";

// 🔹 social key -> icon map (backend er key er sathe match)
const SOCIAL_ICON_MAP = {
  facebook: FaFacebookF,
  instagram: FaInstagram,
  whatsapp: FaWhatsapp,
  threads: FaThreads,
  youtube: FaYoutube,
  twitter: FaTwitter,
  linkedin: FaLinkedinIn,
  tiktok: FaTiktok,
  pinterest: FaPinterestP,
  telegram: FaTelegramPlane,
  snapchat: FaSnapchatGhost,
  reddit: FaRedditAlien,
  github: FaGithub,
};

const HeaderDesktop = ({
  logo,
  searchTerm,
  setSearchTerm,
  productSearch,
  searchResults = [],
  cart,
  user,
  categories = [],
}) => {
  const navigate = useNavigate();
  const boxRef = useRef(null);
  const [open, setOpen] = useState(false);

  const [siteLogo, setSiteLogo] = useState("");
  const [siteBrand, setSiteBrand] = useState("Zarvila");

  // ⭐ header top bar config (text + socials)
  const [headerConfig, setHeaderConfig] = useState(null);

  // ✅ ticker index (1 by 1 show)
  const [tickerIndex, setTickerIndex] = useState(0);

  /* ========== 1) Logo + Brand name load ========== */
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await fetchPublicSettings(); // { success, data }
        const data = res?.data || {};
        if (!alive) return;

        setSiteLogo(data.logoUrl || "");
        setSiteBrand(data.brandName || "Soukhinshop");
      } catch (e) {
        // silent
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  /* ========== 2) Header settings (top bar + socials) load ========== */
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await fetchPublicHeaderSettings(); // { success, data }
        const data = res?.data || {};
        if (!alive) return;

        setHeaderConfig(data);
      } catch (e) {
        console.error("header settings load failed:", e);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  /* ========== 3) Search debounce ========== */
  useEffect(() => {
    const q = searchTerm?.trim();

    if (!q) {
      setOpen(false);
      return;
    }

    const t = setTimeout(() => {
      productSearch(q);
      setOpen(true);
    }, 250);

    return () => clearTimeout(t);
  }, [searchTerm, productSearch]);

  /* ========== 4) Click outside closes dropdown ========== */
  useEffect(() => {
    const onDocClick = (e) => {
      if (!boxRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    const q = searchTerm.trim();
    if (!q) return;
    setOpen(false);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  // ✅ top bar items (supports new: topBarTexts[], old: topBarText)
  const topBarItems = (
    Array.isArray(headerConfig?.topBarTexts) && headerConfig.topBarTexts.length
      ? headerConfig.topBarTexts
      : typeof headerConfig?.topBarText === "string" &&
        headerConfig.topBarText.trim()
      ? [headerConfig.topBarText]
      : []
  ).filter(Boolean);

  // ✅ Auto rotate: 1 item after another
  useEffect(() => {
    if (!topBarItems.length) return;

    // safe reset if list size changes
    setTickerIndex((i) => (i >= topBarItems.length ? 0 : i));

    const id = setInterval(() => {
      setTickerIndex((i) => (i + 1) % topBarItems.length);
    }, 3000); // ✅ 3 seconds

    return () => clearInterval(id);
  }, [topBarItems.length]);

  return (
    <>
      {/* ===== Desktop Top Bar ===== */}
      <nav className="hidden md:flex bg-white border-b border-[#070707] font-manrope">
        <div className="flex justify-between w-full max-w-full mx-auto px-6 h-16 ">
                   {/* Logo / Brand */}
          <Link to="/" className="justify-self-center mr-20">
            {siteLogo ? (
              <img
                className="h-12 w-auto"
                src={`${settingsApi.API_BASE}${siteLogo}`}
                alt={siteBrand}
                loading="lazy"
              />
            ) : (
              <span className="text-black font-semibold tracking-wide">
                {siteBrand}
              </span>
            )}
          </Link>
          {/* LEFT: social + promo */}
          <div className="flex items-center gap-5 text-gray-500">
            <div className="flex items-center gap-4">
              {headerConfig?.socialLinks &&
                Object.entries(headerConfig.socialLinks).map(([key, value]) => {
                  if (!value?.isActive || !value?.url) return null;

                  const Icon = SOCIAL_ICON_MAP[key];
                  if (!Icon) return null;

                  return (
                    <a
                      key={key}
                      href={value.url}
                      aria-label={key}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-gray-800"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
            </div>

            {/* ✅ Offer text (1 by 1 rotating) */}
            {headerConfig?.showTopBar !== false && topBarItems.length > 0 && (
              <div className="topbar">
                <div className="topbar-marquee ticker text-xs tracking-wide uppercase text-gray-600 font-medium">
                  <span key={tickerIndex} className="topbar-text ppt-jump-in">
                    {topBarItems[tickerIndex]}
                  </span>
                </div>
              </div>
            )}
          </div>

 

          {/* RIGHT: search + user + cart + wishlist */}
          <div className="flex items-center justify-end gap-5 text-gray-700">
            {/* Search box + suggestions */}
            <div
              ref={boxRef}
              className="relative hidden lg:flex w-[300px] rounded-full overflow-visible"
            >
              <form onSubmit={onSubmit} className="flex items-center w-full">
                <input
                  type="text"
                  className="text-gray-700 py-1.5 px-3 flex-grow focus:outline-none focus:bg-white border border-gray-300 rounded-l-full font-normal text-xs placeholder:text-gray-500"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => searchTerm && setOpen(true)}
                  aria-label="Search"
                />
                <button
                  type="submit"
                  className="flex items-center justify-center bg-gray-800 text-white px-3 py-[7px] rounded-r-full hover:bg-black transition-colors"
                  aria-label="Search"
                >
                  <FiSearch className="h-4 w-4" />
                </button>
              </form>

              {/* Suggestions Dropdown */}
              {open && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white shadow-xl rounded-lg z-50 max-h-[300px] overflow-y-auto border border-gray-100">
                  {searchResults.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-gray-500">
                      No results
                    </div>
                  ) : (
                    searchResults.map((product) => (
                      <Link
                        key={product._id}
                        to={`/product-details/${product._id}`}
                        onClick={() => {
                          setSearchTerm("");
                          setOpen(false);
                        }}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition border-b last:border-b-0"
                      >
                        <img
                          loading="lazy"
                          src={product.productImage?.[0] || "/placeholder.png"}
                          alt={product.productName}
                          className="w-8 h-8 rounded object-cover border border-gray-200"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-medium text-gray-800 truncate">
                            {product.productName}
                          </p>
                          {product.price != null && (
                            <p className="text-xs text-gray-500 truncate">
                              ৳ {product.price}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Cart */}
            <Link to="/dashboard/cart" aria-label="Cart" className="relative">
              <FiShoppingBag className="h-5 w-5" />
              <span className="absolute -top-2 -right-2 text-[10px] min-w-[18px] h-[18px] px-1 rounded-full bg-black text-white flex items-center justify-center">
                {cart?.length ?? 0}
              </span>
            </Link>

            {/* Fallback search icon (smaller screens) */}
            <button
              type="button"
              aria-label="Search"
              className="hover:text-black lg:hidden"
            >
              <FiSearch className="h-5 w-5" />
            </button>



            {/* Account */}
            <Link
              to={user ? "dashboard/profile" : "/login"}
              aria-label="Account"
              className="hover:text-black"
            >
              <FiUser className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== Secondary bar (categories + links) ===== */}
      <nav className="w-full hidden md:block bg-gradient-to-r from-[#4b0c23] to-[#45106e] relative">
        <div className="w-full max-w-7xl mx-auto px-6 h-8 grid grid-cols-1 items-center">
          {/* SR-only info */}
          <div className="sr-only">
            <a href="tel:7123399294">712-339-9294</a>
            <a href="mailto:info@moderno-demo.com">info@moderno-demo.com</a>
          </div>

          <div className="flex items-center justify-center font-poppins mt-1.5">
            <ul className="flex items-center gap-8 text-[11px] font-manrope font-semibold uppercase tracking-[0.12em]">
              <li>
                <a
                  href="/"
                  className="text-white border-b-[1px] border-transparent pb-1 hover:border-white transition"
                >
                  Homes
                </a>
              </li>

              <li className="relative group">
                <Link
                  to="/mensub"
                  className="text-white border-b-[1px] border-transparent pb-1 hover:border-white transition"
                >
                  Mens
                </Link>
              </li>

              <li className="relative group">
                <Link
                  to="/womensub"
                  className="text-white border-b-[1px] border-transparent pb-1 hover:border-white transition"
                >
                  Womens
                </Link>
              </li>

              <li className="relative group">
                <Link
                  to="/kidsub"
                  className="text-white border-b-[1px] border-transparent pb-1 hover:border-white transition"
                >
                  Kids
                </Link>
              </li>

              <li className="relative group">
                <Link
                  to="/accessories"
                  className="text-white border-b-[1px] border-transparent pb-1 hover:border-white transition"
                >
                  Accessories
                </Link>
              </li>

              <li>
                <Link
                  to="/all-product"
                  className="text-white border-b-[1px] border-transparent pb-1 hover:border-white transition"
                >
                  All Product
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex items-center justify-end gap-5" />
        </div>
      </nav>
    </>
  );
};

export default memo(HeaderDesktop);
