import { useMemo, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FlatList, Pressable, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { useBookingsStore } from "@/store/useBookingsStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import { WORKSHOPS } from "@/data/workshops";
import { getServiceLabel, getServiceEmoji } from "@/data/services";
import type { Booking } from "@/types";
import type { BookingsStackParamList } from "@/navigation/types";
import { statusMeta } from "@/utils/bookingStatus";

type Nav = NativeStackNavigationProp<BookingsStackParamList, "BookingsList">;

export function MyBookingsScreen() {
  const navigation = useNavigation<Nav>();
  const colors = useColors();
  const t = useT();
  const user = useAuthStore((s) => s.user);
  const allRaw = useBookingsStore((s) => s.bookings);
  const [tab, setTab] = useState<"upcoming" | "history">("upcoming");

  const all = useMemo(
    () => (user ? allRaw.filter((b) => b.customerId === user.id) : []),
    [allRaw, user]
  );

  const filtered = useMemo(() => {
    const upcoming: Booking["status"][] = [
      "requested",
      "pending",
      "slot_proposed",
      "confirmed",
      "accepted",
      "in_progress",
    ];
    return all
      .filter((b) =>
        tab === "upcoming" ? upcoming.includes(b.status) : !upcoming.includes(b.status)
      )
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [all, tab]);

  return (
    <ScreenContainer>
      <View style={{ flex: 1, padding: 16 }}>
        <View
          style={{
            flexDirection: "row",
            backgroundColor: colors.bgElevated,
            borderRadius: 14,
            padding: 4,
            marginBottom: 14,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          {(["upcoming", "history"] as const).map((k) => (
            <Pressable
              key={k}
              onPress={() => setTab(k)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 10,
                backgroundColor: tab === k ? colors.accent : "transparent",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: tab === k ? "#FFF" : colors.text,
                  fontWeight: "700",
                  fontSize: 14,
                }}
              >
                {tab === k ? "● " : ""}
                {k === "upcoming" ? t.bookings.upcoming : t.bookings.history}
              </Text>
            </Pressable>
          ))}
        </View>

        {filtered.length === 0 ? (
          <View style={{ flex: 1, justifyContent: "center" }}>
            <EmptyState emoji="📅" title={t.bookings.noBookings} />
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
            renderItem={({ item, index }) => (
              <BookingRow
                booking={item}
                index={index}
                onPress={() => navigation.navigate("BookingDetail", { bookingId: item.id })}
              />
            )}
          />
        )}
      </View>
    </ScreenContainer>
  );
}

function BookingRow({
  booking,
  index,
  onPress,
}: {
  booking: Booking;
  index: number;
  onPress: () => void;
}) {
  const colors = useColors();
  const t = useT();
  const workshop = WORKSHOPS.find((w) => w.id === booking.workshopId);

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
      <Pressable onPress={onPress}>
        <Card>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
            <Text style={{ fontSize: 32 }}>{getServiceEmoji(booking.service)}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text }}>
                {getServiceLabel(booking.service)}
              </Text>
              <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>
                {workshop?.name ?? "Officina"}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8, gap: 12 }}>
                <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text }}>
                  €{booking.estimatedPrice}
                </Text>
                <View
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 10,
                    backgroundColor: statusMeta(booking.status).color,
                  }}
                >
                  <Text style={{ fontSize: 11, color: "#FFF", fontWeight: "700" }}>
                    {t.bookings.status[booking.status]}
                  </Text>
                </View>
              </View>
            </View>
            <Text style={{ fontSize: 18, color: colors.textMuted }}>›</Text>
          </View>
        </Card>
      </Pressable>
    </Animated.View>
  );
}
