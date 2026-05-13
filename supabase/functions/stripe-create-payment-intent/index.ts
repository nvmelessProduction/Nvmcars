// Edge Function: Stripe Create Payment Intent
// Crea un PaymentIntent con application_fee 2% per Nvmcars
// + destinazione del transfer all'account Stripe Connect dell'officina.
//
// Deploy:
//   supabase functions deploy stripe-create-payment-intent
// Secrets richiesti:
//   STRIPE_SECRET_KEY
//
// Invoca dal client:
//   supabase.functions.invoke("stripe-create-payment-intent", { body: { quoteId } })

// @ts-ignore -- Deno runtime, no types in TS server
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
// @ts-ignore
import Stripe from "https://esm.sh/stripe@16.0.0?target=deno";
import { corsHeaders, handleCors } from "../_shared/cors.ts";

// @ts-ignore -- Deno global
const STRIPE_SECRET = Deno.env.get("STRIPE_SECRET_KEY")!;
// @ts-ignore
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
// @ts-ignore
const SUPABASE_SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const stripe = new Stripe(STRIPE_SECRET, { apiVersion: "2024-06-20" });

serve(async (req: Request) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const { quoteId } = await req.json();
    if (!quoteId) {
      return new Response(JSON.stringify({ error: "Missing quoteId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Auth via JWT cliente
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: quote, error: qErr } = await supabaseUser
      .from("quotes")
      .select("*, workshops(stripe_account_id, stripe_charges_enabled)")
      .eq("id", quoteId)
      .single();
    if (qErr || !quote) {
      return new Response(JSON.stringify({ error: "Quote not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (quote.status !== "pending" && quote.status !== "accepted") {
      return new Response(JSON.stringify({ error: "Quote not payable" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const workshop = (quote as any).workshops;
    if (!workshop?.stripe_account_id || !workshop?.stripe_charges_enabled) {
      return new Response(
        JSON.stringify({ error: "Workshop not onboarded to Stripe" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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

    return new Response(
      JSON.stringify({
        clientSecret: pi.client_secret,
        paymentIntentId: pi.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
