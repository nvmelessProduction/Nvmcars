import { useState } from "react";
import { Alert, Linking, ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useColors } from "@/store/useThemeStore";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";
import { track } from "@/lib/analytics";

const FEATURES = [
  "Tutte le guide fai-da-te sbloccate (50+ tutorial)",
  "Video HD passo-passo",
  "Lista pezzi precisa per la TUA auto",
  "Link diretti per comprare i pezzi (Autodoc)",
  "Lista attrezzi consigliati con prezzi",
  "Modalità offline (consulti in garage senza rete)",
  "Verificate dai meccanici Premium",
];

export function DiyUpgradeScreen() {
  const colors = useColors();
  const customerTier = useSubscriptionStore((s) => s.customerTier);
  const startCheckout = useSubscriptionStore((s) => s.startCheckout);
  const [busy, setBusy] = useState(false);

  const active = customerTier === "diy_pro";

  const handleUpgrade = async () => {
    setBusy(true);
    try {
      track("subscription_started", { tier: "diy_pro" });
      const res = await startCheckout("diy_pro");
      if (!res.ok) {
        Alert.alert("Errore", res.reason);
        return;
      }
      await Linking.openURL(res.url);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>
        <View style={{ marginBottom: 4 }}>
          <Text style={{ fontSize: 22, fontWeight: "900", color: colors.text }}>
            DIY Pro 🔧
          </Text>
          <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 4, lineHeight: 21 }}>
            Ripara la tua auto da solo. Risparmi sulla manodopera e impari un mestiere.
          </Text>
        </View>

        <Card padding={20}>
          <View style={{ flexDirection: "row", alignItems: "flex-end", marginBottom: 16 }}>
            <Text style={{ fontSize: 36, fontWeight: "900", color: colors.text }}>4,99€</Text>
            <Text style={{ fontSize: 16, color: colors.textMuted, marginLeft: 6, marginBottom: 6 }}>
              /mese
            </Text>
          </View>
          <View style={{ gap: 8, marginBottom: 16 }}>
            {FEATURES.map((f) => (
              <View key={f} style={{ flexDirection: "row", gap: 8 }}>
                <Text style={{ color: colors.accent, fontSize: 15, fontWeight: "900" }}>✓</Text>
                <Text style={{ flex: 1, fontSize: 14, color: colors.text, lineHeight: 20 }}>{f}</Text>
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
              <Text style={{ color: "#FFF", fontWeight: "700" }}>✓ DIY Pro attivo</Text>
            </View>
          ) : (
            <PrimaryButton label="Attiva DIY Pro" icon="🔧" onPress={handleUpgrade} loading={busy} />
          )}
        </Card>

        <Card>
          <Text style={{ fontSize: 12, color: colors.textMuted, lineHeight: 17 }}>
            Risparmio medio per intervento DIY: 80-150€ in manodopera. La sicurezza prima
            di tutto: se non te la senti, ogni guida ti indica la complessità e quando è
            meglio rivolgersi a un&apos;officina.
          </Text>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}
