// Edge Function: Plate Lookup
// Verifica rate-limit (1 lookup gratis per utente), chiama API Targato.it,
// salva risultato in plate_lookups, ritorna i dati auto.
//
// Deploy:
//   supabase functions deploy plate-lookup
// Secrets:
//   TARGATO_API_KEY
//   TARGATO_API_URL  (default: https://api.targato.it/v1/lookup)
//   (opzionali) UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN

// @ts-ignore
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { handleCors } from "../_shared/cors.ts";
import { parseBody, jsonError, jsonOk, z } from "../_shared/validate.ts";
import { rateLimit, clientIp } from "../_shared/rateLimit.ts";
import { adminClient, requireUser } from "../_shared/auth.ts";

// @ts-ignore
const TARGATO_KEY = Deno.env.get("TARGATO_API_KEY") ?? "";
// @ts-ignore
const TARGATO_URL = Deno.env.get("TARGATO_API_URL") ?? "https://api.targato.it/v1/lookup";

const PLATE_RE = /^[A-Z]{2}\d{3}[A-Z]{2}$/i;

const BodySchema = z.object({
  plate: z
    .string()
    .min(7)
    .max(10)
    .transform((s) => s.replace(/\s/g, "").toUpperCase())
    .refine((s) => PLATE_RE.test(s), "invalid_plate"),
});

serve(async (req: Request) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const auth = await requireUser(req);
  if (!auth.ok) return auth.response;

  // Rate limit doppio: per user e per IP (anti credit-stuffing)
  const ipLimited = await rateLimit({
    key: `plate-ip:${clientIp(req)}`,
    limit: 10,
    windowSec: 3600,
  });
  if (ipLimited) return ipLimited;

  const userLimited = await rateLimit({
    key: `plate-user:${auth.userId}`,
    limit: 5,
    windowSec: 3600,
  });
  if (userLimited) return userLimited;

  const parsed = await parseBody(req, BodySchema);
  if (!parsed.ok) return parsed.response;
  const { plate } = parsed.data;

  try {
    const supabaseUser = auth.client;

    // Quota assoluta: max 1 lookup per utente totale (gratis)
    const { count } = await supabaseUser
      .from("plate_lookups")
      .select("id", { count: "exact", head: true })
      .eq("user_id", auth.userId);
    if ((count ?? 0) >= 1) {
      return jsonError(429, "free_quota_exhausted");
    }

    let plateData: any = null;
    let costCents = 0;
    if (TARGATO_KEY) {
      const res = await fetch(`${TARGATO_URL}?plate=${encodeURIComponent(plate)}`, {
        headers: { Authorization: `Bearer ${TARGATO_KEY}` },
      });
      if (!res.ok) return jsonError(404, "plate_not_found");
      plateData = await res.json();
      costCents = 10;
    } else {
      // Provider non configurato → fallback dati fittizi (mai usare in prod)
      plateData = {
        plate,
        make: "Fiat",
        model: "Panda",
        year: 2020,
        fuel: "benzina",
        displacement: 1242,
        category: "city",
      };
    }

    const admin = adminClient();
    await admin.from("plate_lookups").insert({
      user_id: auth.userId,
      plate,
      result: plateData,
      provider: TARGATO_KEY ? "targato.it" : "mock",
      cost_cents: costCents,
    });
    await admin
      .from("profiles")
      .update({ plate_lookups_used: 1 })
      .eq("id", auth.userId);

    return jsonOk({ ok: true, data: plateData });
  } catch (e) {
    console.error("plate-lookup error", e);
    return jsonError(500, "internal_error");
  }
});
