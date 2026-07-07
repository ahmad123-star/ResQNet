"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/motion";

/**
 * Table — responsive data table.
 *
 * On screens >= md it renders a normal <table>. On small screens it collapses
 * into a stack of cards (one per row), using each column header as the field
 * label — much friendlier than horizontally scrolling a table on a phone.
 *
 * Rows fade in with a subtle stagger.
 *
 * Props:
 *  - columns  : [{ key, header, render?(row), align?, className? }]
 *               `render` lets you put a Button/StatusBadge/etc. in a cell.
 *  - data     : array of row objects
 *  - keyField : property used as the React key (default "id")
 *  - empty    : node shown when data is empty (e.g. an <EmptyState />)
 */
export default function Table({
  columns = [],
  data = [],
  keyField = "id",
  empty = null,
  className,
}) {
  if (!data.length && empty) {
    return <div className={className}>{empty}</div>;
  }

  const alignClass = (align) =>
    align === "right"
      ? "text-right"
      : align === "center"
      ? "text-center"
      : "text-left";

  return (
    <div className={className}>
      {/* ---- Desktop / tablet: real table ---- */}
      <div className="hidden overflow-hidden rounded-xl border border-border md:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-slate-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-secondary",
                    alignClass(col.align)
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <motion.tbody
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {data.map((row, i) => (
              <motion.tr
                key={row[keyField] ?? i}
                variants={staggerItem}
                className="border-b border-border last:border-0 transition-colors hover:bg-slate-50/60"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-4 py-3 text-text",
                      alignClass(col.align),
                      col.className
                    )}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>

      {/* ---- Mobile: stacked cards ---- */}
      <motion.div
        className="flex flex-col gap-3 md:hidden"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {data.map((row, i) => (
          <motion.div
            key={row[keyField] ?? i}
            variants={staggerItem}
            className="rounded-xl border border-border bg-surface p-4 shadow-sm"
          >
            <dl className="flex flex-col gap-2">
              {columns.map((col) => (
                <div
                  key={col.key}
                  className="flex items-center justify-between gap-4"
                >
                  <dt className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                    {col.header}
                  </dt>
                  <dd className="text-sm text-text">
                    {col.render ? col.render(row) : row[col.key]}
                  </dd>
                </div>
              ))}
            </dl>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
