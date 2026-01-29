import React from "react";

// Professional + attractive version for a wholesale site
// - New background color combination
// - Elevated card design with smooth hover animations
// - Icon inside a subtle badge with glow
// - Responsive auto-fit grid
// - Polished typography for business look

const features = [
  {
    icon: "https://ecommerce-website-2k24.netlify.app/static/media/icon-1.7b2526cc76bf7f7e17b0749c5fdd9e9f.svg",
    title: "Best prices & offers",
    description: "Orders $50 or more",
  },
  {
    icon: "https://ecommerce-website-2k24.netlify.app/static/media/icon-3.31e495632028f0eb21c7aa07388f92a8.svg",
    title: "Great daily deal",
    description: "Orders $50 or more",
  },
  {
    icon: "https://ecommerce-website-2k24.netlify.app/static/media/icon-4.358f9215bedf81b8a11ae64168c5e1f1.svg",
    title: "Wide assortment",
    description: "Orders $50 or more",
  },
  {
    icon: "https://ecommerce-website-2k24.netlify.app/static/media/icon-5.510151d61346c48cf437f7937e635b4d.svg",
    title: "Easy returns",
    description: "Orders $50 or more",
  },
];

export default function Features() {
  return (
    <section id="about" className="relative py-14 sm:py-16 md:py-20 bg-white to-br  dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ul className="grid [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))] gap-6 sm:gap-7 md:gap-8">
          {features.map((f, i) => (
            <li key={i} className="list-none">
              <FeatureCard feature={f} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FeatureCard({ feature }) {
  const { icon, title, description } = feature || {};
  return (
    <article
      role="article"
      className="group relative overflow-hidden rounded-2xl  dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 backdrop-blur-sm shadow transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg hover:ring-2 hover:ring-emerald-200/60 dark:hover:ring-emerald-400/20 focus-within:ring-2 focus-within:ring-emerald-300/70 border border-yellow-500"
    >
      <div className="flex items-start gap-4 p-6">
        <div
          className="relative grid place-items-center h-14 w-14 rounded-xl border-6 border-slate-200/80 dark:border-slate-700 bg-gradient-to-tr from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-900 shadow-sm group-hover:shadow-md transition"
        >
          <img
            src={icon}
            alt=""
            loading="lazy"
            className="h-8 w-8 object-contain opacity-90 transition-all duration-200 grayscale group-hover:grayscale-0 group-hover:opacity-100"
          />
          <div aria-hidden className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-transparent via-transparent to-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="min-w-0">
          <h3 className="font-medium text-slate-900 dark:text-white text-md tracking-tight">
            {title}
          </h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {description}
          </p>
        </div>
      </div>

      {/* subtle bottom accent */}
      <div className="h-[3px] bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </article>
  );
}
