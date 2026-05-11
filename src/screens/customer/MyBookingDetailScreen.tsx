import { Alert, ScrollView, Text, View } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useBookingsStore } from "@/store/useBookingsStore";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import { WORKSHOPS } from "@/data/workshops";
import { getServiceLabel, getServiceEmoji } from "@/data/services";
import { openWhatsApp } from "@/utils/whatsapp";
import type { BookingStatus } from "@/types";
import type { BookingsStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<BookingsStackParamList, "BookingDetail">;
type Route = RouteProp<BookingsStackParamList, "BookingDetail">;

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: "#F59E0B",
  accepted: "#10B981",
  rejected: "#EF4444",
  completed: "#64748B",
  cancelled: "#EF4444",
};

export function MyBookingDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { bookingId } = route.params;
  const colors = useColors();
  const t = useT();
  const booking = useBookingsStore((s) => s.bookings.find((b) => b.id === bookingId));
  const updateStatus = useBookingsStore((s) => s.updateStatus);

  if (!booking) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: colors.textMuted }}>Prenotazione non trovata.</Text>
        </View>
      </ScreenContainer>
    );
  }

  const workshop = WORKSHOPS.find((w) => w.id === booking.workshopId);

  const handleCancel = () => {
    Alert.alert(
      "Annullare prenotazione?",
      "Sei sicuro di voler annullare questa prenotazione?",
      [
        { text: t.common.no, style: "cancel" },
        {
          text: t.common.yes,
          style: "destructive",
          onPress: () => updateStatus(booking.id, "cancelled"),
        },
      ]
    );
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>
        <Card>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Text style={{ fontSize: 40 }}>{getServiceEmoji(booking.service)}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: "700", letterSpacing: 0.8 }}>
                {t.bookings.bookingFor.toUpperCase()}
              </Text>
              <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text }}>
                {getServiceLabel(booking.service)}
              </Text>
            </View>
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 10,
                backgroundColor: STATUS_COLORS[booking.status],
              }}
            >
              <Text style={{ color: "#FFF", fontSize: 12, fontWeight: "700" }}>
                {t.bookings.status[booking.status]}
              </Text>
            </View>
          </View>
        </Card>

        <Card>
          <Row label={t.workshop.contact.replace("Contatto", "Officina")} value={workshop?.name ?? "—"} colors={colors} />
          <Row label="Indirizzo" value={workshop?.address ?? "—"} colors={colors} />
          <Row label={t.bookings.estimatedPrice} value={`€${booking.estimatedPrice}`} colors={colors} bold />
          <Row
            label={t.bookings.requestedAt}
            value={new Date(booking.createdAt).toLocaleString("it-IT")}
            colors={colors}
          />
          {booking.scheduledAt ? (
            <Row
              label={t.bookings.scheduledFor}
              value={new Date(booking.scheduledAt).toLocaleString("it-IT")}
              colors={colors}
            />
          ) : null}
        </Card>

        {booking.message ? (
          <Card>
            <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: "700", letterSpacing: 0.8 }}>
              MESSAGGIO
            </Text>
            <Text style={{ fontSize: 14, color: colors.text, marginTop: 6, lineHeight: 21 }}>
              {booking.message}
            </Text>
          </Card>
        ) : null}

        {booking.status === "completed" ? (
          <PrimaryButton
            label={t.bookings.leaveReview}
            icon="⭐"
            onPress={() =>
              navigation.navigate("AddReview", {
                workshopId: booking.workshopId,
                bookingId: booking.id,
              })
            }
          />
        ) : null}

        {workshop && (booking.status === "pending" || booking.status === "accepted") ? (
          <PrimaryButton
            label="Contatta l'officina"
            icon="💬"
            variant="secondary"
            onPress={() =>
              openWhatsApp(
                workshop.phone,
                `Ciao, ti scrivo per la prenotazione di ${getServiceLabel(booking.service)}.`
              )
            }
          />
        ) : null}

        {(booking.status === "pending" || booking.status === "accepted") ? (
          <PrimaryButton label={t.bookings.cancel} variant="danger" onPress={handleCancel} />
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}

function Row({
  label,
  value,
  colors,
  bold,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useColors>;
  bold?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
      }}
    >
      <Text style={{ fontSize: 13, color: colors.textMuted, flex: 1 }}>{label}</Text>
      <Text
        style={{
          fontSize: bold ? 16 : 14,
          color: colors.text,
          fontWeight: bold ? "800" : "600",
          flex: 1.5,
          textAlign: "right",
        }}
      >
        {value}
      </Text>
    </View>
  );
}
