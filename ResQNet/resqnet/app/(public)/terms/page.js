import Link from "next/link";

export const metadata = { title: "Terms of Service — ResQNet" };

export default function TermsPage() {
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
            <h1 className="text-3xl font-bold text-text">Terms of Service</h1>
            <p className="mt-1 text-sm text-text-secondary">Last updated: June 2026</p>
          </div>

          <p className="text-sm text-text-secondary leading-relaxed">
            Welcome to ResQNet. By registering and using this platform, you agree to the following terms and conditions. Please read them carefully before using our services.
          </p>

          {[
            {
              title: "1. Acceptance of Terms",
              body: "By accessing or using ResQNet, you confirm that you are at least 18 years old and agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.",
            },
            {
              title: "2. Description of Service",
              body: "ResQNet is an emergency response coordination platform that connects victims, volunteers, NGOs, donors, and administrators. It is designed to facilitate rapid response during emergencies and disasters.",
            },
            {
              title: "3. User Roles and Responsibilities",
              body: "Users must register with a valid email address and select an appropriate role (Victim, Volunteer, NGO, or Donor). Each role carries specific responsibilities. You agree to use the platform only for its intended purpose and not to misuse or falsely report emergencies.",
            },
            {
              title: "4. Emergency Reporting",
              body: "Victims may submit emergency reports through the platform. False or misleading emergency reports are strictly prohibited and may result in account suspension. ResQNet is not a substitute for official emergency services — always contact your local emergency number (e.g. 1122, 115) in life-threatening situations.",
            },
            {
              title: "5. Volunteer Conduct",
              body: "Volunteers agree to respond to emergencies in good faith and to the best of their ability. ResQNet does not guarantee the availability of volunteers and is not liable for any outcomes resulting from a response or non-response.",
            },
            {
              title: "6. Donations",
              body: "Donors acknowledge that donations made through the platform are directed to NGOs or general emergency funds as selected. ResQNet does not process financial transactions directly and is not responsible for the use of donated funds by recipient organisations.",
            },
            {
              title: "7. Account Security",
              body: "You are responsible for maintaining the confidentiality of your account credentials. You must notify us immediately of any unauthorised access to your account. ResQNet is not liable for any loss resulting from unauthorised use of your account.",
            },
            {
              title: "8. Data and Privacy",
              body: "Your use of ResQNet is also governed by our Privacy Policy, which is incorporated into these terms by reference. We collect and process personal data to operate the platform and coordinate emergency responses.",
            },
            {
              title: "9. Limitation of Liability",
              body: "ResQNet is provided on an 'as is' basis for educational and coordination purposes. We make no warranties regarding the accuracy, reliability, or availability of the service. ResQNet shall not be liable for any direct, indirect, or consequential damages arising from the use of this platform.",
            },
            {
              title: "10. Modifications",
              body: "We reserve the right to modify these Terms at any time. Continued use of the platform after changes are posted constitutes your acceptance of the revised terms.",
            },
            {
              title: "11. Contact",
              body: "For any questions regarding these Terms, please contact the ResQNet team through the platform's admin portal.",
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
