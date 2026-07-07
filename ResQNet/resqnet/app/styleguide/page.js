"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Trash2,
  Pencil,
  Inbox,
  Bell,
  MapPin,
} from "lucide-react";

import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";

import Button from "@/components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBody,
  CardFooter,
} from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Checkbox from "@/components/ui/Checkbox";
import StatusBadge from "@/components/ui/StatusBadge";
import Avatar from "@/components/ui/Avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import {
  Dropdown,
  DropdownItem,
  DropdownSeparator,
} from "@/components/ui/Dropdown";
import Tooltip from "@/components/ui/Tooltip";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import Table from "@/components/ui/Table";
import Spinner from "@/components/ui/Spinner";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { useToast } from "@/components/ui/Toast";

/* ---- Small helpers used only on this page ---- */

// A labelled section wrapper with a consistent heading.
function Section({ id, title, description, children }) {
  return (
    <motion.section
      id={id}
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="scroll-mt-24"
    >
      <div className="mb-5">
        <h2 className="text-xl font-semibold tracking-tight text-text">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-text-secondary">{description}</p>
        )}
      </div>
      {children}
    </motion.section>
  );
}

// A swatch tile for the colour palette.
function Swatch({ name, varName, hex, text = "text-white" }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div
        className={`flex h-20 items-end p-3 ${text}`}
        style={{ background: `var(${varName})` }}
      >
        <span className="text-xs font-medium">{name}</span>
      </div>
      <div className="flex items-center justify-between px-3 py-2">
        <code className="text-xs text-text-secondary">{varName}</code>
        <code className="text-xs font-medium text-text">{hex}</code>
      </div>
    </div>
  );
}

const TABLE_COLUMNS = [
  { key: "id", header: "ID" },
  { key: "location", header: "Location" },
  {
    key: "status",
    header: "Status",
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: "actions",
    header: "",
    align: "right",
    render: () => (
      <Button variant="ghost" size="sm">
        View
      </Button>
    ),
  },
];

const TABLE_DATA = [
  { id: "#1042", location: "Sector 7 — Riverside", status: "critical" },
  { id: "#1041", location: "Downtown Depot", status: "pending" },
  { id: "#1038", location: "North Bridge", status: "resolved" },
  { id: "#1035", location: "Harbour Gate", status: "info" },
];

export default function StyleguidePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const toast = useToast();

  // Briefly show the full-screen loader so it can be reviewed.
  const previewLoader = () => {
    setShowLoader(true);
    setTimeout(() => setShowLoader(false), 2600);
  };

  // Demo the button loading state.
  const previewButtonLoading = () => {
    setLoadingBtn(true);
    setTimeout(() => setLoadingBtn(false), 1800);
  };

  return (
    <div className="min-h-screen bg-background">
      {showLoader && <LoadingScreen label="Connecting to ResQNet…" />}

      {/* Header */}
      <header className="border-b border-border bg-surface/80 backdrop-blur supports-[backdrop-filter]:bg-surface/60 sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white shadow-sm">
              R
            </span>
            <div>
              <p className="text-base font-bold tracking-tight text-text">
                Res<span className="text-primary">Q</span>Net
              </p>
              <p className="-mt-0.5 text-xs text-text-secondary">
                Design system
              </p>
            </div>
          </div>
          <Dropdown
            align="right"
            trigger={
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4" /> Notifications
              </Button>
            }
          >
            <DropdownItem>Mark all as read</DropdownItem>
            <DropdownItem>Notification settings</DropdownItem>
            <DropdownSeparator />
            <DropdownItem destructive icon={Trash2}>
              Clear all
            </DropdownItem>
          </Dropdown>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-16 px-6 py-12">
        {/* Intro */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-light px-3 py-1 text-xs font-medium text-critical-strong">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Emergency response UI kit
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-text">
            ResQNet Component Library
          </h1>
          <p className="mt-2 max-w-2xl text-base text-text-secondary">
            Every reusable component, colour token and status style in one
            place. Calm-but-urgent, accessible, and built mobile-first.
          </p>
        </motion.div>

        {/* Colours */}
        <Section
          title="Colour palette"
          description="Red used purposefully on white / light-grey surfaces."
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <Swatch name="Primary" varName="--color-primary" hex="#C81E1E" />
            <Swatch name="Primary hover" varName="--color-primary-hover" hex="#991B1B" />
            <Swatch name="Primary light" varName="--color-primary-light" hex="#FCEAEA" text="text-critical-strong" />
            <Swatch name="Background" varName="--color-background" hex="#F8FAFC" text="text-text" />
            <Swatch name="Surface" varName="--color-surface" hex="#FFFFFF" text="text-text" />
            <Swatch name="Border" varName="--color-border" hex="#E2E8F0" text="text-text" />
            <Swatch name="Text" varName="--color-text" hex="#0F172A" />
            <Swatch name="Text secondary" varName="--color-text-secondary" hex="#64748B" />
            <Swatch name="Critical" varName="--color-critical" hex="#C81E1E" />
            <Swatch name="Pending" varName="--color-pending" hex="#F59E0B" />
            <Swatch name="Resolved" varName="--color-resolved" hex="#16A34A" />
            <Swatch name="Info" varName="--color-info" hex="#2563EB" />
          </div>
        </Section>

        {/* Typography */}
        <Section
          title="Typography"
          description="Inter, loaded via next/font. A clear, slightly tightened scale."
        >
          <Card padded className="space-y-3">
            <p className="text-5xl font-bold tracking-tight text-text">Display 5xl</p>
            <p className="text-4xl font-bold tracking-tight text-text">Heading 4xl</p>
            <p className="text-3xl font-semibold tracking-tight text-text">Heading 3xl</p>
            <p className="text-2xl font-semibold text-text">Heading 2xl</p>
            <p className="text-xl font-semibold text-text">Heading xl</p>
            <p className="text-lg text-text">Large body — 18px</p>
            <p className="text-base text-text">Base body — 16px. The quick brown fox.</p>
            <p className="text-sm text-text-secondary">Small / secondary — 14px.</p>
            <p className="text-xs text-text-secondary">Caption — 12px.</p>
          </Card>
        </Section>

        {/* Buttons */}
        <Section title="Buttons" description="Variants, sizes, and loading state.">
          <Card padded className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="outline">Outline</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button>
                <Plus className="h-4 w-4" /> With icon
              </Button>
              <Button variant="outline" disabled>
                Disabled
              </Button>
              <Button loading={loadingBtn} onClick={previewButtonLoading}>
                {loadingBtn ? "Working" : "Click to load"}
              </Button>
            </div>
          </Card>
        </Section>

        {/* Status badges */}
        <Section
          title="Status badges"
          description="A pill that colours itself from its `status` prop."
        >
          <Card padded className="flex flex-wrap items-center gap-3">
            <StatusBadge status="critical" />
            <StatusBadge status="pending" />
            <StatusBadge status="resolved" />
            <StatusBadge status="info" />
            <StatusBadge status="pending">Awaiting dispatch</StatusBadge>
            <StatusBadge status="unknown" />
          </Card>
        </Section>

        {/* Form controls */}
        <Section title="Form controls" description="Inputs, selects, and toggles.">
          <Card padded>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="sg-name" required>
                  Reporter name
                </Label>
                <Input id="sg-name" placeholder="Jane Doe" />
              </div>
              <div>
                <Label htmlFor="sg-search">Search</Label>
                <Input
                  id="sg-search"
                  placeholder="Search incidents…"
                  leftIcon={<Search className="h-4 w-4" />}
                />
              </div>
              <div>
                <Label htmlFor="sg-type">Incident type</Label>
                <Select
                  id="sg-type"
                  placeholder="Select a type"
                  options={[
                    { value: "fire", label: "Fire" },
                    { value: "flood", label: "Flood" },
                    { value: "medical", label: "Medical" },
                  ]}
                />
              </div>
              <div>
                <Label htmlFor="sg-err">With error</Label>
                <Input id="sg-err" defaultValue="bad@" error="Enter a valid email." />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="sg-notes">Notes</Label>
                <Textarea id="sg-notes" placeholder="Describe the situation…" />
              </div>
              <div className="flex flex-col gap-3 sm:col-span-2">
                <Checkbox label="This is a life-threatening emergency" defaultChecked />
                <Checkbox label="Share my location with responders" />
                <Checkbox label="Disabled option" disabled />
              </div>
            </div>
          </Card>
        </Section>

        {/* Cards */}
        <Section title="Cards" description="The core surface, with header/body/footer parts.">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Active incidents</CardTitle>
                <CardDescription>Updated 2 minutes ago</CardDescription>
              </CardHeader>
              <CardBody>
                <p className="text-3xl font-bold text-primary">12</p>
                <p className="text-sm text-text-secondary">3 critical, 9 in progress</p>
              </CardBody>
              <CardFooter>
                <Button size="sm">Open dashboard</Button>
                <Button size="sm" variant="ghost">
                  Dismiss
                </Button>
              </CardFooter>
            </Card>
            <Card interactive padded className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-text">Interactive card</p>
                <p className="text-sm text-text-secondary">
                  Hover me — the shadow lifts. Good for clickable list rows.
                </p>
              </div>
            </Card>
          </div>
        </Section>

        {/* Tabs */}
        <Section title="Tabs" description="Animated active indicator.">
          <Card padded>
            <Tabs defaultValue="active">
              <TabsList>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="resolved">Resolved</TabsTrigger>
              </TabsList>
              <TabsContent value="active">
                <p className="text-sm text-text-secondary">
                  12 active incidents being coordinated right now.
                </p>
              </TabsContent>
              <TabsContent value="pending">
                <p className="text-sm text-text-secondary">
                  4 reports awaiting triage.
                </p>
              </TabsContent>
              <TabsContent value="resolved">
                <p className="text-sm text-text-secondary">
                  87 incidents resolved this week.
                </p>
              </TabsContent>
            </Tabs>
          </Card>
        </Section>

        {/* Overlays: dropdown, tooltip, modal, toast */}
        <Section
          title="Overlays & feedback"
          description="Dropdown, tooltip, modal dialog, and toasts."
        >
          <Card padded className="flex flex-wrap items-center gap-3">
            <Dropdown
              trigger={<Button variant="outline">Row actions</Button>}
            >
              <DropdownItem icon={Pencil}>Edit</DropdownItem>
              <DropdownItem icon={MapPin}>View on map</DropdownItem>
              <DropdownSeparator />
              <DropdownItem icon={Trash2} destructive>
                Delete
              </DropdownItem>
            </Dropdown>

            <Tooltip content="Acknowledge this incident">
              <Button variant="secondary">Hover for tooltip</Button>
            </Tooltip>

            <Button onClick={() => setModalOpen(true)}>Open modal</Button>

            <Button
              variant="secondary"
              onClick={() => toast.success("Incident dispatched", { description: "Unit 7 is en route." })}
            >
              Success toast
            </Button>
            <Button
              variant="secondary"
              onClick={() => toast.error("Connection lost", { description: "Retrying…" })}
            >
              Error toast
            </Button>
            <Button
              variant="secondary"
              onClick={() => toast.warning("Severe weather warning")}
            >
              Warning toast
            </Button>
          </Card>
        </Section>

        {/* Avatars */}
        <Section title="Avatars" description="Image with initials fallback.">
          <Card padded className="flex flex-wrap items-center gap-4">
            <Avatar name="Jane Doe" size="sm" />
            <Avatar name="Sam Rivera" size="md" />
            <Avatar name="Operations Center" size="lg" />
            <Avatar name="Photo User" size="lg" />
          </Card>
        </Section>

        {/* Table */}
        <Section
          title="Responsive table"
          description="A real table on desktop; stacked cards on mobile (resize to see)."
        >
          <Table columns={TABLE_COLUMNS} data={TABLE_DATA} />
        </Section>

        {/* Loading states */}
        <Section
          title="Loading & empty states"
          description="Spinners, shimmer skeletons, empty state, and the branded loader."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Card padded className="space-y-5">
              <div className="flex items-center gap-4">
                <Spinner size="sm" className="text-primary" />
                <Spinner size="md" className="text-primary" />
                <Spinner size="lg" className="text-primary" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
                <Skeleton className="h-24 w-full" />
              </div>
              <Button variant="outline" onClick={previewLoader}>
                Preview full-screen loader
              </Button>
            </Card>

            <EmptyState
              icon={Inbox}
              title="No incidents reported"
              description="When a new emergency report comes in, it will appear here."
              action={<Button size="sm"><Plus className="h-4 w-4" /> New report</Button>}
            />
          </div>
        </Section>

        {/* Inline branded loader preview */}
        <Section
          title="Branded loading screen"
          description="The splash/loading screen with its pulsing heartbeat ring (shown inline here)."
        >
          <Card className="overflow-hidden">
            <LoadingScreen fullscreen={false} label="Connecting to ResQNet…" />
          </Card>
        </Section>

        {/* Motion / stagger demo */}
        <Section
          title="List stagger"
          description="Items fade in with a subtle stagger as the section enters."
        >
          <motion.ul
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-3 sm:grid-cols-3"
          >
            {["Triage", "Dispatch", "Resolve"].map((step, i) => (
              <motion.li key={step} variants={staggerItem}>
                <Card padded>
                  <p className="text-sm font-medium text-text-secondary">
                    Step {i + 1}
                  </p>
                  <p className="text-lg font-semibold text-text">{step}</p>
                </Card>
              </motion.li>
            ))}
          </motion.ul>
        </Section>

        <footer className="border-t border-border pt-8 text-sm text-text-secondary">
          ResQNet design system · built with Next.js, Tailwind & Framer Motion.
        </footer>
      </main>

      {/* Modal instance driven by page state */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Confirm dispatch"
        size="md"
      >
        <p className="text-sm text-text-secondary">
          Send the nearest available unit to incident{" "}
          <span className="font-medium text-text">#1042 — Sector 7</span>? The
          responder will be notified immediately.
        </p>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setModalOpen(false);
              toast.success("Unit dispatched", {
                description: "Unit 7 is en route to Sector 7.",
              });
            }}
          >
            Dispatch now
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
