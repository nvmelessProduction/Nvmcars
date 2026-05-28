import { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useColors } from "@/store/useThemeStore";
import { useSubscriptionStore, Subscription } from "@/store/useSubscriptionStore";
import { useT } from "@/i18n";

const TIER_LABEL: Record<Subscription["tier"], string> = {
  free: "Free",
  pro: "Pro",
  premium: "Premium",
  diy_pro: "DIY Pro",
};

const STATUS_LABEL: Record<Subscription["status"], { label: string; color: string }> = {
  active: { label: "Attivo", color: "#10B981" },
  trialing: { label: "In prova", color: "#3B82F6" },
  past_due: { label: "Pagamento in ritardo", color: "#F59E0B" },
  canceled: { label: "Cancellato", color: "#64748B" },
  incomplete: { label: "Incompleto", color: "#F59E0B" },
  incomplete_expired: { label: "Scaduto", color: "#64748B" },
  unpaid: { label: "Non pagato", color: "#EF4444" },
};

export function SubscriptionManageScreen() {
  const colors = useColors();
  const t = useT();
  const navigation = useNavigation<any>();
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const cancel = useSubscriptionStore((s) => s.cancel);
  const [busy, setBusy] = useState<string | null>(null);

  const handleCancel = (sub: Subscription) => {
    if (sub.cancelAtPeriodEnd) return;
    Alert.alert(
      "Disdire abbonamento?",
      `${TIER_LABEL[sub.tier]} resterà attivo fino al ${formatDate(sub.currentPeriodEnd)}. Poi non si rinnoverà.`,
      [
        { text: t.common.cancel, style: "cancel" },
        {
          text: "Disdici",
          style: "destructive",
          onPress: async () => {
            setBusy(sub.id);
            try {
              const res = await cancel(sub.id);
              if (!res.ok) {
                Alert.alert("Errore", res.reason ?? "Errore");
                return;
              }
              Alert.alert("✅ Disdetto", "L'abbonamento non si rinnoverà alla scadenza.");
            } finally {
              setBusy(null);
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>
        <View>
          <Text style={{ fontSize: 22, fontWeight: "900", color: colors.text }}>
            I tuoi abbonamenti
          </Text>
        </View>

        {subscriptions.length === 0 ? (
          <Card padding={20}>
            <Text style={{ fontSize: 14, color: colors.text, marginBottom: 10 }}>
              Non hai abbonamenti attivi.
            </Text>
            <PrimaryButton
              label="Scopri i piani"
              icon="⚡"
              onPress={() => navigation.navigate("ProUpgrade")}
            />
          </Card>
        ) : null}

        {subscriptions.map((sub) => {
          const statusMeta = STATUS_LABEL[sub.status];
          return (
            <Card key={sub.id} padding={18}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 18, fontWeight: "900", color: colors.text }}>
                  {TIER_LABEL[sub.tier]}
                </Text>
                <View
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 999,
                    backgroundColor: `${statusMeta.color}22`,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: "800", color: statusMeta.color }}>
                    {statusMeta.label}
                  </Text>
                </View>
              </View>

              {sub.currentPeriodEnd ? (
                <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 6 }}>
                  {sub.cancelAtPeriodEnd ? "Scade il " : "Rinnovo il "}
                  {formatDate(sub.currentPeriodEnd)}
                </Text>
              ) : null}

              {sub.cancelAtPeriodEnd ? (
                <View style={{ marginTop: 10, padding: 10, borderRadius: 10, backgroundColor: "rgba(245,158,11,0.1)" }}>
                  <Text style={{ fontSize: 12, color: colors.text, lineHeight: 17 }}>
                    ⚠️ Disdetto. Non si rinnoverà alla scadenza.
                  </Text>
                </View>
              ) : (
                <View style={{ marginTop: 14 }}>
                  <PrimaryButton
                    label="Disdici alla scadenza"
                    variant="ghost"
                    onPress={() => handleCancel(sub)}
                    loading={busy === sub.id}
                  />
                </View>
              )}
            </Card>
          );
        })}

        <Card>
          <Text style={{ fontSize: 11, color: colors.textMuted, lineHeight: 16 }}>
            La disdetta si applica alla fine del periodo già pagato. Nessun rimborso parziale.
            Per assistenza scrivi a nvmcarshelp@gmail.com.
          </Text>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
}
