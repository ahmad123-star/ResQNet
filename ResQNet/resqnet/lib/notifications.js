import { createClient } from "@/lib/supabase/client";

/**
 * Insert a single notification row for one user.
 * Fire-and-forget safe — errors are logged but not re-thrown.
 */
export async function createNotification(userId, type, title, message) {
  if (!userId) return;
  const supabase = createClient();
  const { error } = await supabase
    .from("notifications")
    .insert({ user_id: userId, type, title, message });
  if (error) console.warn("[notify]", error.message);
}

/**
 * Insert one notification row per userId — same type/title/message for all.
 * De-duplicates the id list before inserting.
 */
export async function notifyMany(userIds, type, title, message) {
  const unique = [...new Set(userIds)].filter(Boolean);
  if (!unique.length) return;
  const supabase = createClient();
  const rows = unique.map((user_id) => ({ user_id, type, title, message }));
  const { error } = await supabase.from("notifications").insert(rows);
  if (error) console.warn("[notify]", error.message);
}
