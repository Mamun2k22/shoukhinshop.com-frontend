import { useEffect, useState } from "react";
import { API_BASE } from "../../hooks/settingsApi.jsx";
import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaYoutube,
  FaTwitter,
  FaLinkedinIn,
  FaTiktok,
  FaPinterestP,
  FaTelegramPlane,
  FaSnapchatGhost,
  FaRedditAlien,
  FaGithub,
} from "react-icons/fa";
import axios from "axios";
import { FaThreads } from "react-icons/fa6";

const PLATFORMS = {
  facebook: { label: "Facebook", Icon: FaFacebookF },
  instagram: { label: "Instagram", Icon: FaInstagram },
  whatsapp: { label: "WhatsApp", Icon: FaWhatsapp },
  threads: { label: "Threads", Icon: FaThreads }, 
  youtube: { label: "YouTube", Icon: FaYoutube },
  twitter: { label: "Twitter / X", Icon: FaTwitter },
  linkedin: { label: "LinkedIn", Icon: FaLinkedinIn },
  tiktok: { label: "TikTok", Icon: FaTiktok },
  pinterest: { label: "Pinterest", Icon: FaPinterestP },
  telegram: { label: "Telegram", Icon: FaTelegramPlane },
  snapchat: { label: "Snapchat", Icon: FaSnapchatGhost },
  reddit: { label: "Reddit", Icon: FaRedditAlien },
  github: { label: "GitHub", Icon: FaGithub },
};

const defaultSocial = {
  url: "",
  isActive: false,
};

const defaultState = {
  // ✅ multi texts
  topBarTexts: [""],
  showTopBar: true,
  socialLinks: Object.keys(PLATFORMS).reduce((acc, key) => {
    acc[key] = { ...defaultSocial };
    return acc;
  }, {}),
};

const HeaderSectionSettings = () => {
  const [form, setForm] = useState(defaultState);
  const [newText, setNewText] = useState(""); // ✅ add input
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // initial load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_BASE}api/header-settings`, {
          withCredentials: true,
        });

        const data = res.data?.data || {};

        setForm((prev) => {
          // ✅ normalize texts (support old: topBarText string)
          const normalizedTexts =
            Array.isArray(data.topBarTexts) && data.topBarTexts.length
              ? data.topBarTexts
              : typeof data.topBarText === "string" && data.topBarText.trim()
              ? [data.topBarText]
              : prev.topBarTexts;

          return {
            ...prev,
            ...data,
            topBarTexts: normalizedTexts.length ? normalizedTexts : [""],
            socialLinks: {
              ...prev.socialLinks,
              ...(data.socialLinks || {}),
            },
          };
        });
      } catch (err) {
        console.error(err);
        setMessage("Failed to load header settings.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTopBarChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSocialChange = (platform, field, value) => {
    setForm((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: {
          ...prev.socialLinks[platform],
          [field]: value,
        },
      },
    }));
  };

  const addTopBarText = () => {
    const t = newText.trim();
    if (!t) return;

    const next = [...(form.topBarTexts || []), t];
    handleTopBarChange("topBarTexts", next);
    setNewText("");
  };

  const updateTopBarTextItem = (idx, value) => {
    const next = [...(form.topBarTexts || [])];
    next[idx] = value;
    handleTopBarChange("topBarTexts", next);
  };

  const deleteTopBarTextItem = (idx) => {
    const next = (form.topBarTexts || []).filter((_, i) => i !== idx);
    handleTopBarChange("topBarTexts", next.length ? next : [""]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      // ✅ send only what backend needs (safe)
      const payload = {
        showTopBar: form.showTopBar,
        topBarTexts: (form.topBarTexts || [])
          .map((t) => (typeof t === "string" ? t.trim() : ""))
          .filter(Boolean),
        socialLinks: form.socialLinks,
      };

      await axios.put(`${API_BASE}api/header-settings`, payload, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });

      setMessage("Header settings saved successfully.");
    } catch (err) {
      console.error(err);
      setMessage("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-sm text-gray-500">Loading header settings...</div>
      </div>
    );
  }

  const previewText =
    (form.topBarTexts || []).filter(Boolean).join("  •  ") ||
    "Preview: your text will appear here";

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Header Section</h1>
          <p className="text-sm text-gray-500">
            Control the top header bar and social media icons.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium shadow hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {message && (
        <div className="text-sm px-4 py-2 rounded-md bg-gray-100 text-gray-700">
          {message}
        </div>
      )}

      {/* Top bar settings card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Top Bar (Offer Text)
            </h2>
            <p className="text-xs text-gray-500">
              Show announcement text and social icons above the main header.
            </p>
          </div>

          {/* Enabled toggle */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">Enabled</span>
            <button
              type="button"
              onClick={() => handleTopBarChange("showTopBar", !form.showTopBar)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                form.showTopBar ? "bg-purple-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  form.showTopBar ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* ✅ Multi text editor */}
        <div className="space-y-3">
          <label className="text-xs font-medium text-gray-700">
            Offer / Announcement texts
          </label>

          {/* Add new text */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTopBarText();
                }
              }}
              placeholder="e.g. FREE DELIVERY"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={addTopBarText}
              className="px-4 rounded-xl border border-gray-200 text-sm hover:bg-gray-50"
            >
              Add
            </button>
          </div>

          {/* Items list */}
          <div className="space-y-2">
            {(form.topBarTexts || []).map((text, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => updateTopBarTextItem(idx, e.target.value)}
                  placeholder={`Text #${idx + 1}`}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => deleteTopBarTextItem(idx)}
                  className="px-4 rounded-xl border border-red-200 text-red-600 text-sm hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>

          {/* Small preview */}
          <div className="mt-2 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3">
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <span className="inline-flex items-center gap-1 text-gray-500">
                <span className="w-4 h-4 rounded-full bg-gray-300" />
                <span className="w-4 h-4 rounded-full bg-gray-300" />
                <span className="w-4 h-4 rounded-full bg-gray-300" />
                <span className="w-4 h-4 rounded-full bg-gray-300" />
              </span>
              <span className="truncate">{previewText}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Social links card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Social Media Icons
            </h2>
            <p className="text-xs text-gray-500">
              Add or pause social links shown on the left side of the top bar.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Object.entries(PLATFORMS).map(([key, { label, Icon }]) => {
            const item = form.socialLinks[key] || defaultSocial;
            return (
              <div
                key={key}
                className="rounded-xl border border-gray-100 p-4 flex flex-col gap-3 bg-gray-50"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
                      <Icon className="text-gray-700 text-lg" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{label}</p>
                      <p className="text-[11px] text-gray-500">
                        {item.isActive ? "Visible in header" : "Hidden / paused"}
                      </p>
                    </div>
                  </div>

                  {/* Active toggle */}
                  <button
                    type="button"
                    onClick={() =>
                      handleSocialChange(key, "isActive", !item.isActive)
                    }
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
                      item.isActive ? "bg-emerald-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        item.isActive ? "translate-x-4" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-gray-600">
                    Profile / Page URL
                  </label>
                  <input
                    type="text"
                    value={item.url}
                    onChange={(e) => handleSocialChange(key, "url", e.target.value)}
                    placeholder={`https://${key}.com/your-page`}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent bg-white"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HeaderSectionSettings;
