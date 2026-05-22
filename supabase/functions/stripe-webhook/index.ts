// Edge Function: Stripe Webhook
// Riceve eventi da Stripe e aggiorna quote.status quando il pagamento è completato.
//
// Deploy:
//   supabase functions deploy stripe-webhook --no-verify-jwt
// Secrets:
//   STRIPE_SECRET_KEY
//   STRIPE_WEBHOOK_SECRET
//
// Configurare in Stripe Dashboard:
//   Endpoint: https://YOUR-PROJECT.supabase.co/functions/v1/stripe-webhook
//   Events: payment_intent.succeeded, payment_intent.payment_failed, account.updated

// @ts-ignore
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
// @ts-ignore
import Stripe from "https://esm.sh/stripe@16.0.0?target=deno";

// @ts-ignore
const STRIPE_SECRET = Deno.env.get("STRIPE_SECRET_KEY")!;
// @ts-ignore
const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
// @ts-ignore
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
// @ts-ignore
const SUPABASE_SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const stripe = new Stripe(STRIPE_SECRET, { apiVersion: "2024-06-20" });
const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

serve(async (req: Request) => {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();
  if (!sig) return new Response("missing signature", { status: 400 });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, WEBHOOK_SECRET);
  } catch (e) {
    return new Response(`Webhook signature failed: ${e}`, { status: 400 });
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object as Stripe.PaymentIntent;
      const quoteId = pi.metadata?.quote_id;
      if (quoteId) {
        await admin
          .from("quotes")
          .update({
            status: "paid",
            paid_at: new Date().toISOString(),
            payment_ref: pi.id,
            stripe_payment_intent: pi.id,
          })
          .eq("id", quoteId);

        // Notifica l'officina
        const { data: q } = await admin
          .from("quotes")
          .select("workshop_id, customer_id, title")
          .eq("id", quoteId)
          .single();
        if (q) {
          const { data: workshop } = await admin
            .from("workshops")
            .select("owner_id, name")
            .eq("id", q.workshop_id)
            .single();
          if (workshop?.owner_id) {
            await admin.from("notifications").insert({
              user_id: workshop.owner_id,
              type: "payment_received",
              title: "Pagamento ricevuto 💰",
              body: `Hai ricevuto il pagamento per "${q.title}".`,
              related_id: quoteId,
              related_kind: "quote",
            });
          }
          await admin.from("notifications").insert({
            user_id: q.customer_id,
            type: "payment_succeeded",
            title: "Pagamento completato",
            body: `Pagamento confermato per "${q.title}".`,
            related_id: quoteId,
            related_kind: "quote",
          });
        }
      }
    }

    if (event.type === "account.updated") {
      const account = event.data.object as Stripe.Account;
      await admin
        .from("workshops")
        .update({
          stripe_charges_enabled: account.charges_enabled,
        })
        .eq("stripe_account_id", account.id);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(`Handler error: ${e}`, { status: 500 });
  }
});
