// Edge Function: Stripe Create Payment Intent
// Crea un PaymentIntent con application_fee (commission_fee della quote)
// + destinazione del transfer all'account Stripe Connect dell'officina.
//
// Deploy:
//   supabase functions deploy stripe-create-payment-intent
// Secrets richiesti:
//   STRIPE_SECRET_KEY
//   (opzionali) UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
//
// Invoca dal client:
//   supabase.functions.invoke("stripe-create-payment-intent", { body: { quoteId } })

// @ts-ignore -- Deno runtime
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// @ts-ignore
import Stripe from "https://esm.sh/stripe@16.0.0?target=deno";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { parseBody, jsonError, jsonOk, z } from "../_shared/validate.ts";
import { rateLimit } from "../_shared/rateLimit.ts";
import { requireUser } from "../_shared/auth.ts";

// @ts-ignore
const STRIPE_SECRET = Deno.env.get("STRIPE_SECRET_KEY")!;
const stripe = new Stripe(STRIPE_SECRET, { apiVersion: "2024-06-20" });

const BodySchema = z.object({
  quoteId: z.string().uuid(),
});

serve(async (req: Request) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const auth = await requireUser(req);
  if (!auth.ok) return auth.response;

  // Max 30 PI/hour per utente (limita abuse di richieste a Stripe)
  const limited = await rateLimit({
    key: `pi:${auth.userId}`,
    limit: 30,
    windowSec: 3600,
  });
  if (limited) return limited;

  const parsed = await parseBody(req, BodySchema);
  if (!parsed.ok) return parsed.response;
  const { quoteId } = parsed.data;

  try {
    const { data: quote, error: qErr } = await auth.client
      .from("quotes")
      .select("*, workshops(stripe_account_id, stripe_charges_enabled)")
      .eq("id", quoteId)
      .single();
    if (qErr || !quote) return jsonError(404, "quote_not_found");

    // RLS impone già che solo customer/workshop owner vedano la quote.
    // Verifichiamo comunque che il chiamante sia il customer.
    if (quote.customer_id !== auth.userId) {
      return jsonError(403, "forbidden");
    }

    if (quote.status !== "pending" && quote.status !== "accepted") {
      return jsonError(400, "quote_not_payable");
    }

    const workshop = (quote as any).workshops;
    if (!workshop?.stripe_account_id || !workshop?.stripe_charges_enabled) {
      return jsonError(400, "workshop_not_onboarded");
    }

    const amountCents = Math.round(Number(quote.total) * 100);
    const feeCents = Math.round(Number(quote.commission_fee) * 100);

    const pi = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "eur",
      application_fee_amount: feeCents,
      transfer_data: { destination: workshop.stripe_account_id },
      metadata: {
        quote_id: quoteId,
        workshop_id: quote.workshop_id,
        customer_id: quote.customer_id,
      },
    });

    return jsonOk({
      clientSecret: pi.client_secret,
      paymentIntentId: pi.id,
    });
  } catch (e) {
    console.error("stripe-create-payment-intent error", e);
    return jsonError(500, "internal_error");
  }
});
