"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Navigation, CheckCircle2, ChevronRight, AlertTriangle,
  Camera, X, ImageIcon,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from "@/components/ui/Card";
import Label    from "@/components/ui/Label";
import Select   from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Input    from "@/components/ui/Input";
import Button   from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import Map from "@/components/ui/Map";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { SEVERITY_OPTIONS, getCategoryColor, uiSeverityToDb } from "@/lib/data/victimData";
import { createClient } from "@/lib/supabase/client";
import { useShell } from "@/lib/shellContext";
import { notifyMany } from "@/lib/notifications";
import { emailNotify } from "@/lib/emailNotify";
import { createSystemLog } from "@/lib/systemLog";

const SEVERITY_STYLES = {
  low:    { border: "border-resolved/50", bg: "bg-resolved-light",  text: "text-resolved-strong",  ring: "ring-resolved/40" },
  medium: { border: "border-pending/50",  bg: "bg-pending-light",   text: "text-pending-strong",   ring: "ring-pending/40" },
  high:   { border: "border-primary/60",  bg: "bg-critical-light",  text: "text-critical-strong",  ring: "ring-primary/40" },
};

function SeverityCard({ value, label, description, selected, onSelect }) {
  const s = SEVERITY_STYLES[value];
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-all duration-150",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        selected
          ? cn("ring-2", s.ring, s.border, s.bg)
          : "border-border bg-surface hover:bg-slate-50"
      )}
    >
      <span className={cn(
        "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
        selected ? "border-primary bg-primary" : "border-border bg-surface"
      )}>
        {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
      </span>
      <div>
        <p className={cn("text-sm font-semibold", selected ? s.text : "text-text")}>{label}</p>
        <p className="text-xs text-text-secondary">{description}</p>
      </div>
    </button>
  );
}

export default function ReportEmergencyPage() {
  const router    = useRouter();
  const toast     = useToast();
  const { user }  = useShell();

  const [categories,        setCategories]       = useState([]);  // [{id, name}]
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [category,     setCategory]    = useState("");
  const [description,  setDescription] = useState("");
  const [severity,     setSeverity]    = useState("medium");
  const [locText,      setLocText]     = useState("");
  const [coords,       setCoords]      = useState(null); // {lat, lng}
  const [locLoading,   setLocLoading]  = useState(false);
  const [submitting,   setSubmitting]  = useState(false);
  const [submitted,    setSubmitted]   = useState(false);
  const [errors,       setErrors]      = useState({});
  const [photoFile,    setPhotoFile]   = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Load categories from DB on mount.
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("emergency_categories")
      .select("id, name")
      .order("name")
      .then(({ data, error }) => {
        if (error) console.warn("[categories]", error.message);
        setCategories(data ?? []);
        setCategoriesLoading(false);
      });
  }, []);

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported", { description: "Please enter your location manually." });
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setCoords({ lat, lng });
        setLocText(`${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E`);
        setLocLoading(false);
        toast.success("Location detected", { description: "Using your current GPS position." });
      },
      () => {
        setLocLoading(false);
        toast.error("Could not get location", { description: "Please enter your address manually." });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = () => {
    const e = {};
    if (!category)           e.category    = "Please select a category.";
    if (!description.trim()) e.description = "Please describe the emergency.";
    if (!locText.trim())     e.location    = "Please enter or detect your location.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);

    const supabase = createClient();

    // Upload photo to Supabase Storage if selected
    let photoUrl = null;
    if (photoFile) {
      const ext  = photoFile.name.split(".").pop() || "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("emergency-photos")
        .upload(path, photoFile, { contentType: photoFile.type, upsert: false });
      if (uploadError) {
        toast.error("Photo upload failed", { description: uploadError.message });
        setSubmitting(false);
        return;
      }
      const { data: { publicUrl } } = supabase.storage
        .from("emergency-photos")
        .getPublicUrl(path);
      photoUrl = publicUrl;
    }

    const { error } = await supabase.from("emergencies").insert({
      victim_id:   user.id,
      category_id: category,
      description,
      severity:    uiSeverityToDb(severity),
      lat:         coords?.lat ?? null,
      lng:         coords?.lng ?? null,
      address:     locText,
      status:      "Reported",
      photo_url:   photoUrl,
    });

    setSubmitting(false);

    if (error) {
      toast.error("Submission failed", { description: error.message });
      return;
    }

    createSystemLog(user.id, `Emergency reported: ${severity} ${categories.find((c) => c.id === category)?.name ?? "Unknown"} at ${locText}.`, "info");

    /* Notify all NGOs and admins about the new emergency */
    const catName = categories.find((c) => c.id === category)?.name ?? "Unknown";
    const supabase2 = createClient();
    const { data: recipients } = await supabase2
      .from("profiles")
      .select("id")
      .in("role", ["ngo", "admin", "volunteer"]);
    const recipientIds = (recipients ?? []).map((r) => r.id).filter((id) => id !== user.id);
    await notifyMany(
      recipientIds,
      "emergency",
      "New Emergency Reported",
      `A ${severity} ${catName} emergency was reported at: ${locText}.`
    );
    emailNotify(
      recipientIds,
      `New ${severity.charAt(0).toUpperCase() + severity.slice(1)} Emergency: ${catName}`,
      `A ${severity} ${catName} emergency was reported at: ${locText}. Log in to ResQNet to respond.`
    );

    setSubmitted(true);
  };

  const resetForm = () => {
    setSubmitted(false);
    setCategory("");
    setDescription("");
    setLocText("");
    setCoords(null);
    setSeverity("medium");
    clearPhoto();
  };

  /* ── Success screen ───────────────────────────────────────────────────── */
  if (submitted) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <Card padded className="flex flex-col items-center gap-4 text-center">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-resolved-light"
            >
              <CheckCircle2 className="h-8 w-8 text-resolved" />
            </motion.span>
            <div>
              <h2 className="text-xl font-bold text-text">Report submitted!</h2>
              <p className="mt-1.5 text-sm text-text-secondary">
                Your emergency has been reported. Nearby volunteers and NGOs
                are being notified. You&apos;ll receive updates here.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 pt-2">
              <Button variant="primary" fullWidth onClick={() => router.push("/victim/my-emergencies")}>
                Track my emergencies <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" fullWidth onClick={resetForm}>
                Report another
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  /* ── Form ─────────────────────────────────────────────────────────────── */
  const selectedCat = categories.find((c) => c.id === category);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <motion.div
        className="mx-auto max-w-2xl space-y-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={staggerItem}>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light">
              <AlertTriangle className="h-4 w-4 text-primary" aria-hidden="true" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-text">Report Emergency</h1>
          </div>
          <p className="text-sm text-text-secondary">
            Fill in the details below. Volunteers and NGOs will be notified immediately.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">

          {/* Category */}
          <motion.div variants={staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle>Emergency Category</CardTitle>
                <CardDescription>What type of emergency are you reporting?</CardDescription>
              </CardHeader>
              <CardBody>
                <Label htmlFor="em-category" required>Category</Label>
                <Select
                  id="em-category"
                  placeholder={categoriesLoading ? "Loading…" : "Select a category"}
                  options={categories.map((c) => ({ value: c.id, label: c.name }))}
                  value={category}
                  onChange={(e) => { setCategory(e.target.value); setErrors((err) => ({ ...err, category: undefined })); }}
                  error={errors.category}
                  required
                />
                <AnimatePresence>
                  {selectedCat && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="mt-3"
                    >
                      <span className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                        getCategoryColor(selectedCat.name)
                      )}>
                        {selectedCat.name} selected
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardBody>
            </Card>
          </motion.div>

          {/* Description */}
          <motion.div variants={staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
                <CardDescription>Describe what is happening in as much detail as possible.</CardDescription>
              </CardHeader>
              <CardBody>
                <Label htmlFor="em-desc" required>What is happening?</Label>
                <Textarea
                  id="em-desc"
                  placeholder="E.g. Flooding on ground floor, water rising fast. Three people trapped…"
                  rows={4}
                  value={description}
                  onChange={(e) => { setDescription(e.target.value); setErrors((err) => ({ ...err, description: undefined })); }}
                  error={errors.description}
                  required
                />
                <p className="mt-1.5 text-xs text-text-secondary">{description.length}/500 characters</p>
              </CardBody>
            </Card>
          </motion.div>

          {/* Photo */}
          <motion.div variants={staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle>Photo <span className="text-xs font-normal text-text-secondary">(optional)</span></CardTitle>
                <CardDescription>Take a photo or upload one from your device to help responders.</CardDescription>
              </CardHeader>
              <CardBody className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Emergency preview"
                      className="h-52 w-full rounded-xl object-cover border border-border"
                    />
                    <button
                      type="button"
                      onClick={clearPhoto}
                      className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
                      aria-label="Remove photo"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-10 text-text-secondary transition hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    <Camera className="h-8 w-8" />
                    <span className="text-sm font-medium">Tap to take photo or choose from gallery</span>
                    <span className="text-xs text-text-secondary flex items-center gap-1">
                      <ImageIcon className="h-3 w-3" /> JPG, PNG, HEIC up to 10 MB
                    </span>
                  </button>
                )}
                {photoFile && (
                  <p className="text-xs text-text-secondary truncate">
                    {photoFile.name} — {(photoFile.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                )}
              </CardBody>
            </Card>
          </motion.div>

          {/* Severity */}
          <motion.div variants={staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle>Severity</CardTitle>
                <CardDescription>How urgent is this situation?</CardDescription>
              </CardHeader>
              <CardBody className="space-y-2.5">
                {SEVERITY_OPTIONS.map(({ value, label, description: desc }) => (
                  <SeverityCard
                    key={value}
                    value={value}
                    label={label}
                    description={desc}
                    selected={severity === value}
                    onSelect={setSeverity}
                  />
                ))}
              </CardBody>
            </Card>
          </motion.div>

          {/* Location */}
          <motion.div variants={staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
                <CardDescription>Where is the emergency taking place?</CardDescription>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="overflow-hidden rounded-xl border border-border h-44">
                  {coords ? (
                    <Map lat={coords.lat} lng={coords.lng} className="h-44 w-full rounded-xl" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-slate-100">
                      <div className="flex flex-col items-center gap-2 text-center">
                        <MapPin className="h-8 w-8 text-slate-300" aria-hidden="true" />
                        <p className="text-sm font-medium text-slate-400">Detect location to see map</p>
                      </div>
                    </div>
                  )}
                </div>

                <Button type="button" variant="outline" size="sm" loading={locLoading} onClick={handleUseLocation}>
                  <Navigation className="h-4 w-4" />
                  {locLoading ? "Detecting…" : "Use my current location"}
                </Button>

                <div>
                  <Label htmlFor="em-location" required>Address / Description</Label>
                  <Input
                    id="em-location"
                    type="text"
                    placeholder="Street, area, city…"
                    leftIcon={<MapPin className="h-4 w-4" />}
                    value={locText}
                    onChange={(e) => { setLocText(e.target.value); setErrors((err) => ({ ...err, location: undefined })); }}
                    error={errors.location}
                    required
                  />
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Submit */}
          <motion.div variants={staggerItem}>
            <Card className="border-primary/20 bg-primary-light">
              <CardBody>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-text">Ready to submit?</p>
                    <p className="text-xs text-text-secondary">Volunteers within 5 km will be alerted immediately.</p>
                  </div>
                  <Button type="submit" variant="primary" size="lg" loading={submitting} className="shrink-0">
                    <AlertTriangle className="h-5 w-5" />
                    {submitting ? (photoFile ? "Uploading…" : "Submitting…") : "Submit Report"}
                  </Button>
                </div>
              </CardBody>
            </Card>
          </motion.div>

        </form>
      </motion.div>
    </div>
  );
}
