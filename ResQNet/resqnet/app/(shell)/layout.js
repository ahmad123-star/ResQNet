import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ShellProvider }  from "@/lib/shellContext";
import Sidebar            from "@/components/shell/Sidebar";
import Header             from "@/components/shell/Header";
import MobileDrawer       from "@/components/shell/MobileDrawer";
import BottomNav          from "@/components/shell/BottomNav";
import AppShell           from "@/components/shell/AppShell";
import PageTransition     from "@/components/shell/PageTransition";

export default async function ShellLayout({ children }) {
  const supabase = await createClient();

  // getUser() validates the JWT server-side (never trust getSession() alone).
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch the full profile row so we have name, role, blocked status.
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, role, blocked, avatar_url")
    .eq("id", user.id)
    .single();

  if (profile?.blocked) redirect("/login?blocked=1");

  const shellUser = {
    id:        user.id,
    email:     user.email,
    name:      profile?.name       ?? user.user_metadata?.name ?? "User",
    role:      profile?.role       ?? user.user_metadata?.role ?? "victim",
    avatarUrl: profile?.avatar_url ?? null,
  };

  return (
    <ShellProvider user={shellUser}>
      <Sidebar />
      <Header />
      <MobileDrawer />
      <AppShell>
        <PageTransition>
          {children}
        </PageTransition>
      </AppShell>
      <BottomNav />
    </ShellProvider>
  );
}
