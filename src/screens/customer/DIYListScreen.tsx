import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { useColors } from "@/store/useThemeStore";
import { useDiyStore, DIY_CATEGORIES, DiyGuide } from "@/store/useDiyStore";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";

const DIFFICULTY_COLOR: Record<DiyGuide["difficulty"], string> = {
  facile: "#10B981",
  medio: "#F59E0B",
  difficile: "#EF4444",
};

export function DIYListScreen() {
  const colors = useColors();
  const navigation = useNavigation<any>();
  const guides = useDiyStore((s) => s.guides);
  const loading = useDiyStore((s) => s.loading);
  const hydrate = useDiyStore((s) => s.hydrate);
  const customerTier = useSubscriptionStore((s) => s.customerTier);
  const [filterCat, setFilterCat] = useState<string | null>(null);

  useEffect(() => {
    if (guides.length === 0) hydrate();
  }, [hydrate, guides.length]);

  const filtered = filterCat ? guides.filter((g) => g.category === filterCat) : guides;
  const isDiyPro = customerTier === "diy_pro";
  const freeGuides = filtered.filter((g) => !g.isPremium);
  const premiumGuides = filtered.filter((g) => g.isPremium);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>
        <Card padding={20}>
          <Text style={{ fontSize: 22, fontWeight: "900", color: colors.text }}>
            🔧 DIY Garage
          </Text>
          <Text style={{ fontSize: 13, color: colors.textMuted, lineHeight: 19, marginTop: 4 }}>
            Tutorial passo-passo per riparare tu stesso. Risparmi sulla manodopera.
          </Text>
          {!isDiyPro ? (
            <Pressable
              onPress={() => navigation.navigate("DiyUpgrade")}
              style={{
                marginTop: 12,
                padding: 10,
                borderRadius: 10,
                backgroundColor: colors.accent,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#FFF", fontWeight: "800", fontSize: 13 }}>
                ⚡ Sblocca tutte le guide con DIY Pro
              </Text>
            </Pressable>
          ) : null}
        </Card>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
        >
          <CategoryChip
            label="Tutte"
            icon="🏷️"
            active={filterCat === null}
            onPress={() => setFilterCat(null)}
          />
          {DIY_CATEGORIES.map((c) => (
            <CategoryChip
              key={c.key}
              label={c.label}
              icon={c.icon}
              active={filterCat === c.key}
              onPress={() => setFilterCat(c.key === filterCat ? null : c.key)}
            />
          ))}
        </ScrollView>

        {loading && guides.length === 0 ? (
          <View style={{ paddingVertical: 30, alignItems: "center" }}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : null}

        {!loading && filtered.length === 0 ? (
          <EmptyState
            emoji="📚"
            title="Nessuna guida"
            body="Stiamo aggiungendo nuove guide ogni settimana. Torna presto!"
          />
        ) : null}

        {freeGuides.length > 0 ? (
          <View style={{ marginTop: 6 }}>
            <Text style={{ fontSize: 11, fontWeight: "800", color: colors.textMuted, letterSpacing: 0.6, marginBottom: 8 }}>
              GRATIS
            </Text>
            <View style={{ gap: 10 }}>
              {freeGuides.map((g) => (
                <GuideCard key={g.id} guide={g} unlocked />
              ))}
            </View>
          </View>
        ) : null}

        {premiumGuides.length > 0 ? (
          <View style={{ marginTop: 14 }}>
            <Text style={{ fontSize: 11, fontWeight: "800", color: colors.textMuted, letterSpacing: 0.6, marginBottom: 8 }}>
              DIY PRO {isDiyPro ? "✓" : "🔒"}
            </Text>
            <View style={{ gap: 10 }}>
              {premiumGuides.map((g) => (
                <GuideCard key={g.id} guide={g} unlocked={isDiyPro} />
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}

function CategoryChip({ label, icon, active, onPress }: { label: string; icon: string; active: boolean; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: active ? colors.accent : colors.bgElevated,
        borderWidth: 1,
        borderColor: active ? colors.accent : colors.border,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
      }}
    >
      <Text style={{ fontSize: 14 }}>{icon}</Text>
      <Text style={{ color: active ? "#FFF" : colors.text, fontWeight: "700", fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

function GuideCard({ guide, unlocked }: { guide: DiyGuide; unlocked: boolean }) {
  const colors = useColors();
  const navigation = useNavigation<any>();
  return (
    <Pressable
      onPress={() =>
        navigation.navigate(unlocked ? "DiyDetail" : "DiyUpgrade", unlocked ? { slug: guide.slug } : undefined)
      }
    >
      <Card padding={14}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <Text style={{ fontSize: 15, fontWeight: "800", color: colors.text, flex: 1, marginRight: 8 }}>
            {guide.title}
          </Text>
          {!unlocked ? <Text style={{ fontSize: 16 }}>🔒</Text> : null}
        </View>
        <Text style={{ fontSize: 12, color: colors.textMuted, lineHeight: 17 }} numberOfLines={2}>
          {guide.intro}
        </Text>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 10, alignItems: "center", flexWrap: "wrap" }}>
          <Pill text={`⏱️ ${guide.durationMin} min`} />
          <Pill text={guide.difficulty.toUpperCase()} color={DIFFICULTY_COLOR[guide.difficulty]} />
          {guide.helpfulCount > 0 ? <Pill text={`👍 ${guide.helpfulCount}`} /> : null}
        </View>
      </Card>
    </Pressable>
  );
}

function Pill({ text, color }: { text: string; color?: string }) {
  const colors = useColors();
  return (
    <View
      style={{
        backgroundColor: color ? `${color}22` : colors.bgHeader,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
      }}
    >
      <Text style={{ fontSize: 10, fontWeight: "800", color: color ?? "#FFF" }}>{text}</Text>
    </View>
  );
}
