"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, CheckCircle2 } from "lucide-react";
import AuthCard from "@/components/public/AuthCard";
import Input    from "@/components/ui/Input";
import Label    from "@/components/ui/Label";
import Button   from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

const EASE = [0.16, 1, 0.3, 1];

export default function ForgotPasswordPage() {
  const [loading, setSending] = useState(false);
  const [sent, setSent]       = useState(false);
  const [email, setEmail]     = useState("");
  const [error, setError]     = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSending(true);

    const supabase    = createClient();
    const redirectTo  = `${window.location.origin}/reset-password`;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    setSending(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSent(true);
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
          {!sent ? (
            <motion.div key="form" exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <AuthCard
                title="Forgot password?"
                description="Enter your email and we'll send a reset link."
                footer={
                  <Link href="/login" className="font-medium text-primary hover:text-primary-hover">
                    ← Back to login
                  </Link>
                }
              >
                <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                  {error && (
                    <p className="rounded-lg bg-critical-light px-3 py-2 text-sm text-critical-strong">
                      {error}
                    </p>
                  )}
                  <div>
                    <Label htmlFor="fp-email" required>Email address</Label>
                    <Input
                      id="fp-email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      leftIcon={<Mail className="h-4 w-4" />}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" variant="primary" fullWidth loading={loading}>
                    {loading ? "Sending…" : "Send reset link"}
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
                title="Check your email"
                description={`We sent a password reset link to ${email}.`}
                footer={
                  <Link href="/login" className="font-medium text-primary hover:text-primary-hover">
                    ← Back to login
                  </Link>
                }
              >
                <div className="flex flex-col items-center gap-4 py-2">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-resolved-light">
                    <CheckCircle2 className="h-7 w-7 text-resolved" />
                  </span>
                  <p className="text-center text-sm text-text-secondary">
                    Didn&apos;t receive it? Check your spam folder, or{" "}
                    <button
                      type="button"
                      onClick={() => setSent(false)}
                      className="font-medium text-primary hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-primary rounded"
                    >
                      try again
                    </button>
                    .
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
