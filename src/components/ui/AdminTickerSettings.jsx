import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const API_BASE = import.meta.env.VITE_APP_SERVER_URL;

export default function AdminTickerSettings() {
  const token = useMemo(() => localStorage.getItem("token"), []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [enabled, setEnabled] = useState(true);
  const [direction, setDirection] = useState("left");
  const [speed, setSpeed] = useState(35);
  const [pauseOnHover, setPauseOnHover] = useState(true);

  const [items, setItems] = useState([]);
  const [newText, setNewText] = useState("");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  // Load existing settings
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}api/site/ticker`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load ticker settings");
        const data = await res.json();

        setEnabled(Boolean(data?.enabled ?? true));
        setDirection(data?.direction || "left");
        setSpeed(Number(data?.speed ?? 35));
        setPauseOnHover(Boolean(data?.pauseOnHover ?? true));
        setItems(Array.isArray(data?.items) ? data.items : []);
      } catch (e) {
        console.error(e);
        toast.error("Ticker settings load failed");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const addItem = () => {
    const text = newText.trim();
    if (!text) return toast.info("Type a text first");
    const item = { id: crypto.randomUUID(), text, active: true };
    setItems((p) => [item, ...p]);
    setNewText("");
  };

  const updateItemText = (id, text) => {
    setItems((p) => p.map((x) => (x.id === id ? { ...x, text } : x)));
  };

  const toggleItem = (id) => {
    setItems((p) => p.map((x) => (x.id === id ? { ...x, active: !x.active } : x)));
  };

  const removeItem = (id) => {
    setItems((p) => p.filter((x) => x.id !== id));
  };

  const onDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems((prev) => {
      const oldIndex = prev.findIndex((i) => i.id === active.id);
      const newIndex = prev.findIndex((i) => i.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const onSave = async () => {
    try {
      setSaving(true);
      const payload = {
        enabled,
        direction,
        speed,
        pauseOnHover,
        items,
      };

      const res = await fetch(`${API_BASE}api/site/ticker`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success("Ticker settings saved");
    } catch (e) {
      console.error(e);
      toast.error("Could not save ticker settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 bg-white rounded-2xl border shadow-sm">Loading…</div>;
  }

  const activeItems = items.filter((x) => x.active && x.text?.trim());

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6 mt-6 relative overflow-hidden w-full">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Top Bar Marquee (Badges)</h2>
          <p className="text-sm text-slate-500">
            Control the scrolling texts shown under the banner.
          </p>
        </div>

        <button
          onClick={onSave}
          disabled={saving}
          className="px-4 py-2 rounded text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {/* Settings */}
      <div className="grid md:grid-cols-4 gap-4 mt-6">
        <ToggleCard
          title="Enabled"
          desc="Show/Hide the marquee"
          checked={enabled}
          onChange={() => setEnabled((p) => !p)}
        />

        <div className="rounded-2xl border p-4">
          <div className="text-sm font-medium">Direction</div>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </div>

        <div className="rounded-2xl border p-4">
          <div className="text-sm font-medium">Speed</div>
          <div className="text-xs text-slate-500 mt-1">Higher = faster</div>
          <input
            type="range"
            min="10"
            max="80"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="mt-3 w-full"
          />
          <div className="text-sm mt-2">{speed}</div>
        </div>

        <ToggleCard
          title="Pause on hover"
          desc="Stop moving when user hovers"
          checked={pauseOnHover}
          onChange={() => setPauseOnHover((p) => !p)}
        />
      </div>

      {/* Add item */}
      <div className="mt-6 rounded-2xl border p-4">
        <div className="text-sm font-medium mb-2">Add new text</div>
        <div className="flex gap-2">
          <input
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="e.g. FREE DELIVERY"
            className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={addItem}
            className="px-4 py-2 rounded-xl border text-sm font-medium hover:bg-slate-50"
          >
            Add
          </button>
        </div>
      </div>

      {/* List + reorder */}
      <div className="mt-6">
        <div className="text-sm font-semibold mb-2">Items (drag to reorder)</div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((it) => (
                <SortableRow
                  key={it.id}
                  item={it}
                  onToggle={() => toggleItem(it.id)}
                  onRemove={() => removeItem(it.id)}
                  onChangeText={(t) => updateItemText(it.id, t)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {!items.length && (
          <div className="text-sm text-slate-500 mt-3">No items added yet.</div>
        )}
      </div>

      {/* Live Preview */}
      <div className="mt-8">
        <div className="text-sm font-semibold mb-2">Live Preview</div>
        <div className="rounded-lg border bg-slate-50 p-3 overflow-hidden">
          <TickerPreview
            enabled={enabled}
            direction={direction}
            speed={speed}
            pauseOnHover={pauseOnHover}
            items={activeItems}
          />
        </div>
      </div>
    </div>
  );
}

function ToggleCard({ title, desc, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="text-left rounded-2xl border p-4 hover:bg-slate-50"
    >
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">{title}</div>
        <span
          className={`h-6 w-11 rounded-full relative transition ${
            checked ? "bg-indigo-600" : "bg-slate-300"
          }`}
        >
          <span
            className={`h-5 w-5 bg-white rounded-full absolute top-1/2 -translate-y-1/2 transition ${
              checked ? "left-5" : "left-1"
            }`}
          />
        </span>
      </div>
      <div className="text-xs text-slate-500 mt-2">{desc}</div>
    </button>
  );
}

function SortableRow({ item, onToggle, onRemove, onChangeText }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-md border bg-white p-3"
    >
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing px-2 py-2 rounded-xl hover:bg-slate-50"
        {...attributes}
        {...listeners}
        title="Drag"
      >
        <span className="text-slate-500">⋮⋮</span>
      </button>

      <input
        value={item.text}
        onChange={(e) => onChangeText(e.target.value)}
        className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      <button
        type="button"
        onClick={onToggle}
        className={`px-3 py-2 rounded-md text-sm border hover:bg-slate-50 ${
          item.active ? "text-emerald-700 border-emerald-200 bg-emerald-50" : "text-slate-600"
        }`}
      >
        {item.active ? "Active" : "Hidden"}
      </button>

      <button
        type="button"
        onClick={onRemove}
        className="px-3 py-2 rounded-md text-sm border text-rose-700 border-rose-200 bg-rose-50 hover:bg-rose-100"
      >
        Delete
      </button>
    </div>
  );
}

/** simple preview marquee (no extra libs) */
function TickerPreview({ enabled, direction, speed, pauseOnHover, items }) {
  if (!enabled) return <div className="text-sm text-slate-500">Disabled</div>;
  if (!items.length) return <div className="text-sm text-slate-500">No active items</div>;

  const duration = Math.max(8, 120 / (speed || 35)); // speed -> duration mapping
  const animName = direction === "right" ? "tickerRight" : "tickerLeft";

  return (
    <div className="relative overflow-hidden">
      <style>{`
        @keyframes tickerLeft { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes tickerRight { from { transform: translateX(-50%); } to { transform: translateX(0); } }
      `}</style>

      <div
        className={`flex gap-3 w-max ${pauseOnHover ? "hover:[animation-play-state:paused]" : ""}`}
        style={{
          animation: `${animName} ${duration}s linear infinite`,
        }}
      >
        {[...items, ...items].map((it, idx) => (
          <span
            key={`${it.id}-${idx}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border shadow-sm text-sm whitespace-nowrap"
          >
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            {it.text}
          </span>
        ))}
      </div>
    </div>
  );
}
