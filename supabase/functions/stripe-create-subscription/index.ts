// Edge Function: Stripe Create Subscription Checkout
// Crea (se manca) un Customer Stripe per l'utente e apre una Checkout Session
// per attivare la subscription al tier richiesto.
//
// Deploy:
//   supabase functions deploy stripe-create-subscription
// Secrets:
//   STRIPE_SECRET_KEY
//   STRIPE_PRICE_PRO     (price_xxx Stripe — piano Pro 29€/mese)
//   STRIPE_PRICE_PREMIUM (price_xxx Stripe — piano Premium 79€/mese)
//   STRIPE_PRICE_DIY_PRO (price_xxx Stripe — piano DIY 4,99€/mese)
//
// Body: { tier: "pro" | "premium" | "diy_pro" }
// Response: { checkoutUrl: string }

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
const PRICE_PRO = Deno.env.get("STRIPE_PRICE_PRO") ?? "";
// @ts-ignore
const PRICE_PREMIUM = Deno.env.get("STRIPE_PRICE_PREMIUM") ?? "";
// @ts-ignore
const PRICE_DIY_PRO = Deno.env.get("STRIPE_PRICE_DIY_PRO") ?? "";
// @ts-ignore
const SUCCESS_URL = Deno.env.get("STRIPE_SUBSCRIPTION_SUCCESS_URL") ??
  "https://nvmcars.it/subscription/success";
// @ts-ignore
const CANCEL_URL = Deno.env.get("STRIPE_SUBSCRIPTION_CANCEL_URL") ??
  "https://nvmcars.it/subscription/cancel";

const stripe = new Stripe(STRIPE_SECRET, { apiVersion: "2024-06-20" });

const BodySchema = z.object({
  tier: z.enum(["pro", "premium", "diy_pro"]),
});

const PRICES: Record<"pro" | "premium" | "diy_pro", string> = {
  pro: PRICE_PRO,
  premium: PRICE_PREMIUM,
  diy_pro: PRICE_DIY_PRO,
};

serve(async (req: Request) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const auth = await requireUser(req);
  if (!auth.ok) return auth.response;

  // 10 checkout/ora per utente (anti-abuso)
  const limited = await rateLimit({
    key: `sub-checkout:${auth.userId}`,
    limit: 10,
    windowSec: 3600,
  });
  if (limited) return limited;

  const parsed = await parseBody(req, BodySchema);
  if (!parsed.ok) return parsed.response;
  const { tier } = parsed.data;

  const priceId = PRICES[tier];
  if (!priceId) return jsonError(500, "price_not_configured");

  try {
    const admin = adminClient();

    // Trova Stripe customer esistente nel record subscriptions
    const { data: existing } = await admin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", auth.userId)
      .not("stripe_customer_id", "is", null)
      .limit(1)
      .maybeSingle();

    let customerId = existing?.stripe_customer_id as string | null;

    // Se non esiste, crea customer Stripe usando l'email Auth
    if (!customerId) {
      const { data: profile } = await admin
        .from("profiles")
        .select("email, name")
        .eq("id", auth.userId)
        .single();
      const c = await stripe.customers.create({
        email: profile?.email ?? undefined,
        name: profile?.name ?? undefined,
        metadata: { user_id: auth.userId },
      });
      customerId = c.id;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${SUCCESS_URL}?session={CHECKOUT_SESSION_ID}`,
      cancel_url: CANCEL_URL,
      subscription_data: {
        trial_period_days: tier === "diy_pro" ? 0 : 30,
        metadata: { user_id: auth.userId, tier },
      },
      metadata: { user_id: auth.userId, tier },
    });

    if (!session.url) return jsonError(500, "no_session_url");
    return jsonOk({ checkoutUrl: session.url });
  } catch (e) {
    console.error("stripe-create-subscription error", e);
    return jsonError(500, "internal_error");
  }
});
