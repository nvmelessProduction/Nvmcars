// Edge Function: Stripe Create Boost Checkout
// Acquisto one-time per "boostare" un workshop nei risultati per N giorni.
// Crea la riga workshop_boosts in stato 'pending' e una Checkout Session Stripe.
// Quando il webhook payment_intent.succeeded riconosce metadata.kind='boost'
// promuove la riga a 'active'.
//
// Deploy: supabase functions deploy stripe-create-boost
// Secrets: STRIPE_SECRET_KEY + STRIPE_BOOST_SUCCESS_URL + STRIPE_BOOST_CANCEL_URL

// @ts-ignore
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// @ts-ignore
import Stripe from "https://esm.sh/stripe@16.0.0?target=deno";
import { handleCors } from "../_shared/cors.ts";
import { parseBody, jsonError, jsonOk, z } from "../_shared/validate.ts";
import { rateLimit } from "../_shared/rateLimit.ts";
import { requireUser, adminClient } from "../_shared/auth.ts";

// @ts-ignore
const STRIPE_SECRET = Deno.env.get("STRIPE_SECRET_KEY")!;
// @ts-ignore
const SUCCESS_URL = Deno.env.get("STRIPE_BOOST_SUCCESS_URL") ?? "https://nvmcars.it/boost/success";
// @ts-ignore
const CANCEL_URL = Deno.env.get("STRIPE_BOOST_CANCEL_URL") ?? "https://nvmcars.it/boost/cancel";

const stripe = new Stripe(STRIPE_SECRET, { apiVersion: "2024-06-20" });

const BodySchema = z.object({
  workshopId: z.string().uuid(),
  planKey: z.enum(["week_local", "month_local", "week_national", "month_national"]),
});

const PLANS = {
  week_local: { days: 7, amountCents: 1900, national: false, label: "Boost zona — 7gg" },
  month_local: { days: 30, amountCents: 5900, national: false, label: "Boost zona — 30gg" },
  week_national: { days: 7, amountCents: 7900, national: true, label: "Boost nazionale — 7gg" },
  month_national: { days: 30, amountCents: 24900, national: true, label: "Boost nazionale — 30gg" },
} as const;

serve(async (req: Request) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const auth = await requireUser(req);
  if (!auth.ok) return auth.response;

  const limited = await rateLimit({ key: `boost:${auth.userId}`, limit: 10, windowSec: 3600 });
  if (limited) return limited;

  const parsed = await parseBody(req, BodySchema);
  if (!parsed.ok) return parsed.response;
  const { workshopId, planKey } = parsed.data;
  const plan = PLANS[planKey];

  try {
    // verifica ownership
    const { data: ws } = await auth.client
      .from("workshops")
      .select("id, owner_id, cap, name")
      .eq("id", workshopId)
      .single();
    if (!ws || ws.owner_id !== auth.userId) return jsonError(403, "forbidden");

    const admin = adminClient();
    const now = new Date();
    const endAt = new Date(now.getTime() + plan.days * 86400 * 1000);

    const { data: inserted, error: insErr } = await admin
      .from("workshop_boosts")
      .insert({
        workshop_id: workshopId,
        start_at: now.toISOString(),
        end_at: endAt.toISOString(),
        paid_amount_cents: plan.amountCents,
        zone_cap: plan.national ? null : ws.cap,
        status: "pending",
      })
      .select("id")
      .single();
    if (insErr || !inserted) return jsonError(500, "db_insert_failed");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Boost Nvmcars — ${ws.name}`,
              description: plan.label,
            },
            unit_amount: plan.amountCents,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        metadata: {
          kind: "boost",
          boost_id: inserted.id,
          workshop_id: workshopId,
          user_id: auth.userId,
        },
      },
      success_url: `${SUCCESS_URL}?session={CHECKOUT_SESSION_ID}`,
      cancel_url: CANCEL_URL,
    });

    if (!session.url) return jsonError(500, "no_session_url");
    return jsonOk({ checkoutUrl: session.url, boostId: inserted.id });
  } catch (e) {
    console.error("stripe-create-boost error", e);
    return jsonError(500, "internal_error");
  }
});
