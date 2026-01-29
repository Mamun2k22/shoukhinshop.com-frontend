import React, { useEffect, useMemo, useState } from "react";
import MarqueeRtl from "../../components/MarqueeRtl";

const DEFAULT_ITEMS = [
  "24/7 SUPPORT",
  "HIGH QUALITY COTTON",
  "FREE DELIVERY",
  "MONEY BACK GUARANTEE",
];

export default function HomeMarqueeBar() {
  const API = import.meta.env.VITE_APP_SERVER_URL; // example: http://localhost:5000/
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await fetch(`${API}api/site/ticker`);
        if (!res.ok) throw new Error("Ticker fetch failed");
        const data = await res.json();
        if (mounted) setSettings(data);
      } catch (e) {
        console.error(e);
        if (mounted) setSettings(null); // fallback
      }
    })();

    return () => {
      mounted = false;
    };
  }, [API]);

  const enabled = settings?.enabled ?? true;

  const items = useMemo(() => {
    const arr = settings?.items;
    if (!Array.isArray(arr)) return DEFAULT_ITEMS;

    const activeTexts = arr
      .filter((x) => x?.active && String(x?.text || "").trim())
      .map((x) => String(x.text).trim());

    return activeTexts.length ? activeTexts : DEFAULT_ITEMS;
  }, [settings]);

  // backend speed => seconds duration mapping
  const durationSeconds = useMemo(() => {
    const s = Number(settings?.speed);
    if (!Number.isFinite(s)) return 30;

    // speed 10..80 => duration 45..10 (higher speed = faster)
    const d = 50 - s * 0.5;
    return Math.max(10, Math.min(60, d));
  }, [settings]);

  if (!enabled) return null;

  return (
    <MarqueeRtl
      items={items}
      speed={durationSeconds}
      direction={settings?.direction || "left"}
      pauseOnHover={settings?.pauseOnHover ?? true}
    />
  );
}
