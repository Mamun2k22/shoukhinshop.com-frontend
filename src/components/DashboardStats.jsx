import React from "react";

const stats = [
  {
    label: "Total Revenue",
    value: "3,564",
    bg: "bg-cyan-100",
    border: "border-cyan-400",
    text: "text-cyan-700",
  },
  {
    label: "Products sold",
    value: "564",
    bg: "bg-orange-100",
    border: "border-orange-400",
    text: "text-orange-700",
  },
  {
    label: "Growth",
    value: "+5.0%",
    bg: "bg-blue-100",
    border: "border-blue-400",
    text: "text-blue-700",
  },
];

const DashboardStats = () => {
  return (
    <div className="p-1">
    {/* Greeting / Hero Banner (drop-in) */}
<div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-orange-400 to-orange-500 text-white px-6 py-10 sm:px-8 sm:py-12 shadow-md flex items-center justify-between min-h-[160px]">
  {/* decorative blobs */}
  <span className="pointer-events-none absolute -left-6 -top-6 h-20 w-20 rounded-full bg-white/15" />
  <span className="pointer-events-none absolute -right-3 top-10 h-10 w-10 rounded-full bg-orange-300/70" />
  <span className="pointer-events-none absolute right-10 -bottom-6 h-16 w-28 rounded-[50%] bg-orange-600/50 blur-[2px]" />

  {/* left: text */}
  <div className="relative z-10">
    <h1 className="text-3xl sm:text-4xl font-semibold drop-shadow">
      Welcome Back{", "}
      <span className="font-bold">Mr. Dianne Russell</span>
    </h1>
    <p className="text-base mt-2 opacity-95">
      Manage users, products, and orders
    </p>
  </div>

  {/* right: pills + settings */}
  <div className="relative z-10 flex items-center gap-3">
    {/* pill group */}
    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-2 py-1.5 rounded-lg">
      <button className="px-4 py-2 rounded-md text-sm font-semibold bg-slate-900/90 text-white shadow hover:bg-slate-900 transition">
        Companies
      </button>
      <button className="px-4 py-2 rounded-md text-sm font-medium bg-white text-slate-700 hover:bg-slate-100 transition">
        All Packages
      </button>
    </div>

    {/* settings gear */}
    <button
      className="h-10 w-10 grid place-items-center rounded-full bg-white/95 text-orange-600 shadow hover:shadow-md transition"
      aria-label="Settings"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M10.325 4.317a2 2 0 0 1 3.35 0l.36.61a2 2 0 0 0 1.36.94l.69.13a2 2 0 0 1 1.57 2.45l-.17.68a2 2 0 0 0 .4 1.75l.46.53a2 2 0 0 1 0 2.62l-.46.53a2 2 0 0 0-.4 1.75l.17.68a2 2 0 0 1-1.57 2.45l-.69.13a2 2 0 0 0-1.36.94l-.36.61a2 2 0 0 1-3.35 0l-.36-.61a2 2 0 0 0-1.36-.94l-.69-.13a2 2 0 0 1-1.57-2.45l.17-.68a2 2 0 0 0-.4-1.75l-.46-.53a2 2 0 0 1 0-2.62l.46-.53a2 2 0 0 0 .4-1.75l-.17-.68a2 2 0 0 1 1.57-2.45l.69-.13a2 2 0 0 0 1.36-.94l.36-.61ZM12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      </svg>
    </button>
  </div>
</div>


      {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-lg shadow">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className={`rounded-md p-4 ${stat.bg} ${stat.text} flex flex-col items-start shadow-sm`}
          >
            <div className="flex items-center gap-2">
     
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 12L6 9L10 14L14 7L21 17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-sm font-medium">{stat.label}</span>
            </div>
            <h2 className="text-2xl font-semibold mt-2">{stat.value}</h2>
          </div>
        ))}
      </div> */}
    </div>
  );
};

export default DashboardStats;
