import { useState } from "react";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TextField } from "@/components/TextField";
import { Card } from "@/components/Card";
import { useBookingsStore } from "@/store/useBookingsStore";
import { useNotificationsStore } from "@/store/useNotificationsStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useActiveCar } from "@/store/useCarStore";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import { WORKSHOPS } from "@/data/workshops";
import { getServiceLabel, getServiceEmoji } from "@/data/services";
import { pricingForCar } from "@/data/carBrands";
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
  const pushNotification = useNotificationsStore((s) => s.push);

  const workshop = WORKSHOPS.find((w) => w.id === workshopId);
  const basePrice = workshop?.services[service] ?? 0;
  const finalPrice = car ? pricingForCar(basePrice, car.category) : basePrice;
  const [message, setMessage] = useState("");

  const handleConfirm = () => {
    if (!user || !workshop) return;
    if (!car) {
      Alert.alert("Manca la tua auto", "Aggiungi la tua auto per inviare la prenotazione.");
      return;
    }
    const booking = createBooking({
      customerId: user.id,
      workshopId,
      service,
      carId: car.id,
      estimatedPrice: finalPrice,
      message: message.trim(),
    });
    pushNotification({
      userId: workshop.id,
      type: "system",
      title: "Nuova richiesta",
      body: `Hai ricevuto una richiesta di ${getServiceLabel(service)}.`,
      relatedId: booking.id,
    });
    Alert.alert(
      "Richiesta inviata!",
      "L'officina ti risponderà a breve. Vuoi avvisare anche su WhatsApp?",
      [
        {
          text: "Solo nell'app",
          onPress: () => navigation.popToTop(),
        },
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

  if (!workshop) return null;

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>
          <Card>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Text style={{ fontSize: 36 }}>{getServiceEmoji(service)}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: "700", letterSpacing: 0.8 }}>
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

          <Card>
            <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: "700", letterSpacing: 0.8 }}>
              {car ? t.car.customPricing.toUpperCase() : t.car.standardPricing.toUpperCase()}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "baseline", marginTop: 6, gap: 8 }}>
              <Text style={{ fontSize: 36, fontWeight: "800", color: colors.text }}>
                €{finalPrice}
              </Text>
              {car && finalPrice !== basePrice ? (
                <Text style={{ fontSize: 14, color: colors.textMuted, textDecorationLine: "line-through" }}>
                  €{basePrice}
                </Text>
              ) : null}
            </View>
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
                  ➕ Aggiungi la tua auto per un prezzo su misura
                </Text>
              </Pressable>
            )}
          </Card>

          <TextField
            label="Messaggio per l'officina (opzionale)"
            value={message}
            onChangeText={setMessage}
            placeholder="es. Quando posso passare? Ho un'urgenza..."
            multiline
            numberOfLines={4}
            style={{ minHeight: 100, textAlignVertical: "top" }}
          />

          <View style={{ marginTop: 8 }}>
            <PrimaryButton label="Conferma e invia richiesta" icon="✅" onPress={handleConfirm} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
