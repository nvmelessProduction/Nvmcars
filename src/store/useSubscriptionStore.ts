import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type SubscriptionTier = "free" | "pro" | "premium" | "diy_pro";

export type Subscription = {
  id: string;
  tier: SubscriptionTier;
  status: "active" | "past_due" | "canceled" | "trialing" | "incomplete" | "incomplete_expired" | "unpaid";
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

type SubscriptionState = {
  subscriptions: Subscription[];
  proTier: SubscriptionTier;       // computed: tier dell'officina
  customerTier: SubscriptionTier;  // computed: tier del cliente (free o diy_pro)
  monthlyRequestCount: number;     // contatore richieste mese corrente
  loading: boolean;
  hydrate: (userId: string) => Promise<void>;
  startCheckout: (
    tier: Exclude<SubscriptionTier, "free">
  ) => Promise<{ ok: true; url: string } | { ok: false; reason: string }>;
  cancel: (subscriptionId: string) => Promise<{ ok: boolean; reason?: string }>;
  bumpRequestCount: () => void;
};

function computeTiers(subs: Subscription[]) {
  const active = subs.filter(
    (s) => s.status === "active" || s.status === "trialing"
  );
  const proTier =
    active.find((s) => s.tier === "premium")?.tier ??
    active.find((s) => s.tier === "pro")?.tier ??
    "free";
  const customerTier =
    active.find((s) => s.tier === "diy_pro")?.tier ?? "free";
  return { proTier, customerTier };
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      subscriptions: [],
      proTier: "free",
      customerTier: "free",
      monthlyRequestCount: 0,
      loading: false,

      hydrate: async (userId: string) => {
        if (!isSupabaseConfigured) return;
        set({ loading: true });
        try {
          const { data, error } = await supabase
            .from("subscriptions")
            .select("id, tier, status, current_period_end, cancel_at_period_end")
            .eq("user_id", userId);
          if (error || !data) return;
          const subs: Subscription[] = data.map((r) => ({
            id: r.id,
            tier: r.tier as SubscriptionTier,
            status: r.status as Subscription["status"],
            currentPeriodEnd: r.current_period_end,
            cancelAtPeriodEnd: !!r.cancel_at_period_end,
          }));
          const { proTier, customerTier } = computeTiers(subs);
          set({ subscriptions: subs, proTier, customerTier });
        } finally {
          set({ loading: false });
        }
      },

      startCheckout: async (tier) => {
        if (!isSupabaseConfigured) {
          return { ok: false, reason: "backend_not_configured" };
        }
        try {
          const { data, error } = await supabase.functions.invoke(
            "stripe-create-subscription",
            { body: { tier } }
          );
          if (error) return { ok: false, reason: error.message ?? "error" };
          if (!data?.checkoutUrl) return { ok: false, reason: "missing_url" };
          return { ok: true, url: data.checkoutUrl as string };
        } catch (e) {
          return { ok: false, reason: e instanceof Error ? e.message : String(e) };
        }
      },

      cancel: async (subscriptionId) => {
        if (!isSupabaseConfigured) {
          return { ok: false, reason: "backend_not_configured" };
        }
        try {
          const { error } = await supabase.functions.invoke(
            "stripe-cancel-subscription",
            { body: { subscriptionId } }
          );
          if (error) return { ok: false, reason: error.message };
          return { ok: true };
        } catch (e) {
          return { ok: false, reason: e instanceof Error ? e.message : String(e) };
        }
      },

      bumpRequestCount: () => {
        set({ monthlyRequestCount: get().monthlyRequestCount + 1 });
      },
    }),
    {
      name: "nvmcars-subscription",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ monthlyRequestCount: s.monthlyRequestCount }),
    }
  )
);

// Helpers
export const FREE_MONTHLY_REQUESTS_LIMIT = 5;

export function isProActive(tier: SubscriptionTier): boolean {
  return tier === "pro" || tier === "premium";
}

export function isPremiumActive(tier: SubscriptionTier): boolean {
  return tier === "premium";
}

export function isDiyProActive(tier: SubscriptionTier): boolean {
  return tier === "diy_pro";
}
