"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, CheckCircle2 } from "lucide-react";
import AuthCard from "@/components/public/AuthCard";
import Input    from "@/components/ui/Input";
import Label    from "@/components/ui/Label";
import Button   from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

const EASE = [0.16, 1, 0.3, 1];

export default function ResetPasswordPage() {
  const router = useRouter();
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);
  const [pw, setPw]             = useState("");
  const [cpw, setCpw]           = useState("");
  const [mismatch, setMismatch] = useState(false);
  const [error, setError]       = useState("");

  // Supabase lands the user here with a session established from the email link.
  // updateUser() sets the new password for the active session.
  async function handleSubmit(e) {
    e.preventDefault();
    if (pw !== cpw) { setMismatch(true); return; }
    setMismatch(false);
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password: pw });

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setDone(true);
    // Give the user 2 s to read the success screen then send them to login.
    setTimeout(() => router.push("/login"), 2000);
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: EASE }}
        className="w-full max-w-sm"
      >
        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div key="form" exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <AuthCard
                title="Set new password"
                description="Choose a strong password for your account."
              >
                <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                  {error && (
                    <p className="rounded-lg bg-critical-light px-3 py-2 text-sm text-critical-strong">
                      {error}
                    </p>
                  )}
                  <div>
                    <Label htmlFor="rp-pw" required>New password</Label>
                    <Input
                      id="rp-pw" type="password" autoComplete="new-password"
                      placeholder="At least 8 characters"
                      leftIcon={<Lock className="h-4 w-4" />}
                      value={pw}
                      onChange={(e) => setPw(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="rp-cpw" required>Confirm new password</Label>
                    <Input
                      id="rp-cpw" type="password" autoComplete="new-password"
                      placeholder="Repeat password"
                      leftIcon={<Lock className="h-4 w-4" />}
                      value={cpw}
                      onChange={(e) => { setCpw(e.target.value); setMismatch(false); }}
                      error={mismatch ? "Passwords do not match." : undefined}
                      required
                    />
                  </div>
                  <Button type="submit" variant="primary" fullWidth loading={loading}>
                    {loading ? "Updating…" : "Update password"}
                  </Button>
                </form>
              </AuthCard>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <AuthCard
                title="Password updated"
                description="Your password has been changed successfully."
                footer={
                  <Link href="/login" className="font-medium text-primary hover:text-primary-hover">
                    Go to login →
                  </Link>
                }
              >
                <div className="flex flex-col items-center gap-3 py-2">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-resolved-light">
                    <CheckCircle2 className="h-7 w-7 text-resolved" />
                  </span>
                  <p className="text-center text-sm text-text-secondary">
                    You can now log in with your new password.
                  </p>
                </div>
              </AuthCard>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
