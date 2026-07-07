export async function emailNotify(userIds, subject, message) {
  const ids = (Array.isArray(userIds) ? userIds : [userIds]).filter(Boolean);
  if (!ids.length) return;
  try {
    await fetch("/api/notify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userIds: ids, subject, message }),
    });
  } catch (err) {
    console.warn("[emailNotify]", err.message);
  }
}
