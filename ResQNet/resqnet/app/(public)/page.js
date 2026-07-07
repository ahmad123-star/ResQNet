"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Heart,
  Building2,
  Users,
  ArrowRight,
  Phone,
  MapPin,
  Clock,
  Shield,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { staggerContainer, staggerItem, fadeInUp } from "@/lib/motion";

/* ─── Animation helpers ───────────────────────────────────────────────────── */

const EASE = [0.16, 1, 0.3, 1];

/* ─── "How it works" role cards ──────────────────────────────────────────── */

const ROLE_CARDS = [
  {
    icon: AlertTriangle,
    role: "Victim",
    color: "bg-critical-light text-critical-strong",
    iconColor: "text-critical",
    title: "Report & track",
    description:
      "Submit an emergency report in seconds. Get real-time updates as responders mobilise and track your case to resolution.",
    cta: "Report an emergency",
    href: "/register?role=victim",
  },
  {
    icon: Users,
    role: "Volunteer",
    color: "bg-pending-light text-pending-strong",
    iconColor: "text-pending",
    title: "Respond & help",
    description:
      "See nearby emergencies on a live map. Accept tasks matched to your skills and coordinate with NGOs on the ground.",
    cta: "Join as volunteer",
    href: "/register?role=volunteer",
  },
  {
    icon: Building2,
    role: "NGO",
    color: "bg-info-light text-info-strong",
    iconColor: "text-info",
    title: "Coordinate & deploy",
    description:
      "Manage resources, assign volunteers, and generate reports. One dashboard for the full lifecycle of every emergency.",
    cta: "Register your NGO",
    href: "/register?role=ngo",
  },
  {
    icon: Heart,
    role: "Donor",
    color: "bg-resolved-light text-resolved-strong",
    iconColor: "text-resolved",
    title: "Fund & support",
    description:
      "Donate to verified emergencies or standing relief funds. Track exactly how and where your contribution is deployed.",
    cta: "Start donating",
    href: "/register?role=donor",
  },
];

/* ─── Stats ──────────────────────────────────────────────────────────────── */

const STATS = [
  { value: "2 min", label: "Average response time" },
  { value: "10k+", label: "Emergencies resolved" },
  { value: "500+", label: "Active volunteers" },
  { value: "50+", label: "Partner NGOs" },
];

/* ─── Features strip ─────────────────────────────────────────────────────── */

const FEATURES = [
  { icon: Phone,   text: "One-tap emergency reporting" },
  { icon: MapPin,  text: "Real-time responder tracking" },
  { icon: Clock,   text: "24/7 coordination dashboard" },
  { icon: Shield,  text: "Verified volunteers & NGOs" },
];

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <div className="flex flex-col">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-surface">

        {/* Soft red decorative blob — purely visual */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 right-0 h-[520px] w-[520px] rounded-full bg-primary/5 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full bg-primary/4 blur-2xl"
        />

        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:py-36">
          <div className="flex flex-col items-center text-center">

            {/* Pill label */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-light px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-critical-strong">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Community emergency response
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.45, ease: EASE }}
              className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-text sm:text-5xl lg:text-6xl"
            >
              Fast community response{" "}
              <span className="text-primary">when every second matters</span>
            </motion.h1>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16, duration: 0.4, ease: EASE }}
              className="mt-5 max-w-xl text-lg text-text-secondary"
            >
              ResQNet connects victims, volunteers, NGOs, and donors on a single
              platform — turning community response from minutes to seconds.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24, duration: 0.38, ease: EASE }}
              className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
            >
              <Link
                href="/register?role=victim"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-base font-medium text-white shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                Report Emergency
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-surface px-6 text-base font-medium text-text transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center gap-1.5 rounded-xl bg-transparent px-6 text-base font-medium text-text transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Register free <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </motion.div>

            {/* Trust line */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.38, duration: 0.4 }}
              className="mt-5 text-xs text-text-secondary"
            >
              Free for victims &amp; volunteers · Trusted by 50+ NGOs
            </motion.p>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ───────────────────────────────────────────────────── */}
      <section className="border-y border-border bg-slate-50">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-y divide-border md:grid-cols-4 md:divide-y-0"
        >
          {STATS.map(({ value, label }) => (
            <motion.div
              key={label}
              variants={staggerItem}
              className="flex flex-col items-center justify-center gap-0.5 px-6 py-8"
            >
              <span className="text-3xl font-bold text-primary">{value}</span>
              <span className="text-center text-sm text-text-secondary">{label}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── FEATURES STRIP ────────────────────────────────────────────────── */}
      <section className="bg-surface">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mx-auto flex max-w-6xl flex-wrap justify-center gap-4 px-4 py-10 sm:px-6"
        >
          {FEATURES.map(({ icon: Icon, text }) => (
            <motion.div
              key={text}
              variants={staggerItem}
              className="flex items-center gap-2.5 rounded-xl border border-border bg-surface px-4 py-3 shadow-sm"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-light">
                <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
              </span>
              <span className="text-sm font-medium text-text">{text}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">

          {/* Section heading */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="mb-10 text-center"
          >
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              How it works
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-text sm:text-4xl">
              One platform, every role
            </h2>
            <p className="mt-3 mx-auto max-w-xl text-base text-text-secondary">
              Whether you need help, want to give it, or manage the whole
              operation — ResQNet has a tailored experience for you.
            </p>
          </motion.div>

          {/* Role cards */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {ROLE_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <motion.div key={card.role} variants={staggerItem}>
                  <Card className="group flex h-full flex-col p-6 transition-shadow duration-200 hover:shadow-md">
                    {/* Role badge */}
                    <span
                      className={cn(
                        "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                        card.color
                      )}
                    >
                      <Icon className={cn("h-3.5 w-3.5", card.iconColor)} aria-hidden="true" />
                      {card.role}
                    </span>

                    {/* Icon circle */}
                    <div className="mt-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light">
                      <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                    </div>

                    <h3 className="mt-4 text-lg font-semibold text-text">{card.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-text-secondary">
                      {card.description}
                    </p>

                    <Link
                      href={card.href}
                      className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-primary rounded"
                    >
                      {card.cta}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────────── */}
      <section className="bg-primary py-14">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-4 text-center sm:px-6"
        >
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready when emergencies aren&apos;t
          </h2>
          <p className="text-base text-white/80">
            Join thousands of community members already coordinating on ResQNet.
            Sign up free — no credit card required.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 text-base font-medium text-primary transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Create free account
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-white/40 bg-transparent px-6 text-base font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Log in
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">

            {/* Brand */}
            <div className="flex flex-col items-center gap-2 sm:items-start">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
                  R
                </span>
                <span className="font-bold tracking-tight text-text">
                  Res<span className="text-primary">Q</span>Net
                </span>
              </div>
              <p className="max-w-xs text-center text-xs text-text-secondary sm:text-left">
                Fast community emergency response. Connecting help with those who need it.
              </p>
            </div>

            {/* Links */}
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-text-secondary sm:justify-end">
              <Link href="/login"    className="transition-colors hover:text-primary">Login</Link>
              <Link href="/register" className="transition-colors hover:text-primary">Register</Link>
              <Link href="/register?role=victim" className="font-medium text-primary transition-colors hover:text-primary-hover">Report Emergency</Link>
            </nav>
          </div>

          <div className="mt-8 border-t border-border pt-6 text-center text-xs text-text-secondary">
            © {new Date().getFullYear()} ResQNet · Final Year Project · All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
