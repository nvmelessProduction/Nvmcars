import { useEffect } from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/Card";
import { ProFeatureGate } from "@/components/ProFeatureGate";
import { useColors } from "@/store/useThemeStore";
import { useDiyStore } from "@/store/useDiyStore";
import { trackAndOpen } from "@/services/autodoc";
import { track } from "@/lib/analytics";

type Params = { slug: string };

export function DIYDetailScreen() {
  const colors = useColors();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ DiyDetail: Params }, "DiyDetail">>();
  const { slug } = route.params;
  const guide = useDiyStore((s) => s.bySlug(slug));
  const hydrate = useDiyStore((s) => s.hydrate);

  useEffect(() => {
    if (!guide) hydrate();
  }, [guide, hydrate]);

  useEffect(() => {
    if (guide) track("diy_guide_opened", { slug: guide.slug, premium: guide.isPremium });
  }, [guide]);

  if (!guide) {
    return (
      <ScreenContainer>
        <View style={{ padding: 20 }}>
          <Text style={{ color: colors.text }}>Guida non trovata.</Text>
        </View>
      </ScreenContainer>
    );
  }

  // Premium gate
  if (guide.isPremium) {
    return (
      <ProFeatureGate
        requires="diy_pro"
        audience="customer"
        title={guide.title}
        description="Sblocca questa guida (e tutte le altre) con DIY Pro."
        upgradeRoute="DiyUpgrade"
      >
        <ContentView guide={guide} />
      </ProFeatureGate>
    );
  }

  return <ContentView guide={guide} />;
}

function ContentView({ guide }: { guide: ReturnType<typeof useDiyStore.getState>["guides"][number] }) {
  const colors = useColors();

  const openPart = async (part: { name: string; autodocQuery: string }) => {
    const url = await trackAndOpen({
      searchQuery: part.autodocQuery,
      context: "diy_guide",
      contextId: guide.id,
    });
    Linking.openURL(url).catch(() => undefined);
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 60 }}>
        <View>
          <Text style={{ fontSize: 22, fontWeight: "900", color: colors.text }}>{guide.title}</Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
            <Pill text={`⏱️ ${guide.durationMin} min`} />
            <Pill text={guide.difficulty.toUpperCase()} />
          </View>
        </View>

        <Card padding={16}>
          <Text style={{ fontSize: 14, color: colors.text, lineHeight: 21 }}>{guide.intro}</Text>
        </Card>

        {guide.warnings ? (
          <Card padding={16} style={{ borderColor: "#F59E0B", backgroundColor: "rgba(245,158,11,0.08)" }}>
            <Text style={{ fontSize: 13, fontWeight: "800", color: "#F59E0B", marginBottom: 6 }}>
              ⚠️ Sicurezza
            </Text>
            <Text style={{ fontSize: 13, color: colors.text, lineHeight: 19 }}>{guide.warnings}</Text>
          </Card>
        ) : null}

        {guide.partsList.length > 0 ? (
          <Card padding={16}>
            <Text style={{ fontSize: 13, fontWeight: "800", color: colors.textMuted, letterSpacing: 0.6, marginBottom: 10 }}>
              PEZZI NECESSARI
            </Text>
            {guide.partsList.map((p, idx) => (
              <View
                key={idx}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 8,
                  borderBottomWidth: idx < guide.partsList.length - 1 ? 1 : 0,
                  borderBottomColor: colors.border,
                }}
              >
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={{ fontSize: 14, color: colors.text, fontWeight: "600" }}>
                    {p.qty}× {p.name}
                  </Text>
                </View>
                <Pressable
                  onPress={() => openPart(p)}
                  style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.accent }}
                >
                  <Text style={{ color: "#FFF", fontSize: 11, fontWeight: "800" }}>Trova →</Text>
                </Pressable>
              </View>
            ))}
            <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 8, lineHeight: 14 }}>
              Acquisti su Autodoc.it — la nostra commissione non aumenta il prezzo per te.
            </Text>
          </Card>
        ) : null}

        {guide.toolsList.length > 0 ? (
          <Card padding={16}>
            <Text style={{ fontSize: 13, fontWeight: "800", color: colors.textMuted, letterSpacing: 0.6, marginBottom: 10 }}>
              ATTREZZI
            </Text>
            {guide.toolsList.map((t, idx) => (
              <View key={idx} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 }}>
                <Text style={{ fontSize: 14, color: colors.text }}>{t.name}</Text>
                {t.avgPriceEur ? (
                  <Text style={{ fontSize: 13, color: colors.textMuted }}>~{t.avgPriceEur}€</Text>
                ) : null}
              </View>
            ))}
          </Card>
        ) : null}

        <Card padding={16}>
          <Text style={{ fontSize: 13, fontWeight: "800", color: colors.textMuted, letterSpacing: 0.6, marginBottom: 10 }}>
            PROCEDURA
          </Text>
          <Text style={{ fontSize: 14, color: colors.text, lineHeight: 22 }}>
            {guide.contentMarkdown}
          </Text>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}

function Pill({ text }: { text: string }) {
  const colors = useColors();
  return (
    <View style={{ backgroundColor: colors.bgHeader, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 }}>
      <Text style={{ fontSize: 10, fontWeight: "800", color: "#FFF" }}>{text}</Text>
    </View>
  );
}
