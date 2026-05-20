import { useMemo } from "react";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import { FlatList, Text, View } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import { useCarStore } from "@/store/useCarStore";
import { useServiceLogStore } from "@/store/useServiceLogStore";
import { getServiceLabel, getServiceEmoji } from "@/data/services";
import type { HomeStackParamList } from "@/navigation/types";

type Route = RouteProp<HomeStackParamList, "CarServiceLog">;

export function CarServiceLogScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation();
  const { carId } = route.params;
  const colors = useColors();
  const t = useT();
  const car = useCarStore((s) => s.cars.find((c) => c.id === carId));
  const entries = useServiceLogStore((s) => s.entries);
  const reminders = useServiceLogStore((s) => s.reminders);

  const log = useMemo(
    () =>
      entries
        .filter((e) => e.carId === carId)
        .sort((a, b) => b.performedAt - a.performedAt),
    [entries, carId]
  );

  const myReminders = useMemo(
    () => reminders.filter((r) => r.carId === carId).sort((a, b) => a.dueAt - b.dueAt),
    [reminders, carId]
  );

  if (!car) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: colors.textMuted }}>Auto non trovata.</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <FlatList
        data={log}
        keyExtractor={(e) => e.id}
        ListHeaderComponent={
          <View style={{ padding: 16, gap: 14 }}>
            <Card>
              <Text
                style={{ fontSize: 11, color: colors.textMuted, fontWeight: "700", letterSpacing: 0.8 }}
              >
                {t.car.carSectionLabel.toUpperCase()}
              </Text>
              <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text, marginTop: 4 }}>
                {car.make} {car.model}
              </Text>
              <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>
                {car.plate} · {car.year} · {car.fuel}
              </Text>
              {car.km ? (
                <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>
                  📊 {car.km.toLocaleString("it-IT")} km
                </Text>
              ) : null}
            </Card>

            {myReminders.length > 0 ? (
              <Card style={{ borderColor: colors.warning, borderWidth: 1.5 }}>
                <Text
                  style={{ fontSize: 11, color: colors.textMuted, fontWeight: "700", letterSpacing: 0.8 }}
                >
                  ⏰ {t.car.reminderHeader.toUpperCase()}
                </Text>
                <View style={{ marginTop: 10, gap: 8 }}>
                  {myReminders.map((r) => {
                    const dueDate = new Date(r.dueAt);
                    const daysLeft = Math.ceil((r.dueAt - Date.now()) / (1000 * 60 * 60 * 24));
                    const kindLabel =
                      r.kind === "revision"
                        ? t.car.reminderKindRevision
                        : r.kind === "service"
                          ? t.car.reminderKindService
                          : r.kind === "insurance"
                            ? t.car.reminderKindInsurance
                            : t.car.reminderKindTax;
                    const dueSuffix =
                      daysLeft > 0
                        ? ` · ${t.car.reminderDaysLeft.replace("{n}", String(daysLeft))}`
                        : daysLeft === 0
                          ? ` · ${t.car.reminderDueToday}`
                          : ` · ${t.car.reminderOverdue.replace("{n}", String(-daysLeft))}`;
                    return (
                      <View key={r.id}>
                        <Text style={{ color: colors.text, fontWeight: "700", fontSize: 14 }}>
                          {kindLabel}
                        </Text>
                        <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
                          {t.car.reminderDueDate}:{" "}
                          {dueDate.toLocaleDateString("it-IT", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                          {dueSuffix}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </Card>
            ) : null}

            <Text style={{ fontSize: 13, color: colors.textMuted, fontWeight: "700", letterSpacing: 0.6, marginTop: 4 }}>
              📋 {t.car.serviceLogSectionLabel.toUpperCase()}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: "center", paddingVertical: 40 }}>
            <EmptyState emoji="🔧" title={t.car.noServiceLog} />
          </View>
        }
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 16, marginBottom: 10 }}>
            <Card>
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
                <Text style={{ fontSize: 28 }}>{getServiceEmoji(item.service)}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text }}>
                    {getServiceLabel(item.service)}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                    {item.workshopName ?? "Officina"} ·{" "}
                    {new Date(item.performedAt).toLocaleDateString("it-IT", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </Text>
                  {item.description ? (
                    <Text style={{ fontSize: 13, color: colors.text, marginTop: 6, lineHeight: 19 }}>
                      {item.description}
                    </Text>
                  ) : null}
                  {item.cost !== undefined || item.km !== undefined ? (
                    <View style={{ flexDirection: "row", gap: 14, marginTop: 6 }}>
                      {item.cost !== undefined ? (
                        <Text style={{ fontSize: 13, color: colors.text, fontWeight: "700" }}>
                          €{item.cost}
                        </Text>
                      ) : null}
                      {item.km !== undefined ? (
                        <Text style={{ fontSize: 13, color: colors.textMuted }}>
                          {item.km.toLocaleString("it-IT")} km
                        </Text>
                      ) : null}
                    </View>
                  ) : null}
                </View>
              </View>
            </Card>
          </View>
        )}
      />
    </ScreenContainer>
  );
}
