import { useLayoutEffect, useState } from "react";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  ActivityIndicator,
  Alert,
  Pressable,
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
import { isSupabaseConfigured } from "@/lib/supabase";
import { createPaymentIntent, presentStripePaymentSheet } from "@/services/payments";
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
  const [method, setMethod] = useState<"card" | "in_shop">("card");

  useLayoutEffect(() => {
    navigation.setOptions({ title: t.payment.title });
  }, [navigation, t]);

  if (!quote) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Text style={{ color: colors.textMuted }}>{t.payment.quoteNotFound}.</Text>
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
    if (cardholder.trim().length < 3) return t.payment.cardholderInvalid;
    const num = cardNumber.replace(/\s+/g, "");
    if (num.length < 12 || num.length > 19) return t.payment.cardNumberInvalid;
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return t.payment.cardExpiryInvalid;
    if (cvv.length < 3 || cvv.length > 4) return t.payment.cvvInvalid;
    return null;
  };

  const onPayInShop = () => {
    Alert.alert(
      t.payment.confirmPayAtShopTitle,
      t.payment.confirmPayAtShopBody,
      [
        { text: t.common.cancel, style: "cancel" },
        {
          text: t.common.confirm,
          onPress: () => {
            const paymentRef = `IN-SHOP-${Date.now().toString(36).toUpperCase()}`;
            setStatus(quote.id, "accepted", { acceptedAt: Date.now() });
            sendMsg({
              conversationId: quote.conversationId,
              senderId: quote.customerId,
              kind: "system",
              text: `${t.payment.payAtShopChoice}. (${t.payment.reference} ${paymentRef})`,
            });
            Alert.alert(
              t.payment.bookingConfirmedTitle,
              t.payment.bookingConfirmedBody,
              [{ text: "OK", onPress: () => navigation.popToTop() }]
            );
          },
        },
      ]
    );
  };

  const onPayCard = async () => {
    // Se Supabase configurato → prova Stripe vero via Edge Function
    if (isSupabaseConfigured) {
      setProcessing(true);
      try {
        const intent = await createPaymentIntent(quote.id);
        if (!intent.ok) {
          // Edge Function non disponibile / Stripe non onboarded → fallback mock
          if (
            intent.reason.includes("not onboarded") ||
            intent.reason.includes("non configurato") ||
            intent.reason.includes("404")
          ) {
            await runMockCardFlow();
            return;
          }
          Alert.alert(t.payment.failure, intent.reason);
          return;
        }
        const present = await presentStripePaymentSheet(intent.clientSecret, "Nvmcars");
        if (!present.ok) {
          if (present.reason?.includes("non installato")) {
            // SDK non installato in questo build → fallback mock + nota
            await runMockCardFlow();
            return;
          }
          Alert.alert(t.payment.failure, present.reason ?? "Pagamento annullato");
          return;
        }
        // Successo: il webhook Stripe aggiornerà quote.status. Aggiorna locale ora.
        setStatus(quote.id, "paid", {
          paidAt: Date.now(),
          paymentRef: intent.paymentIntentId,
        });
        sendMsg({
          conversationId: quote.conversationId,
          senderId: quote.customerId,
          kind: "system",
          text: `Pagamento confermato (€ ${quote.total.toFixed(2)}).`,
        });
        navigation.replace("PaymentSuccess", { quoteId: quote.id });
      } finally {
        setProcessing(false);
      }
      return;
    }
    // Mock mode
    const err = validate();
    if (err) {
      Alert.alert(t.payment.failure, err);
      return;
    }
    await runMockCardFlow();
  };

  const runMockCardFlow = async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1600));
    const paymentRef = `PAY-${Date.now().toString(36).toUpperCase()}`;
    setStatus(quote.id, "paid", { paidAt: Date.now(), paymentRef });
    sendMsg({
      conversationId: quote.conversationId,
      senderId: quote.customerId,
      kind: "system",
      text: `Pagamento (demo) confermato (€ ${quote.total.toFixed(2)}). Ref ${paymentRef}.`,
    });
    setProcessing(false);
    navigation.replace("PaymentSuccess", { quoteId: quote.id });
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

          <Card padding={16} style={{ borderColor: colors.warning, borderWidth: 1.2 }}>
            <Text style={{ fontSize: 13, color: colors.text, fontWeight: "700" }}>
              🚧 {t.payment.comingSoon}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4, lineHeight: 17 }}>
              {t.payment.comingSoonBody}
            </Text>
          </Card>

          <Card padding={16}>
            <Text style={{ fontSize: 12, fontWeight: "800", color: colors.textMuted, letterSpacing: 0.5, marginBottom: 12 }}>
              {t.payment.paymentMethod.toUpperCase()}
            </Text>

            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pressable
                onPress={() => setMethod("card")}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: method === "card" ? colors.accent : colors.border,
                  backgroundColor: method === "card" ? colors.accentSoft : colors.bgElevated,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 24 }}>💳</Text>
                <Text style={{ fontWeight: "800", color: colors.text, fontSize: 13, marginTop: 4 }}>
                  Carta (Demo)
                </Text>
                <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 2 }}>
                  Test mode
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setMethod("in_shop")}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: method === "in_shop" ? colors.accent : colors.border,
                  backgroundColor: method === "in_shop" ? colors.accentSoft : colors.bgElevated,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 24 }}>🏪</Text>
                <Text style={{ fontWeight: "800", color: colors.text, fontSize: 13, marginTop: 4 }}>
                  {t.payment.payAtShopChoice}
                </Text>
                <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 2 }}>
                  Niente commissione
                </Text>
              </Pressable>
            </View>
          </Card>

          {method === "card" ? (
            <Card padding={16}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "800",
                  color: colors.textMuted,
                  letterSpacing: 0.5,
                  marginBottom: 12,
                }}
              >
                {t.payment.card.toUpperCase()}
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
                <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 6, fontStyle: "italic" }}>
                  💡 {t.payment.cardSimulationNote}
                </Text>
              </View>
            </Card>
          ) : null}

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
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                justifyContent: "center",
                paddingVertical: 12,
              }}
            >
              <ActivityIndicator color={colors.accent} />
              <Text style={{ color: colors.textMuted }}>{t.payment.processing}</Text>
            </View>
          ) : method === "card" ? (
            <PrimaryButton
              label={`${t.payment.payNow} — € ${quote.total.toFixed(2)}`}
              onPress={onPayCard}
            />
          ) : (
            <PrimaryButton
              label={`${t.payment.payAtShopChoice} — € ${quote.subtotal.toFixed(2)}`}
              icon="🏪"
              onPress={onPayInShop}
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
