import { useMemo, useState } from "react";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { WorkshopCard } from "@/components/WorkshopCard";
import { WORKSHOPS } from "@/data/workshops";
import { getServiceLabel } from "@/data/services";
import { haversineKm } from "@/utils/distance";
import { useUserLocation } from "@/hooks/useUserLocation";
import type { CustomerStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<CustomerStackParamList, "WorkshopList">;
type Route = RouteProp<CustomerStackParamList, "WorkshopList">;

type SortKey = "distance" | "price" | "rating";

export function WorkshopListScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const service = route.params?.service;
  const { location, loading } = useUserLocation();
  const [sort, setSort] = useState<SortKey>("distance");

  const items = useMemo(() => {
    const filtered = service
      ? WORKSHOPS.filter((w) => w.services[service] !== undefined)
      : WORKSHOPS;

    const withDistance = filtered.map((w) => ({
      workshop: w,
      distanceKm: location ? haversineKm(location.lat, location.lng, w.lat, w.lng) : 0,
      price: service ? w.services[service] ?? Infinity : Math.min(...Object.values(w.services)),
    }));

    return withDistance.sort((a, b) => {
      if (sort === "distance") return a.distanceKm - b.distanceKm;
      if (sort === "price") return a.price - b.price;
      return b.workshop.rating - a.workshop.rating;
    });
  }, [service, location, sort]);

  if (loading) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
          <Text className="text-ink-500 mt-3">Cerco officine vicine...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View className="px-4 pt-4">
        {service ? (
          <View className="bg-accent-500/10 border border-accent-400 rounded-2xl px-4 py-3 mb-3">
            <Text className="text-sm text-ink-700">
              Servizio cercato:{" "}
              <Text className="font-bold text-ink-900">
                {getServiceLabel(service)}
              </Text>
            </Text>
          </View>
        ) : null}

        <View className="flex-row gap-2 mb-4">
          <SortChip label="📍 Distanza" active={sort === "distance"} onPress={() => setSort("distance")} />
          <SortChip label="💶 Prezzo" active={sort === "price"} onPress={() => setSort("price")} />
          <SortChip label="⭐ Rating" active={sort === "rating"} onPress={() => setSort("rating")} />
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.workshop.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        renderItem={({ item }) => (
          <WorkshopCard
            workshop={item.workshop}
            distanceKm={item.distanceKm}
            highlightedService={service}
            onPress={() =>
              navigation.navigate("WorkshopDetail", {
                workshopId: item.workshop.id,
                service,
              })
            }
          />
        )}
        ListEmptyComponent={
          <View className="items-center py-16 gap-2">
            <Text className="text-4xl">🔍</Text>
            <Text className="text-ink-500">Nessuna officina trovata.</Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}

function SortChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`px-3 py-2 rounded-full border ${
        active ? "bg-ink-900 border-ink-900" : "bg-white border-ink-300"
      }`}
    >
      <Text
        className={`text-xs font-semibold ${active ? "text-white" : "text-ink-700"}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
