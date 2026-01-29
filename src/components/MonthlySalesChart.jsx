// src/components/MonthlySalesChart.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  Cell,
} from "recharts";

const fallbackData = [
  { name: "Jan", sales: 50 },
  { name: "Feb", sales: 120 },
  { name: "Mar", sales: 500 },
  { name: "Apr", sales: 280 },
  { name: "May", sales: 450 },
  { name: "Jun", sales: 150 },
  { name: "Jul", sales: 270 },
  { name: "Aug", sales: 230 },
  { name: "Sep", sales: 670 },
  { name: "Oct", sales: 480 },
  { name: "Nov", sales: 580 },
  { name: "Dec", sales: 1100 },
];

function compactMoney(symbol, value) {
  return `${symbol}${Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0)}`;
}

function numberFmt(symbol, value) {
  return `${symbol}${(value || 0).toLocaleString()}`;
}

function getStats(arr) {
  const values = arr.map((d) => d.sales || 0);
  const total = values.reduce((a, b) => a + b, 0);
  const avg = values.length ? total / values.length : 0;

  const max = Math.max(...values);
  const maxIndex = values.indexOf(max);

  const min = Math.min(...values);
  const minIndex = values.indexOf(min);

  const last = values[values.length - 1] ?? 0;
  const prev = values[values.length - 2] ?? 0;
  const mom = prev > 0 ? (last - prev) / prev : last > 0 ? 1 : 0;

  return { total, avg, max, maxIndex, min, minIndex, mom };
}

// ✅ Professional: slightly rounded (not too pill)
const SoftPillBar = ({ x, y, width, height, fill }) => {
  // smaller rounding for professional look
  const r = Math.max(6, Math.min(10, width * 0.35));
  return (
    <rect x={x} y={y} width={width} height={height} rx={r} ry={r} fill={fill} />
  );
};

const TooltipPill = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null;
  const v = payload[0].value ?? 0;

  return (
    <div className="rounded-md border border-gray-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur">
      <div className="text-[11px] font-medium text-gray-500">{label}</div>
      <div className="text-sm font-semibold text-gray-900">
        {numberFmt(currency, v)}
      </div>
      <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100">
        <div
          className="h-1.5 rounded-full bg-gray-900/70"
          style={{ width: "40%" }}
        />
      </div>
    </div>
  );
};

const Badge = ({ children, tone = "neutral", ...rest }) => {
  const tones = {
    neutral: "bg-gray-100 text-gray-700 ring-gray-200",
    good: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    bad: "bg-rose-50 text-rose-700 ring-rose-200",
    info: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  };
  return (
    <span
      {...rest}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${tones[tone]}`}
    >
      {children}
    </span>
  );
};

const KpiCard = ({ label, value, hint, icon, tone = "indigo" }) => {
  const toneMap = {
    indigo: {
      line: "from-indigo-500 to-indigo-300",
      glow: "bg-indigo-500/10",
      iconBg: "bg-indigo-50 text-indigo-600 ring-indigo-100",
    },
    emerald: {
      line: "from-emerald-500 to-emerald-300",
      glow: "bg-emerald-500/10",
      iconBg: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    },
    rose: {
      line: "from-rose-500 to-rose-300",
      glow: "bg-rose-500/10",
      iconBg: "bg-rose-50 text-rose-600 ring-rose-100",
    },
    slate: {
      line: "from-slate-700 to-slate-400",
      glow: "bg-slate-500/10",
      iconBg: "bg-slate-50 text-slate-700 ring-slate-200",
    },
  };

  const t = toneMap[tone] ?? toneMap.indigo;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {/* top accent line */}
      <div className={`h-1 w-full bg-gradient-to-r ${t.line}`} />

      {/* subtle glow blob */}
      <div className={`pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full ${t.glow} blur-2xl`} />

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold tracking-wide text-gray-500">
              {label}
            </div>

            <div className="mt-1 text-[22px] font-bold leading-tight tracking-tight text-gray-900">
              {value}
            </div>
          </div>

          {icon ? (
            <div
              className={`grid h-9 w-9 place-items-center rounded-xl ring-1 ${t.iconBg}`}
            >
              <span className="text-base">{icon}</span>
            </div>
          ) : null}
        </div>

        <div className="mt-2 text-xs text-gray-500">
          {hint ? hint : <span className="text-gray-400">—</span>}
        </div>
      </div>
    </div>
  );
};


/**
 * Props:
 * - title: string
 * - currency: fallback currency symbol
 * - height: number
 * - year: number
 * - useApi: boolean
 * - data: manual override [{name:'Jan', sales:123}, ...]
 */
export default function MonthlySalesChart({
  title = "Monthly Sales",
  currency: fallbackCurrency = "৳",
  height = 320,
  year: initialYear = new Date().getFullYear(),
  useApi = true,
  data: manualData,
}) {
  const [apiData, setApiData] = useState(null);
  const [apiCurrency, setApiCurrency] = useState(fallbackCurrency);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // dashboard controls
  const [year, setYear] = useState(initialYear);
  const [view, setView] = useState("revenue"); // future-proof toggle

  useEffect(() => {
    if (!useApi) return;
    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setErr("");

        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        const res = await fetch(
          `${import.meta.env.VITE_APP_SERVER_URL}api/admin/analytics/monthly-sales?year=${year}`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            signal: ac.signal,
          }
        );

        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.message || "Failed to load sales data");
        }

        const j = await res.json();
        setApiData(j?.series || null);
        setApiCurrency(j?.currency || fallbackCurrency);
      } catch (e) {
        setErr(e.message || "Network error");
        setApiData(null);
        setApiCurrency(fallbackCurrency);
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, useApi]);

  const data = useMemo(() => manualData || apiData || fallbackData, [
    manualData,
    apiData,
  ]);

  const currency = apiCurrency || fallbackCurrency;

  const { total, avg, max, maxIndex, min, minIndex, mom } = getStats(data);

  const bestMonth = data[maxIndex]?.name ?? "—";
  const worstMonth = data[minIndex]?.name ?? "—";

  const momTone = mom >= 0 ? "good" : "bad";
  const momLabel =
    mom === 0 ? "0.0%" : `${mom > 0 ? "+" : ""}${(mom * 100).toFixed(1)}%`;

  return (
    <div className="rounded-md border border-gray-200 bg-gradient-to-b from-white to-gray-50 p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight text-gray-900">
                {title}
              </h2>
              {loading ? (
                <Badge tone="info">Loading</Badge>
              ) : err ? (
                <Badge tone="bad" title={err}>
                  Fallback
                </Badge>
              ) : (
                <Badge tone="neutral">{year}</Badge>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Track monthly performance, identify best and slow months, and spot
              trends quickly.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View toggle (kept for future expansion) */}
          <div className="inline-flex rounded-2xl border border-gray-200 bg-white p-1 shadow-sm">
            <button
              onClick={() => setView("revenue")}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
                view === "revenue"
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              type="button"
            >
              Revenue
            </button>
            <button
              onClick={() => setView("orders")}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
                view === "orders"
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              type="button"
              title="Hook this to orders later"
            >
              Orders
            </button>
          </div>

          {/* Year picker */}
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="h-9 rounded border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-800 shadow-sm outline-none focus:ring-1 focus:ring-gray-900/10"
          >
     {Array.from({ length: 6 }).map((_, i) => {
  const startYear = 2025;          // 👈 starting year
  const y = startYear + i;         // 2025, 2024, 2023...
  return (
    <option key={y} value={y}>
      {y}
    </option>
  );
})}

          </select>
        </div>
      </div>

{/* KPI row */}
<div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
  <KpiCard
    tone="indigo"
    icon="৳"
    label="Total"
    value={compactMoney(currency, total)}
    hint="Across 12 months"
  />

  <KpiCard
    tone="slate"
    icon="∑"
    label="Average / month"
    value={compactMoney(currency, avg)}
    hint="Benchmark line shown"
  />

  <KpiCard
    tone="emerald"
    icon="★"
    label="Best month"
    value={`${bestMonth}`}
    hint={`${compactMoney(currency, max)} peak`}
  />

  <KpiCard
    tone={mom >= 0 ? "emerald" : "rose"}
    icon={mom >= 0 ? "↗" : "↘"}
    label="MoM (last vs prev)"
    value={momLabel}
    hint={
      <span className="inline-flex items-center gap-2">
        <Badge tone={momTone}>{mom >= 0 ? "Up" : "Down"}</Badge>
        <span className="text-xs text-gray-500">
          Worst: {worstMonth} ({compactMoney(currency, min)})
        </span>
      </span>
    }
  />
</div>


      {/* Chart */}
      <div className="mt-4 rounded-md border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-900">Monthly totals</div>
          <div className="text-xs text-gray-500">
            Hover bars for details • Avg {compactMoney(currency, avg)}
          </div>
        </div>

        <div className="mt-3" style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 16, right: 16, left: 8, bottom: 8 }}
              barCategoryGap={22}
              barSize={34}
            >
              <defs>
                <linearGradient id="barMain" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.18} />
                </linearGradient>

                <linearGradient id="barBest" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4338ca" stopOpacity={0.98} />
                  <stop offset="100%" stopColor="#4338ca" stopOpacity={0.25} />
                </linearGradient>

                <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="8" stdDeviation="10" floodOpacity="0.12" />
                </filter>
              </defs>

              <CartesianGrid strokeDasharray="3 6" vertical={false} stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => compactMoney(currency, v)}
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={56}
              />

              <Tooltip
                cursor={{ fill: "rgba(17,24,39,0.04)" }}
                content={<TooltipPill currency={currency} />}
              />

              {avg > 0 && (
                <ReferenceLine
                  y={avg}
                  stroke="#111827"
                  strokeOpacity={0.25}
                  strokeDasharray="6 6"
                  label={{
                    value: "Avg",
                    position: "insideTopRight",
                    fill: "#6b7280",
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                />
              )}

              {/* ✅ Professional soft-rounded bars */}
              <Bar
                dataKey="sales"
                shape={<SoftPillBar />}
                filter="url(#softShadow)"
                isAnimationActive
                animationBegin={80}
                animationDuration={700}
              >
                {data.map((_, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={idx === maxIndex ? "url(#barBest)" : "url(#barMain)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Footer notes */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-indigo-600/70" />
            Regular months
            <span className="ml-3 inline-flex h-2.5 w-2.5 rounded-full bg-indigo-900/70" />
            Best month ({bestMonth})
          </div>
          <div>
            Total:{" "}
            <span className="font-semibold text-gray-800">
              {numberFmt(currency, total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
