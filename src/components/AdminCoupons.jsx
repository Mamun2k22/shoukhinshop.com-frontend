import React, { useEffect, useState } from "react";

const token =
  localStorage.getItem("token") || sessionStorage.getItem("token");

const BASE = import.meta.env.VITE_APP_SERVER_URL;

export default function AdminCoupons() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    code: "",
    type: "percent",     // percent | fixed
    amount: 0,
    minSpend: 0,
    status: "active",
  });

  const load = async () => {
    setLoading(true);
    const res = await fetch(`${BASE}api/admin/coupons`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setItems(data.items || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${BASE}api/admin/coupons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          appliesTo: { kind: "all" }, // প্রথমে all রাখি; পরে product/category যোগ করবে
        }),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Failed");
      setForm({ code: "", type: "percent", amount: 0, minSpend: 0, status: "active" });
      await load();
      alert("Coupon created");
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const del = async (id) => {
    if (!confirm("Delete coupon?")) return;
    await fetch(`${BASE}api/admin/coupons/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    load();
  };

  const setStatus = async (id, status) => {
    await fetch(`${BASE}api/admin/coupons/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    load();
  };

  return (
    <div className="p-5 w-full ">
      <h2 className="text-xl font-semibold mb-4">Coupons</h2>

     <div className="w-full">
       <form onSubmit={create} className="flex flex-wrap  gap-3 items-end mb-6">
        <div>
          <label className="block text-sm">Code</label>
          <input className="border rounded px-3 py-2"
            value={form.code}
            onChange={e=>setForm(f=>({...f, code:e.target.value}))}
            placeholder="MM10" required />
        </div>
        <div>
          <label className="block text-sm">Type</label>
          <select className="border rounded px-3 py-2"
            value={form.type}
            onChange={e=>setForm(f=>({...f, type:e.target.value}))}>
            <option value="percent">percent %</option>
            <option value="fixed">fixed ৳</option>
          </select>
        </div>
        <div>
          <label className="block text-sm">Amount</label>
          <input type="number" className="border rounded px-3 py-2 w-28"
            value={form.amount}
            onChange={e=>setForm(f=>({...f, amount:Number(e.target.value)}))}
            min="0" required />
        </div>
        <div>
          <label className="block text-sm">Min Spend</label>
          <input type="number" className="border rounded px-3 py-2 w-28"
            value={form.minSpend}
            onChange={e=>setForm(f=>({...f, minSpend:Number(e.target.value)}))} />
        </div>
        <div>
          <label className="block text-sm">Status</label>
          <select className="border rounded px-3 py-2"
            value={form.status}
            onChange={e=>setForm(f=>({...f, status:e.target.value}))}>
            <option value="active">active</option>
            <option value="paused">paused</option>
            <option value="expired">expired</option>
          </select>
        </div>
        <button disabled={saving}
          className="px-4 py-2 rounded bg-indigo-600 text-white">
          {saving ? "Saving..." : "Create"}
        </button>
      </form>
     </div>

      {loading ? (
        <div>Loading…</div>
      ) : (
        <div className="w-full overflow-x-auto bg-white rounded shadow">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-3 text-left">Code</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Min Spend</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(c => (
                <tr key={c._id} className="border-t">
                  <td className="p-3 font-medium">{c.code}</td>
                  <td className="p-3">{c.type}</td>
                  <td className="p-3">{c.type === "percent" ? `${c.amount}%` : `৳ ${c.amount}`}</td>
                  <td className="p-3">৳ {c.minSpend || 0}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      c.status==="active" ? "bg-emerald-100 text-emerald-700"
                      : c.status==="paused" ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-slate-700"
                    }`}>{c.status}</span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    {c.status!=="active" && (
                      <button onClick={()=>setStatus(c._id,"active")}
                        className="px-2 py-1 border rounded">Activate</button>
                    )}
                    {c.status!=="paused" && (
                      <button onClick={()=>setStatus(c._id,"paused")}
                        className="px-2 py-1 border rounded">Pause</button>
                    )}
                    <button onClick={()=>del(c._id)}
                      className="px-2 py-1 border rounded text-rose-600">Delete</button>
                  </td>
                </tr>
              ))}
              {!items.length && (
                <tr><td className="p-6 text-center text-slate-500" colSpan={6}>No coupons</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
