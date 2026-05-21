// Edge Function: Stripe Webhook
// Riceve eventi da Stripe e aggiorna lo stato delle quotes/subscriptions.
//
// Deploy:
//   supabase functions deploy stripe-webhook --no-verify-jwt
// Secrets:
//   STRIPE_SECRET_KEY
//   STRIPE_WEBHOOK_SECRET
//
// Eventi configurati in Stripe Dashboard:
//   - payment_intent.succeeded
//   - payment_intent.payment_failed
//   - account.updated
//   - customer.subscription.created
//   - customer.subscription.updated
//   - customer.subscription.deleted
//   - invoice.payment_failed

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
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;

        // Boost: attiva il record workshop_boosts
        if (pi.metadata?.kind === "boost" && pi.metadata?.boost_id) {
          await admin
            .from("workshop_boosts")
            .update({ status: "active", stripe_payment_intent: pi.id })
            .eq("id", pi.metadata.boost_id);
          break;
        }

        const quoteId = pi.metadata?.quote_id;
        if (!quoteId) break;
        await admin
          .from("quotes")
          .update({
            status: "paid",
            paid_at: new Date().toISOString(),
            payment_ref: pi.id,
            stripe_payment_intent: pi.id,
          })
          .eq("id", quoteId);

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
        break;
      }

      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        await admin
          .from("workshops")
          .update({ stripe_charges_enabled: account.charges_enabled })
          .eq("stripe_account_id", account.id);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.user_id;
        const tier = sub.metadata?.tier;
        if (!userId || !tier) break;
        const period_end = (sub as any).current_period_end as number | undefined;
        const period_start = (sub as any).current_period_start as number | undefined;
        await admin.from("subscriptions").upsert(
          {
            user_id: userId,
            tier,
            stripe_subscription_id: sub.id,
            stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
            current_period_start: period_start ? new Date(period_start * 1000).toISOString() : null,
            current_period_end: period_end ? new Date(period_end * 1000).toISOString() : null,
            cancel_at_period_end: sub.cancel_at_period_end,
            status: sub.status,
            trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
          },
          { onConflict: "user_id,tier" }
        );
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await admin
          .from("subscriptions")
          .update({ status: "canceled" })
          .eq("stripe_subscription_id", sub.id);
        break;
      }

      case "invoice.payment_failed": {
        const inv = event.data.object as Stripe.Invoice;
        const subId = typeof (inv as any).subscription === "string"
          ? (inv as any).subscription
          : null;
        if (subId) {
          await admin
            .from("subscriptions")
            .update({ status: "past_due" })
            .eq("stripe_subscription_id", subId);
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("stripe-webhook error", e);
    return new Response(`Handler error: ${e}`, { status: 500 });
  }
});
