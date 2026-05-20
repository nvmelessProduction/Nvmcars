import { useMemo } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuthStore } from "@/store/useAuthStore";
import { useColors } from "@/store/useThemeStore";
import { useBookingsStore } from "@/store/useBookingsStore";
import { useWorkshopStore } from "@/store/useWorkshopStore";
import { useNotificationsStore } from "@/store/useNotificationsStore";
import { useChatStore } from "@/store/useChatStore";
import { useCarStore } from "@/store/useCarStore";
import { useReviewsStore } from "@/store/useReviewsStore";
import { isSupabaseConfigured } from "@/lib/supabase";
import { ADMIN_EMAILS } from "@/data/admins";

export function AdminHomeScreen() {
  const colors = useColors();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const impersonateCustomer = useAuthStore((s) => s.impersonateCustomer);
  const impersonatePro = useAuthStore((s) => s.impersonatePro);

  const bookings = useBookingsStore((s) => s.bookings);
  const ownWorkshops = useWorkshopStore((s) => s.ownWorkshops);
  const remoteWorkshops = useWorkshopStore((s) => s.remoteWorkshops);
  const notifications = useNotificationsStore((s) => s.notifications);
  const conversations = useChatStore((s) => s.conversations);
  const messages = useChatStore((s) => s.messages);
  const cars = useCarStore((s) => s.cars);
  const reviews = useReviewsStore((s) => s.reviews);

  const stats = useMemo(() => {
    const totalWorkshops = Object.keys(ownWorkshops).length + remoteWorkshops.length;
    const activeWorkshops =
      Object.values(ownWorkshops).filter((w) => w.status === "active").length +
      remoteWorkshops.filter((w) => w.status === "active").length;
    const pendingBookings = bookings.filter(
      (b) =>
        b.status === "requested" ||
        b.status === "pending" ||
        b.status === "slot_proposed"
    ).length;
    const confirmedBookings = bookings.filter(
      (b) =>
        b.status === "confirmed" ||
        b.status === "accepted" ||
        b.status === "in_progress"
    ).length;
    const completedBookings = bookings.filter((b) => b.status === "completed").length;
    const unreadNotifs = notifications.filter((n) => !n.read).length;
    const avgRating =
      reviews.length > 0
        ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
        : "—";
    return {
      totalWorkshops,
      activeWorkshops,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      unreadNotifs,
      avgRating,
    };
  }, [ownWorkshops, remoteWorkshops, bookings, notifications, reviews]);

  if (!user || user.role !== "admin") return null;

  const handleResetLocal = () => {
    Alert.alert(
      "Reset dati locali?",
      "Cancella tutti i dati cache locali (auto, prenotazioni mock, chat). I dati su Supabase non vengono toccati. Continuare?",
      [
        { text: "Annulla", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            // wipe by replacing storage keys via store internals
            useCarStore.setState({ cars: [], activeCarId: null, plateLookupsUsed: 0 });
            useBookingsStore.setState({ bookings: [] });
            useChatStore.setState({ messages: [], conversations: [] });
            useNotificationsStore.setState({ notifications: [] });
            useReviewsStore.setState({ reviews: [] });
            useWorkshopStore.setState({ ownWorkshops: {} });
            Alert.alert("Reset completato", "Cache locale azzerata.");
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer dark>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60, gap: 14 }}>
        {/* Header */}
        <View style={{ alignItems: "center", paddingVertical: 16, gap: 8 }}>
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
            Pannello Admin
          </Text>
          <Text style={{ fontSize: 13, color: colors.textMuted, textAlign: "center" }}>
            {user.email}
          </Text>
          <View
            style={{
              flexDirection: "row",
              gap: 6,
              marginTop: 4,
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: isSupabaseConfigured ? colors.success : colors.warning,
              }}
            />
            <Text style={{ fontSize: 11, color: colors.textMuted }}>
              {isSupabaseConfigured ? "Backend live (Supabase)" : "Backend offline (mock)"}
            </Text>
          </View>
        </View>

        {/* Impersona */}
        <Text style={labelStyle(colors.textMuted)}>IMPERSONA UTENTE</Text>

        <Animated.View entering={FadeInDown.delay(60).duration(300)}>
          <Pressable onPress={impersonateCustomer}>
            <Card padding={18}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                <View style={iconCircleStyle(colors.accentSoft)}>
                  <Text style={{ fontSize: 30 }}>👤</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 17, fontWeight: "800", color: colors.text }}>
                    Visualizza come Cliente
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                    Marco Cliente · cerca officine, prenota, paga, recensisci
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
                <View style={iconCircleStyle(colors.accentSoft)}>
                  <Text style={{ fontSize: 30 }}>🔧</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 17, fontWeight: "800", color: colors.text }}>
                    Visualizza come Professionista
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                    Officina Demo · gestisci richieste, listino, chat
                  </Text>
                </View>
                <Text style={{ fontSize: 22, color: colors.textMuted }}>›</Text>
              </View>
            </Card>
          </Pressable>
        </Animated.View>

        {/* KPI grandi */}
        <Text style={labelStyle(colors.textMuted)}>PANORAMICA SISTEMA</Text>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <KpiCard
            icon="🏪"
            value={stats.totalWorkshops}
            label="Officine totali"
            sub={`${stats.activeWorkshops} attive`}
            colors={colors}
          />
          <KpiCard
            icon="👥"
            value={cars.length}
            label="Auto registrate"
            colors={colors}
          />
        </View>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <KpiCard
            icon="📨"
            value={stats.pendingBookings}
            label="In attesa"
            colors={colors}
            highlight={stats.pendingBookings > 0 ? colors.warning : undefined}
          />
          <KpiCard
            icon="✅"
            value={stats.confirmedBookings}
            label="Confermate"
            colors={colors}
            highlight={stats.confirmedBookings > 0 ? colors.success : undefined}
          />
          <KpiCard
            icon="🏁"
            value={stats.completedBookings}
            label="Completate"
            colors={colors}
          />
        </View>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <KpiCard
            icon="💬"
            value={conversations.length}
            label="Conversazioni"
            sub={`${messages.length} msg`}
            colors={colors}
          />
          <KpiCard
            icon="⭐"
            value={stats.avgRating}
            label="Rating medio"
            sub={`${reviews.length} recensioni`}
            colors={colors}
          />
          <KpiCard
            icon="🔔"
            value={stats.unreadNotifs}
            label="Notifiche non lette"
            colors={colors}
          />
        </View>

        {/* Strumenti operativi */}
        <Text style={labelStyle(colors.textMuted)}>STRUMENTI OPERATIVI</Text>

        <Card>
          <Row
            icon="🎫"
            title="Codici invito"
            subtitle="Crea/visualizza codici per registrare nuove officine"
            onPress={() => Alert.alert("In arrivo", "Gestione codici invito disponibile a breve")}
            colors={colors}
          />
          <Divider colors={colors} />
          <Row
            icon="🏪"
            title="Officine pubblicate"
            subtitle={`${stats.activeWorkshops} attive · ${stats.totalWorkshops - stats.activeWorkshops} in bozza`}
            onPress={() => Alert.alert("In arrivo", "Elenco officine in arrivo")}
            colors={colors}
          />
          <Divider colors={colors} />
          <Row
            icon="📊"
            title="Statistiche dettagliate"
            subtitle="Trend, conversion, top servizi, geografia"
            onPress={() => Alert.alert("In arrivo", "Dashboard analytics in arrivo")}
            colors={colors}
          />
          <Divider colors={colors} />
          <Row
            icon="🧹"
            title="Reset cache locale"
            subtitle="Azzera dati offline (Supabase non viene toccato)"
            onPress={handleResetLocal}
            colors={colors}
          />
        </Card>

        {/* Info team */}
        <Text style={labelStyle(colors.textMuted)}>TEAM ADMIN</Text>
        <Card>
          {Array.from(ADMIN_EMAILS).map((email) => (
            <View
              key={email}
              style={{
                paddingVertical: 8,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Text style={{ fontSize: 16 }}>{email === user.email ? "🟢" : "⚪️"}</Text>
              <Text style={{ flex: 1, color: colors.text, fontSize: 14 }}>{email}</Text>
              {email === user.email ? (
                <Text style={{ color: colors.accent, fontSize: 11, fontWeight: "800" }}>
                  TU
                </Text>
              ) : null}
            </View>
          ))}
          <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 8 }}>
            Per aggiungere admin: modifica `src/data/admins.ts` e ridistribuisci la build.
          </Text>
        </Card>

        <View style={{ marginTop: 12 }}>
          <PrimaryButton
            label="Logout"
            icon="🚪"
            variant="ghost"
            onPress={logout}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const labelStyle = (color: string) => ({
  fontSize: 11,
  color,
  fontWeight: "700" as const,
  letterSpacing: 0.8,
  marginTop: 8,
});

const iconCircleStyle = (bg: string) => ({
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: bg,
  alignItems: "center" as const,
  justifyContent: "center" as const,
});

function KpiCard({
  icon,
  value,
  label,
  sub,
  highlight,
  colors,
}: {
  icon: string;
  value: number | string;
  label: string;
  sub?: string;
  highlight?: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bgElevated,
        borderWidth: 1,
        borderColor: highlight ?? colors.border,
        borderRadius: 14,
        padding: 12,
        alignItems: "flex-start",
        gap: 4,
      }}
    >
      <Text style={{ fontSize: 22 }}>{icon}</Text>
      <Text
        style={{
          fontSize: 22,
          fontWeight: "800",
          color: highlight ?? colors.text,
        }}
      >
        {value}
      </Text>
      <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: "600" }}>{label}</Text>
      {sub ? <Text style={{ fontSize: 10, color: colors.textMuted }}>{sub}</Text> : null}
    </View>
  );
}

function Row({
  icon,
  title,
  subtitle,
  onPress,
  colors,
}: {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <Pressable onPress={onPress}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingVertical: 10,
        }}
      >
        <Text style={{ fontSize: 24, width: 32, textAlign: "center" }}>{icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text }}>{title}</Text>
          <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>{subtitle}</Text>
        </View>
        <Text style={{ fontSize: 20, color: colors.textMuted }}>›</Text>
      </View>
    </Pressable>
  );
}

function Divider({ colors }: { colors: ReturnType<typeof useColors> }) {
  return <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 2 }} />;
}
