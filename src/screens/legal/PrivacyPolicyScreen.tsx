import { ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/Card";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";

export function PrivacyPolicyScreen() {
  const colors = useColors();
  const t = useT();

  const sections: { title: string; body: string }[] = [
    { title: t.legal.privacyDataCollectedTitle, body: t.legal.privacyDataCollectedBody },
    { title: t.legal.privacyUseTitle, body: t.legal.privacyUseBody },
    { title: t.legal.privacyShareTitle, body: t.legal.privacyShareBody },
    { title: t.legal.privacyRightsTitle, body: t.legal.privacyRightsBody },
    { title: t.legal.privacyRetentionTitle, body: t.legal.privacyRetentionBody },
    { title: t.legal.privacyContactTitle, body: t.legal.privacyContactBody },
  ];

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>
        <View
          style={{
            padding: 12,
            borderRadius: 12,
            backgroundColor: colors.accentSoft,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ fontSize: 12, color: colors.text, lineHeight: 17 }}>
            ℹ️ {t.legal.privacyDraftBanner}
          </Text>
        </View>

        <Text style={{ fontSize: 14, color: colors.text, lineHeight: 21 }}>
          {t.legal.privacyIntro}
        </Text>

        {sections.map((s) => (
          <Card key={s.title}>
            <Text style={{ fontSize: 15, fontWeight: "800", color: colors.text, marginBottom: 8 }}>
              {s.title}
            </Text>
            <Text style={{ fontSize: 13, color: colors.textMuted, lineHeight: 20 }}>{s.body}</Text>
          </Card>
        ))}

        <Text
          style={{
            fontSize: 11,
            color: colors.textMuted,
            textAlign: "center",
            marginTop: 8,
          }}
        >
          {t.legal.privacyLastUpdate}: 2025-11
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}
