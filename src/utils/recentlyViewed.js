const KEY = "shoukhinshop_recently_viewed_v1";

export function getRecentlyViewed() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function addRecentlyViewed(product, limit = 12) {
  if (!product?._id) return;

  const item = {
    _id: product._id,
    productName: product.productName || "",
    price: product.price ?? 0,
    productImage:
      Array.isArray(product.productImage) ? product.productImage[0] : product.productImage,
    slug: product.slug,
    category: product.category,
    createdAt: new Date().toISOString(),
  };

  const list = getRecentlyViewed();

  // remove duplicates
  const filtered = list.filter((p) => p?._id !== item._id);

  // newest first
  const next = [item, ...filtered].slice(0, limit);

  localStorage.setItem(KEY, JSON.stringify(next));
  // notify UI
  window.dispatchEvent(new Event("recentlyViewedUpdated"));
}

export function clearRecentlyViewed() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("recentlyViewedUpdated"));
}
