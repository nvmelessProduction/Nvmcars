import { useMemo } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/Card";
import { StatCard } from "@/components/StatCard";
import { useAuthStore } from "@/store/useAuthStore";
import { useBookingsStore } from "@/store/useBookingsStore";
import { useColors } from "@/store/useThemeStore";
import { useReviewsStore } from "@/store/useReviewsStore";
import { useT } from "@/i18n";
import { WORKSHOPS } from "@/data/workshops";
import type { ProDashboardStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<ProDashboardStackParamList, "ProDashboard">;

export function ProDashboardScreen() {
  const navigation = useNavigation<Nav>();
  const colors = useColors();
  const t = useT();
  const user = useAuthStore((s) => s.user);
  const allBookingsRaw = useBookingsStore((s) => s.bookings);
  const allReviewsRaw = useReviewsStore((s) => s.reviews);
  const workshopId = user && user.role === "professional" ? user.workshopId : null;

  const allBookings = useMemo(
    () => (workshopId ? allBookingsRaw.filter((b) => b.workshopId === workshopId) : []),
    [allBookingsRaw, workshopId]
  );
  const reviews = useMemo(
    () =>
      workshopId
        ? allReviewsRaw
            .filter((r) => r.workshopId === workshopId)
            .sort((a, b) => b.createdAt - a.createdAt)
        : [],
    [allReviewsRaw, workshopId]
  );

  const workshop = workshopId ? WORKSHOPS.find((w) => w.id === workshopId) : null;

  const pending = allBookings.filter(
    (b) => b.status === "pending" || b.status === "requested"
  ).length;
  const accepted = allBookings.filter(
    (b) => b.status === "accepted" || b.status === "confirmed" || b.status === "in_progress"
  ).length;
  const completed = allBookings.filter((b) => b.status === "completed").length;
  const totalRevenue = allBookings
    .filter((b) => b.status === "completed")
    .reduce((s, b) => s + b.estimatedPrice, 0);

  if (!user || user.role !== "professional") return null;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>
        <Animated.View entering={FadeInDown.duration(300)}>
          <Text style={{ fontSize: 13, color: colors.textMuted }}>Benvenuto in Nvmcars</Text>
          <Text style={{ fontSize: 22, fontWeight: "800", color: colors.text }}>{user.name}</Text>
        </Animated.View>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <StatCard label={t.pro.newRequests} value={`${pending}`} emoji="📨" delay={0} />
          <StatCard label={t.pro.confirmed} value={`${accepted}`} emoji="✅" delay={80} />
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <StatCard
            label={t.pro.averageRating}
            value={workshop ? workshop.rating.toFixed(1) : "—"}
            emoji="⭐"
            delay={160}
          />
          <StatCard
            label={t.pro.revenue}
            value={`€${totalRevenue}`}
            emoji="💶"
            delay={240}
            trend={`+${completed} servizi`}
          />
        </View>

        <Pressable onPress={() => navigation.navigate("ProStats")}>
          <Card>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: colors.accentSoft,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 24 }}>📊</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text }}>
                  Vai a statistiche dettagliate
                </Text>
                <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                  Conversion rate, trend settimanale, top servizi
                </Text>
              </View>
              <Text style={{ fontSize: 18, color: colors.textMuted }}>›</Text>
            </View>
          </Card>
        </Pressable>

        <Card>
          <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: "700", letterSpacing: 0.6 }}>
            ULTIME RECENSIONI
          </Text>
          {reviews.length === 0 ? (
            <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 8 }}>
              Ancora nessuna recensione.
            </Text>
          ) : (
            <View style={{ gap: 10, marginTop: 8 }}>
              {reviews.slice(0, 3).map((r) => (
                <View key={r.id}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>
                      {r.customerName}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.warning }}>
                      {"★".repeat(r.rating)}
                    </Text>
                  </View>
                  <Text
                    style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}
                    numberOfLines={2}
                  >
                    {r.comment}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}
