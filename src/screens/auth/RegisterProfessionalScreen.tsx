import { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { z } from "zod";
import { ScreenContainer } from "@/components/ScreenContainer";
import { KAV } from "@/components/KAV";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TextField } from "@/components/TextField";
import { Card } from "@/components/Card";
import { useAuthStore } from "@/store/useAuthStore";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import { isSupabaseConfigured } from "@/lib/supabase";

const schema = z.object({
  name: z.string().min(2, "Nome officina troppo corto."),
  email: z.string().email("Email non valida."),
  phone: z.string().min(8, "Telefono non valido."),
  vatNumber: z.string().min(11, "Partita IVA non valida (11 cifre).").max(11),
  password: z.string().min(8, "La password deve avere almeno 8 caratteri."),
  inviteCode: z.string().min(4, "Codice invito mancante."),
});

export function RegisterProfessionalScreen() {
  const t = useT();
  const colors = useColors();
  const registerProfessional = useAuthStore((s) => s.registerProfessional);
  const signupProfessional = useAuthStore((s) => s.signupProfessional);
  const authLoading = useAuthStore((s) => s.authLoading);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  const handleSubmit = async () => {
    const parsed = schema.safeParse({ name, email, phone, vatNumber, password, inviteCode });
    if (!parsed.success) {
      Alert.alert(t.common.error, parsed.error.issues[0]!.message);
      return;
    }
    if (isSupabaseConfigured) {
      const res = await signupProfessional({
        name,
        email: email.trim(),
        phone,
        vatNumber,
        password,
        inviteCode,
      });
      if (!res.ok) {
        Alert.alert(t.auth.invalidInvite, res.reason);
        return;
      }
      if (res.needsEmailVerification) {
        Alert.alert(
          "Conferma la tua email",
          `Ti abbiamo inviato un'email a ${email}. Cliccala per attivare l'account.`
        );
      }
      return;
    }
    const result = registerProfessional({ name, email, phone, vatNumber, inviteCode });
    if (!result.ok) {
      Alert.alert(t.auth.invalidInvite, result.reason);
    }
  };

  return (
    <ScreenContainer>
      <KAV>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 22, paddingTop: 28 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={{ fontSize: 26, fontWeight: "800", color: colors.text }}>
            {t.auth.iAmPro}
          </Text>
          <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 6, marginBottom: 14 }}>
            Per registrare la tua officina ti serve un codice invito Nvmcars.
          </Text>

          <Card style={{ borderColor: colors.accent, marginBottom: 14 }}>
            <Text style={{ fontSize: 13, color: colors.text }}>
              💡 Per il test MVP usa uno di questi codici:
            </Text>
            <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
              NVM-CRV-A4F9 · NVM-LAD-D33M
            </Text>
          </Card>

          <View style={{ gap: 14 }}>
            <TextField
              label={t.auth.inviteCode}
              value={inviteCode}
              onChangeText={(v) => setInviteCode(v.toUpperCase())}
              placeholder="NVM-XXX-XXXX"
              autoCapitalize="characters"
            />
            <TextField
              label={t.auth.workshopName}
              value={name}
              onChangeText={setName}
              placeholder="Autofficina Rossi"
            />
            <TextField
              label={t.auth.email}
              value={email}
              onChangeText={setEmail}
              placeholder="info@autofficina.it"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextField
              label={t.auth.phone}
              value={phone}
              onChangeText={setPhone}
              placeholder="+39 06 1234567"
              keyboardType="phone-pad"
            />
            <TextField
              label={t.auth.vatNumber}
              value={vatNumber}
              onChangeText={setVatNumber}
              placeholder="11 cifre"
              keyboardType="numeric"
              maxLength={11}
            />
            <TextField
              label={t.auth.password}
              value={password}
              onChangeText={setPassword}
              placeholder="Min. 6 caratteri"
              secureTextEntry
            />
          </View>

          <View style={{ marginTop: 24 }}>
            <PrimaryButton
              label={authLoading ? t.common.loading : "Verifica codice e registrati"}
              onPress={handleSubmit}
              disabled={authLoading}
            />
          </View>
        </ScrollView>
      </KAV>
    </ScreenContainer>
  );
}
