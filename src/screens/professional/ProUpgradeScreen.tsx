import { useState } from "react";
import { Alert, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useColors } from "@/store/useThemeStore";
import { useSubscriptionStore, SubscriptionTier } from "@/store/useSubscriptionStore";
import { track } from "@/lib/analytics";

type Plan = {
  tier: Exclude<SubscriptionTier, "free" | "diy_pro">;
  name: string;
  price: string;
  period: string;
  badge?: string;
  features: string[];
  cta: string;
};

const PLANS: Plan[] = [
  {
    tier: "pro",
    name: "Pro",
    price: "29€",
    period: "/mese",
    features: [
      "Richieste illimitate",
      "Calendario completo",
      "Statistiche avanzate",
      "Badge verificato ✓",
      "Risposta in chat <24h garantita",
    ],
    cta: "Attiva Pro",
  },
  {
    tier: "premium",
    name: "Premium",
    price: "79€",
    period: "/mese",
    badge: "Top risultati",
    features: [
      "Tutto di Pro",
      "Top nei risultati di ricerca",
      "Supporto diretto via WhatsApp",
      "Recensioni in evidenza",
      "Boost mensile gratuito",
      "Accesso revisore guide DIY",
    ],
    cta: "Attiva Premium",
  },
];

export function ProUpgradeScreen() {
  const colors = useColors();
  const proTier = useSubscriptionStore((s) => s.proTier);
  const startCheckout = useSubscriptionStore((s) => s.startCheckout);
  const [busy, setBusy] = useState<SubscriptionTier | null>(null);

  const handleUpgrade = async (tier: Plan["tier"]) => {
    setBusy(tier);
    try {
      track("subscription_started", { tier });
      const res = await startCheckout(tier);
      if (!res.ok) {
        Alert.alert("Errore", res.reason);
        return;
      }
      await Linking.openURL(res.url);
    } catch (e) {
      Alert.alert("Errore", String(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>
        <View style={{ marginBottom: 4 }}>
          <Text style={{ fontSize: 22, fontWeight: "900", color: colors.text }}>
            Sblocca il tuo potenziale ⚡
          </Text>
          <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 4, lineHeight: 21 }}>
            Tutti i piani includono 30 giorni gratis di prova. Annulli quando vuoi.
          </Text>
        </View>

        <Card padding={16} style={{ backgroundColor: "rgba(0,170,255,0.08)", borderColor: colors.accent }}>
          <Text style={{ fontSize: 13, color: colors.text, fontWeight: "600", marginBottom: 4 }}>
            🎁 Offerta pioniere
          </Text>
          <Text style={{ fontSize: 12, color: colors.textMuted, lineHeight: 18 }}>
            Le prime 100 officine: 19€/mese a vita per il piano Pro. Iscrivendoti adesso entri nel club.
          </Text>
        </Card>

        {PLANS.map((p) => {
          const active = proTier === p.tier;
          return (
            <Card key={p.tier} padding={20}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={{ fontSize: 20, fontWeight: "900", color: colors.text }}>{p.name}</Text>
                {p.badge ? (
                  <View style={{ backgroundColor: colors.accent, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
                    <Text style={{ color: "#FFF", fontSize: 11, fontWeight: "800" }}>{p.badge}</Text>
                  </View>
                ) : null}
              </View>
              <View style={{ flexDirection: "row", alignItems: "flex-end", marginBottom: 12 }}>
                <Text style={{ fontSize: 32, fontWeight: "900", color: colors.text }}>{p.price}</Text>
                <Text style={{ fontSize: 14, color: colors.textMuted, marginLeft: 4, marginBottom: 5 }}>{p.period}</Text>
              </View>
              <View style={{ gap: 6, marginBottom: 16 }}>
                {p.features.map((f) => (
                  <View key={f} style={{ flexDirection: "row", gap: 8 }}>
                    <Text style={{ color: colors.accent, fontSize: 14, fontWeight: "900" }}>✓</Text>
                    <Text style={{ flex: 1, fontSize: 13, color: colors.text, lineHeight: 19 }}>{f}</Text>
                  </View>
                ))}
              </View>
              {active ? (
                <View
                  style={{
                    paddingVertical: 12,
                    borderRadius: 14,
                    backgroundColor: colors.bgHeader,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#FFF", fontWeight: "700" }}>✓ Piano attivo</Text>
                </View>
              ) : (
                <PrimaryButton
                  label={p.cta}
                  onPress={() => handleUpgrade(p.tier)}
                  loading={busy === p.tier}
                />
              )}
            </Card>
          );
        })}

        <Card>
          <Text style={{ fontSize: 11, color: colors.textMuted, lineHeight: 16 }}>
            Il pagamento è gestito da Stripe. Puoi annullare l&apos;abbonamento in qualsiasi
            momento dalle impostazioni. Nessun rimborso parziale. IVA inclusa quando applicabile.
          </Text>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}
