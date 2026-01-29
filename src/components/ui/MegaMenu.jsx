// MegaMenu.jsx
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";

const chunkArray = (items, chunkSize = 4, maxCols = 3) => {
  const cols = [];
  for (let i = 0; i < items.length && cols.length < maxCols; i += chunkSize) {
    cols.push(items.slice(i, i + chunkSize));
  }
  return cols;
};

const MegaMenu = ({ parentName, bannerSrc, bannerAlt = "Category Banner" }) => {
  const [subsByParent, setSubsByParent] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubs = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_APP_SERVER_URL}api/subcategories`
        );
        const data = await res.json();

        const grouped = (Array.isArray(data) ? data : []).reduce(
          (acc, sub) => {
            const pName = sub.parentCategory?.name;
            if (!pName) return acc;
            if (!acc[pName]) acc[pName] = [];
            acc[pName].push(sub);
            return acc;
          },
          {}
        );

        setSubsByParent(grouped);
      } catch (err) {
        console.error("Error loading subcategories:", err);
        setSubsByParent({});
      } finally {
        setLoading(false);
      }
    };

    fetchSubs();
  }, []);

  const subs = subsByParent[parentName] || [];

  const cols = useMemo(() => chunkArray(subs, 4, 3), [subs]);

  if (loading || subs.length === 0) return null; // data আসার আগে কিছু না দেখালেও হবে

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 top-[115%] z-30 hidden opacity-0 pointer-events-none
               group-hover:block group-hover:opacity-100 group-hover:pointer-events-auto
               transition-opacity duration-150"
    >
      {/* width responsive + max-w logic */}
      <div className="
          w-[90vw] md:w-[80vw] xl:w-[72vw]
        max-w-7xl 2xl:max-w-full
          bg-white border border-neutral-200
          shadow-[0_20px_40px_rgba(0,0,0,0.08)]
          rounded-sm grid grid-cols-4 gap-6 p-6
        "
      >
        {/* left side: subcategories */}
        <div className="col-span-3 grid grid-cols-3 gap-6">
          {cols.map((col, colIndex) => (
            <div key={colIndex} className="flex flex-col">
              {col.map((subcategory) => (
                <div key={subcategory._id} className="mb-3">
                  <Link
                    to={`/subcategory/${subcategory.slug || subcategory.name}`}
                    className="block text-[11px] font-medium text-black hover:text-black"
                  >
                    {subcategory.name}
                  </Link>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* right side: banner image (optional) */}
        <div className="col-span-1 flex items-center justify-center">
          {bannerSrc && (
            <img
              src={bannerSrc}
              alt={bannerAlt}
              className="w-full h-auto rounded"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MegaMenu;
