"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ScrollText, Search, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import Skeleton from "@/components/ui/Skeleton";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import { LOG_LEVEL_META } from "@/lib/data/adminData";
import { createClient } from "@/lib/supabase/client";

const LEVEL_FILTERS = [
  { value: "all",   label: "All" },
  { value: "info",  label: "Info" },
  { value: "warn",  label: "Warn" },
  { value: "error", label: "Error" },
];

function transformLog(row) {
  return {
    id:     row.id,
    time:   row.created_at
      ? new Date(row.created_at).toLocaleString("en-GB", {
          day: "2-digit", month: "short", year: "numeric",
          hour: "2-digit", minute: "2-digit", second: "2-digit",
        })
      : "—",
    user:   row.actor?.name ?? "system",
    action: row.action ?? "",
    level:  row.level ?? "info",
  };
}

function LogSkeletons() {
  return (
    <>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <li key={i} className="grid grid-cols-[1fr] gap-1 px-4 py-3 sm:grid-cols-[160px_1fr_auto] sm:gap-4 sm:items-center border-b border-border last:border-0">
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-4 w-full max-w-lg" />
          <Skeleton className="h-5 w-14 rounded-full sm:ml-auto" />
        </li>
      ))}
    </>
  );
}

export default function LogsPage() {
  const toast = useToast();

  const [logs,      setLogs]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [level,     setLevel]     = useState("all");
  const [refreshing,setRefreshing]= useState(false);

  const fetchLogs = useCallback(async (quiet = false) => {
    if (quiet) setRefreshing(true); else setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("system_logs")
      .select("id, action, level, created_at, actor:profiles!user_id(name)")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      toast.error("Failed to load logs", { description: error.message });
    } else {
      setLogs((data ?? []).map(transformLog));
      if (quiet) toast.success("Logs refreshed", { description: `Showing ${(data ?? []).length} entries.` });
    }
    if (quiet) setRefreshing(false); else setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const visible = logs.filter((l) => {
    const matchLevel  = level === "all" || l.level === level;
    const matchSearch = !search || [l.time, l.user, l.action]
      .some((f) => f.toLowerCase().includes(search.toLowerCase()));
    return matchLevel && matchSearch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <motion.div variants={fadeInUp} initial="hidden" animate="visible"
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <ScrollText className="h-5 w-5 text-text-secondary" aria-hidden="true" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text">System Logs</h1>
            <p className="text-sm text-text-secondary">
              {loading ? "Loading…" : `${visible.length} entries shown`}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" loading={refreshing} onClick={() => fetchLogs(true)}>
          <RefreshCw className="h-4 w-4" />
          {refreshing ? "Refreshing…" : "Refresh"}
        </Button>
      </motion.div>

      {/* Toolbar */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.06 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input placeholder="Search time, user, action…"
            leftIcon={<Search className="h-4 w-4" />}
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-1.5">
          {LEVEL_FILTERS.map((f) => (
            <button key={f.value} type="button" onClick={() => setLevel(f.value)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                "focus-visible:outline-2 focus-visible:outline-primary",
                level === f.value
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-text-secondary hover:bg-slate-200"
              )}>
              {f.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Log list */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
        <Card className="overflow-hidden font-mono text-xs">
          {/* Table header */}
          <div className="grid grid-cols-[160px_1fr_auto] gap-4 border-b border-border bg-slate-50 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
            <span>Timestamp</span>
            <span>Action</span>
            <span>Level</span>
          </div>

          {loading ? (
            <ul className="divide-y divide-border">
              <LogSkeletons />
            </ul>
          ) : (
            <>
              {visible.length === 0 && (
                <div className="py-12 text-center font-sans text-sm text-text-secondary">
                  No logs match your search.
                </div>
              )}
              <motion.ul variants={staggerContainer} initial="hidden" animate="visible"
                className="divide-y divide-border">
                {visible.map((log, i) => {
                  const meta = LOG_LEVEL_META[log.level] ?? LOG_LEVEL_META.info;
                  return (
                    <motion.li key={log.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.12 + i * 0.02 }}
                      className={cn(
                        "grid grid-cols-[1fr] gap-1 px-4 py-3 sm:grid-cols-[160px_1fr_auto] sm:gap-4 sm:items-center",
                        log.level === "error" && "bg-critical-light/30",
                        log.level === "warn"  && "bg-pending-light/20",
                      )}>
                      <span className="text-[11px] text-text-secondary whitespace-nowrap">{log.time}</span>
                      <div className="min-w-0">
                        <span className={cn("font-semibold", meta.text)}>[{log.user}] </span>
                        <span className="text-text">{log.action}</span>
                      </div>
                      <div className="sm:flex sm:justify-end">
                        <StatusBadge status={meta.badge}>
                          {log.level.toUpperCase()}
                        </StatusBadge>
                      </div>
                    </motion.li>
                  );
                })}
              </motion.ul>
            </>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
