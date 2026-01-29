import React, { useEffect, useMemo, useState } from "react";

const DEFAULT = {
  men: {
    title: "Men's Collection",
    subtitles: ["Grab these new items before they are gone!", "Fresh drops weekly!", "Best picks for you!"],
  },
  women: {
    title: "Women's Collection",
    subtitles: ["New arrivals tailored just for you!", "Trending styles inside!", "Limited stock—shop now!"],
  },
  kids: {
    title: "Kid's Collection",
    subtitles: ["Comfort meets style for the little ones!", "Play-ready favorites!", "Cute + comfy picks!"],
  },
  accessories: {
    title: "Accessories Collection",
    subtitles: ["Grab these new items before they are gone!", "Complete your look!", "Small things, big style!"],
  },
};

const SECTION_ORDER = [
  { key: "men", label: "Men" },
  { key: "women", label: "Women" },
  { key: "kids", label: "Kids" },
  { key: "accessories", label: "Accessories" },
];

function Pill({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "px-3 py-1.5 rounded-full text-sm border transition",
        active
          ? "bg-slate-900 text-white border-slate-900"
          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function StatusDot({ ok }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-slate-600">
      <span className={["h-2.5 w-2.5 rounded-full", ok ? "bg-emerald-500" : "bg-amber-500"].join(" ")} />
      {ok ? "Ready" : "Needs 3 subtitles"}
    </span>
  );
}

function arrayMoveIndex(arr, from, to) {
  const next = [...arr];
  const item = next.splice(from, 1)[0];
  next.splice(to, 0, item);
  return next;
}

export default function SettingHomeSection() {
  const baseURL = import.meta.env.VITE_APP_SERVER_URL; // e.g. http://localhost:5000/

  const [activeKey, setActiveKey] = useState("men");
  const [form, setForm] = useState(DEFAULT);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [savedToast, setSavedToast] = useState(false);

  const active = form[activeKey];

  // ===== Load from DB (GET all) =====
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        const res = await fetch(`${baseURL}api/home-section-settings`);
        const json = await res.json();

        if (!res.ok) {
          setErrorMsg(json?.message || "Failed to load home section settings");
          return;
        }

        const nextForm = { ...DEFAULT };

        for (const doc of json?.data || []) {
          const texts = Array.isArray(doc?.subtitles)
            ? doc.subtitles
                .filter((s) => s?.isActive !== false && (s?.text || "").trim())
                .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))
                .map((s) => s.text)
            : [];

          nextForm[doc.key] = {
            title: doc.sectionTitle || nextForm[doc.key]?.title || "",
            subtitles: texts.length ? texts : nextForm[doc.key]?.subtitles || [],
          };
        }

        setForm(nextForm);
      } catch (err) {
        console.error(err);
        setErrorMsg("Network error while loading settings");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [baseURL]);

  const isValid = useMemo(() => {
    const tOk = (active?.title || "").trim().length > 0;
    const sOk = (active?.subtitles || []).filter((x) => String(x).trim().length > 0).length >= 3;
    return tOk && sOk;
  }, [active?.title, active?.subtitles]);

  const filledCount = (active?.subtitles || []).filter((x) => String(x).trim()).length;
  const needs = Math.max(0, 3 - filledCount);

  const previewSubtitle = useMemo(() => {
    const subs = (active?.subtitles || []).filter((x) => String(x).trim());
    return subs.length ? subs[0] : "";
  }, [active?.subtitles]);

  const rotateLeft = () => {
    const subs = [...(active.subtitles || [])];
    if (subs.length <= 1) return;
    const next = subs.slice(1).concat(subs[0]);
    setForm((p) => ({ ...p, [activeKey]: { ...p[activeKey], subtitles: next } }));
  };

  const rotateRight = () => {
    const subs = [...(active.subtitles || [])];
    if (subs.length <= 1) return;
    const last = subs[subs.length - 1];
    const next = [last, ...subs.slice(0, -1)];
    setForm((p) => ({ ...p, [activeKey]: { ...p[activeKey], subtitles: next } }));
  };

  const setTitle = (val) => {
    setForm((p) => ({ ...p, [activeKey]: { ...p[activeKey], title: val } }));
  };

  const setSubtitleAt = (idx, val) => {
    const subs = [...active.subtitles];
    subs[idx] = val;
    setForm((p) => ({ ...p, [activeKey]: { ...p[activeKey], subtitles: subs } }));
  };

  const addSubtitle = () => {
    setForm((p) => ({
      ...p,
      [activeKey]: { ...p[activeKey], subtitles: [...p[activeKey].subtitles, ""] },
    }));
  };

  const removeSubtitle = (idx) => {
    const subs = active.subtitles.filter((_, i) => i !== idx);
    setForm((p) => ({ ...p, [activeKey]: { ...p[activeKey], subtitles: subs } }));
  };

  const moveUp = (idx) => {
    if (idx === 0) return;
    setForm((p) => ({
      ...p,
      [activeKey]: { ...p[activeKey], subtitles: arrayMoveIndex(p[activeKey].subtitles, idx, idx - 1) },
    }));
  };

  const moveDown = (idx) => {
    if (idx === active.subtitles.length - 1) return;
    setForm((p) => ({
      ...p,
      [activeKey]: { ...p[activeKey], subtitles: arrayMoveIndex(p[activeKey].subtitles, idx, idx + 1) },
    }));
  };

  const onReset = () => {
    setErrorMsg("");
    setForm((p) => ({ ...p, [activeKey]: DEFAULT[activeKey] }));
  };

  // ===== Save to DB (PUT) =====
  const onSave = async () => {
    try {
      if (!isValid) return;

      setSaving(true);
      setErrorMsg("");

      const payload = {
        sectionTitle: active.title,
        subtitles: (active.subtitles || [])
          .map((text, i) => ({
            text: String(text || "").trim(),
            order: i + 1,
            isActive: true,
          }))
          .filter((x) => x.text.length > 0),
        isEnabled: true,
      };

      const res = await fetch(`${baseURL}api/home-section-settings/${activeKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        // session/cookie based auth থাকলে এটা অন করবেন:
        // credentials: "include",
      });

      const json = await res.json();

      if (!res.ok) {
        setErrorMsg(json?.message || "Save failed");
        return;
      }

      // DB version update হলে সেটাকে state এ sync করে দেই
      const doc = json?.data;
      if (doc?.key) {
        const texts = Array.isArray(doc?.subtitles)
          ? doc.subtitles
              .filter((s) => s?.isActive !== false && (s?.text || "").trim())
              .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))
              .map((s) => s.text)
          : [];

        setForm((p) => ({
          ...p,
          [doc.key]: {
            title: doc.sectionTitle || p[doc.key].title,
            subtitles: texts.length ? texts : p[doc.key].subtitles,
          },
        }));
      }

      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 1500);
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error while saving");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading settings...</div>;
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold tracking-widest text-slate-500">ADMIN</div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Home Section</h1>
          <p className="mt-1 text-slate-600">Manage home page section titles and subtitle carousel texts (min 3 each).</p>
          {errorMsg && <div className="mt-2 text-sm text-red-600">{errorMsg}</div>}
        </div>

        <div className="flex items-center gap-3">
          <StatusDot ok={isValid} />
          <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm">
            {activeKey.toUpperCase()}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {SECTION_ORDER.map((s) => (
          <Pill key={s.key} active={activeKey === s.key} onClick={() => setActiveKey(s.key)}>
            {s.label}
          </Pill>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Editor */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">Section Settings</div>
              <div className="text-xs text-slate-500">Title + subtitles (carousel texts)</div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onSave}
                disabled={!isValid || saving}
                className={[
                  "px-4 py-2 rounded-xl text-sm font-semibold transition",
                  !isValid || saving
                    ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                    : "bg-slate-900 text-white hover:opacity-90",
                ].join(" ")}
              >
                {saving ? "Saving..." : "Save"}
              </button>

              <button
                type="button"
                onClick={onReset}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 hover:bg-slate-50"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="p-4 md:p-5 space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-slate-800">Section Title</label>
              <input
                value={active.title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Men's Collection"
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            {/* Subtitle carousel items */}
            <div>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-slate-800">Subtitle Carousel Texts</div>
                  <div className="text-xs text-slate-500">
                    Add at least 3. {needs > 0 ? `Need ${needs} more.` : "Looks good."}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addSubtitle}
                  className="px-3 py-2 rounded-xl text-sm font-semibold border border-slate-200 hover:bg-slate-50"
                >
                  + Add
                </button>
              </div>

              <div className="mt-3 space-y-2">
                {active.subtitles.map((txt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-full">
                      <input
                        value={txt}
                        onChange={(e) => setSubtitleAt(idx, e.target.value)}
                        placeholder={`Subtitle #${idx + 1}`}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-slate-900/10"
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveUp(idx)}
                        className="h-10 w-10 rounded-xl border border-slate-200 hover:bg-slate-50"
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveDown(idx)}
                        className="h-10 w-10 rounded-xl border border-slate-200 hover:bg-slate-50"
                        title="Move down"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSubtitle(idx)}
                        className="h-10 w-10 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payload preview */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <div className="text-xs font-semibold text-slate-600">Payload preview (will be saved)</div>
              <pre className="mt-2 text-xs overflow-auto">
{JSON.stringify(
  {
    key: activeKey,
    sectionTitle: active.title,
    subtitles: active.subtitles,
  },
  null,
  2
)}
              </pre>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">Live Preview</div>
              <div className="text-xs text-slate-500">How it will look on the homepage section heading</div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={rotateLeft}
                className="px-3 py-2 rounded-xl text-sm font-semibold border border-slate-200 hover:bg-slate-50"
                title="Previous subtitle"
              >
                ◀
              </button>
              <button
                type="button"
                onClick={rotateRight}
                className="px-3 py-2 rounded-xl text-sm font-semibold border border-slate-200 hover:bg-slate-50"
                title="Next subtitle"
              >
                ▶
              </button>
            </div>
          </div>

          <div className="p-6 md:p-10">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">{active.title || "—"}</h2>
              <p className="mt-2 text-slate-700">
                <span className="inline-block px-2 py-1 rounded bg-white border border-slate-200">
                  {previewSubtitle || "Subtitle will appear here..."}
                </span>
              </p>

              {/* <div className="mt-6 text-xs text-slate-500">
                Homepage এ carousel autoplay চাইলে frontend component এ timer/animation add করবেন.
              </div> */}
            </div>

            {savedToast && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                Saved to database ✅
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
