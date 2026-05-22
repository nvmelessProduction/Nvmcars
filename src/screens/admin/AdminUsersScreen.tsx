import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { useAuthStore } from "@/store/useAuthStore";
import { useColors } from "@/store/useThemeStore";
import { listAllRealUsers, realUserToAuthUser, type RealUserListItem } from "@/services/adminUsers";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { AdminStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<AdminStackParamList, "AdminUsers">;

export function AdminUsersScreen() {
  const navigation = useNavigation<Nav>();
  const colors = useColors();
  const impersonateRealUser = useAuthStore((s) => s.impersonateRealUser);
  const [users, setUsers] = useState<RealUserListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "customer" | "professional">("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listAllRealUsers();
      setUsers(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (filter === "all") return users;
    return users.filter((u) => u.role === filter);
  }, [users, filter]);

  const customerCount = users.filter((u) => u.role === "customer").length;
  const proCount = users.filter((u) => u.role === "professional").length;

  if (!isSupabaseConfigured) {
    return (
      <ScreenContainer dark>
        <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
          <EmptyState
            emoji="🔌"
            title="Backend non configurato"
            body="Per vedere gli utenti reali serve il file .env con le credenziali Supabase."
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer dark>
      <View style={{ padding: 16, gap: 12 }}>
        {/* Filtro tabs */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: colors.bgElevated,
            borderRadius: 14,
            padding: 4,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          {(
            [
              { v: "all" as const, label: `Tutti (${users.length})` },
              { v: "customer" as const, label: `Clienti (${customerCount})` },
              { v: "professional" as const, label: `Pro (${proCount})` },
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
                  borderRadius: 10,
                  backgroundColor: active ? colors.accent : "transparent",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: active ? "#FFFFFF" : colors.text,
                  }}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={{ fontSize: 11, color: colors.textMuted, lineHeight: 16 }}>
          Tocca un utente per visualizzare l'app come lui. Banner in alto per tornare admin.
        </Text>
      </View>

      {loading && users.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.accent} />
          <Text style={{ color: colors.textMuted, marginTop: 12 }}>Caricamento utenti…</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <EmptyState
            emoji="👥"
            title="Nessun utente"
            body="Quando qualcuno si registra apparirà qui."
          />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(u) => u.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 10 }}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={load}
              tintColor={colors.accent}
            />
          }
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 30).duration(250)}>
              <Pressable
                onPress={() => {
                  impersonateRealUser(realUserToAuthUser(item));
                }}
              >
                <Card>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: colors.accentSoft,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ fontSize: 22 }}>
                        {item.role === "customer" ? "👤" : "🔧"}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text }}>
                        {item.name || item.email}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                        {item.email}
                      </Text>
                      {item.role === "professional" && item.workshopName ? (
                        <Text style={{ fontSize: 11, color: colors.accent, marginTop: 2, fontWeight: "600" }}>
                          🏪 {item.workshopName}
                        </Text>
                      ) : null}
                      <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 4 }}>
                        Registrato{" "}
                        {new Date(item.createdAt).toLocaleDateString("it-IT", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </Text>
                    </View>
                    <View
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 999,
                        backgroundColor: colors.accent,
                      }}
                    >
                      <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "800" }}>
                        IMPERSONA
                      </Text>
                    </View>
                  </View>
                </Card>
              </Pressable>
            </Animated.View>
          )}
        />
      )}
    </ScreenContainer>
  );
}
