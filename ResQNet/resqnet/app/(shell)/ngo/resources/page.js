"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Select from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import {
  RESOURCE_STATUS_META,
  RESOURCE_CATEGORIES,
  RESOURCE_STATUS_OPTIONS,
} from "@/lib/data/ngoData";
import { createClient } from "@/lib/supabase/client";
import { useShell } from "@/lib/shellContext";

const EMPTY_FORM = { name: "", category: "", quantity: "", unit: "", status: "available" };

/* ── Resource form inside modal ──────────────────────────────────────────── */
function ResourceForm({ values, onChange, errors }) {
  return (
    <div className="space-y-4 pt-1">
      <div>
        <Label htmlFor="res-name" required>Resource name</Label>
        <Input id="res-name" placeholder="e.g. First Aid Kits"
          value={values.name}
          onChange={(e) => onChange("name", e.target.value)}
          error={errors.name} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="res-cat" required>Category</Label>
          <Select id="res-cat" placeholder="Select…"
            options={RESOURCE_CATEGORIES.map((c) => ({ value: c, label: c }))}
            value={values.category}
            onChange={(e) => onChange("category", e.target.value)}
            error={errors.category} />
        </div>
        <div>
          <Label htmlFor="res-unit">Unit</Label>
          <Input id="res-unit" placeholder="pcs / litres…"
            value={values.unit}
            onChange={(e) => onChange("unit", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="res-qty" required>Quantity</Label>
          <Input id="res-qty" type="number" min="0" placeholder="0"
            value={values.quantity}
            onChange={(e) => onChange("quantity", e.target.value)}
            error={errors.quantity} />
        </div>
        <div>
          <Label htmlFor="res-status">Status</Label>
          <Select id="res-status"
            options={RESOURCE_STATUS_OPTIONS}
            value={values.status}
            onChange={(e) => onChange("status", e.target.value)} />
        </div>
      </div>
    </div>
  );
}

/* ── Desktop table row ───────────────────────────────────────────────────── */
function ResourceRow({ res, onEdit, onDelete }) {
  const meta = RESOURCE_STATUS_META[res.status] ?? RESOURCE_STATUS_META.available;
  return (
    <motion.tr variants={staggerItem}
      className="border-b border-border last:border-0 transition-colors hover:bg-slate-50/60">
      <td className="px-4 py-3.5 text-sm font-medium text-text">{res.name}</td>
      <td className="px-4 py-3.5 text-sm text-text-secondary">{res.category}</td>
      <td className="px-4 py-3.5 text-sm text-text tabular-nums">
        {res.quantity} {res.unit}
      </td>
      <td className="px-4 py-3.5">
        <StatusBadge status={meta.badge}>{meta.label}</StatusBadge>
      </td>
      <td className="px-4 py-3.5 text-right">
        <div className="flex items-center justify-end gap-2">
          <button type="button" onClick={() => onEdit(res)}
            className="rounded-lg border border-border p-1.5 text-text-secondary transition-colors hover:bg-slate-100 hover:text-text focus-visible:outline-2 focus-visible:outline-primary"
            aria-label={`Edit ${res.name}`}>
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => onDelete(res.id)}
            className="rounded-lg border border-border p-1.5 text-critical-strong transition-colors hover:bg-primary-light focus-visible:outline-2 focus-visible:outline-primary"
            aria-label={`Delete ${res.name}`}>
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}

/* ── Mobile card ─────────────────────────────────────────────────────────── */
function ResourceCard({ res, onEdit, onDelete }) {
  const meta = RESOURCE_STATUS_META[res.status] ?? RESOURCE_STATUS_META.available;
  return (
    <motion.div variants={staggerItem}>
      <Card padded className="flex items-center gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-info-light">
          <Package className="h-5 w-5 text-info" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-text truncate">{res.name}</p>
          <p className="text-xs text-text-secondary">{res.category} · {res.quantity} {res.unit}</p>
          <div className="mt-1">
            <StatusBadge status={meta.badge}>{meta.label}</StatusBadge>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => onEdit(res)}
            className="rounded-lg border border-border p-2 text-text-secondary hover:bg-slate-100"
            aria-label={`Edit ${res.name}`}>
            <Pencil className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => onDelete(res.id)}
            className="rounded-lg border border-border p-2 text-critical-strong hover:bg-primary-light"
            aria-label={`Delete ${res.name}`}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </Card>
    </motion.div>
  );
}

/* ── Table / card skeletons ──────────────────────────────────────────────── */
function TableSkeletons() {
  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <tr key={i} className="border-b border-border">
          {[140, 80, 80, 60, 60].map((w, j) => (
            <td key={j} className="px-4 py-3.5">
              <Skeleton className={`h-4 w-${w === 60 ? 16 : w === 80 ? 20 : 36}`} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function CardSkeletons() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <Card key={i} padded className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </Card>
      ))}
    </>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function ResourcesPage() {
  const { user } = useShell();
  const toast    = useToast();

  const [resources,   setResources]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [deleteId,    setDeleteId]    = useState(null);
  const [editing,     setEditing]     = useState(null);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [formErrors,  setFormErrors]  = useState({});
  const [saving,      setSaving]      = useState(false);
  const [deleting,    setDeleting]    = useState(false);

  const loadResources = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("resources")
      .select("id, name, category, quantity, unit, status")
      .eq("ngo_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load resources", { description: error.message });
    } else {
      setResources(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user?.id) loadResources();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const updateField = (k, v) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    setFormErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (res) => {
    setEditing(res);
    setForm({ name: res.name, category: res.category, quantity: String(res.quantity), unit: res.unit ?? "", status: res.status });
    setFormErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())     e.name     = "Name is required.";
    if (!form.category)        e.category = "Select a category.";
    if (form.quantity === "" || isNaN(Number(form.quantity))) e.quantity = "Enter a valid number.";
    return e;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setSaving(true);

    const supabase = createClient();
    const payload = {
      name:     form.name.trim(),
      category: form.category,
      quantity: Number(form.quantity),
      unit:     form.unit.trim(),
      status:   form.status,
    };

    if (editing) {
      const { error } = await supabase
        .from("resources")
        .update(payload)
        .eq("id", editing.id)
        .eq("ngo_id", user.id);

      if (error) {
        toast.error("Update failed", { description: error.message });
      } else {
        setResources((prev) =>
          prev.map((r) => (r.id === editing.id ? { ...r, ...payload } : r))
        );
        toast.success("Resource updated");
        setModalOpen(false);
      }
    } else {
      const { data, error } = await supabase
        .from("resources")
        .insert({ ...payload, ngo_id: user.id })
        .select("id, name, category, quantity, unit, status")
        .single();

      if (error) {
        toast.error("Could not add resource", { description: error.message });
      } else {
        setResources((prev) => [data, ...prev]);
        toast.success("Resource added");
        setModalOpen(false);
      }
    }

    setSaving(false);
  };

  const handleDelete = (id) => setDeleteId(id);

  const confirmDelete = async () => {
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("resources")
      .delete()
      .eq("id", deleteId)
      .eq("ngo_id", user.id);

    if (error) {
      toast.error("Delete failed", { description: error.message });
    } else {
      setResources((prev) => prev.filter((r) => r.id !== deleteId));
      toast.info("Resource removed");
    }
    setDeleting(false);
    setDeleteId(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">

      {/* Heading */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible"
        className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-text-secondary" aria-hidden="true" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text">Resources</h1>
            <p className="text-sm text-text-secondary">
              {loading ? "Loading…" : `${resources.length} item${resources.length !== 1 ? "s" : ""} tracked`}
            </p>
          </div>
        </div>
        <Button variant="primary" size="sm" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add resource
        </Button>
      </motion.div>

      {/* Desktop table */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.08 }}
        className="hidden overflow-hidden rounded-xl border border-border md:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-slate-50">
              {["Name", "Category", "Quantity", "Status", "Actions"].map((h) => (
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
            ) : resources.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-text-secondary">
                  No resources yet. Add your first resource above.
                </td>
              </tr>
            ) : (
              resources.map((r) => (
                <ResourceRow key={r.id} res={r} onEdit={openEdit} onDelete={handleDelete} />
              ))
            )}
          </motion.tbody>
        </table>
      </motion.div>

      {/* Mobile cards */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible"
        className="flex flex-col gap-3 md:hidden">
        {loading ? (
          <CardSkeletons />
        ) : resources.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No resources yet"
            description="Add your first resource to start tracking."
          />
        ) : (
          resources.map((r) => (
            <ResourceCard key={r.id} res={r} onEdit={openEdit} onDelete={handleDelete} />
          ))
        )}
      </motion.div>

      {/* Add / Edit modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editing ? "Edit resource" : "Add resource"} size="sm">
        <ResourceForm values={form} onChange={updateField} errors={formErrors} />
        <ModalFooter>
          <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="primary" loading={saving} onClick={handleSave}>
            {saving ? "Saving…" : editing ? "Save changes" : "Add resource"}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete confirm modal */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete resource" size="sm">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light">
            <AlertTriangle className="h-5 w-5 text-primary" aria-hidden="true" />
          </span>
          <p className="text-sm text-text-secondary pt-1">
            Are you sure you want to remove this resource? This cannot be undone.
          </p>
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" loading={deleting} onClick={confirmDelete}>
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </ModalFooter>
      </Modal>

    </div>
  );
}
