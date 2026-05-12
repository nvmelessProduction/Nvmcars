import { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Share, Text, View } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuthStore } from "@/store/useAuthStore";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import { exportUserData } from "@/lib/wipeUserData";

export function DataExportScreen() {
  const colors = useColors();
  const t = useT();
  const user = useAuthStore((s) => s.user);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const handleExport = async () => {
    setBusy(true);
    try {
      const data = await exportUserData();
      const json = JSON.stringify(data, null, 2);
      await Share.share({
        message: json,
        title: "Nvmcars — esportazione dati",
      });
      setDone(true);
    } catch (e) {
      Alert.alert(t.common.error, String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>
        <Card padding={20}>
          <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text, marginBottom: 10 }}>
            📦 {t.legal.exportTitle}
          </Text>
          <Text style={{ fontSize: 13, color: colors.textMuted, lineHeight: 19, marginBottom: 12 }}>
            {t.legal.exportIntro}
          </Text>
          <Text
            style={{
              fontSize: 11,
              color: colors.textMuted,
              fontStyle: "italic",
              lineHeight: 16,
            }}
          >
            {t.legal.exportMockNote}
          </Text>
        </Card>

        {done ? (
          <Card>
            <Text
              style={{ fontSize: 15, fontWeight: "800", color: colors.text, marginBottom: 6 }}
            >
              ✅ {t.legal.exportRequestedTitle}
            </Text>
            <Text style={{ fontSize: 13, color: colors.textMuted, lineHeight: 19 }}>
              {t.legal.exportRequestedBody.replace("{email}", user?.email ?? "")}
            </Text>
          </Card>
        ) : (
          <PrimaryButton
            label={busy ? t.common.loading : t.legal.exportRequestButton}
            icon="📤"
            onPress={handleExport}
            disabled={busy}
          />
        )}

        {busy ? (
          <View style={{ alignItems: "center", paddingTop: 8 }}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}
