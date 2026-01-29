import React from "react";

const features = [
  {
    title: "Best Prices & Offers",
    text: "We prepared special discounts for you on grocery products.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M12 3C8.134 3 5 6.134 5 10c0 3.866 3.134 7 7 7 1.657 0 3-.448 4.243-1.414M10 8.5c0-.828.895-1.5 2-1.5.737 0 1.375.314 1.725.778.23.299.275.703.114 1.048-.186.403-.605.674-1.081.674H12m0 0v1.25M12 15h.01"
      />
    ),
  },
  {
    title: "100% Return Policy",
    text: "Hassle-free returns on eligible items within the period.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M4 4v5h4M20 20v-5h-4M5.5 9A7 7 0 0120 10M18.5 15A7 7 0 014 14"
      />
    ),
  },
  {
    title: "Support 24/7",
    text: "Our team is here for you anytime, day or night.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M12 6v6l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  },
  {
    title: "Great Offer Daily Deal",
    text: "Fresh hand-picked deals updated every single day.",
    icon: (
      <>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M4 7h16M5 7l1 11a1 1 0 001 .9h10a1 1 0 001-.9L19 7M9 7V5a3 3 0 016 0v2"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M10 12h.01M14 12h.01M10 16h4"
        />
      </>
    ),
  },
];

const DealsOffer = () => {
  return (
    <section className="mt-12">
      <div className="relative overflow-hidden">
        {/* Logo-tone gradient background */}
        <div className="bg-gradient-to-r from-[#0B1B63] via-[#182B88] to-[#283AAE] py-10 md:py-14">
          {/* soft light blobs */}
          <div className="pointer-events-none absolute inset-0 opacity-20">
            <div className="absolute -left-24 -top-24 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
            <div className="absolute right-0 top-1/2 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* heading */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-7">
              <div>
                <p className="text-xs tracking-[0.25em] uppercase text-white/70">
                  Why people love shoukhinshop
                </p>
                <h3 className="text-xl md:text-2xl font-semibold text-white mt-1">
                  Elegance in every deal
                </h3>
              </div>
            </div>

            {/* feature cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {features.map((item) => (
                <div
                  key={item.title}
                  className="group flex items-start gap-4 rounded-2xl bg-white/5 border border-white/10 px-4 py-4 md:px-5 md:py-5 shadow-[0_18px_45px_rgba(15,23,42,0.45)] backdrop-blur-sm hover:bg-white/10 hover:border-white/30 transition-all duration-300"
                >
                  <div className="relative shrink-0">
                    <div className="h-11 w-11 rounded-full bg-white flex items-center justify-center shadow-md group-hover:shadow-lg transition">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="h-6 w-6 text-[#0B1B63]"
                        fill="none"
                        stroke="currentColor"
                      >
                        {item.icon}
                      </svg>
                    </div>
                    <span className="absolute inset-0 rounded-full bg-[#0B1B63]/40 blur-md opacity-0 group-hover:opacity-70 transition-opacity" />
                  </div>

                  <div>
                    <h4 className="font-semibold text-white text-sm md:text-base mb-1.5">
                      {item.title}
                    </h4>
                    <p className="text-xs md:text-sm text-white/80 leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DealsOffer;
