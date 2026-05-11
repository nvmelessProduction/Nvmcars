import { Image, Pressable, Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import type { ServiceKey, Workshop } from "@/types";
import { formatKm } from "@/utils/distance";
import { getServiceLabel } from "@/data/services";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import { useColors } from "@/store/useThemeStore";
import { isOpenNow } from "@/data/workshops";

type Props = {
  workshop: Workshop;
  onPress: () => void;
  distanceKm?: number;
  highlightedService?: ServiceKey;
  priceOverride?: number;
  index?: number;
};

export function WorkshopCard({
  workshop,
  onPress,
  distanceKm,
  highlightedService,
  priceOverride,
  index = 0,
}: Props) {
  const colors = useColors();
  const favoriteIds = useFavoritesStore((s) => s.ids);
  const isFavorite = favoriteIds.includes(workshop.id);
  const toggleFavorite = useFavoritesStore((s) => s.toggle);
  const price =
    priceOverride ??
    (highlightedService
      ? workshop.services[highlightedService]
      : Math.min(...Object.values(workshop.services)));
  const open = isOpenNow(workshop.hours);

  return (
    <Animated.View entering={FadeInUp.delay(index * 60).duration(350)}>
      <Pressable
        onPress={onPress}
        style={{
          backgroundColor: colors.bgElevated,
          borderRadius: 20,
          overflow: "hidden",
          marginBottom: 14,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <View>
          <Image
            source={{ uri: workshop.photo }}
            style={{ width: "100%", height: 140, backgroundColor: colors.border }}
            resizeMode="cover"
          />
          <Pressable
            onPress={() => toggleFavorite(workshop.id)}
            hitSlop={8}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "rgba(15, 23, 42, 0.55)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 20 }}>{isFavorite ? "❤️" : "🤍"}</Text>
          </Pressable>
          <View
            style={{
              position: "absolute",
              bottom: 10,
              left: 10,
              paddingHorizontal: 10,
              paddingVertical: 4,
              backgroundColor: open ? "rgba(16,185,129,0.95)" : "rgba(239,68,68,0.95)",
              borderRadius: 20,
            }}
          >
            <Text style={{ color: "#FFF", fontSize: 11, fontWeight: "700" }}>
              {open ? "Aperto" : "Chiuso"}
            </Text>
          </View>
        </View>

        <View style={{ padding: 14, gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={{ fontSize: 17, fontWeight: "700", color: colors.text }}>
                {workshop.name}
              </Text>
              <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>
                {workshop.city}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ fontSize: 22, fontWeight: "800", color: colors.text }}>
                {price ? `€${price}` : "—"}
              </Text>
              <Text style={{ fontSize: 11, color: colors.textMuted }}>
                {highlightedService ? getServiceLabel(highlightedService) : "da"}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingTop: 2 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Text style={{ fontSize: 14 }}>⭐</Text>
              <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text }}>
                {workshop.rating.toFixed(1)}
              </Text>
              <Text style={{ fontSize: 11, color: colors.textMuted }}>
                ({workshop.reviewsCount})
              </Text>
            </View>
            {distanceKm !== undefined ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Text style={{ fontSize: 14 }}>📍</Text>
                <Text style={{ fontSize: 13, color: colors.text }}>{formatKm(distanceKm)}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
