import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Pressable, ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuthStore } from "@/store/useAuthStore";
import { useColors } from "@/store/useThemeStore";
import { useActiveCar } from "@/store/useCarStore";
import { useChatStore } from "@/store/useChatStore";
import { useT } from "@/i18n";
import type { ProfileStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<ProfileStackParamList, "Profile">;

export function CustomerProfileScreen() {
  const navigation = useNavigation<Nav>();
  const t = useT();
  const colors = useColors();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const car = useActiveCar();
  const conversations = useChatStore((s) => s.conversations);

  if (!user || user.role !== "customer") return null;

  const myConvs = conversations.filter((c) => c.customerId === user.id);
  const unreadChats = myConvs.reduce((acc, c) => acc + (c.unreadCount ?? 0), 0);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>
        <Card padding={20}>
          <View style={{ alignItems: "center", gap: 8 }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: colors.accentSoft,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 38 }}>👤</Text>
            </View>
            <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text }}>
              {user.name}
            </Text>
            <Text style={{ fontSize: 13, color: colors.textMuted }}>{user.email}</Text>
          </View>
        </Card>

        <Row
          icon="💬"
          title={t.chat.chats}
          subtitle={
            myConvs.length === 0
              ? t.chat.noChats
              : `${myConvs.length} ${myConvs.length === 1 ? "conversazione" : "conversazioni"}`
          }
          badge={unreadChats > 0 ? unreadChats : undefined}
          onPress={() => navigation.navigate("CustomerChatsList")}
          colors={colors}
        />
        <Row
          icon="🚗"
          title={t.car.yourCar}
          subtitle={car ? `${car.plate} · ${car.make} ${car.model}` : t.home.addCar}
          onPress={() => navigation.navigate("MyCar")}
          colors={colors}
        />
        <Row
          icon="⚙️"
          title={t.settings.settings}
          subtitle={`${t.settings.theme} · ${t.settings.language}`}
          onPress={() => navigation.navigate("Settings")}
          colors={colors}
        />

        <Card>
          <InfoRow label={t.auth.phone} value={user.phone} colors={colors} />
          <InfoRow label={t.profile.accountType} value={t.profile.customer} colors={colors} />
        </Card>

        <View style={{ marginTop: 12 }}>
          <PrimaryButton label={t.profile.logout} variant="ghost" icon="🚪" onPress={logout} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function Row({
  icon,
  title,
  subtitle,
  onPress,
  colors,
  badge,
}: {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  colors: ReturnType<typeof useColors>;
  badge?: number;
}) {
  return (
    <Pressable onPress={onPress}>
      <Card>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor: colors.accentSoft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 22 }}>{icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text }}>{title}</Text>
            <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
              {subtitle}
            </Text>
          </View>
          {badge !== undefined ? (
            <View
              style={{
                backgroundColor: colors.accent,
                borderRadius: 999,
                paddingHorizontal: 8,
                paddingVertical: 2,
                minWidth: 24,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#FFF", fontSize: 12, fontWeight: "800" }}>{badge}</Text>
            </View>
          ) : null}
          <Text style={{ fontSize: 18, color: colors.textMuted }}>›</Text>
        </View>
      </Card>
    </Pressable>
  );
}

function InfoRow({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
      }}
    >
      <Text style={{ fontSize: 13, color: colors.textMuted }}>{label}</Text>
      <Text style={{ fontSize: 14, color: colors.text, fontWeight: "600" }}>{value}</Text>
    </View>
  );
}
