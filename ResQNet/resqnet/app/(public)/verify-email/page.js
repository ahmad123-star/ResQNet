"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MailOpen, RefreshCcw } from "lucide-react";
import AuthCard from "@/components/public/AuthCard";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

const EASE = [0.16, 1, 0.3, 1];

export default function VerifyEmailPage() {
  const [resending, setResending] = useState(false);
  const [resent, setResent]       = useState(false);

  async function handleResend() {
    setResending(true);
    setResent(false);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      await supabase.auth.resend({ type: "signup", email: user.email });
    }
    setResending(false);
    setResent(true);
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: EASE }}
        className="w-full max-w-sm"
      >
        <AuthCard
          title="Check your inbox"
          description="We've sent a verification link to your email address."
          footer={
            <>
              Wrong email?{" "}
              <Link href="/register" className="font-medium text-primary hover:text-primary-hover">
                Go back to register
              </Link>
            </>
          }
        >
          <div className="flex flex-col items-center gap-5 py-2">
            {/* Animated envelope */}
            <motion.span
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light"
            >
              <MailOpen className="h-8 w-8 text-primary" aria-hidden="true" />
            </motion.span>

            <div className="space-y-2 text-center">
              <p className="text-sm text-text-secondary">
                Click the link in your email to verify your account. It expires
                in <span className="font-medium text-text">24 hours</span>.
              </p>
              <p className="text-sm text-text-secondary">
                Be sure to check your <span className="font-medium text-text">spam folder</span> if
                it doesn&apos;t appear within a minute.
              </p>
            </div>

            {/* Resent confirmation */}
            {resent && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-resolved-light px-3 py-2 text-xs font-medium text-resolved-strong"
              >
                ✓ Verification email resent successfully.
              </motion.p>
            )}

            <Button
              variant="outline"
              fullWidth
              loading={resending}
              onClick={handleResend}
            >
              <RefreshCcw className="h-4 w-4" />
              {resending ? "Resending…" : "Resend verification email"}
            </Button>
          </div>
        </AuthCard>
      </motion.div>
    </div>
  );
}
