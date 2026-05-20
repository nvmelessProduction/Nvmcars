import { useEffect, useLayoutEffect, useMemo } from "react";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ScreenContainer } from "@/components/ScreenContainer";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Card } from "@/components/Card";
import { RatingStars } from "@/components/RatingStars";
import { useReviewsStore } from "@/store/useReviewsStore";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useActiveCar } from "@/store/useCarStore";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import { formatWeeklyHours, isOpenNow } from "@/data/workshops";
import { SERVICES } from "@/data/services";
import { useResolvedWorkshop } from "@/store/useWorkshopStore";
import { resolvePrice, isExactMatch } from "@/utils/pricing";
import type { HomeStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<HomeStackParamList, "WorkshopDetail">;
type Route = RouteProp<HomeStackParamList, "WorkshopDetail">;

export function WorkshopDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { workshopId, service } = route.params;
  const colors = useColors();
  const t = useT();
  const car = useActiveCar();
  const favoriteIds = useFavoritesStore((s) => s.ids);
  const toggleFavorite = useFavoritesStore((s) => s.toggle);
  const userId = useAuthStore((s) => s.user?.id);
  const isFavorite = favoriteIds.includes(workshopId);
  const allReviews = useReviewsStore((s) => s.reviews);
  const hydrateReviews = useReviewsStore((s) => s.hydrateForWorkshop);

  useEffect(() => {
    hydrateReviews(workshopId).catch(() => undefined);
  }, [workshopId, hydrateReviews]);

  const reviews = useMemo(
    () =>
      allReviews
        .filter((r) => r.workshopId === workshopId)
        .sort((a, b) => b.createdAt - a.createdAt),
    [allReviews, workshopId]
  );

  const workshop = useResolvedWorkshop(workshopId);

  useLayoutEffect(() => {
    navigation.setOptions({ title: workshop?.name ?? "" });
  }, [navigation, workshop]);

  if (!workshop) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: colors.textMuted }}>{t.workshop.notFound}</Text>
        </View>
      </ScreenContainer>
    );
  }

  const open = isOpenNow(workshop.hours);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        <View>
          <Image
            source={{ uri: workshop.photo }}
            style={{ width: "100%", height: 220, backgroundColor: colors.border }}
            resizeMode="cover"
          />
          <Pressable
            onPress={() => toggleFavorite(userId, workshopId)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={
              isFavorite ? t.workshop.removeFromFavorites : t.workshop.addToFavorites
            }
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: colors.scrim,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 22 }}>{isFavorite ? "❤️" : "🤍"}</Text>
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 16, paddingTop: 16, gap: 12 }}>
          <Animated.View entering={FadeInDown.duration(350)}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={{ fontSize: 24, fontWeight: "800", color: colors.text, flex: 1 }}>
                {workshop.name}
              </Text>
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 999,
                  backgroundColor: open ? colors.success : colors.danger,
                }}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "700" }}>
                  {open ? t.workshop.openNow : t.workshop.closedNow}
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 4 }}>
              {workshop.address}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 }}>
              <RatingStars value={workshop.rating} size={14} />
              <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>
                {workshop.rating.toFixed(1)}
              </Text>
              <Text style={{ fontSize: 12, color: colors.textMuted }}>
                ({workshop.reviewsCount} {t.workshop.reviews})
              </Text>
            </View>
          </Animated.View>

          <Card>
            <Text style={{ fontSize: 13, color: colors.text, lineHeight: 20 }}>
              {workshop.description}
            </Text>
          </Card>

          <Card>
            <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: "700", letterSpacing: 0.6 }}>
              🕐 {t.workshop.hours.toUpperCase()}
            </Text>
            <Text style={{ fontSize: 13, color: colors.text, marginTop: 6, lineHeight: 20 }}>
              {formatWeeklyHours(workshop.hours)}
            </Text>
          </Card>

          {workshop.acceptingRequests === false ? (
            <Card style={{ borderColor: colors.warning, borderWidth: 1.5 }}>
              <Text style={{ fontSize: 13, color: colors.text, lineHeight: 19 }}>
                ⏸️ {t.workshop.pausedBanner}
              </Text>
            </Card>
          ) : null}

          <Card>
            <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: "700", letterSpacing: 0.6 }}>
              💶 {t.workshop.priceListLabel.toUpperCase()}
            </Text>
            {car ? (
              <Text style={{ fontSize: 11, color: colors.accent, marginTop: 4, fontWeight: "700" }}>
                Prezzi adattati per la tua {car.make} {car.model}
              </Text>
            ) : null}
            <View style={{ marginTop: 10, gap: 4 }}>
              {SERVICES.filter((s) => workshop.services[s.key] !== undefined).map((s, idx) => {
                const res = resolvePrice(workshop, s.key, car);
                if (!res) return null;
                const highlighted = s.key === service;
                const exact = isExactMatch(res);
                return (
                  <Pressable
                    key={s.key}
                    onPress={() => navigation.navigate("BookingForm", { workshopId, service: s.key })}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingVertical: 10,
                      paddingHorizontal: 10,
                      borderRadius: 12,
                      backgroundColor: highlighted ? colors.accentSoft : "transparent",
                      borderTopWidth: idx === 0 ? 0 : 1,
                      borderTopColor: colors.border,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                      <Text style={{ fontSize: 22 }}>{s.emoji}</Text>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 15,
                            color: colors.text,
                            fontWeight: highlighted ? "800" : "600",
                          }}
                        >
                          {s.label}
                        </Text>
                        {exact ? (
                          <Text
                            style={{
                              fontSize: 10,
                              color: colors.accent,
                              fontWeight: "800",
                              marginTop: 2,
                              letterSpacing: 0.4,
                            }}
                          >
                            ✨ {t.workshop.promotedPrice.toUpperCase()}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text }}>
                        €{res.finalPrice}
                      </Text>
                      {res.finalPrice !== res.basePrice ? (
                        <Text style={{ fontSize: 11, color: colors.textMuted, textDecorationLine: "line-through" }}>
                          €{res.basePrice}
                        </Text>
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </Card>

          <Card>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: "700", letterSpacing: 0.6 }}>
                ⭐ {t.reviews.allReviews.toUpperCase()}
              </Text>
              <Text style={{ fontSize: 11, color: colors.textMuted }}>
                {reviews.length} {t.workshop.reviews}
              </Text>
            </View>
            {reviews.length === 0 ? (
              <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 10 }}>
                {t.reviews.noReviews}
              </Text>
            ) : (
              <View style={{ marginTop: 12, gap: 14 }}>
                {reviews.slice(0, 5).map((r) => (
                  <View key={r.id}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>
                        {r.customerName}
                      </Text>
                      <RatingStars value={r.rating} size={14} />
                    </View>
                    <Text style={{ fontSize: 13, color: colors.text, marginTop: 4, lineHeight: 19 }}>
                      {r.comment}
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>
                      {new Date(r.createdAt).toLocaleDateString("it-IT")}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </Card>
        </View>
      </ScrollView>

      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: colors.bgElevated,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          padding: 14,
          gap: 8,
        }}
      >
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ flex: 1 }}>
            <PrimaryButton
              label={t.workshop.chatNow}
              icon="💬"
              variant="ghost"
              onPress={() => navigation.navigate("Chat", { workshopId })}
            />
          </View>
          <View style={{ flex: 1 }}>
            <PrimaryButton
              label="Prenota"
              icon="✅"
              onPress={() =>
                navigation.navigate("BookingForm", {
                  workshopId,
                  service: service ?? SERVICES.find((s) => workshop.services[s.key])!.key,
                })
              }
            />
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}
