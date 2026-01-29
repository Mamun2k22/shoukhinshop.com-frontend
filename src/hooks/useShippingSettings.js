// import { useEffect, useState } from "react";
// import settingsApi from "./settingsApi.jsx";

// export default function useShippingSettings() {
//   const [shipSettings, setShipSettings] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     let alive = true;

//     (async () => {
//       try {
//         setLoading(true);
//         setError("");

//         const res = await settingsApi.fetchPublicShippingSettings(); // {success,data}
//         if (!alive) return;

//         setShipSettings(res?.data || null);
//       } catch (e) {
//         if (!alive) return;
//         setError(e?.message || "Failed to load shipping settings");
//       } finally {
//         if (alive) setLoading(false);
//       }
//     })();

//     return () => {
//       alive = false;
//     };
//   }, []);

//   return { shipSettings, loading, error };
// }
import { useEffect, useMemo, useState } from "react";

// helper: campaign active কিনা
export const isCampaignActive = (c) => {
  if (!c?.active) return false;
  const now = Date.now();
  const start = c.startAt ? +new Date(c.startAt) : 0;
  const end = c.endAt ? +new Date(c.endAt) : 0;
  return (!start || now >= start) && (!end || now <= end);
};

const API_BASE = (import.meta.env.VITE_APP_SERVER_URL || "http://localhost:5000").replace(
  /\/$/,
  ""
);

export default function useShippingSettings() {
  const [shipSettings, setShipSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`${API_BASE}/api/shipping-settings`);
        const json = await res.json().catch(() => ({}));

        const data = json?.data; // response: { success, data }

        if (!alive) return;

        if (res.ok && data) setShipSettings(data);
        else {
          setShipSettings(null);
          setError(json?.message || `Shipping settings fetch failed (${res.status})`);
        }
      } catch (e) {
        if (!alive) return;
        setShipSettings(null);
        setError(e?.message || "Shipping settings fetch error");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // helper getters (optional, convenience)
  const insideRate = useMemo(() => Number(shipSettings?.insideDhakaRate), [shipSettings]);
  const outsideRate = useMemo(() => Number(shipSettings?.outsideDhakaRate), [shipSettings]);

  return {
    shipSettings,
    loading,
    error,
    insideRate,
    outsideRate,
  };
}
