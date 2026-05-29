import { useEffect, useState } from "react";
import { Alert, Image, ScrollView, Text, View, TextInput } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useColors } from "@/store/useThemeStore";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// Multi-Factor Auth (TOTP) per i pro.
// Supabase Auth ha supabase.auth.mfa.enroll/challenge/verify nativamente.
// Flusso:
//   1. enroll() → ritorna un secret + QR code (data URI)
//   2. l'utente lo scansiona con Google Authenticator / Authy / 1Password
//   3. inserisce il codice TOTP a 6 cifre per confermare
//   4. verify() lo attiva
export function ProMfaEnrollScreen() {
  const colors = useColors();
  const navigation = useNavigation<any>();
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrSvg, setQrSvg] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isSupabaseConfigured) startEnrollment();
  }, []);

  const startEnrollment = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
      if (error) {
        Alert.alert("Errore", error.message);
        return;
      }
      if (data) {
        setFactorId(data.id);
        // data.totp.qr_code è un SVG data URI; data.totp.secret è il secret base32
        setQrSvg(data.totp.qr_code);
        setSecret(data.totp.secret);
      }
    } finally {
      setBusy(false);
    }
  };

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
      Alert.alert("✅ MFA attivato", "L'autenticazione a due fattori è ora attiva.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}>
        <View>
          <Text style={{ fontSize: 22, fontWeight: "900", color: colors.text }}>
            🔒 Autenticazione a due fattori
          </Text>
          <Text style={{ fontSize: 13, color: colors.textMuted, lineHeight: 19, marginTop: 4 }}>
            Aggiungi un secondo livello di sicurezza al tuo account officina.
          </Text>
        </View>

        <Card padding={16}>
          <Text style={{ fontSize: 14, fontWeight: "800", color: colors.text, marginBottom: 8 }}>
            Step 1 — Scarica un&apos;app TOTP
          </Text>
          <Text style={{ fontSize: 13, color: colors.text, lineHeight: 19 }}>
            Se non ne hai una, ti consiglio una di queste (tutte gratis):
          </Text>
          <View style={{ marginTop: 8, gap: 4 }}>
            <Text style={{ color: colors.accent, fontSize: 13 }}>• Google Authenticator</Text>
            <Text style={{ color: colors.accent, fontSize: 13 }}>• Authy</Text>
            <Text style={{ color: colors.accent, fontSize: 13 }}>• 1Password</Text>
            <Text style={{ color: colors.accent, fontSize: 13 }}>• iPhone Password autofill (iOS 15+)</Text>
          </View>
        </Card>

        <Card padding={16}>
          <Text style={{ fontSize: 14, fontWeight: "800", color: colors.text, marginBottom: 8 }}>
            Step 2 — Scansiona il QR code
          </Text>
          {qrSvg ? (
            <View style={{ alignItems: "center", padding: 12, backgroundColor: "#FFF", borderRadius: 12 }}>
              {/* il QR è un data URI SVG; il modo più semplice è renderizzarlo come img via expo-image, ma per evitare nuove dep mostriamo il secret */}
              <Image
                source={{ uri: qrSvg.startsWith("data:") ? qrSvg : `data:image/svg+xml;utf8,${encodeURIComponent(qrSvg)}` }}
                style={{ width: 200, height: 200 }}
                resizeMode="contain"
              />
            </View>
          ) : (
            <Text style={{ color: colors.textMuted }}>Sto generando il QR…</Text>
          )}
          {secret ? (
            <View style={{ marginTop: 10 }}>
              <Text style={{ fontSize: 11, color: colors.textMuted }}>Oppure inserisci a mano:</Text>
              <Text
                style={{ fontSize: 13, color: colors.text, fontFamily: "monospace", letterSpacing: 1, marginTop: 4 }}
                selectable
              >
                {secret}
              </Text>
            </View>
          ) : null}
        </Card>

        <Card padding={16}>
          <Text style={{ fontSize: 14, fontWeight: "800", color: colors.text, marginBottom: 8 }}>
            Step 3 — Inserisci il codice
          </Text>
          <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 10 }}>
            Apri l&apos;app TOTP, trova Nvmcars e digita il codice a 6 cifre.
          </Text>
          <TextInput
            value={code}
            onChangeText={(v) => setCode(v.replace(/[^0-9]/g, "").slice(0, 6))}
            placeholder="123456"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            maxLength={6}
            style={{
              backgroundColor: colors.bgElevated,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 14,
              paddingHorizontal: 14,
              paddingVertical: 14,
              fontSize: 22,
              color: colors.text,
              textAlign: "center",
              letterSpacing: 8,
              fontVariant: ["tabular-nums"],
            }}
          />
          <View style={{ marginTop: 12 }}>
            <PrimaryButton
              label="Attiva MFA"
              onPress={handleVerify}
              disabled={code.length !== 6 || busy}
              loading={busy}
            />
          </View>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}
