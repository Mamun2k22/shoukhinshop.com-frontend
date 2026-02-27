// components/navigation/HeaderDesktop.jsx
import React, { useEffect, useRef, useState, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch, FiUser, FiShoppingBag, FiChevronDown } from "react-icons/fi";
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import { RiCustomerService2Line } from "react-icons/ri";
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
import { FaTelegramPlane, FaSnapchatGhost } from "react-icons/fa";

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
  const [siteBrand, setSiteBrand] = useState("Bholamart");

  const [headerConfig, setHeaderConfig] = useState(null);
  const [tickerIndex, setTickerIndex] = useState(0);

  // categories dropdown (simple)
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef(null);

  /* ========== 1) Logo + Brand name load ========== */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetchPublicSettings();
        const data = res?.data || {};
        if (!alive) return;
        setSiteLogo(data.logoUrl || "");
        setSiteBrand(data.brandName || "Bholamart");
      } catch {}
    })();
    return () => (alive = false);
  }, []);

  /* ========== 2) Header settings (top bar + socials) load ========== */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetchPublicHeaderSettings();
        const data = res?.data || {};
        if (!alive) return;
        setHeaderConfig(data);
      } catch (e) {
        console.error("header settings load failed:", e);
      }
    })();
    return () => (alive = false);
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

  /* ========== 4) Click outside closes dropdowns ========== */
  useEffect(() => {
    const onDocClick = (e) => {
      if (!boxRef.current?.contains(e.target)) setOpen(false);
      if (!catRef.current?.contains(e.target)) setCatOpen(false);
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

  useEffect(() => {
    if (!topBarItems.length) return;
    setTickerIndex((i) => (i >= topBarItems.length ? 0 : i));
    const id = setInterval(() => {
      setTickerIndex((i) => (i + 1) % topBarItems.length);
    }, 3000);
    return () => clearInterval(id);
  }, [topBarItems.length]);

  // ✅ FIX: logo src supports ImgBB (http) + local (/uploads)
  const logoSrc = siteLogo
    ? siteLogo.startsWith("http")
      ? siteLogo
      : `${settingsApi.API_BASE}${siteLogo}`
    : "";

  return (
    <>
      {/* ================== TOP BAR (Gradient) ================== */}
      <header className="hidden md:block font-manrope">
        <div className="bg-[#ffffff]">
          <div className="mx-auto w-full max-w-[1400px] px-6 h-[64px] flex items-center gap-6">
            {/* LEFT: logo */}
            {/* <Link to="/" className="flex items-center gap-3 min-w-[180px]">
              {siteLogo ? (
                <img
                  className="h-10 w-auto drop-shadow-sm"
                  src={logoSrc}
                  alt={siteBrand}
                  loading="lazy"
                  onError={(e) => {
                    // fallback: hide broken image
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="text-white font-extrabold tracking-wide text-xl">
                  {siteBrand}
                </div>
              )}
            </Link> */}
            {/* LEFT: logo */}
<Link to="/" className="flex items-center gap-3 min-w-[180px]">
  {siteLogo && (
    <img
      className="h-10 w-auto drop-shadow-sm"
      src={logoSrc}
      alt={siteBrand}
      loading="lazy"
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  )}

<span className="text-xl font-extrabold bg-gradient-to-r from-black to-pink-500 bg-clip-text text-transparent">
  Shoukhin Shop
</span>
</Link>

            {/* CENTER: big search */}
            <div className="flex-1 flex justify-center">
              <div
                ref={boxRef}
                className="relative w-full max-w-[600px]"
              >
                <form
                  onSubmit={onSubmit}
                  className="flex items-center w-full rounded-sm overflow-hidden bg-white/95 shadow-sm border border-[#F77426]"
                >
                  <input
                    type="text"
                    className="h-[38px] w-full px-5 text-[13px] text-gray-700 outline-none placeholder:text-gray-400"
                    placeholder="Search for items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => searchTerm && setOpen(true)}
                    aria-label="Search"
                  />
                  <button
                    type="submit"
                    className="h-[38px] w-[44px] grid place-items-center bg-[#F77426] text-white hover:bg-[#5b4ff0] transition"
                    aria-label="Search"
                  >
                    <FiSearch className="h-4 w-4" />
                  </button>
                </form>

                {/* Suggestions */}
                {open && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-white shadow-xl rounded-xl z-50 max-h-[320px] overflow-y-auto border border-gray-100">
                    {searchResults.length === 0 ? (
                      <div className="px-4 py-3 text-xs text-gray-500">
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
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition border-b last:border-b-0"
                        >
                          <img
                            loading="lazy"
                            src={product.productImage?.[0] || "/placeholder.png"}
                            alt={product.productName}
                            className="w-9 h-9 rounded-lg object-cover border border-gray-200"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-gray-800 truncate">
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
            </div>

            {/* RIGHT: cart + user */}
            <div className="flex items-center gap-5 text-black min-w-[180px] justify-end">
              <Link
                to="/dashboard/cart"
                aria-label="Cart"
                className="flex items-center gap-2 relative"
              >
                <FiShoppingBag className="h-5 w-5" />
                <span className="text-sm font-medium">Cart</span>
                <span className="absolute -top-2 -right-3 text-[10px] min-w-[18px] h-[18px] px-1 rounded-full bg-[#F77426] text-[#f9fafc] font-bold flex items-center justify-center">
                  {cart?.length ?? 0}
                </span>
              </Link>

              <Link
                to={user ? "/dashboard/profile" : "/login"}
                aria-label="Account"
                className="h-9 w-9 rounded-full bg-white/20 border border-white/25 grid place-items-center hover:bg-white/30 transition"
              >
                <FiUser className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* ================== SECOND ROW (White Nav) ================== */}
        <div className="bg-white border-t border-gray-100">
          <div className="mx-auto w-full max-w-[1400px] px-6">
            <nav className="first-nav-container lg:flex items-center flex-wrap md:justify-center lg:justify-between py-2 mt-0 bg-[#ffffff]">
              {/* LEFT + CENTER */}
              <div className="flex items-center flex-wrap md:justify-center lg:justify-between gap-4 font-poppins text-sm font-medium">
                {/* ===== Browse All Categories (click dropdown) ===== */}
                <div ref={catRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setCatOpen((v) => !v)}
                    className="bg-[#F77426] focus:outline-none text-white py-[10px] px-4 rounded-md hover:opacity-95 transition"
                  >
                    <span className="flex items-center space-x-2">
                      <HiOutlineMenuAlt2 className="w-5 h-5" />
                      <span className="font-roboto">Browse All Categories</span>

                      {/* ✅ fix: rotate depends on catOpen */}
                      <FiChevronDown
                        className={`w-4 h-4 transform transition-transform ${
                          catOpen ? "rotate-180" : ""
                        }`}
                      />
                    </span>
                  </button>

                  {/* Dropdown */}
                  {catOpen && (
                    <div className="absolute left-0 z-50 mt-3 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
                      <div className="flex justify-center py-3 w-96">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {(categories?.length ? categories : [])
                            .slice(0, 12)
                            .map((c, index) => (
                              <Link
                                key={c._id || c.slug || c.name || index}
                                to={`/category/${c.slug || c._id || c.name}`}
                                className="flex gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm border hover:shadow-md transition"
                                onClick={() => setCatOpen(false)}
                              >
                                {/* image optional */}
                                {c.image && (
                                  <img
                                    className="h-6 w-6 object-contain"
                                    src={c.image}
                                    alt={c.name || "category"}
                                  />
                                )}
                                <h3 className="text-gray-700 text-sm font-medium">
                                  {c.name || "Category"}
                                </h3>
                              </Link>
                            ))}
                        </div>
                      </div>

                      <div className="flex justify-center mt-3 mb-2">
                        <button
                          type="button"
                          className="px-5 py-1.5 bg-gradient-to-r from-[#F77B31] to-[#e9681d] text-white rounded-full hover:opacity-95 transition"
                        >
                          + Show more...
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* ===== Nav Links ===== */}
                <Link
                  to="/"
                  className="text-gray-700 hover:text-blue-500 transition"
                >
                  Home
                </Link>

                {/* ===== Shop (hover mega menu) ===== */}
                <div className="relative group py-4">
                  <Link
                    to="/shop"
                    className="text-gray-700 hover:text-blue-500 transition"
                  >
                    Shop
                    <FiChevronDown className="w-4 h-4 inline-block ml-1" />
                  </Link>

                  {/* Mega menu */}
                  <div className="absolute left-1/2 transform -translate-x-1/3 w-screen right-0 transition duration-300 ease-in-out z-50 opacity-0 hidden group-hover:!block group-hover:!opacity-100 mt-0 top-[102%] font-quicksand font-normal">
                    <div className="shop-dropdown-menu bg-white shadow-md shadow-slate-400 max-w-[80%] mx-auto w-full grid grid-cols-4 gap-2 py-4 px-6 rounded">
                      {Array.from({ length: 3 }).map((_, colIndex) => (
                        <div key={colIndex} className="flex flex-col">
                          {(categories?.length ? categories : [])
                            .slice(colIndex * 4, colIndex * 4 + 4)
                            .map((cat, idx) => (
                              <div key={cat._id || cat.slug || cat.name || idx}>
                                <Link
                                  to={`/category/${cat.slug || cat._id || cat.name}`}
                                  className="block text-[16px] font-[600] py-2 text-[#303b9d]"
                                >
                                  {cat.name || "Category"}
                                </Link>

                                {cat.subcategories?.map((sub, sidx) => (
                                  <Link
                                    key={sub._id || sub.slug || sub.name || sidx}
                                    to={`/subcategory/${sub.slug || sub._id || sub.name}`}
                                    className="block text-[14px] py-1 font-normal text-gray-700 hover:text-blue-500 transition"
                                  >
                                    {sub.name}
                                  </Link>
                                ))}
                              </div>
                            ))}
                        </div>
                      ))}

                      <div className="flex justify-center items-center col-span-1">
                        <img
                          src="https://i.ibb.co/hdRsdwQ/Grey-Brown-Minimalist-Summer-season-collections-Banner-Landscape-508-x-322-px.png"
                          alt="Category Banner"
                          className="w-full h-auto rounded"
                          loading="lazy"
                          onError={(e) => {
                            // fallback: local placeholder (prevent broken)
                            e.currentTarget.src = "/placeholder.png";
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Link
                  to="/about"
                  className="text-gray-700 hover:text-blue-500 transition"
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="text-gray-700 hover:text-blue-500 transition"
                >
                  Contact
                </Link>
              </div>

              {/* RIGHT: Support (screenshot style) */}
              <Link
                to="/support"
                className="hidden md:flex justify-center items-center gap-3 bg-white px-4 py-1.5 rounded-md shadow-sm hover:shadow-md transition-all duration-300 border border-indigo-500"
              >
                <RiCustomerService2Line className="h-7 w-7 text-emerald-600" />
                <span className="text-gray-800 text-sm font-medium font-roboto">
                  24/7 Support Center
                </span>
              </Link>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
};

export default memo(HeaderDesktop);