import { useState, useEffect } from "react";
import { Alert, ScrollView, Text, TextInput, View } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useColors } from "@/store/useThemeStore";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/lib/supabase";

// Schermata mostrata quando l'utente ha MFA attivo e ha appena fatto login.
// La session è ancora AAL1 (insufficiente per accedere ai dati Pro sensibili).
// Inseriamo il codice TOTP e completiamo il challenge → session passa a AAL2.
export function MfaChallengeScreen() {
  const colors = useColors();
  const logout = useAuthStore((s) => s.logout);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.mfa.listFactors();
      const verifiedTotp = data?.totp.find((f) => f.status === "verified");
      if (verifiedTotp) setFactorId(verifiedTotp.id);
    })();
  }, []);

  const handleVerify = async () => {
    if (!factorId || code.length !== 6) return;
    setBusy(true);
    try {
      const { data: chall, error: chErr } = await supabase.auth.mfa.challenge({ factorId });
      if (chErr || !chall) {
        Alert.alert("Errore", chErr?.message ?? "Challenge fallita.");
        return;
      }
      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: chall.id,
        code,
      });
      if (error) {
        Alert.alert("Codice errato", error.message);
        return;
      }
      // Niente da fare: il listener su auth state in App.tsx rileva l'AAL2
      // e fa scattare il render normale dello stack.
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}>
        <View>
          <Text style={{ fontSize: 22, fontWeight: "900", color: colors.text }}>
            🔒 Verifica MFA
          </Text>
          <Text style={{ fontSize: 13, color: colors.textMuted, lineHeight: 19, marginTop: 4 }}>
            Per accedere a tutti i dati, inserisci il codice a 6 cifre della tua app
            di autenticazione.
          </Text>
        </View>

        <Card padding={16}>
          <TextInput
            value={code}
            onChangeText={(v) => setCode(v.replace(/[^0-9]/g, "").slice(0, 6))}
            placeholder="123456"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
            style={{
              backgroundColor: colors.bgElevated,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 14,
              paddingHorizontal: 14,
              paddingVertical: 14,
              fontSize: 28,
              color: colors.text,
              textAlign: "center",
              letterSpacing: 10,
              fontVariant: ["tabular-nums"],
            }}
          />
          <View style={{ marginTop: 12 }}>
            <PrimaryButton
              label="Verifica"
              onPress={handleVerify}
              disabled={code.length !== 6 || !factorId || busy}
              loading={busy}
            />
          </View>
        </Card>

        <PrimaryButton label="Esci" variant="ghost" onPress={() => logout()} />
      </ScrollView>
    </ScreenContainer>
  );
}
