import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { z } from "zod";
import { ScreenContainer } from "@/components/ScreenContainer";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TextField } from "@/components/TextField";
import { useAuthStore } from "@/store/useAuthStore";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";

const schema = z.object({
  name: z.string().min(2, "Nome troppo corto."),
  email: z.string().email("Email non valida."),
  phone: z.string().min(8, "Telefono non valido."),
  password: z.string().min(6, "La password deve avere almeno 6 caratteri."),
});

export function RegisterCustomerScreen() {
  const t = useT();
  const colors = useColors();
  const registerCustomer = useAuthStore((s) => s.registerCustomer);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    const parsed = schema.safeParse({ name, email, phone, password });
    if (!parsed.success) {
      Alert.alert(t.common.error, parsed.error.issues[0].message);
      return;
    }
    registerCustomer({ name, email, phone });
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
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
            <PrimaryButton label={t.auth.createAccount} onPress={handleSubmit} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
