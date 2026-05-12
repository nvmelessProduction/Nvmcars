import { useLayoutEffect, useState } from "react";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  View,
} from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { KAV } from "@/components/KAV";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TextField } from "@/components/TextField";
import { useQuoteStore } from "@/store/useQuoteStore";
import { useChatStore } from "@/store/useChatStore";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import type { HomeStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<HomeStackParamList, "Payment">;
type Route = RouteProp<HomeStackParamList, "Payment">;

export function PaymentScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const colors = useColors();
  const t = useT();
  const quote = useQuoteStore((s) => s.byId(route.params.quoteId));
  const setStatus = useQuoteStore((s) => s.setStatus);
  const sendMsg = useChatStore((s) => s.send);

  const [cardholder, setCardholder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [processing, setProcessing] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: t.payment.title });
  }, [navigation, t]);

  if (!quote) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Text style={{ color: colors.textMuted }}>Preventivo non trovato.</Text>
        </View>
      </ScreenContainer>
    );
  }

  const formatCardNumber = (raw: string) =>
    raw
      .replace(/[^0-9]/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();

  const formatExpiry = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, "").slice(0, 4);
    if (digits.length < 3) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const validate = () => {
    if (cardholder.trim().length < 3) return "Intestatario non valido.";
    const num = cardNumber.replace(/\s+/g, "");
    if (num.length < 12 || num.length > 19) return "Numero carta non valido.";
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return "Scadenza non valida.";
    if (cvv.length < 3 || cvv.length > 4) return "CVV non valido.";
    return null;
  };

  const onPay = () => {
    const err = validate();
    if (err) {
      Alert.alert(t.payment.failure, err);
      return;
    }
    setProcessing(true);
    setTimeout(() => {
      const paymentRef = `PAY-${Date.now().toString(36).toUpperCase()}`;
      setStatus(quote.id, "paid", { paidAt: Date.now(), paymentRef });
      sendMsg({
        conversationId: quote.conversationId,
        senderId: quote.customerId,
        kind: "system",
        text: `Pagamento confermato (€ ${quote.total.toFixed(2)}). Ref ${paymentRef}.`,
      });
      setProcessing(false);
      navigation.replace("PaymentSuccess", { quoteId: quote.id });
    }, 1600);
  };

  return (
    <ScreenContainer>
      <KAV>
        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <Card padding={16}>
            <Text style={{ fontSize: 12, fontWeight: "800", color: colors.textMuted, letterSpacing: 0.5 }}>
              {t.payment.summary.toUpperCase()}
            </Text>
            <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text, marginTop: 8 }}>
              {quote.title}
            </Text>

            <View style={{ marginTop: 14, gap: 6 }}>
              <Row label={t.quote.subtotal} value={`€ ${quote.subtotal.toFixed(2)}`} colors={colors} />
              <Row
                label={`${t.quote.commissionFee} (${(quote.commissionFeePct * 100).toFixed(0)}%)`}
                value={`€ ${quote.commissionFee.toFixed(2)}`}
                colors={colors}
                sub
              />
              <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 4 }} />
              <Row
                label={t.payment.payNow}
                value={`€ ${quote.total.toFixed(2)}`}
                colors={colors}
                strong
              />
            </View>
          </Card>

          <Card padding={16}>
            <Text style={{ fontSize: 12, fontWeight: "800", color: colors.textMuted, letterSpacing: 0.5, marginBottom: 12 }}>
              {t.payment.paymentMethod.toUpperCase()}
            </Text>

            <View style={{ gap: 10 }}>
              <TextField
                label={t.payment.cardholderName}
                value={cardholder}
                onChangeText={setCardholder}
                placeholder="Mario Rossi"
                autoCapitalize="words"
              />
              <TextField
                label={t.payment.cardNumber}
                value={cardNumber}
                onChangeText={(v) => setCardNumber(formatCardNumber(v))}
                placeholder="0000 0000 0000 0000"
                keyboardType="number-pad"
              />
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <TextField
                    label={t.payment.cardExpiry}
                    value={expiry}
                    onChangeText={(v) => setExpiry(formatExpiry(v))}
                    placeholder="MM/AA"
                    keyboardType="number-pad"
                    maxLength={5}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <TextField
                    label={t.payment.cardCvv}
                    value={cvv}
                    onChangeText={(v) => setCvv(v.replace(/[^0-9]/g, "").slice(0, 4))}
                    placeholder="123"
                    keyboardType="number-pad"
                    secureTextEntry
                    maxLength={4}
                  />
                </View>
              </View>
            </View>
          </Card>

          <View
            style={{
              padding: 14,
              borderRadius: 14,
              backgroundColor: colors.accentSoft,
              gap: 6,
            }}
          >
            <Text style={{ fontSize: 13, color: colors.text, fontWeight: "700" }}>
              🔒 {t.payment.secureNote}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textMuted, lineHeight: 17 }}>
              {t.payment.encryptedNote}
            </Text>
          </View>

          {processing ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, justifyContent: "center", paddingVertical: 12 }}>
              <ActivityIndicator color={colors.accent} />
              <Text style={{ color: colors.textMuted }}>{t.payment.processing}</Text>
            </View>
          ) : (
            <PrimaryButton
              label={`${t.payment.payNow} — € ${quote.total.toFixed(2)}`}
              onPress={onPay}
            />
          )}
        </ScrollView>
      </KAV>
    </ScreenContainer>
  );
}

function Row({
  label,
  value,
  colors,
  sub,
  strong,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useColors>;
  sub?: boolean;
  strong?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          fontSize: strong ? 16 : 14,
          fontWeight: strong ? "800" : sub ? "500" : "600",
          color: sub ? colors.textMuted : colors.text,
          flex: 1,
          paddingRight: 10,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: strong ? 20 : 15,
          fontWeight: strong ? "900" : "700",
          color: strong ? colors.accent : colors.text,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
