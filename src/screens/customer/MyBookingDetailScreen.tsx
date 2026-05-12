import { Alert, ScrollView, Pressable, Text, View } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useBookingsStore } from "@/store/useBookingsStore";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import { useResolvedWorkshop } from "@/store/useWorkshopStore";
import { getServiceLabel, getServiceEmoji } from "@/data/services";
import { openWhatsApp } from "@/utils/whatsapp";
import { statusMeta, canCustomerCancel } from "@/utils/bookingStatus";
import { notifyEvent } from "@/store/useNotificationsStore";
import { useAuthStore } from "@/store/useAuthStore";
import type { BookingsStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<BookingsStackParamList, "BookingDetail">;
type Route = RouteProp<BookingsStackParamList, "BookingDetail">;

export function MyBookingDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { bookingId } = route.params;
  const colors = useColors();
  const t = useT();
  const user = useAuthStore((s) => s.user);
  const booking = useBookingsStore((s) => s.bookings.find((b) => b.id === bookingId));
  const selectSlot = useBookingsStore((s) => s.selectSlot);
  const cancelByCustomer = useBookingsStore((s) => s.cancelByCustomer);
  const workshop = useResolvedWorkshop(booking?.workshopId);

  if (!booking) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: colors.textMuted }}>{t.workshop.notFound}</Text>
        </View>
      </ScreenContainer>
    );
  }

  const meta = statusMeta(booking.status);

  const handleCancel = () => {
    Alert.alert(t.bookings.cancelConfirmTitle, t.bookings.cancelConfirmBody, [
      { text: t.common.no, style: "cancel" },
      {
        text: t.common.yes,
        style: "destructive",
        onPress: () => {
          cancelByCustomer(booking.id);
          if (workshop?.ownerId) {
            notifyEvent({
              userId: workshop.ownerId,
              type: "booking_cancelled",
              title: "Prenotazione annullata",
              body: `Il cliente ha annullato la richiesta di ${getServiceLabel(booking.service)}.`,
              relatedId: booking.id,
              relatedKind: "booking",
            });
          }
        },
      },
    ]);
  };

  const handleSelectSlot = (slotId: string) => {
    const slot = booking.proposedSlots?.find((s) => s.id === slotId);
    if (!slot) return;
    Alert.alert(
      t.bookings.confirmSlot,
      `${new Date(slot.startAt).toLocaleString("it-IT", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      [
        { text: t.common.cancel, style: "cancel" },
        {
          text: t.common.confirm,
          onPress: () => {
            selectSlot(booking.id, slotId);
            if (workshop?.ownerId) {
              notifyEvent({
                userId: workshop.ownerId,
                type: "booking_confirmed",
                title: "Appuntamento confermato",
                body: `Il cliente ha scelto un orario per ${getServiceLabel(booking.service)}.`,
                relatedId: booking.id,
                relatedKind: "booking",
              });
            }
            if (user) {
              notifyEvent({
                userId: user.id,
                type: "booking_confirmed",
                title: t.bookings.bookingConfirmed,
                body: t.bookings.bookingConfirmedHint.replace(
                  "{date}",
                  new Date(slot.startAt).toLocaleString("it-IT", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                ),
                relatedId: booking.id,
                relatedKind: "booking",
              });
            }
          },
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
              <Text
                style={{ fontSize: 11, color: colors.textMuted, fontWeight: "700", letterSpacing: 0.8 }}
              >
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
                backgroundColor: meta.color,
              }}
            >
              <Text style={{ color: "#FFF", fontSize: 12, fontWeight: "700" }}>
                {t.bookings.status[booking.status]}
              </Text>
            </View>
          </View>
        </Card>

        {booking.status === "requested" || booking.status === "pending" ? (
          <Card>
            <Text style={{ fontSize: 13, color: colors.textMuted, lineHeight: 19 }}>
              ⏳ {t.bookings.waitingResponse}
            </Text>
          </Card>
        ) : null}

        {booking.status === "slot_proposed" && booking.proposedSlots ? (
          <Card>
            <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: "700", letterSpacing: 0.8 }}>
              📅 {t.bookings.proposedSlotsTitle.toUpperCase()}
            </Text>
            <Text style={{ fontSize: 13, color: colors.text, marginTop: 6, lineHeight: 19 }}>
              {t.bookings.proposedSlotsHint}
            </Text>
            {booking.proposedNote ? (
              <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 8, fontStyle: "italic" }}>
                "{booking.proposedNote}"
              </Text>
            ) : null}
            <View style={{ marginTop: 12, gap: 8 }}>
              {booking.proposedSlots.map((slot) => (
                <Pressable
                  key={slot.id}
                  onPress={() => handleSelectSlot(slot.id)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderWidth: 1.5,
                    borderColor: colors.accent,
                    backgroundColor: colors.bgElevated,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text }}>
                      {new Date(slot.startAt).toLocaleDateString("it-IT", {
                        weekday: "long",
                        day: "2-digit",
                        month: "long",
                      })}
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>
                      ore{" "}
                      {new Date(slot.startAt).toLocaleTimeString("it-IT", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      · {slot.durationMinutes} {t.common.minutes}
                    </Text>
                  </View>
                  <Text style={{ color: colors.accent, fontWeight: "800" }}>
                    {t.bookings.confirmSlot} ›
                  </Text>
                </Pressable>
              ))}
            </View>
          </Card>
        ) : null}

        {booking.status === "confirmed" || booking.status === "accepted" ? (
          <Card>
            <Text style={{ fontSize: 15, fontWeight: "800", color: colors.text }}>
              ✅ {t.bookings.bookingConfirmed}
            </Text>
            {booking.scheduledAt ? (
              <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 6 }}>
                {t.bookings.bookingConfirmedHint.replace(
                  "{date}",
                  new Date(booking.scheduledAt).toLocaleString("it-IT", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                )}
              </Text>
            ) : null}
          </Card>
        ) : null}

        {booking.status === "in_progress" ? (
          <Card>
            <Text style={{ fontSize: 14, color: colors.text, lineHeight: 20 }}>
              🔧 {t.bookings.workInProgress}
            </Text>
          </Card>
        ) : null}

        {booking.status === "rejected" ? (
          <Card>
            <Text style={{ fontSize: 14, color: colors.text }}>🚫 {t.bookings.rejectedByPro}</Text>
            {booking.cancellationReason ? (
              <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 6 }}>
                {booking.cancellationReason}
              </Text>
            ) : null}
          </Card>
        ) : null}

        {booking.status === "cancelled_by_pro" ? (
          <Card>
            <Text style={{ fontSize: 14, color: colors.text }}>✖️ {t.bookings.cancelledByPro}</Text>
          </Card>
        ) : null}

        <Card>
          <Row label="Officina" value={workshop?.name ?? "—"} colors={colors} />
          <Row label="Indirizzo" value={workshop?.address ?? "—"} colors={colors} />
          <Row
            label={t.bookings.estimatedPrice}
            value={`€${booking.estimatedPrice}`}
            colors={colors}
            bold
          />
          <Row
            label={t.bookings.requestedAt}
            value={new Date(booking.createdAt).toLocaleString("it-IT")}
            colors={colors}
          />
        </Card>

        {booking.message ? (
          <Card>
            <Text
              style={{ fontSize: 11, color: colors.textMuted, fontWeight: "700", letterSpacing: 0.8 }}
            >
              {t.pro.requestMessage.toUpperCase()}
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

        {workshop && canCustomerCancel(booking.status) ? (
          <PrimaryButton
            label={t.bookings.contactWorkshop}
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

        {canCustomerCancel(booking.status) ? (
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
