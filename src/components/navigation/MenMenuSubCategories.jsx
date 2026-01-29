// Navbar.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const MenMenuSubCategories= () => {
  const [subByParent, setSubByParent] = useState({});
  const [subsLoading, setSubsLoading] = useState(true);

  useEffect(() => {
    const fetchSubs = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_APP_SERVER_URL}api/subcategories`
        );
        const data = await res.json();

        // parent অনুযায়ী group করা
        const grouped = (Array.isArray(data) ? data : []).reduce(
          (acc, sub) => {
            const parentName = sub.parentCategory?.name;
            if (!parentName) return acc;
            if (!acc[parentName]) acc[parentName] = [];
            acc[parentName].push(sub);
            return acc;
          },
          {}
        );

        setSubByParent(grouped);
      } catch (err) {
        console.error("Error loading subcategories:", err);
        setSubByParent({});
      } finally {
        setSubsLoading(false);
      }
    };

    fetchSubs();
  }, []);

  const menSubs = subByParent["Men"] || []; // শুধু MEN এর subcategory

  // 4-টা করে ভাগ করার জন্য ছোট helper
  const getColumns = (items, chunkSize = 4, maxCols = 3) => {
    const cols = [];
    for (let i = 0; i < items.length && cols.length < maxCols; i += chunkSize) {
      cols.push(items.slice(i, i + chunkSize));
    }
    return cols;
  };

  const menCols = getColumns(menSubs); // 3 কলাম, প্রতি কলামে 4টা করে

  return (
    <nav className="...">
      <ul className="flex gap-6">
        {/* অন্য menu গুলো */}

        {/* MENS menu */}
        <li className="relative group">
          <Link
            to="/mensub"
            className="inline-block py-4 text-sm font-semibold"
          >
            MENS
          </Link>

          {/* mega menu – তোমার দেওয়া design same রাখা হয়েছে */}
          {!subsLoading && menSubs.length > 0 && (
            <div
              className="absolute left-1/2 -translate-x-1/2 w-[72vw] z-30 hidden opacity-0 pointer-events-none
                    group-hover:block group-hover:opacity-100 group-hover:pointer-events-auto
                    top-[115%] transition-opacity duration-150"
            >
              <div className="bg-white border border-neutral-200 shadow-[0_20px_40px_rgba(0,0,0,0.08)] rounded-md grid grid-cols-4 gap-6 p-6">
                {menCols.map((col, colIndex) => (
                  <div key={colIndex} className="flex flex-col">
                    {col.map((subcategory) => (
                      <div key={subcategory._id} className="mb-3">
                        {/* এখানে চাইলে main category লিঙ্ক না রেখে শুধু subcategory-ই দেখাতে পারো */}
                        <Link
                          to={`/subcategory/${subcategory.slug || subcategory.name}`}
                          className="block text-[13px] font-semibold text-black hover:text-black"
                        >
                          {subcategory.name}
                        </Link>
                      </div>
                    ))}
                  </div>
                ))}

                {/* ডান দিকে banner image */}
                <div className="col-span-1 flex items-center justify-center">
                  <img
                    src="https://i.ibb.co.com/hdRsdwQ/Grey-Brown-Minimalist-Summer-season-collections-Banner-Landscape-508-x-322-px.png"
                    alt="Category Banner"
                    className="w-full h-auto rounded"
                  />
                </div>
              </div>
            </div>
          )}
        </li>

   
      </ul>
    </nav>
  );
};

export default MenMenuSubCategories;
