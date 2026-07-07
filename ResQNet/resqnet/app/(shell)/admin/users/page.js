"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Search, ShieldOff, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import Skeleton from "@/components/ui/Skeleton";
import Input from "@/components/ui/Input";
import EmptyState from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { ROLE_BADGE } from "@/lib/data/adminData";
import { createClient } from "@/lib/supabase/client";
import { useShell } from "@/lib/shellContext";
import { createSystemLog } from "@/lib/systemLog";

/* ── Block/Unblock toggle ────────────────────────────────────────────────── */
function BlockToggle({ user, onToggle, busy }) {
  const blocked = user.status === "blocked";
  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => onToggle(user.id)}
      aria-label={blocked ? `Unblock ${user.name}` : `Block ${user.name}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold",
        "transition-colors focus-visible:outline-2 focus-visible:outline-primary",
        busy && "opacity-60 cursor-not-allowed",
        blocked
          ? "border-resolved/40 bg-resolved-light text-resolved-strong hover:bg-resolved/20"
          : "border-primary/30 bg-primary-light text-critical-strong hover:bg-primary/10"
      )}
    >
      {blocked
        ? <><ShieldCheck className="h-3.5 w-3.5" />Unblock</>
        : <><ShieldOff className="h-3.5 w-3.5" />Block</>
      }
    </button>
  );
}

/* ── Skeleton rows ───────────────────────────────────────────────────────── */
function TableSkeletons() {
  return (
    <>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <tr key={i} className="border-b border-border">
          <td className="px-4 py-3.5">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <Skeleton className="h-4 w-32" />
            </div>
          </td>
          <td className="px-4 py-3.5"><Skeleton className="h-4 w-44" /></td>
          <td className="px-4 py-3.5"><Skeleton className="h-5 w-20 rounded-full" /></td>
          <td className="px-4 py-3.5"><Skeleton className="h-5 w-16 rounded-full" /></td>
          <td className="px-4 py-3.5 text-right"><Skeleton className="h-7 w-20 rounded-lg ml-auto" /></td>
        </tr>
      ))}
    </>
  );
}

export default function UsersPage() {
  const { user: adminUser } = useShell();
  const toast = useToast();

  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [busy,       setBusy]       = useState(null); // id of profile being toggled
  const [roleChanging, setRoleChanging] = useState(null); // id currently changing role

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("id, name, email, role, blocked, created_at")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          toast.error("Failed to load users", { description: error.message });
        } else {
          setUsers(
            (data ?? []).map((p) => ({
              id:     p.id,
              name:   p.name ?? "—",
              email:  p.email ?? "—",
              role:   p.role,
              status: p.blocked ? "blocked" : "active",
            }))
          );
        }
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = users.filter((u) =>
    !search ||
    [u.name, u.email ?? "", u.role].some((f) =>
      f.toLowerCase().includes(search.toLowerCase())
    )
  );

  const toggleBlock = async (id) => {
    const target = users.find((u) => u.id === id);
    if (!target || busy) return;

    const willBlock = target.status !== "blocked";
    setBusy(id);

    // Optimistic update
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: willBlock ? "blocked" : "active" } : u
      )
    );

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ blocked: willBlock })
      .eq("id", id);

    if (error) {
      // Revert
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: target.status } : u))
      );
      toast.error("Update failed", { description: error.message });
    } else {
      createSystemLog(adminUser?.id, `User "${target.name}" ${willBlock ? "blocked" : "unblocked"}.`, "warn");
      toast[willBlock ? "info" : "success"](
        `${target.name} ${willBlock ? "blocked" : "unblocked"}`
      );
    }

    setBusy(null);
  };

  const changeRole = async (id, newRole) => {
    if (roleChanging) return;
    const target = users.find((u) => u.id === id);
    if (!target || target.role === newRole) return;
    setRoleChanging(id);
    const res = await fetch("/api/admin/update-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id, newRole }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error("Role change failed", { description: json.error });
    } else {
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role: newRole } : u));
      createSystemLog(adminUser?.id, `User "${target.name}" role changed to ${newRole}.`, "warn");
      toast.success(`${target.name} is now ${newRole}`);
    }
    setRoleChanging(null);
  };

  const ROLES = ["victim", "volunteer", "ngo", "admin", "donor"];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Heading */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible"
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-text-secondary" aria-hidden="true" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text">Users</h1>
            <p className="text-sm text-text-secondary">
              {loading ? "Loading…" : `${filtered.length} of ${users.length} accounts`}
            </p>
          </div>
        </div>
        <div className="w-full sm:w-72">
          <Input placeholder="Search name, email, role…"
            leftIcon={<Search className="h-4 w-4" />}
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </motion.div>

      {/* Desktop table */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.08 }}
        className="hidden overflow-hidden rounded-xl border border-border md:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-slate-50">
              {["Name", "Email", "Role", "Status", "Actions"].map((h) => (
                <th key={h} className={cn(
                  "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-secondary",
                  h === "Actions" ? "text-right" : "text-left"
                )}>{h}</th>
              ))}
            </tr>
          </thead>
          <motion.tbody variants={staggerContainer} initial="hidden" animate="visible">
            {loading ? (
              <TableSkeletons />
            ) : filtered.map((u) => {
              const roleMeta = ROLE_BADGE[u.role] ?? ROLE_BADGE.victim;
              const blocked  = u.status === "blocked";
              return (
                <motion.tr key={u.id} variants={staggerItem}
                  className="border-b border-border last:border-0 transition-colors hover:bg-slate-50/60">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        blocked ? "bg-slate-100 text-text-secondary" : "bg-primary-light text-primary"
                      )}>
                        {(u.name ?? "—").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </span>
                      <span className={cn("text-sm font-medium", blocked && "text-text-secondary line-through")}>
                        {u.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-text-secondary">{u.email}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={roleMeta.badge}>{roleMeta.label}</StatusBadge>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={blocked ? "critical" : "resolved"}>
                      {blocked ? "Blocked" : "Active"}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <select
                        value={u.role}
                        disabled={roleChanging === u.id}
                        onChange={(e) => changeRole(u.id, e.target.value)}
                        className="rounded-lg border border-border bg-surface px-2 py-1.5 text-xs font-medium text-text focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                        ))}
                      </select>
                      <BlockToggle user={u} onToggle={toggleBlock} busy={busy === u.id} />
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </motion.tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-text-secondary">No users match your search.</div>
        )}
      </motion.div>

      {/* Mobile cards */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible"
        className="flex flex-col gap-3 md:hidden">
        {loading ? (
          [0, 1, 2].map((i) => (
            <Card key={i} padded className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-32" />
                <div className="flex gap-2 mt-1">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
              </div>
            </Card>
          ))
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No users match your search"
            description="Try a different name, email, or role."
          />
        ) : (
          filtered.map((u) => {
            const roleMeta = ROLE_BADGE[u.role] ?? ROLE_BADGE.victim;
            const blocked  = u.status === "blocked";
            return (
              <motion.div key={u.id} variants={staggerItem}>
                <Card padded className="flex items-center gap-3">
                  <span className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                    blocked ? "bg-slate-100 text-text-secondary" : "bg-primary-light text-primary"
                  )}>
                    {(u.name ?? "—").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-sm font-semibold text-text truncate", blocked && "line-through text-text-secondary")}>
                      {u.name}
                    </p>
                    <p className="text-xs text-text-secondary truncate">{u.email}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      <StatusBadge status={roleMeta.badge}>{roleMeta.label}</StatusBadge>
                      <StatusBadge status={blocked ? "critical" : "resolved"}>
                        {blocked ? "Blocked" : "Active"}
                      </StatusBadge>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 items-end">
                    <select
                      value={u.role}
                      disabled={roleChanging === u.id}
                      onChange={(e) => changeRole(u.id, e.target.value)}
                      className="rounded-lg border border-border bg-surface px-2 py-1.5 text-xs font-medium text-text focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                      ))}
                    </select>
                    <BlockToggle user={u} onToggle={toggleBlock} busy={busy === u.id} />
                  </div>
                </Card>
              </motion.div>
            );
          })
        )}
      </motion.div>
    </div>
  );
}
