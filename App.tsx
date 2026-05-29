import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RootNavigator } from "@/navigation/RootNavigator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AdminBanner } from "@/components/AdminBanner";
import { useIsDark } from "@/store/useThemeStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useCarStore } from "@/store/useCarStore";
import { useWorkshopStore } from "@/store/useWorkshopStore";
import { useBookingsStore } from "@/store/useBookingsStore";
import { useChatStore } from "@/store/useChatStore";
import { useNotificationsStore } from "@/store/useNotificationsStore";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";
import { useDiyStore } from "@/store/useDiyStore";
import * as authService from "@/services/auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import { initSentry } from "@/lib/sentry";
import { initAnalytics, identify, reset } from "@/lib/analytics";
import { requestTrackingPermissionIfNeeded } from "@/utils/tracking";
import { registerForPushNotificationsAsync } from "@/utils/pushNotifications";

// Stripe Provider — caricato dinamicamente solo se la dep è installata
let StripeProvider: any = null;
try {
  StripeProvider = require("@stripe/stripe-react-native").StripeProvider;
} catch {
  StripeProvider = null;
}

const STRIPE_PUBLISHABLE = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AppBootstrap>
          <StripeWrapper>
            <RootNavigator />
            <ThemedStatusBar />
            <AdminBanner />
          </StripeWrapper>
        </AppBootstrap>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

function StripeWrapper({ children }: { children: React.ReactNode }) {
  if (!StripeProvider || !STRIPE_PUBLISHABLE) return <>{children}</>;
  return (
    <StripeProvider
      publishableKey={STRIPE_PUBLISHABLE}
      merchantIdentifier="merchant.com.nvmcars.app"
    >
      {children}
    </StripeProvider>
  );
}

function AppBootstrap({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const hydrateCars = useCarStore((s) => s.hydrate);
  const hydrateWorkshops = useWorkshopStore((s) => s.hydrateAll);
  const hydrateWorkshopById = useWorkshopStore((s) => s.hydrateById);
  const hydrateBookings = useBookingsStore((s) => s.hydrate);
  const hydrateConversations = useChatStore((s) => s.hydrateConversations);
  const hydrateNotifications = useNotificationsStore((s) => s.hydrate);
  const hydrateFavorites = useFavoritesStore((s) => s.hydrate);
  const hydrateSubscriptions = useSubscriptionStore((s) => s.hydrate);
  const hydrateDiy = useDiyStore((s) => s.hydrate);

  // Init globali una volta
  useEffect(() => {
    initSentry();
    initAnalytics();
    requestTrackingPermissionIfNeeded().catch(() => undefined);
  }, []);

  // Identify utente in PostHog quando cambia
  useEffect(() => {
    if (user) {
      identify(user.id, { role: user.role });
    } else {
      reset();
    }
  }, [user]);

  // Sync session Supabase ↔ store
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const unsub = authService.onAuthChange((u) => {
      setUser(u);
    });
    // hydrate initial user
    authService.getCurrentUser().then((u) => {
      if (u) setUser(u);
    });
    return () => unsub();
  }, [setUser]);

  // Quando c'è un user, hydrate degli store correlati
  useEffect(() => {
    if (!user) return;
    if (isSupabaseConfigured) {
      registerForPushNotificationsAsync(user.id).catch(() => undefined);
      hydrateNotifications(user.id).catch(() => undefined);
      hydrateWorkshops().catch(() => undefined);
      hydrateSubscriptions(user.id).catch(() => undefined);
      hydrateDiy().catch(() => undefined);
      if (user.role === "customer") {
        hydrateCars(user.id).catch(() => undefined);
        hydrateBookings({ customerId: user.id }).catch(() => undefined);
        hydrateConversations({ customerId: user.id }).catch(() => undefined);
        hydrateFavorites(user.id).catch(() => undefined);
      } else if (user.role === "professional") {
        hydrateBookings({ workshopId: user.workshopId }).catch(() => undefined);
        hydrateConversations({ workshopId: user.workshopId }).catch(() => undefined);
        if (user.workshopId) hydrateWorkshopById(user.workshopId).catch(() => undefined);
      }
      // admin: niente hydrate role-specific (visualizza solo)
    }
  }, [
    user,
    hydrateCars,
    hydrateWorkshops,
    hydrateWorkshopById,
    hydrateBookings,
    hydrateConversations,
    hydrateNotifications,
    hydrateFavorites,
    hydrateSubscriptions,
    hydrateDiy,
  ]);

  return <>{children}</>;
}

function ThemedStatusBar() {
  const isDark = useIsDark();
  return <StatusBar style={isDark ? "light" : "dark"} />;
}
