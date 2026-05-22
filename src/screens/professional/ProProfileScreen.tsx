import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { useNotificationsStore } from "@/store/useNotificationsStore";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import { useWorkshopStore, useOwnWorkshop } from "@/store/useWorkshopStore";
import type { ProProfileStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<ProProfileStackParamList, "ProProfile">;

export function ProProfileScreen() {
  const navigation = useNavigation<Nav>();
  const t = useT();
  const colors = useColors();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const conversations = useChatStore((s) => s.conversations);
  const notifs = useNotificationsStore((s) => s.notifications);
  const ensureWorkshop = useWorkshopStore((s) => s.ensureWorkshop);
  const setAcceptingRequests = useWorkshopStore((s) => s.setAcceptingRequests);
  const missingOnboardingSteps = useWorkshopStore((s) => s.missingOnboardingSteps);
  const workshopId = user && user.role === "professional" ? user.workshopId : undefined;
  const workshop = useOwnWorkshop(workshopId);

  useEffect(() => {
    if (workshopId) ensureWorkshop(workshopId, user?.id);
  }, [workshopId, ensureWorkshop, user?.id]);

  if (!user || user.role !== "professional") return null;

  const missing = workshopId ? missingOnboardingSteps(workshopId) : [];
  const isComplete = missing.length === 0;
  const isActive = workshop?.status === "active" && isComplete;

  const unreadCount = conversations
    .filter((c) => c.workshopId === user.workshopId)
    .reduce((acc, c) => acc + (c.unreadCountPro ?? 0), 0);
  const unreadNotifs = notifs.filter((n) => n.userId === user.id && !n.read).length;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>
        <Card padding={20}>
          <View style={{ alignItems: "center", gap: 8 }}>
            {workshop?.photo ? (
              <Image
                source={{ uri: workshop.photo }}
                style={{ width: 90, height: 90, borderRadius: 45 }}
              />
            ) : (
              <View
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 45,
                  backgroundColor: colors.accentSoft,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 40 }}>🔧</Text>
              </View>
            )}
            <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text }}>
              {workshop?.name || user.name}
            </Text>
            <Text style={{ fontSize: 13, color: colors.textMuted }}>{user.email}</Text>
            <View
              style={{
                backgroundColor: isActive ? colors.success : colors.warning ?? "#F59E0B",
                paddingHorizontal: 10,
                paddingVertical: 3,
                borderRadius: 999,
                marginTop: 4,
              }}
            >
              <Text style={{ color: "#FFF", fontSize: 10, fontWeight: "800", letterSpacing: 0.8 }}>
                {isActive ? t.pro.active.toUpperCase() : t.pro.draft.toUpperCase()}
              </Text>
            </View>
            <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>
              {isActive ? t.pro.visibleHint : t.pro.notVisibleHint}
            </Text>
          </View>
        </Card>

        {!isComplete ? (
          <Card style={{ borderColor: colors.warning ?? "#F59E0B", borderWidth: 1.5 }}>
            <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
              <Text style={{ fontSize: 28 }}>⚠️</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text }}>
                  {t.profile.incompleteProfile}
                </Text>
                <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 4, lineHeight: 19 }}>
                  {t.profile.incompleteProfileHint}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 6 }}>
                  Mancano: {missing.join(", ")}
                </Text>
                <View style={{ marginTop: 12 }}>
                  <PrimaryButton
                    label={t.profile.completeNow}
                    icon="🚀"
                    onPress={() => navigation.navigate("ProOnboarding")}
                  />
                </View>
              </View>
            </View>
          </Card>
        ) : null}

        {isComplete ? (
          <Card>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text }}>
                  {workshop?.acceptingRequests ? t.pro.acceptingRequests : t.pro.notAccepting}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                  {workshop?.acceptingRequests
                    ? "I clienti possono inviarti nuove richieste"
                    : "Sei in pausa: le nuove richieste sono bloccate"}
                </Text>
              </View>
              <Switch
                value={workshop?.acceptingRequests ?? false}
                onValueChange={(v) => {
                  if (workshopId) setAcceptingRequests(workshopId, v);
                }}
              />
            </View>
          </Card>
        ) : null}

        <ActionRow
          icon="💬"
          title={t.pro.myChats}
          subtitle={t.pro.myChatsSubtitle}
          badge={unreadCount > 0 ? unreadCount : undefined}
          onPress={() => navigation.navigate("ProChatsList")}
          colors={colors}
        />
        <ActionRow
          icon="🏢"
          title={t.pro.editWorkshop}
          subtitle="Nome, indirizzo, foto, descrizione"
          onPress={() => navigation.navigate("ProEditWorkshop")}
          colors={colors}
        />
        <ActionRow
          icon="💶"
          title={t.pro.editPriceList}
          subtitle="Servizi, prezzi base e personalizzati"
          onPress={() => navigation.navigate("ProPriceList")}
          colors={colors}
        />
        <ActionRow
          icon="🔔"
          title={t.notifications.notifications}
          subtitle={
            unreadNotifs > 0
              ? `${unreadNotifs} ${unreadNotifs === 1 ? "non letta" : "non lette"}`
              : "Tutte lette"
          }
          badge={unreadNotifs > 0 ? unreadNotifs : undefined}
          onPress={() => navigation.navigate("ProNotifications")}
          colors={colors}
        />
        <ActionRow
          icon="⚙️"
          title={t.settings.settings}
          subtitle={`${t.settings.theme} · ${t.settings.language}`}
          onPress={() => navigation.navigate("ProSettings")}
          colors={colors}
        />

        {workshop?.fiscalData ? (
          <Card>
            <Text
              style={{
                fontSize: 11,
                color: colors.textMuted,
                fontWeight: "700",
                letterSpacing: 0.8,
              }}
            >
              DATI FISCALI
            </Text>
            <InfoRow label={t.pro.legalName} value={workshop.fiscalData.legalName} colors={colors} />
            <InfoRow label={t.pro.vat} value={workshop.fiscalData.vatNumber} colors={colors} />
            <InfoRow label={t.pro.taxCode} value={workshop.fiscalData.taxCode} colors={colors} />
          </Card>
        ) : null}

        <Card>
          <InfoRow label={t.auth.phone} value={user.phone} colors={colors} />
          <InfoRow label="Codice invito" value={user.inviteCode} colors={colors} />
        </Card>

        <View style={{ marginTop: 12 }}>
          <PrimaryButton
            label={t.profile.logout}
            variant="ghost"
            icon="🚪"
            onPress={() => {
              logout().catch(() => undefined);
            }}
          />
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
            <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>{subtitle}</Text>
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
