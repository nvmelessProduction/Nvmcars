// Analytics wrapper: PostHog se configurato, no-op altrimenti.
// Eventi standardizzati per evitare typo nei call site.
//
// Setup:
//   1. npm install posthog-react-native
//   2. Aggiungi EXPO_PUBLIC_POSTHOG_API_KEY in .env (free tier 1M events/mese)
//   3. (opzionale) EXPO_PUBLIC_POSTHOG_HOST se self-hosted
//
// Uso:
//   import { track } from "@/lib/analytics";
//   track("workshop_viewed", { workshopId: "..." });

let PostHog: any = null;
try {
  PostHog = require("posthog-react-native").default;
} catch {
  PostHog = null;
}

let client: any = null;
let initialized = false;

export type AnalyticsEvent =
  | "app_open"
  | "signup_started"
  | "signup_completed"
  | "first_search"
  | "workshop_viewed"
  | "chat_sent"
  | "quote_received"
  | "quote_paid"
  | "subscription_started"
  | "subscription_canceled"
  | "diy_guide_opened"
  | "diy_pro_started"
  | "parts_searched"
  | "autodoc_link_clicked"
  | "boost_purchased"
  | "referral_redeemed"
  | "error_shown";

export function initAnalytics() {
  if (initialized) return;
  const key = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
  if (!key || !PostHog) return;
  const host = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";
  try {
    client = new PostHog(key, { host, captureAppLifecycleEvents: false });
    initialized = true;
    track("app_open");
  } catch (e) {
    console.warn("PostHog init failed:", e);
  }
}

export function identify(userId: string, properties?: Record<string, unknown>) {
  if (!client) return;
  try {
    // mai inviare email/phone/IBAN — solo l'id pseudonimo
    client.identify(userId, properties);
  } catch {
    /* noop */
  }
}

export function reset() {
  if (!client) return;
  try {
    client.reset();
  } catch {
    /* noop */
  }
}

export function track(event: AnalyticsEvent, properties?: Record<string, unknown>) {
  if (!client) return;
  try {
    client.capture(event, properties);
  } catch {
    /* noop */
  }
}

export const isAnalyticsActive = () => initialized;
