import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type PaymentIntentResult =
  | { ok: true; clientSecret: string; paymentIntentId: string }
  | { ok: false; reason: string };

export async function createPaymentIntent(quoteId: string): Promise<PaymentIntentResult> {
  if (!isSupabaseConfigured) {
    return { ok: false, reason: "Backend non configurato" };
  }
  try {
    const { data, error } = await supabase.functions.invoke("stripe-create-payment-intent", {
      body: { quoteId },
    });
    if (error) return { ok: false, reason: error.message };
    if (!data?.clientSecret) return { ok: false, reason: data?.error ?? "Errore creazione pagamento" };
    return { ok: true, clientSecret: data.clientSecret, paymentIntentId: data.paymentIntentId };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : "Errore di rete" };
  }
}

export type AccountLinkResult =
  | { ok: true; url: string; accountId: string }
  | { ok: false; reason: string };

export async function createStripeAccountLink(
  workshopId: string,
  options?: { returnUrl?: string; refreshUrl?: string }
): Promise<AccountLinkResult> {
  if (!isSupabaseConfigured) return { ok: false, reason: "Backend non configurato" };
  try {
    const { data, error } = await supabase.functions.invoke("stripe-create-account-link", {
      body: {
        workshopId,
        returnUrl: options?.returnUrl ?? "nvmcars://stripe/return",
        refreshUrl: options?.refreshUrl ?? "nvmcars://stripe/refresh",
      },
    });
    if (error) return { ok: false, reason: error.message };
    if (!data?.url) return { ok: false, reason: data?.error ?? "Errore" };
    return { ok: true, url: data.url, accountId: data.accountId };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : "Errore di rete" };
  }
}

// Stripe SDK è opzionale: caricato dinamicamente solo se installato.
// Quando @stripe/stripe-react-native non è in node_modules, la chiamata fa fallback.
export async function presentStripePaymentSheet(
  clientSecret: string,
  merchantDisplayName = "Nvmcars"
): Promise<{ ok: boolean; reason?: string }> {
  try {
    // Import dinamico per non rompere il bundle se la dep non è installata.
    // @ts-ignore
    const stripeMod = await import("@stripe/stripe-react-native").catch(() => null);
    if (!stripeMod || !stripeMod.initPaymentSheet || !stripeMod.presentPaymentSheet) {
      return { ok: false, reason: "Stripe SDK non installato" };
    }
    const initRes = await stripeMod.initPaymentSheet({
      paymentIntentClientSecret: clientSecret,
      merchantDisplayName,
    });
    if (initRes.error) return { ok: false, reason: initRes.error.message };
    const present = await stripeMod.presentPaymentSheet();
    if (present.error) return { ok: false, reason: present.error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : "Errore Stripe" };
  }
}
