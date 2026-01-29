import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const withBase = (p) => {
  const base = import.meta.env.VITE_APP_SERVER_URL || "";
  return `${base.replace(/\/$/,"")}/${String(p).replace(/^\//,"")}`;
};

export default function SearchBox() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const boxRef = useRef(null);
  const ctrl = useRef(null);

  // debounce
  useEffect(() => {
    if (!q) { setItems([]); return; }
    // cancel previous
    if (ctrl.current) ctrl.current.abort();
    const ac = new AbortController();
    ctrl.current = ac;

    const t = setTimeout(async () => {
      try {
        const res = await fetch(withBase(`api/products/suggest?q=${encodeURIComponent(q)}`), {
          credentials: "include",
          signal: ac.signal,
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
        setOpen(true);
      } catch { /* ignore */ }
    }, 220);

    return () => {
      clearTimeout(t);
      ac.abort();
    };
  }, [q]);

  // click outside close
  useEffect(() => {
    const onDoc = (e) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
    setOpen(false);
  };

  return (
    <div className="relative w-full max-w-md" ref={boxRef}>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products…"
          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </form>

      {/* suggestions */}
      {open && items.length > 0 && (
        <div className="absolute z-30 mt-1 w-full bg-white border rounded-md shadow-md max-h-64 overflow-y-auto">
          {items.map((s, i) => (
            <button
              key={`${s}-${i}`}
              onClick={() => {
                navigate(`/search?q=${encodeURIComponent(s)}`);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-indigo-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
