import { useEffect, useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { ProFeatureGate } from "@/components/ProFeatureGate";
import { useColors } from "@/store/useThemeStore";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

type GuideSummary = {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  reviewerWorkshopId: string | null;
  reviewedAt: string | null;
};

export function ProDIYReviewerScreen() {
  return (
    <ScreenContainer>
      <ProFeatureGate
        requires="premium"
        title="Programma Expert"
        description="Solo le officine Premium possono certificare le guide DIY. Risposta a domande tecniche, badge Expert sul profilo, visibilità aumentata."
      >
        <ReviewerContent />
      </ProFeatureGate>
    </ScreenContainer>
  );
}

function ReviewerContent() {
  const colors = useColors();
  const user = useAuthStore((s) => s.user);
  const workshopId = user?.role === "professional" ? user.workshopId : null;
  const [guides, setGuides] = useState<GuideSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    (async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from("diy_guides")
          .select("id, title, category, difficulty, reviewer_workshop_id, reviewed_at, published")
          .order("created_at", { ascending: false })
          .limit(50);
        if (data) {
          setGuides(
            data.map((r: any) => ({
              id: r.id,
              title: r.title,
              category: r.category,
              difficulty: r.difficulty,
              reviewerWorkshopId: r.reviewer_workshop_id,
              reviewedAt: r.reviewed_at,
            }))
          );
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const certifyGuide = async (guideId: string) => {
    if (!workshopId || !isSupabaseConfigured) return;
    const { error } = await supabase
      .from("diy_guides")
      .update({ reviewer_workshop_id: workshopId, reviewed_at: new Date().toISOString() })
      .eq("id", guideId);
    if (error) {
      Alert.alert("Errore", error.message);
      return;
    }
    setGuides((prev) =>
      prev.map((g) =>
        g.id === guideId
          ? { ...g, reviewerWorkshopId: workshopId, reviewedAt: new Date().toISOString() }
          : g
      )
    );
    Alert.alert("✅ Certificato", "La guida ora porta il tuo badge Expert.");
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: "900", color: colors.text }}>
          🎓 Programma Expert
        </Text>
        <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 4, lineHeight: 19 }}>
          Rivedi le guide DIY e certificale se sono tecnicamente corrette. Il tuo nome
          apparirà come Expert sulla guida.
        </Text>
      </View>

      {loading ? null : guides.length === 0 ? (
        <EmptyState emoji="📚" title="Nessuna guida da revisionare" />
      ) : (
        <FlatList
          data={guides}
          keyExtractor={(g) => g.id}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 40 }}
          renderItem={({ item }) => {
            const certified = !!item.reviewerWorkshopId;
            const isMine = item.reviewerWorkshopId === workshopId;
            return (
              <Card padding={14}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={{ fontSize: 15, fontWeight: "800", color: colors.text }}>
                      {item.title}
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>
                      {item.category.toUpperCase()} · {item.difficulty}
                    </Text>
                  </View>
                  {certified ? (
                    <View
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 999,
                        backgroundColor: isMine ? colors.accent : colors.bgHeader,
                      }}
                    >
                      <Text style={{ fontSize: 10, fontWeight: "800", color: "#FFF" }}>
                        {isMine ? "✓ TUA" : "ALTRO"}
                      </Text>
                    </View>
                  ) : null}
                </View>
                {!certified ? (
                  <Pressable
                    onPress={() => certifyGuide(item.id)}
                    style={{
                      marginTop: 10,
                      paddingVertical: 8,
                      borderRadius: 10,
                      backgroundColor: colors.accent,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "#FFF", fontSize: 12, fontWeight: "800" }}>
                      Certifica come Expert
                    </Text>
                  </Pressable>
                ) : null}
              </Card>
            );
          }}
        />
      )}
    </View>
  );
}
