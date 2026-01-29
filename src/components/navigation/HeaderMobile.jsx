// components/Header/HeaderMobile.jsx
import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import settingsApi from "../../hooks/settingsApi.jsx"; 
import {
  FiSearch,
  FiMenu,
  FiX,
  FiUser,
  FiChevronDown,
  FiShoppingCart,
  FiChevronLeft,
} from "react-icons/fi";
 


function HeaderMobile({
  logo,
  cart,
  user,
  categories,
  mobileMenue,
  handleLogout, // future use
  searchTerm,
  setSearchTerm,
  productSearch,
  searchResults,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeInnermenue, setActiveInnermenue] = useState(null);
  const [siteLogo, setSiteLogo] = useState("");   // dynamic logo url
  const [siteBrand, setSiteBrand] = useState("shoukhinshop");

  // local state for search UX
  const [openResults, setOpenResults] = useState(false);
  const [typing, setTyping] = useState(false);
  const debRef = useRef(null);
  const nav = useNavigate();

  const baseBtn =
    "inline-flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const iconBtn =
    baseBtn +
    " w-10 h-10 bg-white/90 border border-gray-200 active:scale-[.98]";
  const cartCount = Array.isArray(cart) ? cart.length : 0;

  // Lock body scroll while search overlay open
  useEffect(() => {
    if (!isSearchOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isSearchOpen]);

  // Debounced search (optimized: empty হলে debounce/কল কিছুই হবে না)
  const onType = (val) => {
    setSearchTerm(val);

    const q = val.trim();

    // input খালি হলে সাথে সাথেই সব reset
    if (!q) {
      setTyping(false);
      setOpenResults(false);
      if (debRef.current) clearTimeout(debRef.current);
      return;
    }

    setTyping(true);
    if (debRef.current) clearTimeout(debRef.current);

    debRef.current = setTimeout(() => {
      productSearch(q);
      setOpenResults(true);
      setTyping(false);
    }, 250);
  };

  const onCloseSearch = () => {
    setIsSearchOpen(false);
    setOpenResults(false);
    setTyping(false);
    if (debRef.current) clearTimeout(debRef.current);
  };

  const goToProduct = (id) => {
    onCloseSearch();
    setSearchTerm("");
    nav(`/product-details/${id}`);
  };

  const onSubmitSearch = (e) => {
    e?.preventDefault?.();
    const q = searchTerm.trim();
    if (!q) return;
    onCloseSearch();
    nav(`/search?q=${encodeURIComponent(q)}`);
  };

  // Esc to close search overlay
  useEffect(() => {
    if (!isSearchOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onCloseSearch();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isSearchOpen]);

  // profile icon click → direct navigate
  const onAccountClick = () => {
    if (user) {
      nav("/dashboard/profile");
    } else {
      nav("/login");
    }
  };
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await settingsApi.fetchPublicSettings();
        const data = res?.data || {};
        if (!alive) return;

        setSiteLogo(data.logoUrl || "");
        setSiteBrand(data.brandName || "shoukhinshop");
      } catch (e) {
        // fail silently (header break করবে না)
        // console.log(e.message);
      }
    })();

    return () => { alive = false; };
  }, []);

  return (
    <div className="md:hidden block">
      {/* Top bar */}
      <div className="relative py-3">
        <div className="flex justify-between items-center gap-2 w-full px-3.5">
          <button
            type="button"
            onClick={() => setIsMenuOpen((p) => !p)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className={iconBtn}
          >
            {isMenuOpen ? (
              <FiX className="text-gray-700 text-xl" />
            ) : (
              <FiMenu className="text-gray-700 text-xl" />
            )}
          </button>

{/* ✅ Center logo holder (fixed width so layout won't shift) */}
<Link
  to="/"
  aria-label="Go to home"
  className="flex items-center justify-center w-[140px] sm:w-[160px] -ml-1"
>
  {siteLogo ? (
    <img
      className="h-8 w-full object-contain"   // ✅ fixed height + contain
      src={`${settingsApi.API_BASE}${siteLogo}`}
      alt={siteBrand}
      loading="lazy"
    />
  ) : (
    <span className="text-black font-semibold tracking-wide text-sm truncate">
      {siteBrand}
    </span>
  )}
</Link>


          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Open search"
              className={iconBtn}
            >
              <FiSearch className="text-gray-700 text-xl" />
            </button>

            <Link
              to="/dashboard/cart"
              aria-label="Cart"
              className={iconBtn + " relative"}
            >
              <FiShoppingCart className="text-gray-700 text-xl" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 h-4 min-w-4 px-1 rounded-full bg-emerald-600 text-[10px] text-white flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Account button → direct navigate */}
            <button
              type="button"
              onClick={onAccountClick}
              aria-label={user ? "Go to profile" : "Login"}
              className={iconBtn + " overflow-hidden"}
            >
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <FiUser className="text-gray-700 text-xl" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Drawer menu */}
      {isMenuOpen && (
        <div className="mobile-menue w-full p-3 bg-white border-t border-slate-200 z-[60]">
          <ul className="flex flex-col gap-2 font-roboto">
            {mobileMenue.map((item, index) => {
              const isAllCat = item.name === "All Category";
              const isOpen = activeInnermenue === index;

              return (
                <li key={index}>
                  <button
                    type="button"
                    onClick={() =>
                      isAllCat
                        ? setActiveInnermenue((p) =>
                            p === index ? null : index
                          )
                        : undefined
                    }
                    className="group w-full flex items-center justify-between gap-3 rounded-lg border border-transparent px-3 py-2.5 text-sm font-semibold text-slate-900 hover:bg-indigo-50 hover:text-indigo-700 active:border-indigo-200"
                  >
                    <span className="flex items-center gap-2">
                      {item.icon ? (
                        <img className="h-5 w-5" src={item.icon} alt="" />
                      ) : (
                        <span className="h-5 w-5 rounded bg-slate-200" />
                      )}
                      <span className="text-base">
                        <Link to="/" onClick={() => setIsMenuOpen(false)}>
                          {item.name}
                        </Link>
                      </span>
                    </span>
                    {isAllCat && (
                      <FiChevronDown
                        className={`text-lg transition-transform ${
                          isOpen ? "rotate-180 text-indigo-700" : "text-slate-500"
                        }`}
                      />
                    )}
                  </button>

                  {isAllCat && isOpen && (
                    <div className="mobile-nav-inner-menue mt-3 pl-1">
                      <ul className="grid grid-cols-2 gap-3">
                        {categories.map((category) => (
                          <li
                            key={category._id || category.name}
                            className="rounded-md hover:bg-indigo-50 transition"
                          >
                            <Link
                              to={`/category/${category.name}`}
                              onClick={() => setIsMenuOpen(false)}
                              className="flex items-center gap-2 px-2 py-2"
                            >
                              {category.image && (
                                <img
                                  className="h-4 w-4 object-contain"
                                  src={category.image}
                                  alt=""
                                />
                              )}
                              <span className="text-sm text-gray-700 font-medium">
                                {category.name}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Search overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-white">
          {/* Top row: back + input */}
          <form
            onSubmit={onSubmitSearch}
            className="flex items-center gap-3 p-3"
          >
            <button
              aria-label="Close search"
              type="button"
              onClick={onCloseSearch}
              className={baseBtn + " w-10 h-10"}
            >
              <FiChevronLeft className="text-2xl" />
            </button>

            <div className="flex items-center gap-2 w-full border border-gray-300 rounded-lg px-3 py-2">
              <input
                type="text"
                autoFocus
                placeholder="Search for items…"
                className="flex-1 text-[15px] text-gray-800 outline-none"
                value={searchTerm}
                onChange={(e) => onType(e.target.value)}
              />
              <button type="submit" aria-label="Search" className="p-1">
                <FiSearch className="text-gray-500 text-xl" />
              </button>
            </div>
          </form>

          {/* Results list */}
          <div className="px-3 pb-4">
            {typing && (
              <div className="px-1 py-2 text-sm text-gray-500">
                Searching…
              </div>
            )}

            {!typing && openResults && (
              <MobileSearchResults
                results={searchResults}
                searchTerm={searchTerm}
                onSelect={goToProduct}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Memoized search result list for less re-render
const MobileSearchResults = React.memo(function MobileSearchResults({
  results = [],
  searchTerm,
  onSelect,
}) {
  const items = Array.isArray(results) ? results.slice(0, 20) : [];

  if (!searchTerm?.trim()) return null;

  if (!items.length) {
    return (
      <div className="px-1 py-2 text-sm text-gray-500">No results</div>
    );
  }

  return (
    <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 overflow-hidden">
      {items.map((p) => (
        <li
          key={p._id}
          className="flex items-center gap-3 px-3 py-2 active:bg-gray-100"
          onClick={() => onSelect(p._id)}
          role="button"
        >
          <img
            src={
              Array.isArray(p.productImage)
                ? p.productImage[0] || "/placeholder.png"
                : p.productImage || "/placeholder.png"
            }
            alt={p.productName}
            className="w-12 h-12 rounded object-cover border"
            loading="lazy"
          />
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-gray-800 truncate">
              {p.productName}
            </p>
            {p.price != null && (
              <p className="text-xs text-gray-500 truncate">৳ {p.price}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
});

export default React.memo(HeaderMobile);






































// // components/Header/HeaderMobile.jsx
// import { Link, useNavigate } from "react-router-dom";
// import {
//   FiSearch, FiMenu, FiX, FiUser, FiChevronDown, FiShoppingCart, FiChevronLeft
// } from "react-icons/fi";
// import React, { useEffect, useState, useRef } from "react";

// function HeaderMobile({
//   logo, cart, user, categories, mobileMenue,
//   handleLogout, searchTerm, setSearchTerm, productSearch, searchResults, // ⬅️ NEW: searchResults prop
// }) {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [isSearchOpen, setIsSearchOpen] = useState(false);
//   const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
//   const [activeInnermenue, setActiveInnermenue] = useState(null);

//   // local state for search UX
//   const [openResults, setOpenResults] = useState(false);
//   const [typing, setTyping] = useState(false);
//   const debRef = useRef(null);
//   const nav = useNavigate();

//   const baseBtn = "inline-flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500";
//   const iconBtn = `${baseBtn} w-10 h-10 bg-white/90 border border-gray-200 active:scale-[.98]`;
//   const cartCount = Array.isArray(cart) ? cart.length : 0;

//   useEffect(() => {
//     const onDoc = (e) => {
//       if (!e.target.closest?.("#mob-account-menu")) setIsAccountMenuOpen(false);
//     };
//     document.addEventListener("mousedown", onDoc);
//     return () => document.removeEventListener("mousedown", onDoc);
//   }, []);

//   // Lock body scroll while search overlay open
//   useEffect(() => {
//     if (!isSearchOpen) return;
//     const prev = document.body.style.overflow;
//     document.body.style.overflow = "hidden";
//     return () => { document.body.style.overflow = prev; };
//   }, [isSearchOpen]);

//   // Debounced search while typing
//   const onType = (val) => {
//     setSearchTerm(val);
//     setTyping(true);
//     if (debRef.current) clearTimeout(debRef.current);
//     debRef.current = setTimeout(() => {
//       const q = val.trim();
//       if (q) {
//         productSearch(q);
//         setOpenResults(true);
//       } else {
//         setOpenResults(false);
//       }
//       setTyping(false);
//     }, 250);
//   };

//   const onCloseSearch = () => {
//     setIsSearchOpen(false);
//     setOpenResults(false);
//     setTyping(false);
//   };

//   const goToProduct = (id) => {
//     onCloseSearch();
//     setSearchTerm("");
//     nav(`/product-details/${id}`);
//   };

//   const onSubmitSearch = (e) => {
//     e?.preventDefault?.();
//     const q = searchTerm.trim();
//     if (!q) return;
//     onCloseSearch();
//     nav(`/search?q=${encodeURIComponent(q)}`);
//   };

//   // Esc to close
//   useEffect(() => {
//     const onKey = (e) => { if (e.key === "Escape") onCloseSearch(); };
//     if (isSearchOpen) window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [isSearchOpen]);

//   return (
//     <div className="md:hidden block">
//       {/* Top bar */}
//       <div className="relative py-3">
//         <div className="flex justify-between items-center gap-2 w-full px-3.5">
//           <Link to="/" aria-label="Go to home" className="shrink-0">
//             <img src={logo} alt="M.M Trading" className="h-10 w-auto object-contain" />
//           </Link>

//           <div className="flex items-center gap-2">
//             <button type="button" onClick={() => setIsSearchOpen(true)} aria-label="Open search" className={iconBtn}>
//               <FiSearch className="text-gray-700 text-xl" />
//             </button>

//             <Link to="/dashboard/cart" aria-label="Cart" className={`${iconBtn} relative`}>
//               <FiShoppingCart className="text-gray-700 text-xl" />
//               {cartCount > 0 && (
//                 <span className="absolute -right-1 -top-1 h-4 min-w-4 px-1 rounded-full bg-emerald-600 text-[10px] text-white flex items-center justify-center">
//                   {cartCount}
//                 </span>
//               )}
//             </Link>

//             <div id="mob-account-menu" className="relative">
//               <button
//                 type="button"
//                 onClick={() => setIsAccountMenuOpen((p) => !p)}
//                 aria-haspopup="menu"
//                 aria-expanded={isAccountMenuOpen}
//                 className={`${iconBtn} overflow-hidden`}
//               >
//                 {user?.profileImage ? (
//                   <img src={user.profileImage} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
//                 ) : (
//                   <FiUser className="text-gray-700 text-xl" />
//                 )}
//               </button>

//               {isAccountMenuOpen && (
//                 <div role="menu" className="absolute right-0 mt-2 w-44 rounded-xl border border-gray-200 bg-white shadow-lg z-50 overflow-hidden">
//                   {user ? (
//                     <>
//                       <Link to="/dashboard/profile" className="block px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50" role="menuitem" onClick={() => setIsAccountMenuOpen(false)}>
//                         Profile
//                       </Link>
//                       <button
//                         onClick={() => { setIsAccountMenuOpen(false); handleLogout?.(); }}
//                         className="block w-full text-left px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50"
//                         role="menuitem"
//                       >
//                         Logout
//                       </button>
//                     </>
//                   ) : (
//                     <Link to="/login" onClick={() => setIsAccountMenuOpen(false)} className="block px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50" role="menuitem">
//                       Login
//                     </Link>
//                   )}
//                 </div>
//               )}
//             </div>

//             <button type="button" onClick={() => setIsMenuOpen((p) => !p)} aria-label={isMenuOpen ? "Close menu" : "Open menu"} className={iconBtn}>
//               {isMenuOpen ? <FiX className="text-gray-700 text-xl" /> : <FiMenu className="text-gray-700 text-xl" />}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Drawer menu */}
//       {isMenuOpen && (
//         <div className="mobile-menue w-full p-3 bg-slate-100 border-t border-slate-200 z-[60]">
//           <ul className="flex flex-col gap-2 font-roboto">
//             {mobileMenue.map((item, index) => {
//               const isAllCat = item.name === "All Category";
//               const isOpen = activeInnermenue === index;

//               return (
//                 <li key={index}>
//                   <button
//                     type="button"
//                     onClick={() => (isAllCat ? setActiveInnermenue((p) => (p === index ? null : index)) : undefined)}
//                     className="group w-full flex items-center justify-between gap-3 rounded-lg border border-transparent px-3 py-2.5 text-sm font-semibold text-slate-900 hover:bg-indigo-50 hover:text-indigo-700 active:border-indigo-200"
//                   >
//                     <span className="flex items-center gap-2">
//                       {item.icon ? <img className="h-5 w-5" src={item.icon} alt="" /> : <span className="h-5 w-5 rounded bg-slate-200" />}
//                       <span className="text-base">{item.name}</span>
//                     </span>
//                     {isAllCat && (
//                       <FiChevronDown className={`text-lg transition-transform ${isOpen ? "rotate-180 text-indigo-700" : "text-slate-500"}`} />
//                     )}
//                   </button>

//                   {isAllCat && isOpen && (
//                     <div className="mobile-nav-inner-menue mt-3 pl-1">
//                       <ul className="grid grid-cols-2 gap-3">
//                         {categories.map((category) => (
//                           <li key={category._id || category.name} className="rounded-md hover:bg-indigo-50 transition">
//                             <Link to={`/category/${category.name}`} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-2 py-2">
//                               <img className="h-4 w-4 object-contain" src={category.image} alt="" />
//                               <span className="text-sm text-gray-700 font-medium">{category.name}</span>
//                             </Link>
//                           </li>
//                         ))}
//                       </ul>
//                     </div>
//                   )}
//                 </li>
//               );
//             })}
//           </ul>
//         </div>
//       )}

//       {/* Search overlay */}
//       {isSearchOpen && (
//         <div className="fixed inset-0 z-50 bg-white">
//           {/* Top row: back + input */}
//           <form onSubmit={onSubmitSearch} className="flex items-center gap-3 p-3">
//             <button aria-label="Close search" type="button" onClick={onCloseSearch} className={`${baseBtn} w-10 h-10`}>
//               <FiChevronLeft className="text-2xl" />
//             </button>

//             <div className="flex items-center gap-2 w-full border border-gray-300 rounded-lg px-3 py-2">
//               <input
//                 type="text"
//                 autoFocus
//                 placeholder="Search for items…"
//                 className="flex-1 text-[15px] text-gray-800 outline-none"
//                 value={searchTerm}
//                 onChange={(e) => onType(e.target.value)}
//               />
//               <button type="submit" aria-label="Search" className="p-1">
//                 <FiSearch className="text-gray-500 text-xl" />
//               </button>
//             </div>
//           </form>

//           {/* Results list */}
//           <div className="px-3 pb-4">
//             {typing && (
//               <div className="px-1 py-2 text-sm text-gray-500">Searching…</div>
//             )}

//             {!typing && openResults && (
//               <MobileSearchResults
//                 results={searchResults}        // ⬅️ use real results
//                 searchTerm={searchTerm}
//                 onSelect={goToProduct}
//               />
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// function MobileSearchResults({ results = [], searchTerm, onSelect }) {
//   const items = Array.isArray(results) ? results.slice(0, 20) : [];

//   if (!searchTerm?.trim()) return null;

//   if (!items.length) {
//     return <div className="px-1 py-2 text-sm text-gray-500">No results</div>;
//   }

//   return (
//     <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 overflow-hidden">
//       {items.map((p) => (
//         <li
//           key={p._id}
//           className="flex items-center gap-3 px-3 py-2 active:bg-gray-100"
//           onClick={() => onSelect(p._id)}
//           role="button"
//         >
//           <img
//             src={Array.isArray(p.productImage) ? (p.productImage[0] || "/placeholder.png") : (p.productImage || "/placeholder.png")}
//             alt={p.productName}
//             className="w-12 h-12 rounded object-cover border"
//             loading="lazy"
//           />
//           <div className="min-w-0">
//             <p className="text-[13px] font-medium text-gray-800 truncate">{p.productName}</p>
//             {p.price != null && (
//               <p className="text-xs text-gray-500 truncate">৳ {p.price}</p>
//             )}
//           </div>
//         </li>
//       ))}
//     </ul>
//   );
// }

// export default React.memo(HeaderMobile);
// components/Header/HeaderMobile.jsx