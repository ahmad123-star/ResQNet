"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, Coins, Package, Info, CheckCircle2, ChevronRight,
} from "lucide-react";
import {
  Card, CardHeader, CardTitle, CardDescription, CardBody,
} from "@/components/ui/Card";
import Label from "@/components/ui/Label";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { SUGGESTED_AMOUNTS } from "@/lib/data/donorData";
import { createClient } from "@/lib/supabase/client";
import { useShell } from "@/lib/shellContext";
import { createNotification, notifyMany } from "@/lib/notifications";
import { createSystemLog } from "@/lib/systemLog";
import { emailNotify } from "@/lib/emailNotify";

/* ── Donation type tab ───────────────────────────────────────────────────── */
function TypeTab({ value, current, icon: Icon, label, description, onSelect }) {
  const active = value === current;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={cn(
        "flex flex-1 flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all duration-150",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        active
          ? "border-primary bg-primary-light"
          : "border-border bg-surface hover:bg-slate-50"
      )}
    >
      <span className={cn(
        "flex h-10 w-10 items-center justify-center rounded-xl",
        active ? "bg-primary text-white" : "bg-slate-100 text-text-secondary"
      )}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div>
        <p className={cn("text-sm font-bold", active ? "text-primary" : "text-text")}>{label}</p>
        <p className="text-xs text-text-secondary">{description}</p>
      </div>
    </button>
  );
}

/* ── Amount quick-select pill ────────────────────────────────────────────── */
function AmountChip({ val, label, current, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(val)}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
        "focus-visible:outline-2 focus-visible:outline-primary",
        current === val
          ? "border-primary bg-primary text-white"
          : "border-border bg-surface text-text-secondary hover:bg-slate-50"
      )}
    >
      {label}
    </button>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function DonatePage() {
  const router    = useRouter();
  const toast     = useToast();
  const { user }  = useShell();

  /* Dropdown options loaded from DB */
  const [ngoOptions,       setNgoOptions]       = useState([]);
  const [emergencyOptions, setEmergencyOptions] = useState([]);
  const [optionsLoading,   setOptionsLoading]   = useState(true);

  /* Form state */
  const [donationType, setDonationType] = useState("funds");   // "funds" | "items"
  const [targetType,   setTargetType]   = useState("ngo");     // "ngo" | "emergency" | ""
  const [amount,       setAmount]       = useState("");
  const [customAmount, setCustomAmount] = useState(false);
  const [item,         setItem]         = useState("");
  const [quantity,     setQuantity]     = useState("");
  const [target,       setTarget]       = useState("");
  const [notes,        setNotes]        = useState("");
  const [errors,       setErrors]       = useState({});
  const [submitting,   setSubmitting]   = useState(false);
  const [submitted,    setSubmitted]    = useState(false);

  /* Load NGO profiles + open emergencies */
  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase
        .from("profiles")
        .select("id, name")
        .eq("role", "ngo")
        .order("name"),
      supabase
        .from("emergencies")
        .select("id, address, emergency_categories(name)")
        .in("status", ["Reported", "In Progress"])
        .order("created_at", { ascending: false })
        .limit(30),
    ]).then(([ngoRes, emRes]) => {
      setNgoOptions(
        (ngoRes.data ?? []).map((n) => ({ value: n.id, label: n.name ?? "Unnamed NGO" }))
      );
      setEmergencyOptions(
        (emRes.data ?? []).map((e) => ({
          value: e.id,
          label: `${e.id.slice(0, 8).toUpperCase()} — ${e.emergency_categories?.name ?? "Emergency"}${e.address ? `, ${e.address}` : ""}`,
        }))
      );
      setOptionsLoading(false);
    });
  }, []);

  /* Helpers */
  const selectAmount = (val) => {
    setAmount(val);
    setCustomAmount(false);
    setErrors((e) => ({ ...e, amount: undefined }));
  };

  const handleTypeSwitch = (val) => {
    setDonationType(val);
    setAmount(""); setItem(""); setQuantity("");
    setCustomAmount(false);
    setErrors({});
  };

  const validate = () => {
    const e = {};
    if (donationType === "funds") {
      const n = Number(amount);
      if (!amount || isNaN(n) || n <= 0) e.amount = "Enter a valid amount greater than ₨ 0.";
    } else {
      if (!item.trim())     e.item     = "Describe the item(s) you are donating.";
      if (!quantity.trim()) e.quantity = "Enter quantity.";
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    if (!user?.id) { toast.error("Not signed in"); return; }
    setErrors({});
    setSubmitting(true);

    const supabase = createClient();
    const payload = {
      donor_id:            user.id,
      type:                donationType === "funds" ? "Funds" : "Items",
      amount:              donationType === "funds"  ? Number(amount)   : null,
      item:                donationType === "items"  ? item.trim()      : null,
      quantity:            donationType === "items"  ? Number(quantity) : null,
      target_ngo_id:       targetType === "ngo"       && target ? target : null,
      target_emergency_id: targetType === "emergency" && target ? target : null,
      status:              "Pending",
    };

    const { error } = await supabase.from("donations").insert(payload);

    if (error) {
      toast.error("Submission failed", { description: error.message });
      setSubmitting(false);
      return;
    }

    const donationSummary = donationType === "funds"
      ? `₨ ${Number(amount).toLocaleString()} funds`
      : `${quantity} × ${item}`;
    createSystemLog(user.id, `Donation submitted: ${donationSummary}.`, "info");

    /* Notify target NGO directly, or all admins for general/emergency donations */
    const summary = donationType === "funds"
      ? `₨ ${Number(amount).toLocaleString()} in funds`
      : `${quantity} × ${item}`;
    const notifTitle   = "New Donation Received";
    const notifMessage = `A donor has submitted a donation of ${summary}.`;

    if (targetType === "ngo" && target) {
      await createNotification(target, "donation", notifTitle, notifMessage);
      emailNotify([target], `${notifTitle} — ResQNet`, notifMessage);
    } else {
      const { data: admins } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "admin");
      const adminIds = (admins ?? []).map((a) => a.id);
      await notifyMany(adminIds, "donation", notifTitle, notifMessage);
      emailNotify(adminIds, `${notifTitle} — ResQNet`, notifMessage);
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  /* ── Success screen ──────────────────────────────────────────────────── */
  if (submitted) {
    const summary = donationType === "funds"
      ? `₨ ${Number(amount).toLocaleString()}`
      : `${quantity} × ${item}`;

    return (
      <div className="flex flex-1 items-center justify-center p-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <Card padded className="flex flex-col items-center gap-5 text-center">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-resolved-light"
            >
              <CheckCircle2 className="h-8 w-8 text-resolved" />
            </motion.span>

            <div>
              <h2 className="text-xl font-bold text-text">Thank you!</h2>
              <p className="mt-1.5 text-sm text-text-secondary">
                Your donation of{" "}
                <span className="font-semibold text-text">{summary}</span>{" "}
                has been recorded. It will be deployed to those who need it most.
              </p>
            </div>

            <div className="flex items-start gap-2 rounded-lg border border-info/30 bg-info-light px-3 py-2 text-left">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-info" aria-hidden="true" />
              <p className="text-xs text-info-strong">
                This donation has been logged for transparency. No real payment was processed.
              </p>
            </div>

            <div className="flex w-full flex-col gap-2">
              <Button variant="primary" fullWidth onClick={() => router.push("/donor/my-donations")}>
                View my donations <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" fullWidth onClick={() => {
                setSubmitted(false);
                setAmount(""); setItem(""); setQuantity(""); setTarget("");
                setNotes(""); setCustomAmount(false); setErrors({});
              }}>
                Donate again
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  /* Current dropdown options label lookup */
  const currentNgoLabel = ngoOptions.find((n) => n.value === target)?.label;
  const currentEmLabel  = emergencyOptions.find((n) => n.value === target)?.label;

  /* ── Form ────────────────────────────────────────────────────────────── */
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <motion.div
        className="mx-auto max-w-2xl space-y-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Heading */}
        <motion.div variants={staggerItem}>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light">
              <Heart className="h-4 w-4 text-primary" aria-hidden="true" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-text">Make a Donation</h1>
          </div>
          <p className="text-sm text-text-secondary">
            Support verified emergencies with funds or essential items.
          </p>
        </motion.div>

        {/* Transparency disclaimer */}
        <motion.div variants={staggerItem}>
          <div className="flex items-start gap-3 rounded-xl border border-info/30 bg-info-light px-4 py-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-info" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-info-strong">Transparency notice</p>
              <p className="mt-0.5 text-sm text-info-strong/80">
                Donations are recorded for transparency. No real payment is processed in
                this prototype — no real payment is processed. Your submission is recorded in the database.
              </p>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">

          {/* Step 1: Donation type */}
          <motion.div variants={staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle>Donation Type</CardTitle>
                <CardDescription>Are you donating money or physical items?</CardDescription>
              </CardHeader>
              <div className="px-5 pb-5">
                <div className="flex gap-3">
                  <TypeTab value="funds" current={donationType} icon={Coins}
                    label="Funds" description="Monetary donation"
                    onSelect={handleTypeSwitch} />
                  <TypeTab value="items" current={donationType} icon={Package}
                    label="Items" description="Physical supplies"
                    onSelect={handleTypeSwitch} />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Step 2: Amount OR Item + Quantity */}
          <motion.div variants={staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle>
                  {donationType === "funds" ? "Donation Amount" : "Item Details"}
                </CardTitle>
                <CardDescription>
                  {donationType === "funds"
                    ? "Choose a suggested amount or enter a custom value."
                    : "Describe what you are donating and how many."}
                </CardDescription>
              </CardHeader>
              <div className="px-5 pb-5 space-y-4">
                <AnimatePresence mode="wait">
                  {donationType === "funds" ? (
                    <motion.div key="funds"
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
                      className="space-y-4">
                      <div>
                        <p className="mb-2 text-sm font-medium text-text">Quick select</p>
                        <div className="flex flex-wrap gap-2">
                          {SUGGESTED_AMOUNTS.map((a) => (
                            <AmountChip key={a.value} val={a.value} label={a.label}
                              current={customAmount ? "" : amount}
                              onSelect={selectAmount} />
                          ))}
                          <button
                            type="button"
                            onClick={() => { setCustomAmount(true); setAmount(""); }}
                            className={cn(
                              "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                              "focus-visible:outline-2 focus-visible:outline-primary",
                              customAmount
                                ? "border-primary bg-primary text-white"
                                : "border-border bg-surface text-text-secondary hover:bg-slate-50"
                            )}>
                            Custom
                          </button>
                        </div>
                      </div>
                      <AnimatePresence>
                        {(customAmount || !SUGGESTED_AMOUNTS.find((a) => a.value === amount)) && (
                          <motion.div key="custom-input"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}>
                            <Label htmlFor="don-amount" required>Amount (₨)</Label>
                            <Input id="don-amount" type="number" min="1"
                              placeholder="Enter amount in PKR"
                              value={customAmount ? amount : ""}
                              onChange={(e) => {
                                setAmount(e.target.value);
                                setErrors((er) => ({ ...er, amount: undefined }));
                              }}
                              error={errors.amount} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      {!customAmount && amount && (
                        <p className="text-sm font-medium text-primary">
                          Selected: ₨ {Number(amount).toLocaleString()}
                        </p>
                      )}
                      {errors.amount && !customAmount && (
                        <p className="text-xs text-critical-strong">{errors.amount}</p>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div key="items"
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
                      className="space-y-4">
                      <div>
                        <Label htmlFor="don-item" required>Item description</Label>
                        <Input id="don-item" placeholder="e.g. Blankets, First Aid Kits, Water bottles…"
                          value={item}
                          onChange={(e) => { setItem(e.target.value); setErrors((er) => ({ ...er, item: undefined })); }}
                          error={errors.item} />
                      </div>
                      <div className="w-40">
                        <Label htmlFor="don-qty" required>Quantity</Label>
                        <Input id="don-qty" type="number" min="1" placeholder="e.g. 50"
                          value={quantity}
                          onChange={(e) => { setQuantity(e.target.value); setErrors((er) => ({ ...er, quantity: undefined })); }}
                          error={errors.quantity} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>

          {/* Step 3: Target */}
          <motion.div variants={staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle>Donation Target</CardTitle>
                <CardDescription>
                  Optionally direct your donation to a specific NGO or emergency.
                </CardDescription>
              </CardHeader>
              <div className="px-5 pb-5 space-y-4">
                <div className="flex gap-2">
                  {[
                    { v: "",          label: "General fund" },
                    { v: "ngo",       label: "Specific NGO" },
                    { v: "emergency", label: "Specific emergency" },
                  ].map((opt) => (
                    <button key={opt.v} type="button"
                      onClick={() => { setTargetType(opt.v); setTarget(""); }}
                      className={cn(
                        "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                        "focus-visible:outline-2 focus-visible:outline-primary",
                        targetType === opt.v
                          ? "bg-primary text-white"
                          : "bg-slate-100 text-text-secondary hover:bg-slate-200"
                      )}>
                      {opt.label}
                    </button>
                  ))}
                </div>

                <AnimatePresence>
                  {targetType === "ngo" && (
                    <motion.div key="ngo-select"
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}>
                      <Label htmlFor="don-ngo">Select NGO</Label>
                      <Select id="don-ngo"
                        placeholder={optionsLoading ? "Loading NGOs…" : "Choose an NGO…"}
                        options={ngoOptions}
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        disabled={optionsLoading} />
                    </motion.div>
                  )}
                  {targetType === "emergency" && (
                    <motion.div key="em-select"
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}>
                      <Label htmlFor="don-em">Select Emergency</Label>
                      <Select id="don-em"
                        placeholder={optionsLoading ? "Loading emergencies…" : "Choose an emergency…"}
                        options={emergencyOptions}
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        disabled={optionsLoading} />
                    </motion.div>
                  )}
                  {targetType === "" && (
                    <motion.p key="general-note"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-xs text-text-secondary">
                      Your donation will go into the general relief fund and be allocated
                      where it is needed most.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>

          {/* Step 4: Notes */}
          <motion.div variants={staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle>Optional Notes</CardTitle>
                <CardDescription>Add a personal message or any special instructions.</CardDescription>
              </CardHeader>
              <div className="px-5 pb-5">
                <Textarea placeholder="e.g. Please prioritise children's needs…"
                  rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </Card>
          </motion.div>

          {/* Submit */}
          <motion.div variants={staggerItem}>
            <Card className="border-primary/20 bg-primary-light">
              <div className="p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-text">
                      {donationType === "funds" && amount
                        ? `Donating ₨ ${Number(amount).toLocaleString()}`
                        : donationType === "items" && item
                        ? `Donating ${quantity || "?"} × ${item}`
                        : "Ready to donate?"}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {targetType === "ngo" && target && currentNgoLabel
                        ? `To: ${currentNgoLabel}`
                        : targetType === "emergency" && target && currentEmLabel
                        ? `To: ${currentEmLabel}`
                        : "General relief fund"}
                    </p>
                  </div>
                  <Button type="submit" variant="primary" size="lg"
                    loading={submitting} className="shrink-0">
                    <Heart className="h-5 w-5" />
                    {submitting ? "Recording…" : "Submit donation"}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

        </form>
      </motion.div>
    </div>
  );
}
