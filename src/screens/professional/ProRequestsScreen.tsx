import { useCallback, useMemo, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Alert, FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { useBookingsStore } from "@/store/useBookingsStore";
import { useAuthStore } from "@/store/useAuthStore";
import { notifyEvent } from "@/store/useNotificationsStore";
import { useServiceLogStore } from "@/store/useServiceLogStore";
import { useResolvedWorkshop } from "@/store/useWorkshopStore";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import { getServiceLabel, getServiceEmoji } from "@/data/services";
import { statusMeta, canProAct, canProStart, canProComplete } from "@/utils/bookingStatus";
import type { Booking, BookingStatus } from "@/types";
import type { ProRequestsStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<ProRequestsStackParamList, "ProRequests">;

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "ora";
  if (minutes < 60) return `${minutes} min fa`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h fa`;
  return `${Math.floor(hours / 24)}g fa`;
}

type Filter = "pending" | "confirmed" | "completed" | "all";

export function ProRequestsScreen() {
  const navigation = useNavigation<Nav>();
  const colors = useColors();
  const t = useT();
  const user = useAuthStore((s) => s.user);
  const allRaw = useBookingsStore((s) => s.bookings);
  const rejectBooking = useBookingsStore((s) => s.rejectBooking);
  const startWork = useBookingsStore((s) => s.startWork);
  const completeWork = useBookingsStore((s) => s.completeWork);
  const addLogEntry = useServiceLogStore((s) => s.addEntry);
  const [filter, setFilter] = useState<Filter>("pending");
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const workshopId = user && user.role === "professional" ? user.workshopId : null;
  const workshop = useResolvedWorkshop(workshopId ?? undefined);
  const all = useMemo(
    () => (workshopId ? allRaw.filter((b) => b.workshopId === workshopId) : []),
    [allRaw, workshopId]
  );

  const matchesFilter = (status: BookingStatus, f: Filter): boolean => {
    if (f === "all") return true;
    if (f === "pending") return status === "requested" || status === "pending" || status === "slot_proposed";
    if (f === "confirmed")
      return status === "confirmed" || status === "accepted" || status === "in_progress";
    if (f === "completed")
      return (
        status === "completed" ||
        status === "rejected" ||
        status === "cancelled_by_customer" ||
        status === "cancelled_by_pro"
      );
    return true;
  };

  const data = useMemo(
    () => [...all.filter((b) => matchesFilter(b.status, filter))].sort((a, b) => b.createdAt - a.createdAt),
    [all, filter]
  );

  const handleReject = (b: Booking) => {
    Alert.alert("Rifiutare la richiesta?", "Il cliente sarà avvisato.", [
      { text: t.common.cancel, style: "cancel" },
      {
        text: t.pro.reject,
        style: "destructive",
        onPress: () => {
          rejectBooking(b.id);
          notifyEvent({
            userId: b.customerId,
            type: "booking_rejected",
            title: "Prenotazione non disponibile",
            body: `L'officina ha rifiutato la richiesta di ${getServiceLabel(b.service)}.`,
            relatedId: b.id,
            relatedKind: "booking",
          });
        },
      },
    ]);
  };

  const handleStart = (b: Booking) => {
    startWork(b.id);
    notifyEvent({
      userId: b.customerId,
      type: "booking_in_progress",
      title: "Lavorazione iniziata",
      body: `L'officina ha iniziato a lavorare sulla tua auto.`,
      relatedId: b.id,
      relatedKind: "booking",
    });
  };

  const handleComplete = (b: Booking) => {
    completeWork(b.id);
    addLogEntry({
      carId: b.carId,
      workshopId: b.workshopId,
      workshopName: workshop?.name ?? "Officina",
      service: b.service,
      cost: b.estimatedPrice,
      performedAt: Date.now(),
    });
    notifyEvent({
      userId: b.customerId,
      type: "booking_completed",
      title: "Servizio completato",
      body: `Lascia una recensione su ${getServiceLabel(b.service)}.`,
      relatedId: b.id,
      relatedKind: "booking",
    });
  };

  return (
    <ScreenContainer>
      <View style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
          <View style={{ flexDirection: "row", gap: 6 }}>
            {(
              [
                { v: "pending" as Filter, label: "Nuove" },
                { v: "confirmed" as Filter, label: "Confermate" },
                { v: "completed" as Filter, label: "Storico" },
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
            <EmptyState emoji="📨" title="Nessuna richiesta in questa categoria." />
          </View>
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
            }
            contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 24 }}
            renderItem={({ item, index }) => {
              const meta = statusMeta(item.status);
              return (
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
                              backgroundColor: meta.color,
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
                            "{item.message}"
                          </Text>
                        ) : null}
                        {item.status === "slot_proposed" && item.proposedSlots ? (
                          <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 6 }}>
                            📅 {item.proposedSlots.length} orari proposti — in attesa di scelta del cliente
                          </Text>
                        ) : null}
                      </View>
                    </View>

                    {canProAct(item.status) ? (
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
                          onPress={() =>
                            navigation.navigate("ProProposeSlots", { bookingId: item.id })
                          }
                          style={{
                            flex: 1,
                            paddingVertical: 10,
                            borderRadius: 12,
                            backgroundColor: colors.success,
                            alignItems: "center",
                          }}
                        >
                          <Text style={{ color: "#FFF", fontWeight: "700" }}>
                            📅 {t.pro.proposeSlots}
                          </Text>
                        </Pressable>
                      </View>
                    ) : null}

                    {canProStart(item.status) ? (
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
                          onPress={() => handleStart(item)}
                          style={{
                            flex: 1,
                            paddingVertical: 10,
                            borderRadius: 12,
                            backgroundColor: colors.accent,
                            alignItems: "center",
                          }}
                        >
                          <Text style={{ color: "#FFF", fontWeight: "700" }}>
                            🔧 {t.pro.startWork}
                          </Text>
                        </Pressable>
                      </View>
                    ) : null}

                    {item.status === "in_progress" && canProComplete(item.status) ? (
                      <View style={{ marginTop: 12 }}>
                        <Pressable
                          onPress={() => handleComplete(item)}
                          style={{
                            paddingVertical: 12,
                            borderRadius: 12,
                            backgroundColor: colors.success,
                            alignItems: "center",
                          }}
                        >
                          <Text style={{ color: "#FFF", fontWeight: "800" }}>
                            🏁 {t.pro.completeBooking}
                          </Text>
                        </Pressable>
                      </View>
                    ) : null}
                  </Card>
                </Animated.View>
              );
            }}
          />
        )}
      </View>
    </ScreenContainer>
  );
}
