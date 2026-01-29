import React from "react";

/** Polished, responsive benefits strip */
export default function FeaturesBar() {
  const items = [
    {
      id: "ship",
      title: "Nationwide Delivery",
      desc: "ISD 100৳ • OSD 150৳",
      icon: TruckIcon,
      from: "from-sky-100", to: "to-sky-50", ring: "ring-sky-200", ink: "text-sky-700",
      chipFrom: "from-sky-500", chipTo: "to-sky-600",
    },
    {
      id: "refund",
      title: "Money Back",
      desc: "Refund in 30 days",
      icon: RefundIcon,
      from: "from-emerald-100", to: "to-emerald-50", ring: "ring-emerald-200", ink: "text-emerald-700",
      chipFrom: "from-emerald-500", chipTo: "to-emerald-600",
    },
    {
      id: "secure",
      title: "Secure Payment",
      desc: "Zero transaction fee",
      icon: ShieldIcon,
      from: "from-indigo-100", to: "to-indigo-50", ring: "ring-indigo-200", ink: "text-indigo-700",
      chipFrom: "from-indigo-500", chipTo: "to-indigo-600",
    },
    {
      id: "discount",
      title: "Website Purchase",
      desc: "Min 10% off on all",
      icon: PercentIcon,
      from: "from-rose-100", to: "to-rose-50", ring: "ring-rose-200", ink: "text-rose-700",
      chipFrom: "from-rose-500", chipTo: "to-rose-600",
    },
  ];

  return (
    <section className="bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-poppins">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {items.map(({ id, title, desc, icon: Icon, from, to, ring, ink, chipFrom, chipTo }) => (
            <article
              key={id}
              className="group relative rounded-xl border border-white/40 bg-white/70 backdrop-blur
                         shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)]
                         transition-all duration-300 hover:-translate-y-[2px]"
            >
              <div className="flex items-start gap-3 p-4 lg:p-5">
                {/* Icon chip */}
                <div className={`shrink-0 h-11 w-11 rounded-xl ring-1 ${ring}
                                 bg-gradient-to-b ${from} ${to}
                                 flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${ink}`} />
                </div>

                {/* Text */}
                <div className="leading-tight">
                  <h3 className="text-[14px] lg:text-[15px] font-semibold text-neutral-900">
                    {title}
                  </h3>
                  <p className="mt-1 text-[12px] lg:text-[13px] text-neutral-600">{desc}</p>

                  {/* tiny accent underline on hover */}
                  <span
                    className={`mt-2 block h-[3px] w-0 rounded-full bg-gradient-to-r ${chipFrom} ${chipTo}
                                transition-all duration-300 group-hover:w-16`}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ====== Nicer inline icons (no extra deps) ====== */
function TruckIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor">
      <path d="M3 7h11v8H3z" strokeWidth="1.6" />
      <path d="M14 9h4l3 3v3h-7z" strokeWidth="1.6" />
      <circle cx="7" cy="17" r="1.7" fill="currentColor" />
      <circle cx="17" cy="17" r="1.7" fill="currentColor" />
    </svg>
  );
}
function RefundIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor">
      <path d="M7 10H5a4 4 0 0 1 4-4h6" strokeWidth="1.6" />
      <path d="M17 14h2a4 4 0 0 1-4 4H9" strokeWidth="1.6" />
      <path d="M7 10l-2 2 2 2" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="8" strokeWidth="1.6" />
    </svg>
  );
}
function ShieldIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor">
      <path d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6l7-3z" strokeWidth="1.6" />
      <path d="M9.5 12.2l1.9 1.8L15 10" strokeWidth="1.6" />
    </svg>
  );
}
function PercentIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor">
      <path d="M6 18L18 6" strokeWidth="1.8" />
      <circle cx="7.5" cy="7.5" r="2.4" strokeWidth="1.6" />
      <circle cx="16.5" cy="16.5" r="2.4" strokeWidth="1.6" />
    </svg>
  );
}
