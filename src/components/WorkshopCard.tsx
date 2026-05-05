import { Image, Pressable, Text, View } from "react-native";
import type { ServiceKey, Workshop } from "@/types";
import { formatKm } from "@/utils/distance";
import { getServiceLabel } from "@/data/services";

type Props = {
  workshop: Workshop;
  onPress: () => void;
  distanceKm?: number;
  highlightedService?: ServiceKey;
};

export function WorkshopCard({
  workshop,
  onPress,
  distanceKm,
  highlightedService,
}: Props) {
  const price = highlightedService
    ? workshop.services[highlightedService]
    : Math.min(...Object.values(workshop.services));

  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-3xl overflow-hidden mb-4 border border-ink-100 active:opacity-80"
    >
      <Image
        source={{ uri: workshop.photo }}
        className="w-full h-36 bg-ink-100"
        resizeMode="cover"
      />
      <View className="p-4 gap-2">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-lg font-bold text-ink-900">{workshop.name}</Text>
            <Text className="text-sm text-ink-500">{workshop.city}</Text>
          </View>
          <View className="items-end">
            <Text className="text-2xl font-bold text-ink-900">
              {price ? `€${price}` : "—"}
            </Text>
            {highlightedService ? (
              <Text className="text-xs text-ink-500">
                {getServiceLabel(highlightedService)}
              </Text>
            ) : (
              <Text className="text-xs text-ink-500">da</Text>
            )}
          </View>
        </View>

        <View className="flex-row items-center gap-3 pt-1">
          <View className="flex-row items-center gap-1">
            <Text className="text-base">⭐</Text>
            <Text className="text-sm font-semibold text-ink-900">
              {workshop.rating.toFixed(1)}
            </Text>
            <Text className="text-xs text-ink-500">({workshop.reviewsCount})</Text>
          </View>
          {distanceKm !== undefined ? (
            <View className="flex-row items-center gap-1">
              <Text className="text-base">📍</Text>
              <Text className="text-sm text-ink-700">{formatKm(distanceKm)}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
