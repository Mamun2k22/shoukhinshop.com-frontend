// src/components/PromoBanner.jsx
import { useEffect, useRef, useState } from "react";
import {
  FiClock,
  FiHeadphones,
  FiTag,
  FiX,
  FiPackage,
  FiFileText,
  FiMessageCircle,
} from "react-icons/fi";

/**
 * Wholesale Promo Banner (mobile-first, minimize on close)
 * - X চাপলে পুরোটা hide না হয়ে "mini" বার দেখায় ↔ header shift হয় না
 */
export default function PromoBanner({
  deadline,
  moq = 50,
  supportPhone = "tel:+8801700000000",
  bulkPriceHref = "/bulk-pricing",
  enquiryHref = "/enquiry",
}) {
  const deadlineRef = useRef(
    deadline ? new Date(deadline) : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
  );

  // "full" | "mini"
  const [mode, setMode] = useState("full");

  const calc = () => {
    const now = Date.now();
    const diff = Math.max(0, +deadlineRef.current - now);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return { diff, days, hours, minutes, seconds };
  };
  const [timeLeft, setTimeLeft] = useState(calc());

  useEffect(() => {
    if (timeLeft.diff === 0) return;
    const id = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pad = (n) => String(n).padStart(2, "0");
  const minimize = () => setMode("mini");

  return (
    <div
      className="sticky top-0 z-50"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
      role="region"
      aria-label="Wholesale promotional banner"
    >
      <div className="bg-gradient-to-r from-[#EC4237] to-orange-400 text-white">
        <div className="relative mx-auto max-w-7xl px-3 sm:px-4">
    

          {mode === "full" ? (
            <>
              {/* ===== Desktop / Tablet ===== */}
              <div className="hidden md:flex items-center justify-between gap-6 py-3">
                <div className="flex items-center gap-5">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold">
                    <FiTag className="text-lg" />
                    Bulk Orders 10% Discount
                  </span>

                  <span className="inline-flex items-center gap-2 text-sm">
                    <FiClock className="text-lg" />
                    Ends in
                    <Pill value={timeLeft.days} label="Days" />
                    <Pill value={timeLeft.hours} label="Hours" />
                    <Pill value={timeLeft.minutes} label="Min" />
                    <Pill value={timeLeft.seconds} label="Sec" />
                  </span>

                  <span className="inline-flex items-center gap-2 text-sm opacity-95">
                    <FiPackage className="text-lg" />
                    MOQ: <strong className="ml-1">{moq}</strong> pcs
                  </span>

                  {/* <a href={bulkPriceHref} className="inline-flex items-center gap-2 text-sm underline decoration-white/50 hover:decoration-white">
                    <FiFileText className="text-lg" />
                    Bulk Price List
                  </a>

                  <a href={enquiryHref} className="inline-flex items-center gap-2 text-sm underline decoration-white/50 hover:decoration-white">
                    <FiMessageCircle className="text-lg" />
                    Quick Enquiry
                  </a> */}
                </div>

                <a
                  href={supportPhone}
                  className="inline-flex items-center gap-2 rounded-full bg-white text-indigo-700 px-4 py-1.5 text-sm font-semibold hover:bg-white/90"
                >
                  <FiHeadphones className="text-lg" />
                  Call Support
                </a>
              </div>

              {/* ===== Mobile (< md) ===== */}
              <div className="md:hidden py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold">
                    <FiTag className="text-[16px]" />
                    Bulk Orders 10% Off
                  </span>

                  <span
                    className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1 text-[11px]"
                    aria-label={`Ends in ${timeLeft.days} days ${timeLeft.hours} hours ${timeLeft.minutes} minutes ${timeLeft.seconds} seconds`}
                  >
                    <FiClock className="text-sm" />
                    {timeLeft.days}d {pad(timeLeft.hours)}h {pad(timeLeft.minutes)}m {pad(timeLeft.seconds)}s
                  </span>

                  <a
                    href={supportPhone}
                    className="inline-flex items-center gap-1 rounded-full bg-white text-indigo-700 px-2.5 py-1 text-[11px] font-semibold"
                  >
                    <FiHeadphones className="text-sm" />
                    Call
                  </a>
                </div>

                {/* <div className="mt-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1 text-[11px] shrink-0">
                    <FiPackage className="text-sm" />
                    MOQ: {moq} pcs
                  </span>

                  <a
                    href={bulkPriceHref}
                    className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1 text-[11px] shrink-0"
                  >
                    <FiFileText className="text-sm" />
                    Bulk Price
                  </a>

                  <a
                    href={enquiryHref}
                    className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1 text-[11px] shrink-0"
                  >
                    <FiMessageCircle className="text-sm" />
                    Enquiry
                  </a>
                </div> */}
              </div>
            </>
          ) : (
            // ===== MINI MODE (after close) — slim chip bar, both on mobile & desktop =====
            <div className="py-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold">
                  <FiTag className="text-[14px]" />
                  Wholesale Offer
                </span>

                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[11px]">
                  <FiClock className="text-[13px]" />
                  {timeLeft.days}d {pad(timeLeft.hours)}h {pad(timeLeft.minutes)}m {pad(timeLeft.seconds)}s
                </span>

                <a
                  href={supportPhone}
                  className="inline-flex items-center gap-1 rounded-full bg-white text-indigo-700 px-2 py-0.5 text-[11px] font-semibold"
                >
                  <FiHeadphones className="text-[13px]" />
                  Call
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Pill({ value, label }) {
  return (
    <span className="inline-flex items-center rounded-md bg-white/10 px-2.5 py-1">
      <span className="font-semibold">{String(value).padStart(2, "0")}</span>
      <span className="ml-1 text-[11px] opacity-90">{label}</span>
    </span>
  );
}

/* optional global css:
.no-scrollbar::-webkit-scrollbar{display:none}
.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
*/
