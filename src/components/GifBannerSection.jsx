// components/banners/GifBannerSection.jsx
import React, { memo, useState } from "react";
import { Link } from "react-router-dom";

const GifBannerSection = ({
  imageUrl,
  alt = "Promotion Banner",
  to = "/all-product",
  heightClass = "h-[90px] md:h-[120px] lg:h-[160px]",
  containerClass = "max-w-7xl",
}) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <section className="w-full">
      <div className={`mx-auto w-full ${containerClass} px- md:px-2`}>
        <Link
          to={to}
          className="block w-full overflow-hidden rounded-xl border border-black/5 bg-gray-100 shadow-sm"
          aria-label={alt}
        >
          {/* skeleton */}
          {!loaded && !failed && (
            <div className={`w-full ${heightClass} animate-pulse bg-gray-200`} />
          )}

          {/* fallback if failed */}
          {failed && (
            <div className={`w-full ${heightClass} bg-gray-200 flex items-center justify-center`}>
              <p className="text-sm text-gray-600">
                Banner unavailable (image blocked). Use your own CDN or proxy.
              </p>
            </div>
          )}

          {/* image */}
          {!failed && (
            <img
              src={imageUrl}
              alt={alt}
              loading="lazy"
              decoding="async"
              onLoad={() => setLoaded(true)}
              onError={() => setFailed(true)}
              className={`w-full object-cover ${heightClass} ${loaded ? "block" : "hidden"}`}
              referrerPolicy="no-referrer"
            />
          )}
        </Link>
      </div>
    </section>
  );
};

export default memo(GifBannerSection);
