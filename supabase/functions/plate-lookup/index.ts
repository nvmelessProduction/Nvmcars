// Edge Function: Plate Lookup
// Verifica rate-limit (1 lookup gratis per utente), chiama API Targato.it,
// salva risultato in plate_lookups, ritorna i dati auto.
//
// Deploy:
//   supabase functions deploy plate-lookup
// Secrets:
//   TARGATO_API_KEY
//   TARGATO_API_URL  (default: https://api.targato.it/v1/lookup)

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
const TARGATO_KEY = Deno.env.get("TARGATO_API_KEY") ?? "";
// @ts-ignore
const TARGATO_URL = Deno.env.get("TARGATO_API_URL") ?? "https://api.targato.it/v1/lookup";

const PLATE_RE = /^[A-Z]{2}\d{3}[A-Z]{2}$/i;

serve(async (req: Request) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const { plate } = await req.json();
    if (!plate || !PLATE_RE.test(String(plate).replace(/\s/g, ""))) {
      return new Response(JSON.stringify({ ok: false, reason: "Targa non valida" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUser = createClient(SUPABASE_URL, SERVICE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData } = await supabaseUser.auth.getUser();
    const user = userData?.user;
    if (!user) {
      return new Response(JSON.stringify({ ok: false, reason: "Non autorizzato" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // rate-limit: max 1 lookup per utente totale
    const { count } = await supabaseUser
      .from("plate_lookups")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    if ((count ?? 0) >= 1) {
      return new Response(
        JSON.stringify({ ok: false, reason: "Hai già usato la tua ricerca gratuita." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Chiamata API Targato.it
    let plateData: any = null;
    let costCents = 0;
    if (TARGATO_KEY) {
      const res = await fetch(`${TARGATO_URL}?plate=${encodeURIComponent(plate)}`, {
        headers: { Authorization: `Bearer ${TARGATO_KEY}` },
      });
      if (!res.ok) {
        return new Response(
          JSON.stringify({ ok: false, reason: "Targa non trovata" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      plateData = await res.json();
      costCents = 10; // approx €0.10 / req
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

    // Salva audit + consuma quota
    const adminClient = createClient(SUPABASE_URL, SERVICE_KEY);
    await adminClient.from("plate_lookups").insert({
      user_id: user.id,
      plate,
      result: plateData,
      provider: TARGATO_KEY ? "targato.it" : "mock",
      cost_cents: costCents,
    });
    await adminClient
      .from("profiles")
      .update({ plate_lookups_used: 1 })
      .eq("id", user.id);

    return new Response(JSON.stringify({ ok: true, data: plateData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, reason: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
