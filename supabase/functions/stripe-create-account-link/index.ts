// Edge Function: Stripe Create Account Link
// Onboarding Stripe Connect Express per l'officina.
//
// Deploy:
//   supabase functions deploy stripe-create-account-link
// Secrets:
//   STRIPE_SECRET_KEY

// @ts-ignore
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// @ts-ignore
import Stripe from "https://esm.sh/stripe@16.0.0?target=deno";
import { handleCors } from "../_shared/cors.ts";
import { parseBody, jsonError, jsonOk, z } from "../_shared/validate.ts";
import { rateLimit } from "../_shared/rateLimit.ts";
import { requireUser } from "../_shared/auth.ts";

// @ts-ignore
const STRIPE_SECRET = Deno.env.get("STRIPE_SECRET_KEY")!;
const stripe = new Stripe(STRIPE_SECRET, { apiVersion: "2024-06-20" });

const BodySchema = z.object({
  workshopId: z.string().uuid(),
  returnUrl: z.string().url().optional(),
  refreshUrl: z.string().url().optional(),
});

serve(async (req: Request) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const auth = await requireUser(req);
  if (!auth.ok) return auth.response;

  // 10 onboarding link / ora per utente (anti-abuso)
  const limited = await rateLimit({
    key: `acct-link:${auth.userId}`,
    limit: 10,
    windowSec: 3600,
  });
  if (limited) return limited;

  const parsed = await parseBody(req, BodySchema);
  if (!parsed.ok) return parsed.response;
  const { workshopId, returnUrl, refreshUrl } = parsed.data;

  try {
    // Verifica ownership del workshop col JWT cliente (RLS)
    const { data: workshop, error } = await auth.client
      .from("workshops")
      .select("id, stripe_account_id, owner_id, fiscal_data")
      .eq("id", workshopId)
      .single();
    if (error || !workshop) return jsonError(404, "workshop_not_found");
    if (workshop.owner_id !== auth.userId) return jsonError(403, "forbidden");

    let accountId = workshop.stripe_account_id as string | null;
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "IT",
        business_type: "company",
        metadata: { workshop_id: workshopId },
      });
      accountId = account.id;
      await auth.client
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

    return jsonOk({ url: link.url, accountId });
  } catch (e) {
    console.error("stripe-create-account-link error", e);
    return jsonError(500, "internal_error");
  }
});
