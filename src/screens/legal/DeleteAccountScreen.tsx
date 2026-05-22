import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuthStore } from "@/store/useAuthStore";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import { wipeUserData } from "@/lib/wipeUserData";

export function DeleteAccountScreen() {
  const colors = useColors();
  const t = useT();
  const logout = useAuthStore((s) => s.logout);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);

  const performDelete = async () => {
    setBusy(true);
    try {
      await wipeUserData();
      await logout();
      Alert.alert(t.legal.deleteSuccessTitle, t.legal.deleteSuccessBody);
    } catch (e) {
      Alert.alert(t.common.error, String(e));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(t.legal.deleteConfirmDialogTitle, t.legal.deleteConfirmDialogBody, [
      { text: t.common.cancel, style: "cancel" },
      {
        text: t.legal.deleteButton,
        style: "destructive",
        onPress: performDelete,
      },
    ]);
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>
        <Card padding={20}>
          <Text style={{ fontSize: 17, fontWeight: "800", color: colors.danger, marginBottom: 10 }}>
            ⚠️ {t.legal.deleteWarningTitle}
          </Text>
          <Text style={{ fontSize: 13, color: colors.text, lineHeight: 20 }}>
            {t.legal.deleteWarningBody}
          </Text>
        </Card>

        <Card>
          <Text style={{ fontSize: 12, color: colors.textMuted, lineHeight: 18 }}>
            ℹ️ {t.legal.deleteRetentionNote}
          </Text>
        </Card>

        <Pressable
          onPress={() => setConfirmed((v) => !v)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            padding: 14,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: confirmed ? colors.danger : colors.border,
            backgroundColor: confirmed ? "rgba(220,38,38,0.08)" : "transparent",
          }}
        >
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              borderWidth: 2,
              borderColor: confirmed ? colors.danger : colors.border,
              backgroundColor: confirmed ? colors.danger : "transparent",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {confirmed ? (
              <Text style={{ color: "#FFF", fontSize: 14, fontWeight: "900" }}>✓</Text>
            ) : null}
          </View>
          <Text style={{ flex: 1, fontSize: 13, color: colors.text, fontWeight: "600" }}>
            {t.legal.deleteConfirmCheckbox}
          </Text>
        </Pressable>

        <View style={{ marginTop: 6 }}>
          <PrimaryButton
            label={t.legal.deleteButton}
            variant="danger"
            icon="🗑️"
            onPress={handleDelete}
            disabled={!confirmed || busy}
            loading={busy}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
