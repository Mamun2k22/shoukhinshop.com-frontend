import React from "react";
import { Sparkles, Shield, Truck, RefreshCw, Award, Headphones } from "lucide-react";

const FEATURE_ITEMS = [
  { text: "FREE EXPRESS DELIVERY", icon: Truck, color: "text-emerald-400" },
  { text: "24/7 PREMIUM SUPPORT", icon: Headphones, color: "text-blue-400" },
  { text: "100% SATISFACTION GUARANTEE", icon: Award, color: "text-amber-400" },
  { text: "EXTENDED WARRANTY", icon: Shield, color: "text-violet-400" },
  { text: "EASY 30-DAY RETURNS", icon: RefreshCw, color: "text-rose-400" },
  { text: "PREMIUM QUALITY FABRICS", icon: Sparkles, color: "text-cyan-400" },
];

export default function PremiumMarquee() {
  return (
    <div className="relative bg-gradient-to-r from-gray-900 via-black to-gray-900 border-b border-gray-800 overflow-hidden">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-900/20 to-transparent animate-[shimmer_3s_infinite]" />
      </div>
      
      <div className="relative">
        {/* Edge fading - improved for seamless look */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-gray-900 via-gray-900/95 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-gray-900 via-gray-900/95 to-transparent z-10" />
        
        {/* Main marquee content */}
        <div className="flex h-12 md:h-10 items-center justify-center">
          <div className="relative w-full overflow-hidden">
            <div className="flex animate-marquee whitespace-nowrap">
              {[...FEATURE_ITEMS, ...FEATURE_ITEMS].map((item, idx) => (
                <div
                  key={idx}
                  className="mx-4 md:mx-6 flex items-center gap-3 group cursor-default transition-all duration-300 hover:scale-105"
                >
                  <item.icon 
                    className={`w-4 h-4 ${item.color} transition-transform duration-300 group-hover:rotate-12`} 
                  />
                  <span className="text-xs md:text-sm font-medium text-gray-200 tracking-wider whitespace-nowrap">
                    {item.text}
                  </span>
                  
                  {/* Animated separator */}
                  <div className="h-4 w-px bg-gradient-to-b from-transparent via-gray-600 to-transparent mx-1 group-last:hidden" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}















// import React from "react";

// const DEFAULT_ITEMS = [
//   "24/7 SUPPORT",
//   "HIGH QUALITY COTTON",
//   "FREE DELIVERY",
//   "MONEY BACK GUARANTEE",
// ];

// // --- MarqueeRtl Component (Updated) ---
// export default function MarqueeRtl({
//   items = DEFAULT_ITEMS,
//   speed = 30, // seconds
//   direction = "left",
//   pauseOnHover = true,
// }) {
//   const loopItems = [...items, ...items];

//   return (
//     // Background updated to a solid, deep charcoal color
//     <div className="w-full bg-[#1A1A1A] border-y border-slate-700">
//       <div className="relative mx-auto max-w-full group">
        
//         {/* Edge fading updated to match the dark background */}
//         <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#1A1A1A] to-transparent z-10" />
//         <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#1A1A1A] to-transparent z-10" />

//         <div className="relative flex h-10 md:h-12 items-center overflow-hidden">
//           <div
//             className={`marquee-track flex ${pauseOnHover ? "group-hover:[animation-play-state:paused]" : ""}`}
//             style={{
//               animationDuration: `${speed}s`,
//               animationDirection: direction === "right" ? "reverse" : "normal",
//             }}
//           >
//             <Group items={loopItems} />
//             <Group items={loopItems} ariaHidden />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // --- Group Component (Updated for Sleek Aesthetic) ---
// function Group({ items, ariaHidden }) {
//   return (
//     <ul
//       aria-hidden={ariaHidden || undefined}
//       // Text color updated to light, tracking adjusted, font weight set to medium
//       className="marquee-group flex items-center gap-3 text-[12px] md:text-[14px] tracking-wider font-medium uppercase text-slate-200"
//     >
//       {items.map((txt, i) => (
//         <li key={`${txt}-${i}`} className="flex items-center gap-0">
          
//           <div 
//             // Pill color updated to a dark gray, border subtle, padding adjusted
//             className=""
//           >
//             {/* Dot color changed to a single, vibrant amber accent */}
//             <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
//             <span className="whitespace-nowrap">{txt}</span>
//           </div>

//           {/* Separator simplified to a small, subtle dot */}
//           {i !== items.length - 1 && (
//             <span className="h-1 w-1 mx-4 rounded-full bg-slate-600/70" />
//           )}
//         </li>
//       ))}

//       {/* Simplified last separator */}
//       <span className="h-1 w-1 mx-4 rounded-full bg-slate-600/70" />
//     </ul>
//   );
// }