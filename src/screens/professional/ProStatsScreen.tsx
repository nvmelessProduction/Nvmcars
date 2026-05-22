import { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/Card";
import { useAuthStore } from "@/store/useAuthStore";
import { useBookingsStore } from "@/store/useBookingsStore";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import { getServiceLabel } from "@/data/services";

export function ProStatsScreen() {
  const colors = useColors();
  const t = useT();
  const user = useAuthStore((s) => s.user);
  const bookingsRaw = useBookingsStore((s) => s.bookings);
  const workshopId = user && user.role === "professional" ? user.workshopId : null;
  const bookings = useMemo(
    () => (workshopId ? bookingsRaw.filter((b) => b.workshopId === workshopId) : []),
    [bookingsRaw, workshopId]
  );

  const totalRequests = bookings.length;
  const accepted = bookings.filter(
    (b) =>
      b.status === "confirmed" ||
      b.status === "accepted" ||
      b.status === "in_progress" ||
      b.status === "completed"
  ).length;
  const rejected = bookings.filter(
    (b) =>
      b.status === "rejected" ||
      b.status === "cancelled_by_customer" ||
      b.status === "cancelled_by_pro"
  ).length;
  const conversion = totalRequests > 0 ? Math.round((accepted / totalRequests) * 100) : 0;

  const byService = bookings.reduce<Record<string, number>>((acc, b) => {
    acc[b.service] = (acc[b.service] ?? 0) + 1;
    return acc;
  }, {});
  const topServices = Object.entries(byService)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxCount = topServices[0]?.[1] ?? 1;

  const weekly = new Array(7).fill(0);
  bookings.forEach((b) => {
    const daysAgo = Math.floor((Date.now() - b.createdAt) / (1000 * 60 * 60 * 24));
    if (daysAgo < 7) weekly[6 - daysAgo] += 1;
  });
  const maxWeekly = Math.max(...weekly, 1);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>
        <Card>
          <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: "700", letterSpacing: 0.8 }}>
            CONVERSION RATE
          </Text>
          <Text style={{ fontSize: 40, fontWeight: "800", color: colors.text, marginTop: 4 }}>
            {conversion}%
          </Text>
          <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
            {accepted} accettate / {totalRequests} richieste totali ({rejected} rifiutate)
          </Text>
          <View
            style={{
              marginTop: 12,
              height: 8,
              borderRadius: 4,
              backgroundColor: colors.border,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                height: 8,
                width: `${conversion}%`,
                backgroundColor: colors.success,
              }}
            />
          </View>
        </Card>

        <Card>
          <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: "700", letterSpacing: 0.8 }}>
            ULTIMI 7 GIORNI
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              gap: 6,
              marginTop: 14,
              height: 120,
            }}
          >
            {weekly.map((count, i) => (
              <Animated.View
                key={i}
                entering={FadeInUp.delay(i * 40).duration(300)}
                style={{
                  flex: 1,
                  height: `${(count / maxWeekly) * 100}%`,
                  minHeight: 4,
                  backgroundColor: colors.accent,
                  borderRadius: 4,
                  justifyContent: "flex-end",
                  alignItems: "center",
                  paddingBottom: 2,
                }}
              >
                {count > 0 ? (
                  <Text style={{ color: "#FFF", fontSize: 10, fontWeight: "800" }}>{count}</Text>
                ) : null}
              </Animated.View>
            ))}
          </View>
          <View style={{ flexDirection: "row", gap: 6, marginTop: 6 }}>
            {["L", "M", "M", "G", "V", "S", "D"].map((d, i) => (
              <Text
                key={i}
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontSize: 11,
                  color: colors.textMuted,
                }}
              >
                {d}
              </Text>
            ))}
          </View>
        </Card>

        <Card>
          <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: "700", letterSpacing: 0.8 }}>
            TOP SERVIZI RICHIESTI
          </Text>
          {topServices.length === 0 ? (
            <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 8 }}>
              Ancora nessun dato.
            </Text>
          ) : (
            <View style={{ gap: 10, marginTop: 14 }}>
              {topServices.map(([service, count]) => (
                <View key={service}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                    <Text style={{ fontSize: 14, color: colors.text, fontWeight: "600" }}>
                      {getServiceLabel(service)}
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.textMuted }}>{count}</Text>
                  </View>
                  <View
                    style={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: colors.border,
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        height: 6,
                        width: `${(count / maxCount) * 100}%`,
                        backgroundColor: colors.accent,
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}
