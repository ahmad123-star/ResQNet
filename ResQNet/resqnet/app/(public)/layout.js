import PublicNav from "@/components/public/PublicNav";

/**
 * Public layout — wraps the home page and all auth pages.
 * No sidebar; just the light PublicNav top bar.
 */
export default function PublicLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicNav />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
