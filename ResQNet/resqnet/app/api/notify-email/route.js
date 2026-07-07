import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend   = new Resend(process.env.RESEND_API_KEY);
const FROM     = "ResQNet Alerts <onboarding@resend.dev>";

function buildHtml(subject, message) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
        <span style="background:#ef4444;color:#fff;font-weight:700;font-size:16px;padding:6px 14px;border-radius:8px">ResQNet</span>
      </div>
      <h2 style="margin:0 0 12px;font-size:18px;color:#111827">${subject}</h2>
      <p style="margin:0 0 20px;font-size:14px;color:#374151;line-height:1.6">${message}</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"/>
      <p style="margin:0;font-size:12px;color:#9ca3af">This is an automated alert from ResQNet Emergency Response System. Do not reply to this email.</p>
    </div>
  `;
}

export async function POST(req) {
  try {
    const { userIds, subject, message } = await req.json();
    if (!userIds?.length || !subject || !message) {
      return Response.json({ ok: true });
    }

    // Fetch emails server-side using service role (bypasses RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data } = await supabase
      .from("profiles")
      .select("email")
      .in("id", userIds);

    const emails = (data ?? []).map((p) => p.email).filter(Boolean);
    if (!emails.length) return Response.json({ ok: true });

    await Promise.allSettled(
      emails.map((to) =>
        resend.emails.send({ from: FROM, to, subject, html: buildHtml(subject, message) })
      )
    );

    return Response.json({ ok: true });
  } catch (err) {
    console.error("[notify-email]", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
