// Edge Function: Stripe Cancel Subscription
// Cancella alla fine del periodo corrente (preserva accesso fino a scadenza).

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
const stripe = new Stripe(STRIPE_SECRET, { apiVersion: "2024-06-20" });

const BodySchema = z.object({
  subscriptionId: z.string().uuid(),
});

serve(async (req: Request) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const auth = await requireUser(req);
  if (!auth.ok) return auth.response;

  const limited = await rateLimit({
    key: `sub-cancel:${auth.userId}`,
    limit: 5,
    windowSec: 3600,
  });
  if (limited) return limited;

  const parsed = await parseBody(req, BodySchema);
  if (!parsed.ok) return parsed.response;

  try {
    const admin = adminClient();
    const { data: sub } = await admin
      .from("subscriptions")
      .select("id, user_id, stripe_subscription_id")
      .eq("id", parsed.data.subscriptionId)
      .single();

    if (!sub) return jsonError(404, "subscription_not_found");
    if (sub.user_id !== auth.userId) return jsonError(403, "forbidden");
    if (!sub.stripe_subscription_id) return jsonError(400, "no_stripe_id");

    await stripe.subscriptions.update(sub.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    await admin
      .from("subscriptions")
      .update({ cancel_at_period_end: true })
      .eq("id", sub.id);

    return jsonOk({ ok: true });
  } catch (e) {
    console.error("stripe-cancel-subscription error", e);
    return jsonError(500, "internal_error");
  }
});
