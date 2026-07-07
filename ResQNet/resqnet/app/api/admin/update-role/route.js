import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

const VALID_ROLES = ["victim", "volunteer", "ngo", "admin", "donor"];

export async function POST(req) {
  try {
    const { userId, newRole } = await req.json();

    if (!userId || !VALID_ROLES.includes(newRole)) {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    // Verify the requester is an admin
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { data: requester } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (requester?.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Use service role to update auth.users metadata + profiles
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Update auth.users user_metadata (used by middleware for routing)
    const { error: authError } = await admin.auth.admin.updateUserById(userId, {
      user_metadata: { role: newRole },
    });
    if (authError) return Response.json({ error: authError.message }, { status: 500 });

    // Update profiles table
    const { error: profileError } = await admin
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);
    if (profileError) return Response.json({ error: profileError.message }, { status: 500 });

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
