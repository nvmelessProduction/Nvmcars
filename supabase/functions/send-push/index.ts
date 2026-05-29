// Edge Function: Send Push Notification
// Manda push via Expo Push Service ai push_token del profilo destinatario.
//
// Deploy:
//   supabase functions deploy send-push
// Body:
//   { userId: string, title: string, body?: string, data?: object }
//
// NOTA: rimosso --no-verify-jwt per evitare che chiunque possa spammare push.
// Chiamala dal client autenticato o da Edge Function admin con service-role.

// @ts-ignore
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { handleCors } from "../_shared/cors.ts";
import { parseBody, jsonError, jsonOk, z } from "../_shared/validate.ts";
import { rateLimit } from "../_shared/rateLimit.ts";
import { adminClient, requireUser } from "../_shared/auth.ts";

// @ts-ignore
const EXPO_TOKEN = Deno.env.get("EXPO_ACCESS_TOKEN") ?? "";
const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

const BodySchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1).max(120),
  body: z.string().max(500).optional(),
  data: z.record(z.unknown()).optional(),
});

serve(async (req: Request) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const auth = await requireUser(req);
  if (!auth.ok) return auth.response;

  // 60 push / minuto per chiamante (anti-spam)
  const limited = await rateLimit({
    key: `push:${auth.userId}`,
    limit: 60,
    windowSec: 60,
  });
  if (limited) return limited;

  const parsed = await parseBody(req, BodySchema);
  if (!parsed.ok) return parsed.response;
  const { userId, title, body, data } = parsed.data;

  try {
    const admin = adminClient();

    // Anti-abuse: solo admin può mandare push a userId arbitrari.
    // Utenti normali possono mandare push SOLO a se stessi (es. test notifica).
    // I push "applicativi" (chat reply, quote received, ecc.) vanno fatti
    // server-side da trigger SQL o da altre edge function con service_role.
    if (userId !== auth.userId) {
      const { data: caller } = await admin
        .from("profiles")
        .select("is_admin")
        .eq("id", auth.userId)
        .single();
      if (!caller?.is_admin) return jsonError(403, "forbidden");
    }

    const { data: profile } = await admin
      .from("profiles")
      .select("push_token")
      .eq("id", userId)
      .single();

    if (!profile?.push_token) {
      return jsonOk({ ok: false, reason: "no_push_token" });
    }

    const message = {
      to: profile.push_token,
      sound: "default",
      title,
      body: body ?? "",
      data: data ?? {},
    };

    const headers: Record<string, string> = {
      Accept: "application/json",
      "Accept-Encoding": "gzip, deflate",
      "Content-Type": "application/json",
    };
    if (EXPO_TOKEN) headers["Authorization"] = `Bearer ${EXPO_TOKEN}`;

    const res = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(message),
    });
    const result = await res.json();

    return jsonOk({ ok: true, result });
  } catch (e) {
    console.error("send-push error", e);
    return jsonError(500, "internal_error");
  }
});
