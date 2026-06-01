import { useEffect, useMemo } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image, Pressable, ScrollView, Switch, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { useNotificationsStore } from "@/store/useNotificationsStore";
import { useBookingsStore } from "@/store/useBookingsStore";
import { useReviewsStore } from "@/store/useReviewsStore";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import { useWorkshopStore, useOwnWorkshop } from "@/store/useWorkshopStore";
import { useSubscriptionStore, isProActive, isPremiumActive } from "@/store/useSubscriptionStore";
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
  const allBookings = useBookingsStore((s) => s.bookings);
  const allReviews = useReviewsStore((s) => s.reviews);
  const ensureWorkshop = useWorkshopStore((s) => s.ensureWorkshop);
  const setAcceptingRequests = useWorkshopStore((s) => s.setAcceptingRequests);
  const missingOnboardingSteps = useWorkshopStore((s) => s.missingOnboardingSteps);
  const workshopId = user && user.role === "professional" ? user.workshopId : undefined;
  const workshop = useOwnWorkshop(workshopId);
  const proTier = useSubscriptionStore((s) => s.proTier);

  useEffect(() => {
    if (workshopId) ensureWorkshop(workshopId, user?.id);
  }, [workshopId, ensureWorkshop, user?.id]);

  const stats = useMemo(() => {
    const mine = workshopId ? allBookings.filter((b) => b.workshopId === workshopId) : [];
    const pending = mine.filter(
      (b) => b.status === "requested" || b.status === "pending" || b.status === "slot_proposed"
    ).length;
    const completed = mine.filter((b) => b.status === "completed").length;
    const revenue = mine
      .filter((b) => b.status === "completed")
      .reduce((s, b) => s + (b.estimatedPrice ?? 0), 0);
    const reviews = workshopId ? allReviews.filter((r) => r.workshopId === workshopId) : [];
    const rating =
      reviews.length > 0
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : "—";
    return { pending, completed, revenue, rating, reviewsCount: reviews.length };
  }, [allBookings, allReviews, workshopId]);

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
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* ===== HEADER BANNER ===== */}
        <View style={{ backgroundColor: colors.bgHeader, paddingTop: 20, paddingBottom: 22, paddingHorizontal: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            {workshop?.photo ? (
              <Image
                source={{ uri: workshop.photo }}
                style={{ width: 68, height: 68, borderRadius: 20, borderWidth: 2, borderColor: colors.accent }}
              />
            ) : (
              <View
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: 20,
                  backgroundColor: colors.accentSoft,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 32 }}>🔧</Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, fontWeight: "900", color: colors.onHeader }} numberOfLines={1}>
                {workshop?.name || user.name}
              </Text>
              <Text style={{ fontSize: 12, color: colors.onHeaderMuted, marginTop: 2 }} numberOfLines={1}>
                {workshop?.city ? `${workshop.city} · ` : ""}{user.email}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  alignSelf: "flex-start",
                  gap: 5,
                  backgroundColor: isActive ? "rgba(34,197,94,0.18)" : "rgba(255,122,26,0.18)",
                  paddingHorizontal: 9,
                  paddingVertical: 3,
                  borderRadius: 999,
                  marginTop: 7,
                }}
              >
                <View
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 4,
                    backgroundColor: isActive ? colors.success : colors.warning,
                  }}
                />
                <Text style={{ color: isActive ? colors.success : colors.warning, fontSize: 10, fontWeight: "800", letterSpacing: 0.6 }}>
                  {isActive ? t.pro.active.toUpperCase() : t.pro.draft.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ padding: 16, gap: 14, marginTop: -10 }}>
          {/* ===== STATISTICHE RAPIDE ===== */}
          {isComplete ? (
            <Animated.View entering={FadeInDown.duration(300)} style={{ flexDirection: "row", gap: 10 }}>
              <MiniStat label="In attesa" value={`${stats.pending}`} accent={stats.pending > 0} colors={colors} />
              <MiniStat label="Completate" value={`${stats.completed}`} colors={colors} />
              <MiniStat label="Rating" value={`${stats.rating}`} colors={colors} />
              <MiniStat label="Incassato" value={`€${stats.revenue}`} colors={colors} />
            </Animated.View>
          ) : null}

          {/* ===== PROFILO INCOMPLETO ===== */}
          {!isComplete ? (
            <Card style={{ borderColor: colors.warning, borderWidth: 1.5 }}>
              <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
                <Text style={{ fontSize: 28 }}>⚠️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text }}>
                    {t.profile.incompleteProfile}
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 4, lineHeight: 19 }}>
                    {t.profile.incompleteProfileHint}
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

          {/* ===== INTERRUTTORE DISPONIBILITÀ ===== */}
          {isComplete ? (
            <Card>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ flex: 1, marginRight: 10 }}>
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

          {/* ===== GESTIONE OFFICINA ===== */}
          <SectionLabel text="GESTIONE OFFICINA" colors={colors} />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            <GridTile icon="💬" title="Chat" badge={unreadCount} onPress={() => navigation.navigate("ProChatsList")} colors={colors} />
            <GridTile icon="🏢" title="Officina" onPress={() => navigation.navigate("ProEditWorkshop")} colors={colors} />
            <GridTile icon="💶" title="Listino" onPress={() => navigation.navigate("ProPriceList")} colors={colors} />
            <GridTile icon="🔔" title="Notifiche" badge={unreadNotifs} onPress={() => navigation.navigate("ProNotifications")} colors={colors} />
          </View>

          {/* ===== CRESCITA ===== */}
          <SectionLabel text="FAI CRESCERE L'OFFICINA" colors={colors} />
          <ActionRow
            icon={isPremiumActive(proTier) ? "👑" : isProActive(proTier) ? "⚡" : "⭐"}
            title={
              isPremiumActive(proTier) ? "Piano Premium attivo" :
              isProActive(proTier) ? "Piano Pro attivo" : "Sblocca i piani Pro"
            }
            subtitle={
              isProActive(proTier) ? "Gestisci o cambia piano" : "Richieste illimitate, calendario, statistiche"
            }
            highlight
            onPress={() => navigation.navigate(isProActive(proTier) ? "SubscriptionManage" as never : "ProUpgrade" as never)}
            colors={colors}
          />
          <ActionRow
            icon="🚀"
            title="Boost officina"
            subtitle="Compari in cima ai risultati di ricerca"
            onPress={() => navigation.navigate("ProBoost")}
            colors={colors}
          />
          <ActionRow
            icon="🎁"
            title="Invita altre officine"
            subtitle="5€ di credito per ogni officina invitata"
            onPress={() => navigation.navigate("Referral")}
            colors={colors}
          />
          {isPremiumActive(proTier) ? (
            <ActionRow
              icon="🎓"
              title="Programma Expert"
              subtitle="Certifica le guide DIY come meccanico esperto"
              onPress={() => navigation.navigate("ProDIYReviewer")}
              colors={colors}
            />
          ) : null}

          {/* ===== ACCOUNT ===== */}
          <SectionLabel text="ACCOUNT E SICUREZZA" colors={colors} />
          <ActionRow
            icon="🔒"
            title="Sicurezza (2FA)"
            subtitle="Proteggi l'accesso con autenticazione a due fattori"
            onPress={() => navigation.navigate("ProMfaEnroll")}
            colors={colors}
          />
          <ActionRow
            icon="⚙️"
            title={t.settings.settings}
            subtitle={`${t.settings.theme} · ${t.settings.language}`}
            onPress={() => navigation.navigate("ProSettings")}
            colors={colors}
          />

          {/* ===== DATI ===== */}
          {workshop?.fiscalData ? (
            <Card>
              <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: "700", letterSpacing: 0.8 }}>
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

          <View style={{ marginTop: 8 }}>
            <PrimaryButton
              label={t.profile.logout}
              variant="ghost"
              icon="🚪"
              onPress={() => {
                logout().catch(() => undefined);
              }}
            />
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function MiniStat({
  label,
  value,
  accent,
  colors,
}: {
  label: string;
  value: string;
  accent?: boolean;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bgElevated,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: accent ? colors.accent : colors.border,
        paddingVertical: 12,
        paddingHorizontal: 6,
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: "900", color: accent ? colors.accent : colors.text }}>
        {value}
      </Text>
      <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 3, fontWeight: "600" }}>{label}</Text>
    </View>
  );
}

function SectionLabel({ text, colors }: { text: string; colors: ReturnType<typeof useColors> }) {
  return (
    <Text style={{ fontSize: 11, fontWeight: "800", color: colors.textMuted, letterSpacing: 0.8, marginTop: 6 }}>
      {text}
    </Text>
  );
}

function GridTile({
  icon,
  title,
  badge,
  onPress,
  colors,
}: {
  icon: string;
  title: string;
  badge?: number;
  onPress: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <Pressable onPress={onPress} style={{ width: "47%", flexGrow: 1 }}>
      <View
        style={{
          backgroundColor: colors.bgElevated,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 16,
          minHeight: 86,
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: colors.accentSoft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 20 }}>{icon}</Text>
          </View>
          {badge && badge > 0 ? (
            <View
              style={{
                backgroundColor: colors.accent,
                borderRadius: 999,
                paddingHorizontal: 7,
                paddingVertical: 2,
                minWidth: 22,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#FFF", fontSize: 11, fontWeight: "800" }}>{badge > 9 ? "9+" : badge}</Text>
            </View>
          ) : null}
        </View>
        <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text, marginTop: 10 }}>{title}</Text>
      </View>
    </Pressable>
  );
}

function ActionRow({
  icon,
  title,
  subtitle,
  onPress,
  colors,
  badge,
  highlight,
}: {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  colors: ReturnType<typeof useColors>;
  badge?: number;
  highlight?: boolean;
}) {
  return (
    <Pressable onPress={onPress}>
      <Card style={highlight ? { borderColor: colors.accent, borderWidth: 1.5 } : undefined}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor: highlight ? colors.accent : colors.accentSoft,
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
