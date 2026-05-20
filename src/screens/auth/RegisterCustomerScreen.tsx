import { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { z } from "zod";
import { ScreenContainer } from "@/components/ScreenContainer";
import { KAV } from "@/components/KAV";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TextField } from "@/components/TextField";
import { useAuthStore } from "@/store/useAuthStore";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import { isSupabaseConfigured } from "@/lib/supabase";

const schema = z.object({
  name: z.string().min(2, "Nome troppo corto."),
  email: z.string().email("Email non valida."),
  phone: z.string().min(8, "Telefono non valido."),
  password: z.string().min(8, "La password deve avere almeno 8 caratteri."),
});

export function RegisterCustomerScreen() {
  const t = useT();
  const colors = useColors();
  const registerCustomer = useAuthStore((s) => s.registerCustomer);
  const signupCustomer = useAuthStore((s) => s.signupCustomer);
  const authLoading = useAuthStore((s) => s.authLoading);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    const parsed = schema.safeParse({ name, email, phone, password });
    if (!parsed.success) {
      Alert.alert(t.common.error, parsed.error.issues[0]!.message);
      return;
    }
    if (isSupabaseConfigured) {
      const res = await signupCustomer({ name, email: email.trim(), phone, password });
      if (!res.ok) {
        Alert.alert(t.common.error, res.reason);
        return;
      }
      if (res.needsEmailVerification) {
        Alert.alert(
          t.auth.checkEmailTitle,
          t.auth.checkEmailBody.replace("{email}", email)
        );
      }
      return;
    }
    registerCustomer({ name, email, phone });
  };

  return (
    <ScreenContainer>
      <KAV>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 22, paddingTop: 28 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={{ fontSize: 26, fontWeight: "800", color: colors.text }}>
            {t.auth.iAmCustomer}
          </Text>
          <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 6, marginBottom: 22 }}>
            Crea il tuo account in 30 secondi.
          </Text>

          <View style={{ gap: 14 }}>
            <TextField
              label={t.auth.nameAndSurname}
              value={name}
              onChangeText={setName}
              placeholder="Mario Rossi"
            />
            <TextField
              label={t.auth.email}
              value={email}
              onChangeText={setEmail}
              placeholder="mario@esempio.it"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextField
              label={t.auth.phone}
              value={phone}
              onChangeText={setPhone}
              placeholder="+39 333 1234567"
              keyboardType="phone-pad"
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
              label={authLoading ? t.common.loading : t.auth.createAccount}
              onPress={handleSubmit}
              disabled={authLoading}
            />
          </View>
        </ScrollView>
      </KAV>
    </ScreenContainer>
  );
}
