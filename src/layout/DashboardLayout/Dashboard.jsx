// src/layout/DashboardLayout/Dashboard.jsx
import { useState, useMemo } from "react";
import { Outlet, Link, NavLink } from "react-router-dom";
import { RxDashboard } from "react-icons/rx";
import { LuUserRoundCheck } from "react-icons/lu";
import {
  FiMenu,
  FiSearch,
  FiLogOut,
  FiUser,
  FiHome,
  FiTag,
  FiLayers,
  FiShoppingBag,
  FiImage,
  FiUsers,
  FiStar,
  FiFileText,
  FiPackage,
  FiCreditCard,
  FiShield,
  FiBookmark,
  FiSettings,
  FiCheckSquare,
  FiTruck,
  FiXSquare,
  FiLayout,
  FiDroplet,
} from "react-icons/fi";
import { IoBagAddOutline, IoColorFill } from "react-icons/io5";
import { RiAdminLine } from "react-icons/ri";

import Color from "../../components/Color";
import useLogout from "../../hooks/useLogout";
import { useUser } from "../../hooks/userContext";
import { FaChartLine, FaList } from "react-icons/fa";
import { AiOutlineGlobal } from "react-icons/ai";

const navBase =
  "flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium transition";
const navIdle = "text-slate-600 hover:text-indigo-700 hover:bg-indigo-50";
const navActive =
  "text-indigo-700 bg-indigo-100 ring-1 ring-indigo-200 shadow-sm";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer
  const [openColor, setOpenColor] = useState(false);

  // ✅ userContext থেকে user নেই/লোডিং—দুটোই হ্যান্ডেল
  const { user, loading } = useUser() || {};
  const { handleLogout } = useLogout();
  const [unread] = useState(9); // demo
  const defaultAvatar = "https://preline.co/assets/img/160x160/img1.jpg";
  const avatarSrc = user?.profileImage || defaultAvatar;
  // ✅ user hydrate হওয়া পর্যন্ত UI-র ক্রিটিক্যাল অংশ render না করি
  const isHydrated = useMemo(() => {
    if (typeof loading === "boolean") return !loading;
    // যদি loading না পাঠাও, user defined হলেই hydrated ধরা
    return user !== undefined;
  }, [user, loading]);

  const role = user?.role;
  const isAdmin = role === "admin";
  // (Mobile drawer) — admin
  const adminLinks = [
    { to: "/dashboard", icon: <RxDashboard />, label: "Dashboard", end: true },
    { to: "/", icon: <FiHome />, label: "Home" },
    { to: "/dashboard/seller", icon: <RiAdminLine />, label: "Admin" },
    { to: "/dashboard/hero", icon: <FiImage />, label: "Banner" },
    { to: "/dashboard/orders", icon: <FiTag />, label: "All Orders" },
    { to: "/dashboard/product", icon: <IoBagAddOutline />, label: "Product" },
    {
      to: "/dashboard/create",
      icon: <FiShoppingBag />,
      label: "Create Product",
    },
    { to: "/dashboard/user", icon: <FiUsers />, label: "Users" },
    { to: "/dashboard/review", icon: <FiStar />, label: "Reviews" },
    { to: "/dashboard/invoices", icon: <FiCreditCard />, label: "Invoices" },
    { to: "/dashboard/shiping", icon: <FiCreditCard />, label: "Shiping" },
  ];

  // (Mobile drawer) — user
  const userLinks = [
    { to: "/", icon: <FiHome />, label: "Home" },
    { to: "/dashboard/cart", icon: <FiShoppingBag />, label: "My Cart" },
    { to: "/dashboard/order", icon: <FiLayers />, label: "Order History" },
    {
      to: "/dashboard/my-invoices",
      icon: <FiCreditCard />,
      label: "My Invoices",
    },
    {
      to: "/dashboard/setting",
      icon: <FiSettings />,
      label: "Settings",
    },
    { to: "/dashboard/profile", icon: <FiUser />, label: "My Profile" },
    {
      to: "/dashboard/wishlist",
      icon: <FaList />,
      label: "Wishlist",
    },
,
  ];

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    if (h < 21) return "Good Evening";
    return "Good Night";
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.();
    }
  };

  // (Desktop sidebar) — admin grouped
  const adminGroups = [
    {
      title: "Navigation",
      items: [
        {
          to: "/dashboard",
          icon: <RxDashboard />,
          label: "Dashboard",
          end: true,
        },
        { to: "/", icon: <FiHome />, label: "Home" },
      ],
    },
    {
      title: "Catalog",
      items: [
        { to: "/dashboard/product", icon: <FiPackage />, label: "Products" },
        // { to: "/dashboard/categories", icon: <FiLayers />, label: "Categories" },
        { to: "/dashboard/hero", icon: <FiImage />, label: "Media/Banners" },
      ],
    },
    {
      title: "Sales",
      items: [
        {
          to: "/dashboard/orders",
          icon: <FiShoppingBag />,
          label: "All Orders",
        },
        {
          to: "/dashboard/confirm-orders",
          icon: <FiCheckSquare />,
          label: "Confirm Orders",
        },
        {
          to: "/dashboard/delivery-orders",
          icon: <FiTruck />,
          label: "Delivery Orders",
        },
        {
          to: "/dashboard/cancel-orders",
          icon: <FiXSquare />,
          label: "Cancel Orders",
        },
        {
          to: "/dashboard/invoices",
          icon: <FiCreditCard />,
          label: "Invoices",
        },
        { to: "/dashboard/coupon", icon: <FiTag />, label: "Coupon" },
        {
          to: "/dashboard/sales-report",
          icon: <FaChartLine />,
          label: "Report",
        },
        // { to: "/dashboard/shiping", icon: <FiShoppingBag />, label: "Shiping" },
      ],
    },
    {
      title: "Customers",
      items: [
        { to: "/dashboard/user", icon: <FiUsers />, label: "User" },
        // { to: "/dashboard/seller-approved", icon: <FiShield />, label: "Approved Sellers" },
        { to: "/dashboard/review", icon: <FiStar />, label: "Reviews" },
      ],
    },
    {
      title: "Management",
      // extras: ({ navBase, navIdle }) => (
      //   <div className="flex flex-col gap-1">
      //     <button
      //       type="button"
      //       onClick={() => setOpenColor(true)}
      //       className={`${navBase} ${navIdle} w-full`}
      //     >
      //       <IoColorFill className="text-base" />
      //       <span>Color</span>
      //     </button>
      //   </div>
      // ),

      items: [
        {
          to: "/dashboard/categories",
          icon: <FiLayers />,
          label: "Categories",
        },
        {
          to: "/dashboard/subcategories",
          icon: <FiMenu />,
          label: "Sub Category",
        },
        {
          to: "/dashboard/color",
          icon: <FiDroplet />,
          label: "Color",
        },
        {
          to: "/dashboard/brands",
          icon: <FiBookmark />,
          label: "Brands",
        },
      ],
    },
    {
      title: "Settings",
      items: [
        {
          to: "/dashboard/setting-logo",
          icon: <FiShield />,
          label: "Logo",
        },
        {
          to: "/dashboard/setting-section",
          icon: <FiSettings />,
          label: "Home Section",
        },
        {
          to: "/dashboard/setting-header",
          icon: <FiLayout />,
          label: "Header Section",
        },
        {
          to: "/dashboard/setting-shipping",
          icon: <FiTruck />,
          label: "Shipping",
        },
        {
          to: "/dashboard/setting-ticker",
          icon: <FiFileText />,
          label: "Ticker",
        },
        {
          to: "/dashboard/General-setting",
          icon: <AiOutlineGlobal />,
          label: "General Setting",
        },
        // {
        //   to: "/dashboard/settings/roles",
        //   icon: <FiShield />,
        //   label: "Users & Roles",
        // },
      ],
    },
  ];

  // (Desktop sidebar) — user grouped
  const userGroups = [
    {
      title: "Navigation",
      items: [{ to: "/", icon: <FiHome />, label: "Home" }],
    },
    {
      title: "Shopping",
      items: [
        { to: "/dashboard/cart", icon: <FiShoppingBag />, label: "My Cart" },
        { to: "/dashboard/order", icon: <FiLayers />, label: "Order History" },
        {
          to: "/dashboard/my-invoices",
          icon: <FiCreditCard />,
          label: "My Invoices",
        },
        {
          to: "/dashboard/setting",
          icon: <FiSettings />,
          label: "Settings",
        },
        {
          to: "/dashboard/wishlist",
          icon: <FaList />,
          label: "Wishlist",
        },
      ],
    },
    // {
    //   title: "Verification",
    //   items: [{ to: "/seller/verification", icon: <RiAdminLine />, label: "Seller Verification" }],
    // },
  ];

  // ✅ role না আসা পর্যন্ত গ্রুপ/লিংক রেন্ডার কোরো না
  const resolvedDesktopGroups = role
    ? isAdmin
      ? adminGroups
      : userGroups
    : [];
  const resolvedMobileLinks = role ? (isAdmin ? adminLinks : userLinks) : [];

  const displayName = user?.name || user?.username || "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Topbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b h-14">
        <div className="mx-auto max-w-full px-3 xl:px-4 h-14 flex items-center justify-between mt-0.5">
          {/* Left */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg border hover:bg-slate-50"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <FiMenu />
            </button>
            <div className="hidden lg:block">
              <Link to="/" className="flex items-center gap-2 ">
                <img
                  src="https://img.freepik.com/premium-vector/modern-technology-logo-blue-circle-futuristic-digital-symbol_1274917-4950.jpg?semt=ais_hybrid&w=740&q=80"
                  alt="Web Defend IT"
                  className="h-10 w-10 rounded-full object-cover"
                />
                <span className="hidden sm:block font-semibold tracking-tight">
                  Shoukhinshop
                </span>
              </Link>
            </div>
          </div>

          {/* Greeting chip */}
          <span className="items-center justify-center gap-2 px-3 py-1 rounded-md border bg-white text-center mx-auto hidden lg:block">
            {!isHydrated ? (
              <span className="inline-block h-3 w-28 bg-slate-200 rounded animate-pulse" />
            ) : displayName ? (
              <span className="font-lato">
                {getGreeting()}, {displayName}
              </span>
            ) : null}
          </span>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              title="Toggle fullscreen"
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg border hover:bg-slate-50"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                className="text-slate-600"
              >
                <path
                  fill="currentColor"
                  d="M7 3H3v4h2V5h2V3zm12 0h-4v2h2v2h2V3zM5 17H3v4h4v-2H5v-2zm16 0h-2v2h-2v2h4v-4z"
                />
              </svg>
            </button>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg border bg-white min-w-[120px]">
              {!isHydrated ? (
                <>
                  <span className="h-7 w-7 rounded-full bg-slate-200 animate-pulse" />
                  <span className="inline-block h-3 w-16 bg-slate-200 rounded animate-pulse" />
                </>
              ) : (
                <>
                  <img
                    src={avatarSrc}
                    alt="avatar"
                    className="h-7 w-7 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = defaultAvatar;
                    }}
                  />

                  <span className="text-sm">{displayName}</span>
                </>
              )}
            </div>
            <button
              onClick={handleLogout}
              aria-label="Logout"
              // Cleaned up styling for a more standard look
              className="inline-flex text-[13px] items-center rounded-md px-3 py-[7px]
             bg-transparent text-gray-600 border border-gray-300
             hover:bg-red-50 hover:text-red-700 hover:border-red-300
             focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 transition duration-200"
            >
              <FiLogOut className="h-5 w-5" />
              <span className="hidden sm:inline font-medium">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Shell */}
      <div className="md:mx-4 mx-0 max-w-full px-2 md:px-3 lg:px-0 flex">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:flex w-[240px] shrink-0 pt-6 pb-10 mr-6">
          <div
            className="
              sticky top-16 w-full rounded-md border border-gray-200 bg-white/80 p-3 shadow-sm backdrop-blur
              h-[calc(100vh-4rem)] overflow-hidden flex flex-col
            "
          >
            <div className="flex-1 overflow-y-auto pr-1 nice-scrollbar scroll-fade-mask">
              <nav className="space-y-5">
                {/* ✅ role ready হলে তবেই গ্রুপ রেন্ডার */}
                {resolvedDesktopGroups.length === 0 ? (
                  <div className="px-2 text-xs text-slate-400">
                    Loading menu…
                  </div>
                ) : (
                  resolvedDesktopGroups.map((group) => (
                    <div key={group.title}>
                      <h6 className="px-2 mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                        {group.title}
                      </h6>

                      {group.items?.length > 0 && (
                        <ul className="flex flex-col gap-1">
                          {group.items.map(({ to, icon, label, end }) => (
                            <li key={to}>
                              <NavLink
                                to={to}
                                end={end}
                                className={({ isActive }) =>
                                  `${navBase} ${isActive ? navActive : navIdle}`
                                }
                              >
                                <span className="text-base">{icon}</span>
                                <span className="truncate">{label}</span>
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      )}

                      {group.extras && (
                        <div className="mt-1">
                          {group.extras({ navBase, navIdle })}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </nav>
            </div>

            {/* pinned bottom */}
            <div className="mt-3 border-t pt-3 shrink-0">
              <h6 className="px-2 mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                Account
              </h6>
              <Link to="/dashboard/profile" className={`${navBase} ${navIdle}`}>
                <FiUser className="text-base" />
                <span>My Profile</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Drawer (mobile) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-50 md:hidden"
            role="dialog"
            aria-modal="true"
          >
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl p-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* <img
                    src="https://i.ibb.co.com/s1Lw5vj/mobile.png"
                    alt="Web Defend IT"
                    className="h-8 w-8 rounded-full object-cover"
                  /> */}
                </div>
                <button
                  className="h-9 w-9 rounded-lg border"
                  onClick={() => setSidebarOpen(false)}
                >
                  ✕
                </button>
              </div>

              <div className="mb-3">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    placeholder="Search…"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <nav className="space-y-3">
                <div>
                  <h6 className="px-1 mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    Navigation
                  </h6>
                  <div className="flex flex-col gap-1">
                    {/* ✅ role resolve হলে তবেই লিংক দেখাই */}
                    {resolvedMobileLinks.length === 0 ? (
                      <span className="px-2 text-xs text-slate-400">
                        Loading menu…
                      </span>
                    ) : (
                      resolvedMobileLinks.map(({ to, icon, label, end }) => (
                        <NavLink
                          key={to}
                          to={to}
                          end={end}
                          onClick={() => setSidebarOpen(false)}
                          className={({ isActive }) =>
                            `${navBase} ${isActive ? navActive : navIdle}`
                          }
                        >
                          <span className="text-base">{icon}</span>
                          <span>{label}</span>
                        </NavLink>
                      ))
                    )}
                  </div>
                </div>

                {isAdmin && (
                  <div>
                    <h6 className="px-1 mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      Management
                    </h6>
                    <div className="flex flex-col gap-1"></div>
                  </div>
                )}

                <div className="pt-2 border-t">
                  <button
                    onClick={() => {
                      setSidebarOpen(false);
                      handleLogout();
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    <FiLogOut />
                    Logout
                  </button>
                </div>
              </nav>
            </div>
          </div>
        )}

        {/* Main */}
        <main className="flex-1 pb-10">
          <div>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
