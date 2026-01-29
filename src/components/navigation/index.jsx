// components/navigation/index.jsx
import React, {
  lazy,
  Suspense,
  useContext,
  useEffect,
  useRef,
} from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import PromoBanner from "../PromoBanner";
import logo from "../../assets/images/logo.png";
import useCart from "../../hooks/useCart";
import { useUser } from "../../hooks/userContext";
import useLogout from "../../hooks/useLogout";
import { SearchContext } from "../../context/SearchContext";
import ProductLoader from "../../Spinner/ProductLoader";

// simple client-only media hook (CSR apps এ OK)
function useIsMobile(breakpoint = 768) {
  const isClient = typeof window !== "undefined";
  const [isMobile, setIsMobile] = React.useState(
    () => (isClient ? window.innerWidth < breakpoint : false)
  );

  useEffect(() => {
    if (!isClient) return;
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isClient, breakpoint]);

  return isMobile;
}

// Lazy chunks – আলাদা বান্ডেল হবে
const HeaderDesktop = lazy(() => import("./HeaderDesktop"));
const HeaderMobile = lazy(() => import("./HeaderMobile"));

const Header = () => {
  const [cart] = useCart();
  const { user } = useUser();
  const { handleLogout } = useLogout();
  const menuRef = useRef(null);
  const isMobile = useIsMobile();

  // Search context (আগের মতোই)
  const {
    searchTerm,
    setSearchTerm,
    handleSearch,
    productSearch,
    searchResults,
  } = useContext(SearchContext);

  // হালকা debounce বজায় (searchTerm থাকলে তবেই call)
  useEffect(() => {
    const q = searchTerm?.trim();
    if (!q) return;

    const t = setTimeout(() => {
      productSearch(q);
    }, 300);

    return () => clearTimeout(t);
  }, [searchTerm, productSearch]);

  // Categories fetch – React Query cache + performance tuning
  const {
    data: categories = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const r = await fetch(
        `${import.meta.env.VITE_APP_SERVER_URL}api/categories`
      );
      if (!r.ok) throw new Error("Failed to load categories");
      return r.json();
    },
    staleTime: 1000 * 60 * 10, // 10 min fresh
    cacheTime: 1000 * 60 * 30, // 30 min cache
    refetchOnWindowFocus: false,
  });

  const mobileMenue = [
    {
      id: "",
      name: "Home",
      icon: "https://cdn-icons-png.flaticon.com/128/263/263115.png",
    },
    {
      id: "",
      name: "All Category",
      icon: "https://cdn-icons-png.flaticon.com/128/5991/5991059.png",
      innermenue: [],
    },
    {
      id: "",
      name: "Contact",
      icon: "https://cdn-icons-png.flaticon.com/128/10261/10261328.png",
    },
  ];

  return (
    <>
      {/* চাইলে PromoBanner আবার চালু করতে পারো */}
      {/* <PromoBanner /> */}

      <div ref={menuRef}>
        <Helmet>
          <title>shoukhinshop</title>
        </Helmet>

        {/* উপরে ছোট info bar – চাইলে সরিয়েও দিতে পারো */}
        {isLoading && (
         <ProductLoader />
        )}
        {error && (
          <div className="w-full text-center text-xs text-red-500 py-1">
            Failed to load categories
          </div>
        )}

        <Suspense fallback={null}>
          {isMobile ? (
            <HeaderMobile
              logo={logo}
              cart={cart}
              user={user}
              categories={categories}
              mobileMenue={mobileMenue}
              handleLogout={handleLogout}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              productSearch={productSearch}
              searchResults={searchResults}
            />
          ) : (
            <HeaderDesktop
              logo={logo}
              cart={cart}
              user={user}
              categories={categories}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              handleSearch={handleSearch}
              productSearch={productSearch}
              searchResults={searchResults}
            />
          )}
        </Suspense>
      </div>
    </>
  );
};

export default Header;
