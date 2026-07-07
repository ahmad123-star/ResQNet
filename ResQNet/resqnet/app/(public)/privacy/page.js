import Link from "next/link";

export const metadata = { title: "Privacy Policy — ResQNet" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-3xl">

        <div className="mb-8">
          <Link href="/register"
            className="text-sm font-medium text-primary hover:text-primary-hover">
            ← Back to Register
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm space-y-6">

          <div>
            <h1 className="text-3xl font-bold text-text">Privacy Policy</h1>
            <p className="mt-1 text-sm text-text-secondary">Last updated: June 2026</p>
          </div>

          <p className="text-sm text-text-secondary leading-relaxed">
            ResQNet is committed to protecting your personal information. This Privacy Policy explains what data we collect, how we use it, and your rights regarding your information.
          </p>

          {[
            {
              title: "1. Information We Collect",
              body: "We collect information you provide during registration, including your name, email address, phone number, and role. We also collect data generated through your use of the platform, such as emergency reports, task activity, donation records, and location data (only when explicitly provided by you).",
            },
            {
              title: "2. How We Use Your Information",
              body: "Your information is used to operate and coordinate emergency response services, send notifications about emergencies and tasks relevant to your role, maintain system logs for security and audit purposes, and improve the platform's functionality.",
            },
            {
              title: "3. Location Data",
              body: "Location data is only collected when you choose to use the 'Detect my location' feature while reporting an emergency. This data is stored alongside the emergency report and is visible to volunteers, NGOs, and administrators to facilitate response. We do not track your location continuously.",
            },
            {
              title: "4. Photos and Uploads",
              body: "Photos you upload as part of an emergency report are stored securely in our cloud storage. These photos are accessible to platform users with relevant roles (volunteers, NGOs, admins) for response coordination purposes.",
            },
            {
              title: "5. Email Notifications",
              body: "By registering, you consent to receiving email notifications related to your emergency reports, assigned tasks, and platform activity. These are transactional notifications necessary for the platform to function. You may contact an administrator to opt out.",
            },
            {
              title: "6. Data Sharing",
              body: "We do not sell your personal data to third parties. Your information is shared only within the platform between relevant roles (e.g. your emergency location is shared with responding volunteers and NGOs). We use Supabase for database and authentication services, and Resend for email delivery.",
            },
            {
              title: "7. Data Security",
              body: "We use industry-standard security measures including encrypted connections (HTTPS), row-level security on all database tables, and secure authentication via Supabase Auth. However, no system is completely secure, and we cannot guarantee absolute security.",
            },
            {
              title: "8. Data Retention",
              body: "Your account data is retained for as long as your account is active. Emergency records are retained indefinitely for historical and audit purposes. You may request deletion of your account by contacting an administrator.",
            },
            {
              title: "9. Your Rights",
              body: "You have the right to access the personal data we hold about you, request correction of inaccurate data, and request deletion of your account. To exercise these rights, contact the platform administrator.",
            },
            {
              title: "10. Changes to This Policy",
              body: "We may update this Privacy Policy from time to time. We will notify registered users of significant changes via the platform's notification system.",
            },
            {
              title: "11. Contact",
              body: "If you have any questions or concerns about this Privacy Policy, please contact the ResQNet team through the platform's admin portal.",
            },
          ].map(({ title, body }) => (
            <div key={title}>
              <h2 className="text-base font-semibold text-text mb-1">{title}</h2>
              <p className="text-sm text-text-secondary leading-relaxed">{body}</p>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}
