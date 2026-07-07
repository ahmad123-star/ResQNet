"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock } from "lucide-react";
import AuthCard  from "@/components/public/AuthCard";
import Input     from "@/components/ui/Input";
import Label     from "@/components/ui/Label";
import Button    from "@/components/ui/Button";
import Checkbox  from "@/components/ui/Checkbox";
import { createClient } from "@/lib/supabase/client";
import { createSystemLog } from "@/lib/systemLog";

const EASE = [0.16, 1, 0.3, 1];

function LoginForm() {
  const router  = useRouter();
  const params  = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(
    params.get("blocked") ? "Your account has been blocked. Please contact support." : ""
  );

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const fd       = new FormData(e.target);
    const email    = fd.get("email");
    const password = fd.get("password");

    const supabase = createClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    // Fetch profile to get role and blocked status.
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, blocked")
      .eq("id", user.id)
      .single();

    if (profileError) {
      // Profile missing or RLS blocked the read — show a clear error rather
      // than silently falling back to a wrong role.
      console.error("Profile fetch failed:", profileError);
      setError("Could not load your account profile. Please contact support.");
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    if (profile.blocked) {
      await supabase.auth.signOut();
      setError("Your account has been blocked. Please contact support.");
      setLoading(false);
      return;
    }

    createSystemLog(user.id, "User logged in.", "info");
    router.push(`/${profile.role}/dashboard`);
    router.refresh();
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
          title="Welcome back"
          description="Log in to your ResQNet account."
          footer={
            <>
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-medium text-primary hover:text-primary-hover">
                Register
              </Link>
            </>
          }
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            {error && (
              <p className="rounded-lg bg-critical-light px-3 py-2 text-sm text-critical-strong">
                {error}
              </p>
            )}

            <div>
              <Label htmlFor="login-email" required>Email address</Label>
              <Input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                leftIcon={<Mail className="h-4 w-4" />}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password" required>Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-primary hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-primary rounded"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                leftIcon={<Lock className="h-4 w-4" />}
                required
              />
            </div>

            <Checkbox id="remember" label="Remember me for 30 days" defaultChecked />

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              loading={loading}
              className="mt-1"
            >
              {loading ? "Signing in…" : "Log in"}
            </Button>
          </form>
        </AuthCard>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
