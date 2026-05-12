import { useLayoutEffect } from "react";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import { Alert, ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useQuoteStore } from "@/store/useQuoteStore";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import { WORKSHOPS } from "@/data/workshops";

type Route = RouteProp<{ QuoteDetail: { quoteId: string } }, "QuoteDetail">;

export function QuoteDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<Route>();
  const colors = useColors();
  const t = useT();
  const user = useAuthStore((s) => s.user);
  const quote = useQuoteStore((s) => s.byId(route.params.quoteId));
  const setStatus = useQuoteStore((s) => s.setStatus);
  const sendMsg = useChatStore((s) => s.send);

  useLayoutEffect(() => {
    navigation.setOptions({ title: t.quote.quote });
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

  const workshop = WORKSHOPS.find((w) => w.id === quote.workshopId);
  const isCustomer = user?.id === quote.customerId;
  const isPro = user?.role === "professional";
  const canAct = isCustomer && quote.status === "pending";

  const onAccept = () => {
    setStatus(quote.id, "accepted", { acceptedAt: Date.now() });
    sendMsg({
      conversationId: quote.conversationId,
      senderId: quote.customerId,
      kind: "system",
      text: "Hai accettato il preventivo. Procedi con il pagamento sicuro.",
    });
    navigation.navigate("Payment", { quoteId: quote.id });
  };

  const onReject = () => {
    Alert.alert(t.quote.reject, t.quote.rejectConfirm, [
      { text: t.common.cancel, style: "cancel" },
      {
        text: t.quote.reject,
        style: "destructive",
        onPress: () => {
          setStatus(quote.id, "rejected");
          sendMsg({
            conversationId: quote.conversationId,
            senderId: quote.customerId,
            kind: "system",
            text: "Il cliente ha rifiutato il preventivo.",
          });
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}>
        <View>
          <Text style={{ fontSize: 11, fontWeight: "800", color: colors.accent, letterSpacing: 0.5 }}>
            {t.quote.quote.toUpperCase()} •{" "}
            {t.quote.status[quote.status as keyof typeof t.quote.status]?.toUpperCase() ?? quote.status.toUpperCase()}
          </Text>
          <Text style={{ fontSize: 24, fontWeight: "800", color: colors.text, marginTop: 6 }}>
            {quote.title}
          </Text>
          {workshop ? (
            <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 4 }}>
              {workshop.name} • {workshop.city}
            </Text>
          ) : null}
        </View>

        {quote.notes ? (
          <Card padding={14}>
            <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 4, fontWeight: "600" }}>
              Note
            </Text>
            <Text style={{ color: colors.text, fontSize: 14, lineHeight: 20 }}>{quote.notes}</Text>
          </Card>
        ) : null}

        <Card padding={16}>
          <Text style={{ fontSize: 12, fontWeight: "800", color: colors.textMuted, letterSpacing: 0.5, marginBottom: 10 }}>
            DETTAGLIO INTERVENTO
          </Text>
          {quote.lineItems.map((li) => (
            <View
              key={li.id}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 8,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={{ color: colors.text, fontSize: 14, fontWeight: "600" }}>
                  {li.description}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
                  {li.quantity} × € {li.unitPrice.toFixed(2)}
                </Text>
              </View>
              <Text style={{ color: colors.text, fontSize: 15, fontWeight: "700" }}>
                € {(li.quantity * li.unitPrice).toFixed(2)}
              </Text>
            </View>
          ))}

          <View style={{ marginTop: 12 }}>
            <Row label={t.quote.subtotal} value={`€ ${quote.subtotal.toFixed(2)}`} colors={colors} />
            <Row
              label={`${t.quote.commissionFee} (${(quote.commissionFeePct * 100).toFixed(0)}%)`}
              value={`€ ${quote.commissionFee.toFixed(2)}`}
              colors={colors}
              sub
            />
            <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 8 }} />
            <Row
              label={t.quote.total}
              value={`€ ${quote.total.toFixed(2)}`}
              colors={colors}
              strong
            />
          </View>

          <View
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 12,
              backgroundColor: colors.accentSoft,
            }}
          >
            <Text style={{ fontSize: 12, color: colors.text, lineHeight: 18 }}>
              🔒 {t.quote.commissionFeeNote}
            </Text>
          </View>
        </Card>

        <Text style={{ fontSize: 12, color: colors.textMuted, textAlign: "center" }}>
          {t.quote.validUntil}:{" "}
          {new Date(quote.validUntil).toLocaleDateString("it-IT", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </Text>

        {canAct ? (
          <View style={{ gap: 10, marginTop: 6 }}>
            <PrimaryButton label={t.quote.acceptAndPay} onPress={onAccept} />
            <PrimaryButton label={t.quote.reject} variant="ghost" onPress={onReject} />
          </View>
        ) : null}

        {quote.status === "accepted" && isCustomer ? (
          <View style={{ marginTop: 6 }}>
            <PrimaryButton
              label={t.quote.acceptAndPay}
              onPress={() => navigation.navigate("Payment", { quoteId: quote.id })}
            />
          </View>
        ) : null}

        {quote.status === "paid" ? (
          <Card padding={16}>
            <Text style={{ color: colors.success, fontWeight: "800", fontSize: 15 }}>
              ✓ {t.quote.customerPaid}
            </Text>
            <Text style={{ color: colors.textMuted, marginTop: 4, fontSize: 13 }}>
              Pagamento completato. L'officina riceverà il bonifico al ritiro.
            </Text>
          </Card>
        ) : null}

        {quote.status === "rejected" ? (
          <Card padding={16}>
            <Text style={{ color: colors.danger, fontWeight: "800", fontSize: 15 }}>
              ✗ {t.quote.customerRejected}
            </Text>
          </Card>
        ) : null}

        {isPro && quote.status === "pending" ? (
          <Card padding={16}>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>
              ⏱ {t.quote.waitingForCustomer}
            </Text>
          </Card>
        ) : null}
      </ScrollView>
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
        paddingVertical: sub ? 4 : 6,
      }}
    >
      <Text
        style={{
          fontSize: strong ? 16 : 14,
          fontWeight: strong ? "800" : sub ? "500" : "600",
          color: sub ? colors.textMuted : colors.text,
          flex: 1,
          paddingRight: 12,
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
