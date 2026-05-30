import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import type { ServiceKey, Workshop } from "@/types";
import { formatKm } from "@/utils/distance";
import { getServiceLabel } from "@/data/services";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import { isOpenNow } from "@/data/workshops";
import { hitSlop, withOpacity } from "@/theme/tokens";

type Props = {
  workshop: Workshop;
  onPress: () => void;
  distanceKm?: number;
  highlightedService?: ServiceKey;
  priceOverride?: number;
  index?: number;
  boosted?: boolean;
};

export function WorkshopCard({
  workshop,
  onPress,
  distanceKm,
  highlightedService,
  priceOverride,
  index = 0,
  boosted = false,
}: Props) {
  const colors = useColors();
  const t = useT();
  const favoriteIds = useFavoritesStore((s) => s.ids);
  const isFavorite = favoriteIds.includes(workshop.id);
  const toggleFavorite = useFavoritesStore((s) => s.toggle);
  const userId = useAuthStore((s) => s.user?.id);
  const price =
    priceOverride ??
    (highlightedService
      ? workshop.services[highlightedService]
      : Math.min(...Object.values(workshop.services)));
  const open = isOpenNow(workshop.hours);
  const [imgError, setImgError] = useState(false);

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
          {workshop.photo && !imgError ? (
            <Image
              source={{ uri: workshop.photo }}
              style={{ width: "100%", height: 140, backgroundColor: colors.border }}
              resizeMode="cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <View
              style={{
                width: "100%",
                height: 140,
                backgroundColor: colors.bgHeader,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 36 }}>🔧</Text>
            </View>
          )}
          <Pressable
            onPress={() => toggleFavorite(userId, workshop.id)}
            hitSlop={hitSlop.medium}
            accessibilityRole="button"
            accessibilityLabel={isFavorite ? t.workshop.removeFromFavorites : t.workshop.addToFavorites}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: colors.scrim,
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
              backgroundColor: withOpacity(open ? colors.success : colors.danger, 0.95),
              borderRadius: 20,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "700" }}>
              {open ? t.workshop.openNow : t.workshop.closedNow}
            </Text>
          </View>
          {boosted ? (
            <View
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                paddingHorizontal: 10,
                paddingVertical: 4,
                backgroundColor: withOpacity(colors.warning, 0.95),
                borderRadius: 20,
              }}
            >
              <Text style={{ color: "#0F172A", fontSize: 11, fontWeight: "800" }}>
                ⭐ PROMOSSO
              </Text>
            </View>
          ) : null}
        </View>

        <View style={{ padding: 14, gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text numberOfLines={1} style={{ fontSize: 17, fontWeight: "700", color: colors.text }}>
                {workshop.name}
              </Text>
              <Text numberOfLines={1} style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>
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
