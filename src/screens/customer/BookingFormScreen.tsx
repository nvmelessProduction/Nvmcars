import { useState } from "react";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Alert, Pressable, Text, View } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { KeyboardAwareScrollView } from "@/components/KAV";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TextField } from "@/components/TextField";
import { Card } from "@/components/Card";
import { useBookingsStore } from "@/store/useBookingsStore";
import { notifyEvent } from "@/store/useNotificationsStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useActiveCar } from "@/store/useCarStore";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import { useResolvedWorkshop } from "@/store/useWorkshopStore";
import { getServiceLabel, getServiceEmoji } from "@/data/services";
import { resolvePrice, isExactMatch } from "@/utils/pricing";
import { openWhatsApp } from "@/utils/whatsapp";
import type { HomeStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<HomeStackParamList, "BookingForm">;
type Route = RouteProp<HomeStackParamList, "BookingForm">;

export function BookingFormScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { workshopId, service } = route.params;
  const colors = useColors();
  const t = useT();
  const user = useAuthStore((s) => s.user);
  const car = useActiveCar();
  const createBooking = useBookingsStore((s) => s.createBooking);
  const workshop = useResolvedWorkshop(workshopId);

  const priceRes = workshop ? resolvePrice(workshop, service, car) : null;
  const [message, setMessage] = useState("");

  const handleConfirm = () => {
    if (!user || !workshop || !priceRes) return;
    if (!car) {
      Alert.alert("Manca la tua auto", "Aggiungi la tua auto per inviare la prenotazione.");
      return;
    }
    const booking = createBooking({
      customerId: user.id,
      workshopId,
      service,
      carId: car.id,
      estimatedPrice: priceRes.finalPrice,
      message: message.trim(),
    });
    if (workshop.ownerId) {
      notifyEvent({
        userId: workshop.ownerId,
        type: "booking_requested",
        title: "Nuova richiesta",
        body: `Hai ricevuto una richiesta di ${getServiceLabel(service)}.`,
        relatedId: booking.id,
        relatedKind: "booking",
      });
    }
    Alert.alert(
      "Richiesta inviata!",
      "L'officina ti risponderà a breve con orari disponibili.",
      [
        { text: "Solo nell'app", onPress: () => navigation.popToTop() },
        {
          text: "Apri WhatsApp",
          onPress: () => {
            openWhatsApp(
              workshop.phone,
              `Ciao ${workshop.name}, ti scrivo da Nvmcars. Vorrei prenotare ${getServiceLabel(
                service
              )} per la mia ${car.make} ${car.model}.${message ? "\n\n" + message : ""}`
            );
            navigation.popToTop();
          },
        },
      ]
    );
  };

  if (!workshop || !priceRes) return null;

  const exact = isExactMatch(priceRes);
  const accepting = workshop.acceptingRequests !== false;

  return (
    <ScreenContainer>
      <KeyboardAwareScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 80 }}>
          <Card>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Text style={{ fontSize: 36 }}>{getServiceEmoji(service)}</Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 11,
                    color: colors.textMuted,
                    fontWeight: "700",
                    letterSpacing: 0.8,
                  }}
                >
                  SERVIZIO
                </Text>
                <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text }}>
                  {getServiceLabel(service)}
                </Text>
                <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>
                  {workshop.name}
                </Text>
              </View>
            </View>
          </Card>

          {!accepting ? (
            <Card style={{ borderColor: colors.warning, borderWidth: 1.5 }}>
              <Text style={{ fontSize: 13, color: colors.text, lineHeight: 19 }}>
                ⏸️ {t.workshop.pausedBanner}
              </Text>
            </Card>
          ) : null}

          <Card>
            <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: "700", letterSpacing: 0.8 }}>
              {exact ? t.car.customPricing.toUpperCase() : t.car.standardPricing.toUpperCase()}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "baseline", marginTop: 6, gap: 8 }}>
              <Text style={{ fontSize: 36, fontWeight: "800", color: colors.text }}>
                €{priceRes.finalPrice}
              </Text>
              {priceRes.finalPrice !== priceRes.basePrice ? (
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.textMuted,
                    textDecorationLine: "line-through",
                  }}
                >
                  €{priceRes.basePrice}
                </Text>
              ) : null}
            </View>
            {exact ? (
              <Text style={{ fontSize: 11, color: colors.accent, fontWeight: "800", marginTop: 6 }}>
                ✨ Prezzo personalizzato dall'officina per la tua auto
              </Text>
            ) : null}
            {car ? (
              <View style={{ marginTop: 8 }}>
                <Text style={{ fontSize: 13, color: colors.textMuted }}>
                  Adeguato per la tua{" "}
                  <Text style={{ fontWeight: "700", color: colors.text }}>
                    {car.make} {car.model}
                  </Text>{" "}
                  ({car.plate})
                </Text>
              </View>
            ) : (
              <Pressable onPress={() => navigation.navigate("AddCar")} style={{ marginTop: 10 }}>
                <Text style={{ color: colors.accent, fontWeight: "700" }}>
                  ➕ {t.home.addCar} per un prezzo su misura
                </Text>
              </Pressable>
            )}
            <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 8, fontStyle: "italic" }}>
              Il prezzo è una stima. L'officina ti confermerà il prezzo definitivo dopo la valutazione.
            </Text>
          </Card>

          <TextField
            label={`${t.pro.requestMessage} (${t.common.optional})`}
            value={message}
            onChangeText={setMessage}
            placeholder="es. Quando posso passare? Ho un'urgenza..."
            multiline
            numberOfLines={4}
            style={{ minHeight: 100, textAlignVertical: "top" }}
          />

          <View style={{ marginTop: 8 }}>
            <PrimaryButton
              label={t.common.submit}
              icon="📤"
              onPress={handleConfirm}
              disabled={!accepting}
            />
          </View>
      </KeyboardAwareScrollView>
    </ScreenContainer>
  );
}
