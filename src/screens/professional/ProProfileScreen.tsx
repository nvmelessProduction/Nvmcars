import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Pressable, ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuthStore } from "@/store/useAuthStore";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import type { ProProfileStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<ProProfileStackParamList, "ProProfile">;

export function ProProfileScreen() {
  const navigation = useNavigation<Nav>();
  const t = useT();
  const colors = useColors();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  if (!user || user.role !== "professional") return null;

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
              <Text style={{ fontSize: 38 }}>🔧</Text>
            </View>
            <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text }}>
              {user.name}
            </Text>
            <Text style={{ fontSize: 13, color: colors.textMuted }}>{user.email}</Text>
            <View
              style={{
                backgroundColor: colors.accent,
                paddingHorizontal: 10,
                paddingVertical: 3,
                borderRadius: 999,
                marginTop: 4,
              }}
            >
              <Text style={{ color: "#FFF", fontSize: 10, fontWeight: "800", letterSpacing: 0.8 }}>
                PROFESSIONISTA
              </Text>
            </View>
          </View>
        </Card>

        <ActionRow
          icon="🏢"
          title={t.pro.editWorkshop}
          subtitle="Nome, indirizzo, contatti, descrizione"
          onPress={() => navigation.navigate("ProEditWorkshop")}
          colors={colors}
        />
        <ActionRow
          icon="⚙️"
          title={t.settings.settings}
          subtitle={`${t.settings.theme} · ${t.settings.language}`}
          onPress={() => navigation.navigate("ProSettings")}
          colors={colors}
        />

        <Card>
          <InfoRow label={t.auth.phone} value={user.phone} colors={colors} />
          <InfoRow label={t.auth.vatNumber} value={user.vatNumber} colors={colors} />
          <InfoRow label="Codice invito" value={user.inviteCode} colors={colors} />
        </Card>

        <View style={{ marginTop: 12 }}>
          <PrimaryButton label={t.profile.logout} variant="ghost" icon="🚪" onPress={logout} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function ActionRow({
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
