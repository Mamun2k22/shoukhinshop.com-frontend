// DashboardExtras.jsx
import React, { useMemo, useState } from "react";
import { FiTrendingUp, FiTruck, FiDownload, FiExternalLink, FiPackage, FiUsers, FiCreditCard, FiAlertTriangle } from "react-icons/fi";

/* ---------- demo data (API দিয়ে রিপ্লেস করো) ---------- */
const demoRevenue = {
  today:   { revenue: 4280, orders: 62, aov: 69, profit: 980, spark: [8,12,10,14,9,16,18] },
  week:    { revenue: 30120, orders: 410, aov: 73, profit: 6650, spark: [10,14,12,30,22,26,28] },
  month:   { revenue: 128400, orders: 1712, aov: 75, profit: 27400, spark: [12,20,18,22,26,30,28,32,31,27,35,38] },
};

// const demoFunnel = { visitors: 12000, cart: 2400, checkout: 1300, purchase: 920 };

const recentOrders = [
  { id:"#A1021", customer:"Arman Hossain", total: 128.50, method:"COD", status:"Pending" },
  { id:"#A1020", customer:"Nadia Islam",   total: 86.00,  method:"Card", status:"Shipped" },
  { id:"#A1019", customer:"Rezaul Karim",  total: 266.90, method:"Card", status:"Processing" },
  { id:"#A1018", customer:"Sumaiya Akter", total: 59.00,  method:"COD", status:"Completed" },
];

const topProducts = [
  { name:"Smart Watch X2", sku:"SWX-002", sold: 157, revenue: 9420 },
  { name:"AirPods Max",   sku:"APM-014", sold: 89,  revenue: 17800 },
  { name:"Pixel 8 Pro",   sku:"P8P-221", sold: 42,  revenue: 24990 },
];

const lowStock = [
  { name:"USB-C Cable", sku:"USBC-11", stock: 7 },
  { name:"Power Bank 10k", sku:"PB-10", stock: 4 },
  { name:"Keyboard TKL", sku:"KB-T1", stock: 2 },
];

const payments = [
  { label: "COD", value: 45, color: "#10b981" },
  { label: "Card", value: 38, color: "#6366f1" },
  { label: "bKash/Nagad", value: 17, color: "#f59e0b" },
];

const customersSnapshot = { new: 62, returning: 38 };

/* ---------- tiny sparkline (SVG) ---------- */
function Sparkline({ values=[], stroke="#6366f1" }) {
  if (!values.length) return null;
  const w = 140, h = 40;
  const max = Math.max(...values);
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * (w - 4) + 2;
    const y = h - (v / max) * (h - 6) - 3;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="opacity-90">
      <polyline fill="none" stroke={stroke} strokeWidth="2" points={points} />
    </svg>
  );
}

/* ---------- tiny donut (SVG) ---------- */
function MiniDonut({ parts }) {
  const total = parts.reduce((a,c)=>a+c.value,0);
  let acc = 0;
  return (
    <svg width="70" height="70" viewBox="0 0 36 36">
      {parts.map((p,i)=>{
        const start = acc/total*100; acc += p.value;
        const dash = (p.value/total)*100;
        return (
          <circle key={i}
            cx="18" cy="18" r="15.915"
            fill="transparent"
            stroke={p.color}
            strokeWidth="4"
            strokeDasharray={`${dash} ${100-dash}`}
            strokeDashoffset={100 - start}
          />
        );
      })}
      <circle cx="18" cy="18" r="11" fill="white" />
    </svg>
  );
}

/* ---------- main extras ---------- */
export default function DashboardExtras() {
  const [range, setRange] = useState("today");
  const R = demoRevenue[range];

//   const funnelPct = useMemo(()=>({
//     cart: (demoFunnel.cart/demoFunnel.visitors)*100,
//     checkout: (demoFunnel.checkout/demoFunnel.visitors)*100,
//     purchase: (demoFunnel.purchase/demoFunnel.visitors)*100,
//   }),[]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mt-6">
      {/* Left column */}
      <div className="space-y-5">
        {/* Revenue overview */}
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Revenue overview</h3>
            <div className="inline-flex gap-1 bg-slate-100 rounded-lg p-1">
              {["today","week","month"].map(k=>(
                <button key={k}
                  onClick={()=>setRange(k)}
                  className={`px-3 py-1.5 rounded-md text-sm capitalize ${range===k ? "bg-white shadow font-semibold" : "text-slate-600"}`}>
                  {k}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4">
            <Stat label="Revenue"  value={`৳${R.revenue.toLocaleString()}`} icon={<FiTrendingUp />} />
            <Stat label="Orders"   value={R.orders} icon={<FiDownload />} />
            <Stat label="AOV"      value={`৳${R.aov}`} icon={<FiPackage />} />
          </div>

          <div className="mt-4">
            <Sparkline values={R.spark} stroke="#f59e0b" />
          </div>

          <div className="mt-3 text-sm text-slate-600">
            Est. Net Profit: <span className="font-semibold text-emerald-600">৳{R.profit.toLocaleString()}</span>
          </div>
        </div>

        {/* Conversion funnel */}
        {/* <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <h3 className="font-semibold text-slate-800">Conversion funnel</h3>
          <div className="mt-4 space-y-3">
            <FunnelRow label="Visitors" value={demoFunnel.visitors} pct={100} color="bg-slate-300" />
            <FunnelRow label="Add to Cart" value={demoFunnel.cart} pct={funnelPct.cart} color="bg-indigo-400" />
            <FunnelRow label="Checkout" value={demoFunnel.checkout} pct={funnelPct.checkout} color="bg-amber-400" />
            <FunnelRow label="Purchase" value={demoFunnel.purchase} pct={funnelPct.purchase} color="bg-emerald-500" />
          </div>
        </div> */}
      </div>

      {/* Middle column */}
      <div className="space-y-5">
        {/* Recent orders */}
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Recent orders</h3>
            <button className="text-sm text-indigo-600 hover:underline">View all</button>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="py-2 text-left">Order</th>
                  <th className="py-2 text-left">Customer</th>
                  <th className="py-2 text-left">Total</th>
                  <th className="py-2 text-left">Method</th>
                  <th className="py-2 text-left">Status</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentOrders.map(o=>(
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="py-2 font-medium">{o.id}</td>
                    <td className="py-2">{o.customer}</td>
                    <td className="py-2">৳{o.total.toFixed(2)}</td>
                    <td className="py-2">{o.method}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs
                        ${o.status==="Completed"  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" :
                          o.status==="Shipped"     ? "bg-indigo-50  text-indigo-700  ring-1 ring-indigo-200"  :
                          o.status==="Processing"  ? "bg-amber-50   text-amber-700   ring-1 ring-amber-200"   :
                                                     "bg-rose-50    text-rose-700    ring-1 ring-rose-200"}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-2">
                      <button className="inline-flex items-center gap-1 text-indigo-600 hover:underline">
                        <FiExternalLink /> Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top products */}
        {/* <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <h3 className="font-semibold text-slate-800">Top products (by revenue)</h3>
          <div className="mt-3 space-y-3">
            {topProducts.map((p,i)=>(
              <div key={i} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-800">{p.name}</div>
                  <div className="text-xs text-slate-500">{p.sku} • {p.sold} sold</div>
                </div>
                <div className="font-semibold">৳{p.revenue.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div> */}
      </div>

      {/* Right column */}
      <div className="space-y-5">
        {/* Customers snapshot */}
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <h3 className="font-semibold text-slate-800">Customers</h3>
          <div className="mt-3 flex items-center gap-4">
            <MiniDonut parts={[
              { label:"New", value: customersSnapshot.new, color:"#6366f1" },
              { label:"Returning", value: customersSnapshot.returning, color:"#10b981" },
            ]}/>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-indigo-500" /> New customers: <b>{customersSnapshot.new}%</b>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> Returning: <b>{customersSnapshot.returning}%</b>
              </div>
            </div>
          </div>
        </div>

        {/* Payments breakdown */}
        {/* <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <h3 className="font-semibold text-slate-800">Payments</h3>
          <div className="mt-3 space-y-2">
            {payments.map((p,i)=>(
              <div key={i} className="flex items-center gap-3">
                <div className="w-20 text-sm text-slate-600">{p.label}</div>
                <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full" style={{width:`${p.value}%`, background:p.color}} />
                </div>
                <div className="w-10 text-right text-sm">{p.value}%</div>
              </div>
            ))}
          </div>
        </div> */}

        {/* Low stock alerts */}
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <FiAlertTriangle className="text-amber-500" /> Low stock
            </h3>
            <button className="text-sm text-indigo-600 hover:underline">Manage</button>
          </div>
          <div className="mt-3 space-y-2">
            {lowStock.map((it,i)=>(
              <div key={i} className="flex items-center justify-between">
                <div className="text-sm">{it.name} <span className="text-xs text-slate-500">({it.sku})</span></div>
                <span className={`px-2 py-0.5 rounded-full text-xs ${it.stock<=3 ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200" : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"}`}>
                  {it.stock} pcs
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- small sub components ---------- */
function Stat({ label, value, icon }) {
  return (
    <div className="rounded-lg border bg-white p-3 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-slate-400">{icon}</div>
      </div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}

// function FunnelRow({ label, value, pct, color }) {
//   return (
//     <div>
//       <div className="flex items-center justify-between text-sm">
//         <span className="text-slate-600">{label}</span>
//         <span className="font-medium">{value.toLocaleString()}</span>
//       </div>
//       <div className="mt-1 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
//         <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
//       </div>
//     </div>
//   );
// }
