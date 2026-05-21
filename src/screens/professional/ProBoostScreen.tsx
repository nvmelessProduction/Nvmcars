import { useState } from "react";
import { Alert, Linking, ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useColors } from "@/store/useThemeStore";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { track } from "@/lib/analytics";

type BoostPlan = {
  key: "week_local" | "month_local" | "week_national" | "month_national";
  label: string;
  duration: string;
  scope: string;
  priceEur: number;
};

const PLANS: BoostPlan[] = [
  { key: "week_local", label: "Boost zona — 7 giorni", duration: "7 giorni", scope: "Solo il tuo CAP", priceEur: 19 },
  { key: "month_local", label: "Boost zona — 30 giorni", duration: "30 giorni", scope: "Solo il tuo CAP", priceEur: 59 },
  { key: "week_national", label: "Boost nazionale — 7 giorni", duration: "7 giorni", scope: "Tutta Italia", priceEur: 79 },
  { key: "month_national", label: "Boost nazionale — 30 giorni", duration: "30 giorni", scope: "Tutta Italia", priceEur: 249 },
];

export function ProBoostScreen() {
  const colors = useColors();
  const user = useAuthStore((s) => s.user);
  const workshopId = user?.role === "professional" ? user.workshopId : "";
  const [busy, setBusy] = useState<string | null>(null);

  const handlePurchase = async (plan: BoostPlan) => {
    if (!workshopId) {
      Alert.alert("Errore", "Workshop non configurato.");
      return;
    }
    if (!isSupabaseConfigured) {
      Alert.alert("Modalità offline", "Configura il backend per acquistare boost.");
      return;
    }
    setBusy(plan.key);
    try {
      track("boost_purchased", { plan: plan.key, priceEur: plan.priceEur });
      const { data, error } = await supabase.functions.invoke("stripe-create-boost", {
        body: { workshopId, planKey: plan.key },
      });
      if (error || !data?.checkoutUrl) {
        Alert.alert("Errore", error?.message ?? "Impossibile creare il checkout.");
        return;
      }
      await Linking.openURL(data.checkoutUrl);
    } finally {
      setBusy(null);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>
        <View>
          <Text style={{ fontSize: 22, fontWeight: "900", color: colors.text }}>
            🚀 Boost
          </Text>
          <Text style={{ fontSize: 13, color: colors.textMuted, lineHeight: 19, marginTop: 4 }}>
            Compari in cima ai risultati di ricerca. Più clienti, più richieste, più lavoro.
          </Text>
        </View>

        <Card padding={14} style={{ backgroundColor: "rgba(245,158,11,0.08)", borderColor: "#F59E0B" }}>
          <Text style={{ fontSize: 12, color: colors.text, lineHeight: 18 }}>
            📊 Le officine boostate ricevono in media{" "}
            <Text style={{ fontWeight: "800" }}>3-5x</Text> più richieste durante il periodo attivo.
          </Text>
        </Card>

        {PLANS.map((p) => (
          <Card key={p.key} padding={16}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: "800", color: colors.text }}>{p.label}</Text>
                <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 3 }}>
                  {p.scope} · {p.duration}
                </Text>
              </View>
              <Text style={{ fontSize: 22, fontWeight: "900", color: colors.text }}>{p.priceEur}€</Text>
            </View>
            <View style={{ marginTop: 10 }}>
              <PrimaryButton
                label="Acquista boost"
                onPress={() => handlePurchase(p)}
                loading={busy === p.key}
              />
            </View>
          </Card>
        ))}

        <Card>
          <Text style={{ fontSize: 11, color: colors.textMuted, lineHeight: 16 }}>
            Il boost è cumulabile con il piano Premium. Pagamento singolo tramite Stripe.
            Non si rinnova automaticamente.
          </Text>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}
