"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { timeAgo } from "@/lib/utils";

const ShellContext = createContext(null);

function getInitialCollapsed() {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 1024;
}

function transformNotif(row) {
  return {
    id:        row.id,
    type:      row.type    ?? "system",
    title:     row.title   ?? "",
    message:   row.message ?? "",
    read:      row.is_read ?? false,
    time:      timeAgo(row.created_at),
    createdAt: row.created_at,
  };
}

export function ShellProvider({ user, children }) {
  const [collapsed,    setCollapsed]  = useState(getInitialCollapsed);
  const [drawerOpen,   setDrawerOpen] = useState(false);
  const [lang,         setLang]       = useState("en");
  const [avatarUrl,    setAvatarUrl]  = useState(user?.avatarUrl ?? null);
  const [notifications, setNotifs]   = useState([]);
  const [notifsLoading, setNotifsLoading] = useState(true);

  /* Responsive sidebar collapse */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = (e) => setCollapsed(!e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  /* Load notifications + subscribe to Realtime */
  useEffect(() => {
    if (!user?.id) return;
    const supabase = createClient();

    /* Initial fetch — 50 most recent */
    supabase
      .from("notifications")
      .select("id, type, title, message, is_read, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setNotifs((data ?? []).map(transformNotif));
        setNotifsLoading(false);
      });

    /* Realtime: prepend new inserts */
    const channel = supabase
      .channel(`notifs:${user.id}`)
      .on(
        "postgres_changes",
        {
          event:  "INSERT",
          schema: "public",
          table:  "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifs((prev) => [transformNotif(payload.new), ...prev]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = useCallback(async (id) => {
    /* Optimistic */
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);
  }, []);

  const markAllRead = useCallback(async () => {
    /* Optimistic */
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("is_read", false);
    /* RLS restricts to own rows automatically */
  }, []);

  return (
    <ShellContext.Provider
      value={{
        user,
        role: user?.role ?? "victim",
        collapsed,
        setCollapsed,
        drawerOpen,
        setDrawerOpen,
        lang,
        setLang,
        avatarUrl,
        setAvatarUrl,
        notifications,
        notifsLoading,
        unreadCount,
        markRead,
        markAllRead,
      }}
    >
      {children}
    </ShellContext.Provider>
  );
}

export function useShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useShell must be called within a <ShellProvider>");
  return ctx;
}
