"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { User, Mail, Phone, Lock, MapPin } from "lucide-react";
import AuthCard  from "@/components/public/AuthCard";
import Input     from "@/components/ui/Input";
import Label     from "@/components/ui/Label";
import Select    from "@/components/ui/Select";
import Button    from "@/components/ui/Button";
import Checkbox  from "@/components/ui/Checkbox";
import { createClient } from "@/lib/supabase/client";
import { createSystemLog } from "@/lib/systemLog";

const EASE = [0.16, 1, 0.3, 1];

const ROLE_OPTIONS = [
  { value: "victim",    label: "Victim — I need help" },
  { value: "volunteer", label: "Volunteer — I want to help" },
  { value: "ngo",       label: "NGO — We coordinate response" },
  { value: "donor",     label: "Donor — I want to contribute" },
];

const ROLE_HINTS = {
  victim:    "You'll be able to report emergencies and track their resolution.",
  volunteer: "You'll see nearby emergencies and accept tasks matched to your skills.",
  ngo:       "You'll manage resources, assign volunteers and generate reports.",
  donor:     "You'll donate to verified emergencies and track your contributions.",
};

function RegisterForm() {
  const params      = useSearchParams();
  const router      = useRouter();
  const defaultRole = params.get("role") || "";

  const [loading, setLoading] = useState(false);
  const [role, setRole]       = useState(defaultRole);
  const [agreed, setAgreed]   = useState(false);
  const [errors, setErrors]   = useState({});
  const [serverError, setServerError] = useState("");

  const validate = (data) => {
    const e = {};
    if (!data.name.trim())        e.name     = "Full name is required.";
    if (!data.email.trim())       e.email    = "Email is required.";
    if (!data.phone.trim())       e.phone    = "Phone number is required.";
    if (data.password.length < 8) e.password = "Password must be at least 8 characters.";
    if (!data.role)               e.role     = "Please select your role.";
    if (!data.location.trim())    e.location = "Location is required.";
    if (!agreed)                  e.agreed   = "You must accept the terms.";
    return e;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    const fd = new FormData(e.target);
    const data = {
      name:     fd.get("name"),
      email:    fd.get("email"),
      phone:    fd.get("phone"),
      password: fd.get("password"),
      role,
      location: fd.get("location"),
    };

    const errs = validate(data);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email:    data.email,
      password: data.password,
      options: {
        data: {
          name:  data.name,
          phone: data.phone,
          role:  data.role,
        },
      },
    });

    if (error) {
      setServerError(error.message);
      setLoading(false);
      return;
    }

    // If Supabase email confirmation is enabled the user must verify first.
    // If it's disabled they are signed in immediately and we redirect to dashboard.
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      createSystemLog(session.user.id, `New user registered as ${data.role}.`, "info");
      router.push(`/${data.role}/dashboard`);
      router.refresh();
    } else {
      router.push("/verify-email");
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: EASE }}
        className="w-full max-w-md"
      >
        <AuthCard
          wide
          title="Create your account"
          description="Join ResQNet to report, respond, or support emergencies."
          footer={
            <>
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:text-primary-hover">
                Log in
              </Link>
            </>
          }
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            {serverError && (
              <p className="rounded-lg bg-critical-light px-3 py-2 text-sm text-critical-strong">
                {serverError}
              </p>
            )}

            {/* Full name */}
            <div>
              <Label htmlFor="reg-name" required>Full name</Label>
              <Input
                id="reg-name" name="name" type="text" autoComplete="name"
                placeholder="Jane Doe"
                leftIcon={<User className="h-4 w-4" />}
                error={errors.name}
                onChange={() => setErrors((e) => ({ ...e, name: undefined }))}
                required
              />
            </div>

            {/* Email + Phone */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="reg-email" required>Email</Label>
                <Input
                  id="reg-email" name="email" type="email" autoComplete="email"
                  placeholder="you@example.com"
                  leftIcon={<Mail className="h-4 w-4" />}
                  error={errors.email}
                  onChange={() => setErrors((e) => ({ ...e, email: undefined }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="reg-phone" required>Phone</Label>
                <Input
                  id="reg-phone" name="phone" type="tel" autoComplete="tel"
                  placeholder="+92 300 0000000"
                  leftIcon={<Phone className="h-4 w-4" />}
                  error={errors.phone}
                  onChange={() => setErrors((e) => ({ ...e, phone: undefined }))}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="reg-password" required>Password</Label>
              <Input
                id="reg-password" name="password" type="password" autoComplete="new-password"
                placeholder="At least 8 characters"
                leftIcon={<Lock className="h-4 w-4" />}
                error={errors.password}
                onChange={() => setErrors((e) => ({ ...e, password: undefined }))}
                required
              />
            </div>

            {/* Role */}
            <div>
              <Label htmlFor="reg-role" required>I am a…</Label>
              <Select
                id="reg-role" name="role"
                placeholder="Select your role"
                options={ROLE_OPTIONS}
                value={role}
                onChange={(e) => { setRole(e.target.value); setErrors((er) => ({ ...er, role: undefined })); }}
                error={errors.role}
                required
              />
              {role && ROLE_HINTS[role] && (
                <motion.p
                  key={role}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1.5 text-xs text-text-secondary"
                >
                  {ROLE_HINTS[role]}
                </motion.p>
              )}
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="reg-location" required>Location / City</Label>
              <Input
                id="reg-location" name="location" type="text"
                placeholder="Karachi, Lahore, Islamabad…"
                leftIcon={<MapPin className="h-4 w-4" />}
                error={errors.location}
                onChange={() => setErrors((e) => ({ ...e, location: undefined }))}
                required
              />
            </div>

            {/* Terms */}
            <div>
              <Checkbox
                id="reg-terms"
                checked={agreed}
                onChange={(e) => { setAgreed(e.target.checked); setErrors((er) => ({ ...er, agreed: undefined })); }}
                label={
                  <span>
                    I agree to the{" "}
                    <Link href="/terms" target="_blank" className="font-medium text-primary hover:text-primary-hover">Terms of Service</Link>
                    {" "}and{" "}
                    <Link href="/privacy" target="_blank" className="font-medium text-primary hover:text-primary-hover">Privacy Policy</Link>
                  </span>
                }
              />
              {errors.agreed && (
                <p className="mt-1.5 text-xs text-critical-strong">{errors.agreed}</p>
              )}
            </div>

            <Button type="submit" variant="primary" size="md" fullWidth loading={loading} className="mt-1">
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>
        </AuthCard>
      </motion.div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
