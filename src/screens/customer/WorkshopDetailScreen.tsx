import { useMemo } from "react";
import { useRoute, type RouteProp } from "@react-navigation/native";
import { Image, ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { PrimaryButton } from "@/components/PrimaryButton";
import { WORKSHOPS } from "@/data/workshops";
import { SERVICES, getServiceLabel } from "@/data/services";
import { openWhatsApp } from "@/utils/whatsapp";
import type { CustomerStackParamList } from "@/navigation/types";

type Route = RouteProp<CustomerStackParamList, "WorkshopDetail">;

export function WorkshopDetailScreen() {
  const route = useRoute<Route>();
  const { workshopId, service } = route.params;
  const workshop = useMemo(
    () => WORKSHOPS.find((w) => w.id === workshopId),
    [workshopId]
  );

  if (!workshop) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <Text className="text-ink-500">Officina non trovata.</Text>
        </View>
      </ScreenContainer>
    );
  }

  const handleBook = () => {
    const serviceLabel = service ? getServiceLabel(service) : "un servizio";
    const message = `Ciao ${workshop.name}, ti scrivo da Nvmcars. Vorrei prenotare ${serviceLabel}. Quando posso passare?`;
    openWhatsApp(workshop.phone, message);
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <Image
          source={{ uri: workshop.photo }}
          className="w-full h-56 bg-ink-100"
          resizeMode="cover"
        />

        <View className="px-6 pt-6 gap-4">
          <View>
            <Text className="text-2xl font-bold text-ink-900">{workshop.name}</Text>
            <Text className="text-base text-ink-500 mt-1">{workshop.address}</Text>
          </View>

          <View className="flex-row items-center gap-4">
            <View className="flex-row items-center gap-1">
              <Text className="text-base">⭐</Text>
              <Text className="text-base font-bold text-ink-900">
                {workshop.rating.toFixed(1)}
              </Text>
              <Text className="text-sm text-ink-500">
                ({workshop.reviewsCount} recensioni)
              </Text>
            </View>
          </View>

          <View className="bg-white rounded-2xl p-4 border border-ink-100">
            <Text className="text-sm font-semibold text-ink-700 mb-1">🕐 Orari</Text>
            <Text className="text-base text-ink-900">{workshop.hours}</Text>
          </View>

          <View className="bg-white rounded-2xl p-4 border border-ink-100">
            <Text className="text-sm font-semibold text-ink-700 mb-3">
              💶 Listino servizi
            </Text>
            <View className="gap-3">
              {SERVICES.filter((s) => workshop.services[s.key] !== undefined).map(
                (s) => {
                  const isHighlighted = s.key === service;
                  return (
                    <View
                      key={s.key}
                      className={`flex-row items-center justify-between py-2 ${
                        isHighlighted
                          ? "bg-accent-500/10 -mx-2 px-2 rounded-xl"
                          : ""
                      }`}
                    >
                      <View className="flex-row items-center gap-2">
                        <Text className="text-xl">{s.emoji}</Text>
                        <Text
                          className={`text-base ${
                            isHighlighted ? "font-bold text-ink-900" : "text-ink-900"
                          }`}
                        >
                          {s.label}
                        </Text>
                      </View>
                      <Text className="text-base font-bold text-ink-900">
                        €{workshop.services[s.key]}
                      </Text>
                    </View>
                  );
                }
              )}
            </View>
          </View>

          <View className="bg-white rounded-2xl p-4 border border-ink-100">
            <Text className="text-sm font-semibold text-ink-700 mb-1">📞 Contatto</Text>
            <Text className="text-base text-ink-900">{workshop.phone}</Text>
          </View>
        </View>
      </ScrollView>

      <View className="absolute left-0 right-0 bottom-0 px-6 py-4 bg-white border-t border-ink-100">
        <PrimaryButton
          label="Prenota su WhatsApp"
          icon="💬"
          onPress={handleBook}
        />
      </View>
    </ScreenContainer>
  );
}
