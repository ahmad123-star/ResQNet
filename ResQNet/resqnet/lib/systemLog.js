import { createClient } from "@/lib/supabase/client";

export async function createSystemLog(userId, action, level = "info") {
  if (!userId) return;
  const supabase = createClient();
  const { error } = await supabase
    .from("system_logs")
    .insert({ user_id: userId, action, level });
  if (error) console.warn("[syslog]", error.message);
}
