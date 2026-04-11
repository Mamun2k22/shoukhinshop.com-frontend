import React from "react";
import { Link } from "react-router-dom";

export default function SubcategoryTabs({
  parentCategory,
  activeSubSlug = "",
}) {
  if (!parentCategory) return null;

  const subcategories = parentCategory?.subcategories || [];
  const parentSlug = parentCategory?.slug || "";

  if (!subcategories.length) return null;

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2">
        <Link
          to={`/category/${parentSlug}`}
          className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
            !activeSubSlug
              ? "bg-black text-white border-black"
              : "bg-white text-gray-700 border-gray-300 hover:border-black hover:text-black"
          }`}
        >
          All
        </Link>

        {subcategories.map((sub) => (
          <Link
            key={sub._id}
            to={`/category/${parentSlug}/${sub.slug}`}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
              activeSubSlug === sub.slug
                ? "bg-black text-white border-black"
                : "bg-white text-gray-700 border-gray-300 hover:border-black hover:text-black"
            }`}
          >
            {sub.name}
          </Link>
        ))}
      </div>
    </div>
  );
}