import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuthStore } from "@/store/useAuthStore";
import { useColors } from "@/store/useThemeStore";
import { useBookingsStore } from "@/store/useBookingsStore";
import { useWorkshopStore } from "@/store/useWorkshopStore";
import { useNotificationsStore } from "@/store/useNotificationsStore";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { AdminStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<AdminStackParamList, "AdminHome">;

export function AdminHomeScreen() {
  const navigation = useNavigation<Nav>();
  const colors = useColors();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const impersonateCustomer = useAuthStore((s) => s.impersonateCustomer);
  const impersonatePro = useAuthStore((s) => s.impersonatePro);

  const bookingsCount = useBookingsStore((s) => s.bookings.length);
  const workshopsCount = useWorkshopStore(
    (s) => Object.keys(s.ownWorkshops).length + s.remoteWorkshops.length
  );
  const notificationsCount = useNotificationsStore((s) => s.notifications.length);

  if (!user || user.role !== "admin") return null;

  return (
    <ScreenContainer dark>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }}>
        {/* Header */}
        <View style={{ alignItems: "center", paddingVertical: 20, gap: 8 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: colors.accent,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 40 }}>👑</Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: "800", color: colors.text }}>
            Admin Mode
          </Text>
          <Text style={{ fontSize: 13, color: colors.textMuted, textAlign: "center" }}>
            {user.email} · {isSupabaseConfigured ? "🟢 Backend live" : "🟡 Backend offline"}
          </Text>
        </View>

        {/* Switch role */}
        <Text
          style={{
            fontSize: 11,
            color: colors.textMuted,
            fontWeight: "700",
            letterSpacing: 0.8,
            marginTop: 8,
          }}
        >
          IMPERSONA UTENTE
        </Text>

        <Animated.View entering={FadeInDown.delay(60).duration(300)}>
          <Pressable onPress={impersonateCustomer}>
            <Card padding={18}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: colors.accentSoft,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 30 }}>👤</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 17, fontWeight: "800", color: colors.text }}>
                    Visualizza come Cliente
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                    Vedi l'app come Marco Cliente · cerca officine, prenota, paga
                  </Text>
                </View>
                <Text style={{ fontSize: 22, color: colors.textMuted }}>›</Text>
              </View>
            </Card>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(300)}>
          <Pressable onPress={impersonatePro}>
            <Card padding={18}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: colors.accentSoft,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 30 }}>🔧</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 17, fontWeight: "800", color: colors.text }}>
                    Visualizza come Professionista
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                    Vedi l'app come Officina Demo · gestisci richieste, listino, chat
                  </Text>
                </View>
                <Text style={{ fontSize: 22, color: colors.textMuted }}>›</Text>
              </View>
            </Card>
          </Pressable>
        </Animated.View>

        {/* Statistiche globali (utili in futuro) */}
        <Text
          style={{
            fontSize: 11,
            color: colors.textMuted,
            fontWeight: "700",
            letterSpacing: 0.8,
            marginTop: 16,
          }}
        >
          PANORAMICA SISTEMA
        </Text>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <StatCard icon="🏪" label="Officine" value={workshopsCount} colors={colors} />
          <StatCard icon="📅" label="Prenotazioni" value={bookingsCount} colors={colors} />
          <StatCard icon="🔔" label="Notifiche" value={notificationsCount} colors={colors} />
        </View>

        <View style={{ marginTop: 24 }}>
          <PrimaryButton
            label="Logout"
            icon="🚪"
            variant="ghost"
            onPress={logout}
          />
        </View>

        <Text
          style={{
            fontSize: 11,
            color: colors.textMuted,
            textAlign: "center",
            marginTop: 12,
            lineHeight: 16,
          }}
        >
          Account interno. In modalità impersona vedrai un banner in alto per tornare qui in
          qualunque momento.
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}

function StatCard({
  icon,
  label,
  value,
  colors,
}: {
  icon: string;
  label: string;
  value: number;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bgElevated,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 14,
        padding: 12,
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 22 }}>{icon}</Text>
      <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text, marginTop: 4 }}>
        {value}
      </Text>
      <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>{label}</Text>
    </View>
  );
}
