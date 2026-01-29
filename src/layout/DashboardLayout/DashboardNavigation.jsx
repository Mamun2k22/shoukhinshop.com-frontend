import { Link } from "react-router-dom";
import { FiMenu, FiLogOut } from "react-icons/fi";
import React, { useMemo } from "react";
import { useUser } from "../../hooks/userContext";
import useLogout from "../../hooks/useLogout";

function DashboardNavigation({
  onOpenSidebar,
  isHydrated: isHydratedProp,           // optional
  displayName: displayNameProp,         // optional
  getGreeting: getGreetingProp,         // optional
  toggleFullscreen: toggleFullscreenProp,// optional
  onLogout,                              // optional (fallbacks to useLogout)
  user: userProp,                        // optional (fallbacks to context)
}) {
  // ---- user from context if prop not provided
  const { user: ctxUser, loading } = useUser() || {};
  const user = userProp ?? ctxUser;

  // ---- logout fallback
  const { handleLogout } = useLogout();
  const doLogout = onLogout ?? handleLogout;

  // ---- hydration status
  const isHydrated = useMemo(() => {
    if (typeof isHydratedProp === "boolean") return isHydratedProp;
    return loading === false;
  }, [isHydratedProp, loading]);

  const displayName = useMemo(() => {
    if (displayNameProp !== undefined) return displayNameProp;
    return user?.name || user?.username || "";
  }, [displayNameProp, user]);

  const getGreeting =
    getGreetingProp ??
    (() => {
      const h = new Date().getHours();
      if (h < 12) return "Good Morning";
      if (h < 17) return "Good Afternoon";
      if (h < 21) return "Good Evening";
      return "Good Night";
    });

  const toggleFullscreen =
    toggleFullscreenProp ??
    (() => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => {});
      } else {
        document.exitFullscreen?.();
      }
    });

  const fallback = "https://preline.co/assets/img/160x160/img1.jpg";
  const avatarSrc = user?.profileImage
    ? `${user.profileImage}${user.profileImage.includes("?") ? "&" : "?"}t=${Date.now()}`
    : fallback;

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b h-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-2 h-14 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg border hover:bg-slate-50"
            onClick={onOpenSidebar}
            aria-label="Open menu"
          >
            <FiMenu />
          </button>

          <div className="hidden lg:block">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="https://img.freepik.com/premium-vector/modern-technology-logo-blue-circle-futuristic-digital-symbol_1274917-4950.jpg?semt=ais_hybrid&w=740&q=80"
                alt="Web Defend IT"
                className="h-10 w-10 rounded-full object-cover"
              />
              <span className="hidden sm:block font-semibold tracking-tight">
                Web Defend IT
              </span>
            </Link>
          </div>
        </div>

        {/* Greeting chip */}
        <span className="items-center justify-center gap-2 px-3 py-1.5 rounded-lg border bg-white text-center mx-auto hidden lg:block">
          {!isHydrated ? (
            <span className="inline-block h-4 w-28 bg-slate-200 rounded animate-pulse" />
          ) : displayName ? (
            <span className="font-medium">{getGreeting()}, {displayName}</span>
          ) : null}
        </span>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            title="Toggle fullscreen"
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border hover:bg-slate-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" className="text-slate-600">
              <path fill="currentColor" d="M7 3H3v4h2V5h2V3zm12 0h-4v2h2v2h2V3zM5 17H3v4h4v-2H5v-2zm16 0h-2v2h-2v2h4v-4z" />
            </svg>
          </button>

          {/* Profile chip */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-white min-w-[120px]">
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
                  onError={(e) => { e.currentTarget.src = fallback; }}
                />
                <span className="text-sm">{displayName}</span>
              </>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={doLogout}
            aria-label="Logout"
            className="inline-flex items-center gap-2 rounded-md px-3 py-2
                       bg-gradient-to-r from-rose-600 via-red-600 to-orange-600
                       text-white shadow-sm hover:shadow-md hover:opacity-95 active:scale-[.98]
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2
                       transition duration-200"
          >
            <FiLogOut className="h-5 w-5" />
            <span className="hidden sm:inline font-medium">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default React.memo(DashboardNavigation);
