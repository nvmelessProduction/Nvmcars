import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { useColors } from "@/store/useThemeStore";
import { useWorkshopStore } from "@/store/useWorkshopStore";
import type { Workshop } from "@/types";

type Filter = "all" | "active" | "draft";

export function AdminWorkshopsScreen() {
  const colors = useColors();
  const ownWorkshops = useWorkshopStore((s) => s.ownWorkshops);
  const remoteWorkshops = useWorkshopStore((s) => s.remoteWorkshops);
  const [filter, setFilter] = useState<Filter>("all");

  const all = useMemo<Workshop[]>(() => {
    const map = new Map<string, Workshop>();
    for (const w of remoteWorkshops) map.set(w.id, w);
    for (const w of Object.values(ownWorkshops)) map.set(w.id, w);
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [ownWorkshops, remoteWorkshops]);

  const list = useMemo(() => {
    if (filter === "active") return all.filter((w) => w.status === "active");
    if (filter === "draft") return all.filter((w) => w.status !== "active");
    return all;
  }, [all, filter]);

  const activeCount = all.filter((w) => w.status === "active").length;

  return (
    <ScreenContainer>
      <FlatList
        data={list}
        keyExtractor={(w) => w.id}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 96 }}
        ListHeaderComponent={
          <View style={{ gap: 12, marginBottom: 4 }}>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Card padding={14} style={{ flex: 1 }}>
                <Text style={{ fontSize: 24, fontWeight: "900", color: colors.text }}>
                  {all.length}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textMuted }}>Officine totali</Text>
              </Card>
              <Card padding={14} style={{ flex: 1 }}>
                <Text style={{ fontSize: 24, fontWeight: "900", color: colors.success }}>
                  {activeCount}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textMuted }}>Attive</Text>
              </Card>
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {(["all", "active", "draft"] as Filter[]).map((f) => (
                <Pressable
                  key={f}
                  onPress={() => setFilter(f)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 10,
                    alignItems: "center",
                    backgroundColor: filter === f ? colors.accent : colors.bgElevated,
                    borderWidth: 1,
                    borderColor: filter === f ? colors.accent : colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: filter === f ? "#FFFFFF" : colors.text,
                    }}
                  >
                    {f === "all" ? "Tutte" : f === "active" ? "Attive" : "In bozza"}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={{ paddingTop: 40 }}>
            <EmptyState
              emoji="🏪"
              title="Nessuna officina"
              body="Non ci sono officine in questa categoria."
            />
          </View>
        }
        renderItem={({ item }) => {
          const isActive = item.status === "active";
          return (
            <Card padding={16}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text }}>
                    {item.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                    {item.city}
                    {item.province ? ` (${item.province})` : ""} · ⭐ {item.rating.toFixed(1)} (
                    {item.reviewsCount})
                  </Text>
                </View>
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 999,
                    backgroundColor: isActive ? colors.accentSoft : colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "800",
                      color: isActive ? colors.accent : colors.textMuted,
                    }}
                  >
                    {isActive ? "ATTIVA" : "BOZZA"}
                  </Text>
                </View>
              </View>
            </Card>
          );
        }}
      />
    </ScreenContainer>
  );
}
