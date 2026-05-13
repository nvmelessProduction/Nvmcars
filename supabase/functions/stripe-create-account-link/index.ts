// Edge Function: Stripe Create Account Link
// Onboarding Stripe Connect Express per l'officina.
// Crea (se manca) un account Stripe per l'officina e ritorna un AccountLink
// per completare l'onboarding (KYC).
//
// Deploy:
//   supabase functions deploy stripe-create-account-link
// Secrets:
//   STRIPE_SECRET_KEY
//
// Invoca dal client (pro):
//   supabase.functions.invoke("stripe-create-account-link", {
//     body: { workshopId, returnUrl, refreshUrl }
//   })

// @ts-ignore
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
// @ts-ignore
import Stripe from "https://esm.sh/stripe@16.0.0?target=deno";
import { corsHeaders, handleCors } from "../_shared/cors.ts";

// @ts-ignore
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
    const { workshopId, returnUrl, refreshUrl } = await req.json();
    if (!workshopId) {
      return new Response(JSON.stringify({ error: "Missing workshopId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: workshop, error } = await supabaseUser
      .from("workshops")
      .select("id, stripe_account_id, owner_id, fiscal_data")
      .eq("id", workshopId)
      .single();
    if (error || !workshop) {
      return new Response(JSON.stringify({ error: "Workshop not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let accountId = workshop.stripe_account_id as string | null;
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "IT",
        business_type: "company",
        metadata: { workshop_id: workshopId },
      });
      accountId = account.id;
      await supabaseUser
        .from("workshops")
        .update({ stripe_account_id: accountId })
        .eq("id", workshopId);
    }

    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl ?? "https://nvmcars.it/stripe/refresh",
      return_url: returnUrl ?? "https://nvmcars.it/stripe/return",
      type: "account_onboarding",
    });

    return new Response(JSON.stringify({ url: link.url, accountId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
