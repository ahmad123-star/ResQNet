"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Phone, MapPin, Lock, Eye, EyeOff, CheckCircle2,
  Bell, Camera, Loader2, X,
} from "lucide-react";
import {
  Card, CardHeader, CardTitle, CardDescription, CardBody, CardFooter,
} from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";
import { useShell } from "@/lib/shellContext";
import { cn } from "@/lib/utils";
import { fadeInUp } from "@/lib/motion";
import { NOTIF_PREFS } from "@/lib/data/sharedData";
import { createClient } from "@/lib/supabase/client";

/* ── Inline save confirmation ────────────────────────────────────────────── */
function SaveConfirm({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.span
          initial={{ opacity: 0, x: 6 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-1.5 text-xs font-medium text-resolved-strong"
        >
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
          Saved
        </motion.span>
      )}
    </AnimatePresence>
  );
}

/* ── Notification toggle row ─────────────────────────────────────────────── */
function NotifRow({ pref, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-text">{pref.label}</p>
        <p className="mt-0.5 text-xs text-text-secondary">{pref.description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={pref.label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent",
          "transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          checked ? "bg-primary" : "bg-slate-200"
        )}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={cn(
            "inline-block h-4 w-4 rounded-full bg-white shadow",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}

/* ── Role label ──────────────────────────────────────────────────────────── */
const ROLE_META = {
  victim:    { label: "Victim",    color: "bg-critical-light text-critical-strong" },
  volunteer: { label: "Volunteer", color: "bg-pending-light text-pending-strong" },
  ngo:       { label: "NGO",       color: "bg-info-light text-info-strong" },
  admin:     { label: "Admin",     color: "bg-slate-100 text-text-secondary" },
  donor:     { label: "Donor",     color: "bg-resolved-light text-resolved-strong" },
};

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function ProfilePage() {
  const { user, role, avatarUrl, setAvatarUrl } = useShell();
  const toast = useToast();
  const fileRef = useRef(null);

  /* Profile fields */
  const [name,            setName]            = useState("");
  const [phone,           setPhone]           = useState("");
  const [location,        setLocation]        = useState("");
  const [profileLoading,  setProfileLoading]  = useState(true);
  const [savingProfile,   setSavingProfile]   = useState(false);
  const [savedProfile,    setSavedProfile]    = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  /* Password fields */
  const [currentPw,   setCurrentPw]  = useState("");
  const [newPw,       setNewPw]      = useState("");
  const [confirmPw,   setConfirmPw]  = useState("");
  const [showCurrent, setShowCurrent]= useState(false);
  const [showNew,     setShowNew]    = useState(false);
  const [pwErrors,    setPwErrors]   = useState({});
  const [savingPw,    setSavingPw]   = useState(false);
  const [savedPw,     setSavedPw]    = useState(false);

  /* Notification prefs */
  const defaultNotifState = Object.fromEntries(
    NOTIF_PREFS.map((p) => [p.id, p.id !== "weekly_digest"])
  );
  const [notifState,  setNotifState]  = useState(defaultNotifState);
  const [savingNotif, setSavingNotif] = useState(false);
  const [savedNotif,  setSavedNotif]  = useState(false);

  /* Load profile from DB */
  useEffect(() => {
    if (!user?.id) return;
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("name, phone, address")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setName(data.name ?? "");
          setPhone(data.phone ?? "");
          setLocation(data.address ?? "");
        }
        setProfileLoading(false);
      });
  }, [user?.id]);

  /* Load notification prefs from localStorage */
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("notif_prefs") ?? "null");
      if (saved) setNotifState(saved);
    } catch {}
  }, []);

  /* Save profile to DB */
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!user?.id) return;
    setSavingProfile(true);
    setSavedProfile(false);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ name: name.trim(), phone: phone.trim(), address: location.trim() })
      .eq("id", user.id);
    setSavingProfile(false);
    if (error) {
      toast.error("Save failed", { description: error.message });
    } else {
      setSavedProfile(true);
      toast.success("Profile updated");
      setTimeout(() => setSavedProfile(false), 3000);
    }
  };

  /* Upload avatar to Supabase Storage */
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large", { description: "Maximum size is 5 MB." });
      return;
    }
    setUploadingAvatar(true);
    const supabase = createClient();
    const ext  = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) {
      toast.error("Upload failed", { description: uploadError.message });
      setUploadingAvatar(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);
    setAvatarUrl(publicUrl);
    setUploadingAvatar(false);
    toast.success("Profile photo updated");
    e.target.value = "";
  };

  /* Delete avatar from storage + clear DB */
  const handleDeleteAvatar = async () => {
    if (!avatarUrl || !user?.id) return;
    setUploadingAvatar(true);
    const supabase = createClient();
    // Extract the storage path from the public URL (everything after "/avatars/")
    const storagePath = avatarUrl.split("/avatars/")[1];
    if (storagePath) {
      await supabase.storage.from("avatars").remove([storagePath]);
    }
    await supabase.from("profiles").update({ avatar_url: null }).eq("id", user.id);
    setAvatarUrl(null);
    setUploadingAvatar(false);
    toast.success("Profile photo removed");
  };

  /* Change password via Supabase Auth */
  const handleSavePw = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!currentPw)          errs.currentPw  = "Enter your current password.";
    if (newPw.length < 8)    errs.newPw      = "At least 8 characters.";
    if (newPw !== confirmPw) errs.confirmPw  = "Passwords do not match.";
    if (Object.keys(errs).length) { setPwErrors(errs); return; }
    setPwErrors({});
    setSavingPw(true);
    setSavedPw(false);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setSavingPw(false);
    if (error) {
      toast.error("Password change failed", { description: error.message });
    } else {
      setSavedPw(true);
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      toast.success("Password changed");
      setTimeout(() => setSavedPw(false), 3000);
    }
  };

  /* Save notification prefs to localStorage */
  const handleSaveNotif = () => {
    localStorage.setItem("notif_prefs", JSON.stringify(notifState));
    setSavingNotif(true);
    setSavedNotif(false);
    setTimeout(() => {
      setSavingNotif(false);
      setSavedNotif(true);
      toast.success("Notification preferences saved");
      setTimeout(() => setSavedNotif(false), 3000);
    }, 400);
  };

  const roleMeta    = ROLE_META[role] || ROLE_META.victim;
  const displayName = name || user?.name || "—";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl space-y-6">

        {/* Heading */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible">
          <h1 className="text-2xl font-bold tracking-tight text-text">Profile & Settings</h1>
          <p className="mt-0.5 text-sm text-text-secondary">
            Manage your personal information and account preferences.
          </p>
        </motion.div>

        {/* Avatar + role badge */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.05 }}>
          <Card padded>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <div className="relative shrink-0">
                <Avatar src={avatarUrl} name={displayName} size="lg" className="h-20! w-20! text-xl!" />
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                {/* Upload / change button */}
                <button type="button"
                  aria-label="Change profile picture"
                  disabled={uploadingAvatar}
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface bg-slate-100 text-text-secondary transition-colors hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-60">
                  {uploadingAvatar
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    : <Camera className="h-3.5 w-3.5" aria-hidden="true" />}
                </button>
                {/* Remove button — only shown when a photo is set */}
                {avatarUrl && (
                  <button type="button"
                    aria-label="Remove profile picture"
                    disabled={uploadingAvatar}
                    onClick={handleDeleteAvatar}
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-surface bg-critical-light text-critical-strong transition-colors hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-60">
                    <X className="h-2.5 w-2.5" aria-hidden="true" />
                  </button>
                )}
              </div>
              <div className="text-center sm:text-left">
                <p className="text-lg font-bold text-text">{displayName}</p>
                <p className="text-sm text-text-secondary">{user?.email ?? "—"}</p>
                <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
                    roleMeta.color
                  )}>
                    {roleMeta.label}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-resolved-light px-2.5 py-1 text-xs font-medium text-resolved-strong">
                    <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                    Verified
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Profile info form */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.08 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-text-secondary" aria-hidden="true" />
                <CardTitle>Personal Information</CardTitle>
              </div>
              <CardDescription>Update your name, contact details and location.</CardDescription>
            </CardHeader>
            <CardBody>
              <form id="profile-form" onSubmit={handleSaveProfile} className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="pf-name" required>Full name</Label>
                  <Input id="pf-name" value={name} disabled={profileLoading}
                    leftIcon={<User className="h-4 w-4" />}
                    onChange={(e) => { setName(e.target.value); setSavedProfile(false); }} />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="pf-email">Email</Label>
                  <Input id="pf-email" type="email" value={user?.email ?? ""}
                    leftIcon={<Mail className="h-4 w-4" />}
                    readOnly
                    className="opacity-60 cursor-not-allowed" />
                  <p className="mt-1 text-xs text-text-secondary">Email is managed by your account and cannot be changed here.</p>
                </div>
                <div>
                  <Label htmlFor="pf-phone">Phone</Label>
                  <Input id="pf-phone" type="tel" value={phone} disabled={profileLoading}
                    leftIcon={<Phone className="h-4 w-4" />}
                    onChange={(e) => { setPhone(e.target.value); setSavedProfile(false); }} />
                </div>
                <div>
                  <Label htmlFor="pf-loc">Location / City</Label>
                  <Input id="pf-loc" value={location} disabled={profileLoading}
                    leftIcon={<MapPin className="h-4 w-4" />}
                    onChange={(e) => { setLocation(e.target.value); setSavedProfile(false); }} />
                </div>
              </form>
            </CardBody>
            <CardFooter className="justify-between">
              <SaveConfirm show={savedProfile} />
              <Button type="submit" form="profile-form" variant="primary"
                size="sm" loading={savingProfile} disabled={profileLoading} className="ml-auto">
                {savingProfile ? "Saving…" : "Save changes"}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Change password */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.11 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-text-secondary" aria-hidden="true" />
                <CardTitle>Change Password</CardTitle>
              </div>
              <CardDescription>Use a strong password of at least 8 characters.</CardDescription>
            </CardHeader>
            <CardBody>
              <form id="pw-form" onSubmit={handleSavePw} className="space-y-4" noValidate>
                <div className="relative">
                  <Label htmlFor="pf-cpw" required>Current password</Label>
                  <Input id="pf-cpw" type={showCurrent ? "text" : "password"}
                    autoComplete="current-password" placeholder="••••••••"
                    leftIcon={<Lock className="h-4 w-4" />}
                    value={currentPw}
                    onChange={(e) => { setCurrentPw(e.target.value); setPwErrors((er) => ({ ...er, currentPw: undefined })); }}
                    error={pwErrors.currentPw} />
                  <button type="button"
                    onClick={() => setShowCurrent((v) => !v)}
                    aria-label={showCurrent ? "Hide password" : "Show password"}
                    className="absolute right-3 top-8 text-text-secondary hover:text-text focus-visible:outline-2 focus-visible:outline-primary rounded">
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="relative">
                    <Label htmlFor="pf-npw" required>New password</Label>
                    <Input id="pf-npw" type={showNew ? "text" : "password"}
                      autoComplete="new-password" placeholder="Min. 8 characters"
                      leftIcon={<Lock className="h-4 w-4" />}
                      value={newPw}
                      onChange={(e) => { setNewPw(e.target.value); setPwErrors((er) => ({ ...er, newPw: undefined })); }}
                      error={pwErrors.newPw} />
                    <button type="button"
                      onClick={() => setShowNew((v) => !v)}
                      aria-label={showNew ? "Hide password" : "Show password"}
                      className="absolute right-3 top-8 text-text-secondary hover:text-text focus-visible:outline-2 focus-visible:outline-primary rounded">
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  <div>
                    <Label htmlFor="pf-cfpw" required>Confirm new password</Label>
                    <Input id="pf-cfpw" type="password"
                      autoComplete="new-password" placeholder="Repeat password"
                      leftIcon={<Lock className="h-4 w-4" />}
                      value={confirmPw}
                      onChange={(e) => { setConfirmPw(e.target.value); setPwErrors((er) => ({ ...er, confirmPw: undefined })); }}
                      error={pwErrors.confirmPw} />
                  </div>
                </div>

                {newPw.length > 0 && (
                  <div className="flex items-center gap-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className={cn(
                        "h-1 flex-1 rounded-full transition-colors",
                        newPw.length >= (i + 1) * 2
                          ? newPw.length < 6 ? "bg-primary"
                          : newPw.length < 10 ? "bg-pending"
                          : "bg-resolved"
                          : "bg-border"
                      )} />
                    ))}
                    <p className="text-xs text-text-secondary">
                      {newPw.length < 6 ? "Weak" : newPw.length < 10 ? "Fair" : "Strong"}
                    </p>
                  </div>
                )}
              </form>
            </CardBody>
            <CardFooter className="justify-between">
              <SaveConfirm show={savedPw} />
              <Button type="submit" form="pw-form" variant="secondary"
                size="sm" loading={savingPw} className="ml-auto">
                {savingPw ? "Updating…" : "Update password"}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Notification preferences */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.14 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-text-secondary" aria-hidden="true" />
                <CardTitle>Notification Preferences</CardTitle>
              </div>
              <CardDescription>Choose which notifications you receive. Saved locally on this device.</CardDescription>
            </CardHeader>
            <CardBody>
              <ul className="divide-y divide-border">
                {NOTIF_PREFS.map((pref) => (
                  <li key={pref.id}>
                    <NotifRow
                      pref={pref}
                      checked={notifState[pref.id] ?? true}
                      onChange={(val) => {
                        setNotifState((p) => ({ ...p, [pref.id]: val }));
                        setSavedNotif(false);
                      }}
                    />
                  </li>
                ))}
              </ul>
            </CardBody>
            <CardFooter className="justify-between">
              <SaveConfirm show={savedNotif} />
              <Button variant="secondary" size="sm" loading={savingNotif}
                onClick={handleSaveNotif} className="ml-auto">
                {savingNotif ? "Saving…" : "Save preferences"}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}
