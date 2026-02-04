// components/navigation/HeaderDesktop.jsx
import React, { useEffect, useRef, useState, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch, FiUser, FiHeart, FiShoppingBag, FiChevronDown } from "react-icons/fi";
import settingsApi, {
  fetchPublicSettings,
  fetchPublicHeaderSettings,
} from "../../hooks/settingsApi.jsx";




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
  const categoryRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const [siteLogo, setSiteLogo] = useState("");
  const [siteBrand, setSiteBrand] = useState("Shoukhinshop");

  // ⭐ header top bar config
  const [headerConfig, setHeaderConfig] = useState(null);

  // ✅ ticker index
  const [tickerIndex, setTickerIndex] = useState(0);

  /* ========== Load settings ========== */
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await fetchPublicSettings();
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

    return () => {
      alive = false;
    };
  }, []);

  /* ========== Search debounce ========== */
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

  /* ========== Click outside closes dropdowns ========== */
  useEffect(() => {
    const onDocClick = (e) => {
      if (!boxRef.current?.contains(e.target)) setOpen(false);
      if (!categoryRef.current?.contains(e.target)) setCategoryOpen(false);
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

  // ✅ top bar items
  const topBarItems = (
    Array.isArray(headerConfig?.topBarTexts) && headerConfig.topBarTexts.length
      ? headerConfig.topBarTexts
      : typeof headerConfig?.topBarText === "string" &&
        headerConfig.topBarText.trim()
      ? [headerConfig.topBarText]
      : []
  ).filter(Boolean);

  // ✅ Auto rotate top bar items
  useEffect(() => {
    if (!topBarItems.length) return;
    setTickerIndex((i) => (i >= topBarItems.length ? 0 : i));

    const id = setInterval(() => {
      setTickerIndex((i) => (i + 1) % topBarItems.length);
    }, 3000);

    return () => clearInterval(id);
  }, [topBarItems.length]);

  // ✅ Safe social links filter
  const socialLinks = headerConfig?.socialLinks || {};
  const validSocialLinks = Object.entries(socialLinks)
    .filter(([key, url]) => {
      // Check if URL exists and is a string
      if (!url || typeof url !== 'string') return false;
      
      // Check if we have an icon for this social platform
      if (!SOCIAL_ICON_MAP[key]) return false;
      
      // Check if URL is not empty after trimming
      return url.trim().length > 0;
    });

  return (
    <>
      {/* ===== TOP ANNOUNCEMENT BAR ===== */}
      {topBarItems.length > 0 && (
        <div className="hidden md:block bg-gradient-to-r from-[#4b0c23] to-[#951331] text-white">
          <div className="max-w-7xl mx-auto px-6 py-1.5">
            <div className="flex items-center justify-center">
              <div className="flex-1 flex justify-center">
                <div className="relative h-6 overflow-hidden">
                  <div
                    className="transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateY(-${tickerIndex * 24}px)` }}
                  >
                    {topBarItems.map((text, idx) => (
                      <div
                        key={idx}
                        className="h-6 flex items-center justify-center"
                      >
                        <p className="text-xs font-medium text-center">
                          {text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Social Links - FIXED: Added null check and string validation */}
              {validSocialLinks.length > 0 && (
                <div className="flex items-center gap-3">
                  {validSocialLinks.map(([key, url]) => {
                    const Icon = SOCIAL_ICON_MAP[key];
                    if (!Icon) return null;
                    
                    return (
                      <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-300 hover:text-white transition-colors"
                        aria-label={key}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== MAIN HEADER ===== */}
      <header className="hidden md:block sticky top-0 z-40 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* LOGO */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                {siteLogo ? (
                  <img
                    className="h-12 w-auto"
                    src={`${settingsApi.API_BASE}${siteLogo}`}
                    alt={siteBrand}
                    loading="lazy"
                  />
                ) : (
                  <span className="text-2xl font-bold text-gray-900 tracking-tight">
                    {siteBrand}
                  </span>
                )}
              </Link>
            </div>

            {/* CATEGORIES MENU */}
            <div className="flex-1 mx-8">
              <nav className="flex items-center justify-center">
                <ul className="flex items-center space-x-8">
                  <li>
                    <Link
                      to="/"
                      className="text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors"
                    >
                      Home
                    </Link>
                  </li>
                  
                  {/* Browse All Categories Dropdown */}
                  <li className="relative" ref={categoryRef}>
                    <button
                      onClick={() => setCategoryOpen(!categoryOpen)}
                      className="flex items-center text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors"
                    >
                      <span>Browse All Categories</span>
                      <FiChevronDown className={`ml-1 h-4 w-4 transition-transform ${categoryOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {categoryOpen && categories && categories.length > 0 && (
                      <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50">
                        {categories.map((category) => (
                          <Link
                            key={category._id || category.id || Math.random()}
                            to={`/category/${category.slug || category._id}`}
                            onClick={() => setCategoryOpen(false)}
                            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <span className="truncate">{category.name || "Unnamed Category"}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </li>
                  
                  <li>
                    <Link
                      to="/all-product"
                      className="text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors"
                    >
                      All Products
                    </Link>
                  </li>

                  
                  <li>
                    <Link
                      to="/contact"
                      className="text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors"
                    >
                      Contact
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>

            {/* RIGHT ACTIONS */}
            <div className="flex items-center space-x-6">
              {/* SEARCH */}
              <div className="relative" ref={boxRef}>
                <form onSubmit={onSubmit} className="relative">
                  <input
                    type="text"
                    className="w-96 pl-4 pr-10 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => searchTerm && setOpen(true)}
                    aria-label="Search"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label="Search"
                  >
                    <FiSearch className="h-4 w-4" />
                  </button>
                </form>
                
                {/* Search Suggestions */}
                {open && searchResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50 max-h-96 overflow-y-auto">
                    {searchResults.map((product) => (
                      <Link
                        key={product._id}
                        to={`/product-details/${product._id}`}
                        onClick={() => {
                          setSearchTerm("");
                          setOpen(false);
                        }}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <img
                          src={product.productImage?.[0] || "/placeholder.png"}
                          alt={product.productName || "Product"}
                          className="w-10 h-10 rounded object-cover border border-gray-200"
                          loading="lazy"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product.productName || "Unnamed Product"}
                          </p>
                          {product.price != null && (
                            <p className="text-xs text-gray-500">
                              ৳ {product.price.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* WISHLIST */}
              <Link
                to="/dashboard/wishlist"
                className="text-gray-700 hover:text-gray-900 transition-colors relative"
                aria-label="Wishlist"
              >
                <FiHeart className="h-5 w-5" />
              </Link>

              {/* CART */}
              <Link
                to="/dashboard/cart"
                className="text-gray-700 hover:text-gray-900 transition-colors relative"
                aria-label="Cart"
              >
                <FiShoppingBag className="h-5 w-5" />
                {cart && cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 text-xs min-w-[20px] h-[20px] px-1 rounded-full bg-red-500 text-white flex items-center justify-center font-medium">
                    {cart.length > 99 ? '99+' : cart.length}
                  </span>
                )}
              </Link>

              {/* ACCOUNT */}
              <Link
                to={user ? "/dashboard/profile" : "/login"}
                className="text-gray-700 hover:text-gray-900 transition-colors"
                aria-label="Account"
              >
                <FiUser className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default memo(HeaderDesktop);