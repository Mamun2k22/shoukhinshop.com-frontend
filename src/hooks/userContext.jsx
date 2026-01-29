// src/hooks/userContext.jsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

const UserContext = createContext();

// 🔹 helper: সব জায়গায় user normalize করে নেই (id/_id/userId -> id)
const normalizeUser = (u) => {
  if (!u) return null;
  const id = u.id || u._id || u.userId;
  return { ...u, id };
};

export const UserProvider = ({ children }) => {
  // localStorage → initial user (normalized)
  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("user");
    try {
      const parsed = raw ? JSON.parse(raw) : null;
      return normalizeUser(parsed);
    } catch {
      return null;
    }
  });

  // 🔹 hydrate/refresh status
  const [loading, setLoading] = useState(true);

  const updateUser = useCallback((userData) => {
    const normalized = normalizeUser(userData);
    setUser(normalized);
    if (normalized) {
      localStorage.setItem("user", JSON.stringify(normalized));
    } else {
      localStorage.removeItem("user");
    }
  }, []);

  const clearUser = useCallback(() => {
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  // 🔹 server থেকে প্রোফাইল এনে Context hydrate করি
  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      updateUser(null);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_APP_SERVER_URL}api/users/profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.ok) {
        const data = await res.json();
        const u = data?.user;
        if (u) {
          updateUser(u); // updateUser নিজেই normalize করছে
        } else {
          updateUser(null);
        }
      } else {
        // token invalid হলে user clear করে দাও
        updateUser(null);
      }
    } catch (e) {
      console.error("refreshUser failed:", e);
      updateUser(null);
    } finally {
      setLoading(false);
    }
  }, [updateUser]);

  // 🔹 mount হলে একবার hydrate
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // 🔹 multi-tab sync (optional sweetener)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "user") {
        const newVal = e.newValue ? JSON.parse(e.newValue) : null;
        setUser(normalizeUser(newVal));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo(
    () => ({ user, loading, updateUser, clearUser, refreshUser }),
    [user, loading, updateUser, clearUser, refreshUser]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
