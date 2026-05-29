import { ReactNode } from "react";
import { Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useColors } from "@/store/useThemeStore";
import { useSubscriptionStore, isProActive, isPremiumActive, isDiyProActive, SubscriptionTier } from "@/store/useSubscriptionStore";

type Props = {
  /** Tier minimo richiesto. Default: pro. */
  requires?: "pro" | "premium" | "diy_pro";
  /** Quale tipo di gate: officina (default) o cliente. */
  audience?: "pro" | "customer";
  /** Titolo del paywall (override). */
  title?: string;
  /** Descrizione (override). */
  description?: string;
  /** Naviga a una route specifica al press CTA. Default: ProUpgrade per pro, DiyUpgrade per customer. */
  upgradeRoute?: string;
  children: ReactNode;
};

export function ProFeatureGate({
  requires = "pro",
  audience = "pro",
  title,
  description,
  upgradeRoute,
  children,
}: Props) {
  const colors = useColors();
  const navigation = useNavigation<any>();
  const proTier = useSubscriptionStore((s) => s.proTier);
  const customerTier = useSubscriptionStore((s) => s.customerTier);

  const tier: SubscriptionTier = audience === "customer" ? customerTier : proTier;

  let allowed = false;
  if (requires === "pro") allowed = isProActive(tier);
  else if (requires === "premium") allowed = isPremiumActive(tier);
  else if (requires === "diy_pro") allowed = isDiyProActive(tier);

  if (allowed) return <>{children}</>;

  return (
    <View style={{ padding: 16, gap: 14 }}>
      <Card padding={20}>
        <Text style={{ fontSize: 32, marginBottom: 8 }}>🔒</Text>
        <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text, marginBottom: 6 }}>
          {title ?? (audience === "customer" ? "Funzione DIY Pro" : "Funzione Pro")}
        </Text>
        <Text style={{ fontSize: 14, color: colors.textMuted, lineHeight: 21, marginBottom: 14 }}>
          {description ??
            (audience === "customer"
              ? "Sblocca tutte le guide fai-da-te con DIY Pro a 4,99€/mese."
              : "Sblocca richieste illimitate, calendario completo, statistiche avanzate.")}
        </Text>
        <PrimaryButton
          label={audience === "customer" ? "Attiva DIY Pro" : "Scopri i piani Pro"}
          icon={audience === "customer" ? "🔧" : "⚡"}
          onPress={() =>
            navigation.navigate(upgradeRoute ?? (audience === "customer" ? "DiyUpgrade" : "ProUpgrade"))
          }
        />
      </Card>
    </View>
  );
}

/**
 * Gate inline per casi semplici: ritorna `true` se l'utente può.
 * Esempio: `if (!useProFeatureAllowed()) return <Paywall/>;`
 */
export function useProFeatureAllowed(
  requires: "pro" | "premium" | "diy_pro" = "pro"
): boolean {
  const proTier = useSubscriptionStore((s) => s.proTier);
  const customerTier = useSubscriptionStore((s) => s.customerTier);
  if (requires === "diy_pro") return isDiyProActive(customerTier);
  if (requires === "premium") return isPremiumActive(proTier);
  return isProActive(proTier);
}
