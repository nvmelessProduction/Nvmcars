import { useMemo, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FlatList, Pressable, Text, View } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { useBookingsStore } from "@/store/useBookingsStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationsStore } from "@/store/useNotificationsStore";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import { getServiceLabel, getServiceEmoji } from "@/data/services";
import type { Booking, BookingStatus } from "@/types";
import type { ProRequestsStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<ProRequestsStackParamList, "ProRequests">;

const STATUS_COLOR: Record<BookingStatus, string> = {
  pending: "#F59E0B",
  accepted: "#10B981",
  rejected: "#EF4444",
  completed: "#64748B",
  cancelled: "#EF4444",
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} min fa`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h fa`;
  return `${Math.floor(hours / 24)}g fa`;
}

type Filter = "all" | "pending" | "accepted" | "completed";

export function ProRequestsScreen() {
  const navigation = useNavigation<Nav>();
  const colors = useColors();
  const t = useT();
  const user = useAuthStore((s) => s.user);
  const allRaw = useBookingsStore((s) => s.bookings);
  const updateStatus = useBookingsStore((s) => s.updateStatus);
  const pushNotification = useNotificationsStore((s) => s.push);
  const [filter, setFilter] = useState<Filter>("pending");

  const workshopId = user && user.role === "professional" ? user.workshopId : null;
  const all = useMemo(
    () => (workshopId ? allRaw.filter((b) => b.workshopId === workshopId) : []),
    [allRaw, workshopId]
  );

  const data = useMemo(() => {
    const filtered = filter === "all" ? all : all.filter((b) => b.status === filter);
    return [...filtered].sort((a, b) => b.createdAt - a.createdAt);
  }, [all, filter]);

  const handleAccept = (b: Booking) => {
    updateStatus(b.id, "accepted");
    pushNotification({
      userId: b.customerId,
      type: "booking_accepted",
      title: "Prenotazione confermata 🎉",
      body: `La tua richiesta di ${getServiceLabel(b.service)} è stata accettata.`,
      relatedId: b.id,
    });
  };

  const handleReject = (b: Booking) => {
    updateStatus(b.id, "rejected");
    pushNotification({
      userId: b.customerId,
      type: "booking_rejected",
      title: "Prenotazione non disponibile",
      body: `L'officina ha rifiutato la richiesta di ${getServiceLabel(b.service)}.`,
      relatedId: b.id,
    });
  };

  const handleComplete = (b: Booking) => {
    updateStatus(b.id, "completed");
    pushNotification({
      userId: b.customerId,
      type: "booking_completed",
      title: "Servizio completato",
      body: `Lascia una recensione su ${getServiceLabel(b.service)}.`,
      relatedId: b.id,
    });
  };

  return (
    <ScreenContainer>
      <View style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
          <View style={{ flexDirection: "row", gap: 6 }}>
            {(
              [
                { v: "pending" as Filter, label: "In attesa" },
                { v: "accepted" as Filter, label: "Confermate" },
                { v: "completed" as Filter, label: "Completate" },
                { v: "all" as Filter, label: "Tutte" },
              ]
            ).map(({ v, label }) => {
              const active = filter === v;
              return (
                <Pressable
                  key={v}
                  onPress={() => setFilter(v)}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    borderRadius: 999,
                    backgroundColor: active ? colors.text : colors.bgElevated,
                    borderWidth: 1,
                    borderColor: active ? colors.text : colors.border,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "700",
                      color: active ? colors.bg : colors.text,
                    }}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {data.length === 0 ? (
          <View style={{ flex: 1, justifyContent: "center" }}>
            <EmptyState emoji="📨" title="Nessuna richiesta." />
          </View>
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 24 }}
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeInRight.delay(index * 50).duration(300)}>
                <Card>
                  <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
                    <Text style={{ fontSize: 32 }}>{getServiceEmoji(item.service)}</Text>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text }}>
                          {getServiceLabel(item.service)}
                        </Text>
                        <View
                          style={{
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 999,
                            backgroundColor: STATUS_COLOR[item.status],
                          }}
                        >
                          <Text style={{ color: "#FFF", fontSize: 10, fontWeight: "700" }}>
                            {t.bookings.status[item.status]}
                          </Text>
                        </View>
                      </View>
                      <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                        Cliente #{item.customerId.slice(0, 6)} · {timeAgo(item.createdAt)} ·{" "}
                        €{item.estimatedPrice}
                      </Text>
                      {item.message ? (
                        <Text style={{ fontSize: 13, color: colors.text, marginTop: 6, lineHeight: 19 }}>
                          “{item.message}”
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  {item.status === "pending" ? (
                    <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
                      <Pressable
                        onPress={() => handleReject(item)}
                        style={{
                          flex: 1,
                          paddingVertical: 10,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: colors.danger,
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ color: colors.danger, fontWeight: "700" }}>
                          {t.pro.reject}
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleAccept(item)}
                        style={{
                          flex: 1,
                          paddingVertical: 10,
                          borderRadius: 12,
                          backgroundColor: colors.success,
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ color: "#FFF", fontWeight: "700" }}>{t.pro.accept}</Text>
                      </Pressable>
                    </View>
                  ) : null}

                  {item.status === "accepted" ? (
                    <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
                      <Pressable
                        onPress={() =>
                          navigation.navigate("ProChat", {
                            conversationId: `cv-${item.customerId}-${item.workshopId}`,
                          })
                        }
                        style={{
                          flex: 1,
                          paddingVertical: 10,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: colors.border,
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ color: colors.text, fontWeight: "700" }}>💬 Chat</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleComplete(item)}
                        style={{
                          flex: 1,
                          paddingVertical: 10,
                          borderRadius: 12,
                          backgroundColor: colors.accent,
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ color: "#FFF", fontWeight: "700" }}>
                          {t.pro.markCompleted}
                        </Text>
                      </Pressable>
                    </View>
                  ) : null}
                </Card>
              </Animated.View>
            )}
          />
        )}
      </View>
    </ScreenContainer>
  );
}
