"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tag, Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Checkbox from "@/components/ui/Checkbox";
import Textarea from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { EMPTY_CATEGORY } from "@/lib/data/adminData";
import { createClient } from "@/lib/supabase/client";

function CategoryForm({ values, onChange, errors }) {
  return (
    <div className="space-y-4 pt-1">
      <div className="grid grid-cols-4 gap-3">
        <div>
          <Label htmlFor="cat-icon">Icon</Label>
          <Input id="cat-icon" placeholder="🌊"
            value={values.icon} onChange={(e) => onChange("icon", e.target.value)} />
        </div>
        <div className="col-span-3">
          <Label htmlFor="cat-name" required>Name</Label>
          <Input id="cat-name" placeholder="e.g. Flood"
            value={values.name}
            onChange={(e) => onChange("name", e.target.value)}
            error={errors.name} />
        </div>
      </div>
      <div>
        <Label htmlFor="cat-desc">Description</Label>
        <Textarea id="cat-desc" rows={3} placeholder="Brief description of this category…"
          value={values.description} onChange={(e) => onChange("description", e.target.value)} />
      </div>
      <Checkbox id="cat-active" label="Active (visible to users when reporting)"
        checked={values.active} onChange={(e) => onChange("active", e.target.checked)} />
    </div>
  );
}

function TableSkeletons() {
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <tr key={i} className="border-b border-border">
          <td className="w-12 px-4 py-3.5"><Skeleton className="h-6 w-6" /></td>
          <td className="px-4 py-3.5"><Skeleton className="h-4 w-28" /></td>
          <td className="px-4 py-3.5"><Skeleton className="h-4 w-64" /></td>
          <td className="px-4 py-3.5"><Skeleton className="h-5 w-16 rounded-full" /></td>
          <td className="px-4 py-3.5 text-right">
            <div className="flex justify-end gap-2">
              <Skeleton className="h-7 w-7 rounded-lg" />
              <Skeleton className="h-7 w-7 rounded-lg" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

export default function CategoriesPage() {
  const toast = useToast();

  const [cats,      setCats]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [modalOpen, setModal]     = useState(false);
  const [deleteId,  setDeleteId]  = useState(null);
  const [editing,   setEditing]   = useState(null);
  const [form,      setForm]      = useState(EMPTY_CATEGORY);
  const [formErr,   setFormErr]   = useState({});
  const [saving,    setSaving]    = useState(false);
  const [deleting,  setDeleting]  = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("emergency_categories")
      .select("id, name, icon, description, active, created_at")
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          toast.error("Failed to load categories", { description: error.message });
        } else {
          setCats(
            (data ?? []).map((c) => ({
              id:          c.id,
              name:        c.name ?? "",
              icon:        c.icon ?? "",
              description: c.description ?? "",
              active:      c.active ?? true,
            }))
          );
        }
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateField = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setFormErr((p) => ({ ...p, [k]: undefined }));
  };

  const openAdd = () => {
    setEditing(null); setForm(EMPTY_CATEGORY); setFormErr({}); setModal(true);
  };
  const openEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, icon: c.icon, description: c.description, active: c.active });
    setFormErr({}); setModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setFormErr({ name: "Name is required." }); return; }
    setSaving(true);
    const supabase = createClient();

    if (editing) {
      const { error } = await supabase
        .from("emergency_categories")
        .update({ name: form.name, icon: form.icon, description: form.description, active: form.active })
        .eq("id", editing.id);
      if (error) {
        toast.error("Update failed", { description: error.message });
      } else {
        setCats((p) => p.map((c) => c.id === editing.id ? { ...c, ...form } : c));
        toast.success("Category updated");
        setModal(false);
      }
    } else {
      const { data, error } = await supabase
        .from("emergency_categories")
        .insert({ name: form.name, icon: form.icon, description: form.description, active: form.active })
        .select("id, name, icon, description, active")
        .single();
      if (error) {
        toast.error("Create failed", { description: error.message });
      } else {
        setCats((p) => [...p, {
          id: data.id, name: data.name ?? "", icon: data.icon ?? "",
          description: data.description ?? "", active: data.active ?? true,
        }]);
        toast.success("Category added");
        setModal(false);
      }
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("emergency_categories")
      .delete()
      .eq("id", deleteId);
    if (error) {
      toast.error("Delete failed", { description: error.message });
    } else {
      setCats((p) => p.filter((c) => c.id !== deleteId));
      toast.info("Category deleted");
      setDeleteId(null);
    }
    setDeleting(false);
  };

  const toggleActive = async (id) => {
    const target = cats.find((c) => c.id === id);
    if (!target) return;
    const newVal = !target.active;
    // Optimistic
    setCats((p) => p.map((c) => c.id === id ? { ...c, active: newVal } : c));
    const supabase = createClient();
    const { error } = await supabase
      .from("emergency_categories")
      .update({ active: newVal })
      .eq("id", id);
    if (error) {
      // Revert
      setCats((p) => p.map((c) => c.id === id ? { ...c, active: target.active } : c));
      toast.error("Update failed", { description: error.message });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <motion.div variants={fadeInUp} initial="hidden" animate="visible"
        className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-text-secondary" aria-hidden="true" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text">Categories</h1>
            <p className="text-sm text-text-secondary">
              {loading ? "Loading…" : `${cats.length} emergency types`}
            </p>
          </div>
        </div>
        <Button variant="primary" size="sm" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add category
        </Button>
      </motion.div>

      {/* Desktop table */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.07 }}
        className="hidden overflow-hidden rounded-xl border border-border md:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-slate-50">
              {["", "Name", "Description", "Status", "Actions"].map((h, i) => (
                <th key={i} className={cn(
                  "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-secondary",
                  h === "Actions" ? "text-right" : "text-left"
                )}>{h}</th>
              ))}
            </tr>
          </thead>
          <motion.tbody variants={staggerContainer} initial="hidden" animate="visible">
            {loading ? (
              <TableSkeletons />
            ) : cats.map((cat) => (
              <motion.tr key={cat.id} variants={staggerItem}
                className="border-b border-border last:border-0 transition-colors hover:bg-slate-50/60">
                <td className="w-12 px-4 py-3.5 text-xl">{cat.icon}</td>
                <td className="px-4 py-3.5 text-sm font-semibold text-text">{cat.name}</td>
                <td className="px-4 py-3.5 text-sm text-text-secondary max-w-xs truncate">{cat.description}</td>
                <td className="px-4 py-3.5">
                  <button type="button" onClick={() => toggleActive(cat.id)}
                    className="focus-visible:outline-2 focus-visible:outline-primary rounded-lg">
                    {cat.active
                      ? <StatusBadge status="resolved">Active</StatusBadge>
                      : <StatusBadge status="pending">Inactive</StatusBadge>}
                  </button>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button type="button" onClick={() => openEdit(cat)}
                      className="rounded-lg border border-border p-1.5 text-text-secondary hover:bg-slate-100 hover:text-text focus-visible:outline-2 focus-visible:outline-primary"
                      aria-label={`Edit ${cat.name}`}>
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => setDeleteId(cat.id)}
                      className="rounded-lg border border-border p-1.5 text-critical-strong hover:bg-primary-light focus-visible:outline-2 focus-visible:outline-primary"
                      aria-label={`Delete ${cat.name}`}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
        {!loading && cats.length === 0 && (
          <div className="px-4 py-12 text-center text-sm text-text-secondary">
            No categories yet. Add one using the button above.
          </div>
        )}
      </motion.div>

      {/* Mobile cards */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible"
        className="flex flex-col gap-3 md:hidden">
        {loading ? (
          [0, 1, 2].map((i) => (
            <Card key={i} padded className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </Card>
          ))
        ) : cats.length === 0 ? (
          <EmptyState
            icon={Tag}
            title="No categories yet"
            description="Add an emergency category using the button above."
          />
        ) : (
          cats.map((cat) => (
            <motion.div key={cat.id} variants={staggerItem}>
              <Card padded className="flex items-center gap-3">
                <span className="text-2xl">{cat.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-text">{cat.name}</p>
                  <p className="text-xs text-text-secondary truncate">{cat.description}</p>
                  <div className="mt-1">
                    {cat.active
                      ? <StatusBadge status="resolved">Active</StatusBadge>
                      : <StatusBadge status="pending">Inactive</StatusBadge>}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button type="button" onClick={() => openEdit(cat)}
                    className="rounded-lg border border-border p-2 text-text-secondary hover:bg-slate-100"
                    aria-label={`Edit ${cat.name}`}>
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => setDeleteId(cat.id)}
                    className="rounded-lg border border-border p-2 text-critical-strong hover:bg-primary-light"
                    aria-label={`Delete ${cat.name}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Add / Edit modal */}
      <Modal open={modalOpen} onClose={() => setModal(false)}
        title={editing ? "Edit category" : "Add category"} size="sm">
        <CategoryForm values={form} onChange={updateField} errors={formErr} />
        <ModalFooter>
          <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
          <Button variant="primary" loading={saving} onClick={handleSave}>
            {saving ? "Saving…" : editing ? "Save changes" : "Add category"}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete confirm modal */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete category" size="sm">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light">
            <AlertTriangle className="h-5 w-5 text-primary" aria-hidden="true" />
          </span>
          <p className="pt-1 text-sm text-text-secondary">
            Delete this category? Existing emergency reports that use it won&apos;t be affected.
          </p>
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
