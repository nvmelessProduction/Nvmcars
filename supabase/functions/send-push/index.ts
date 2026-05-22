// Edge Function: Send Push Notification
// Manda push via Expo Push Service ai push_token del profilo destinatario.
//
// Deploy:
//   supabase functions deploy send-push --no-verify-jwt
// (no-verify-jwt perché chiamata da database trigger / cron)
//
// Body:
//   { userId: string, title: string, body: string, data?: object }
//
// Per il flusso prod, conviene chiamarla da:
//   - Trigger SQL su notifications insert
//   - Cron job per reminder

// @ts-ignore
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders, handleCors } from "../_shared/cors.ts";

// @ts-ignore
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
// @ts-ignore
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// @ts-ignore
const EXPO_TOKEN = Deno.env.get("EXPO_ACCESS_TOKEN") ?? "";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

serve(async (req: Request) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const { userId, title, body, data } = await req.json();
    if (!userId || !title) {
      return new Response(JSON.stringify({ error: "Missing userId/title" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: profile } = await admin
      .from("profiles")
      .select("push_token, language")
      .eq("id", userId)
      .single();

    if (!profile?.push_token) {
      return new Response(JSON.stringify({ ok: false, reason: "No push token" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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

    return new Response(JSON.stringify({ ok: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
