import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TextField } from "@/components/TextField";
import { useAuthStore } from "@/store/useAuthStore";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import type { AuthStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<AuthStackParamList, "Login">;

export function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const t = useT();
  const colors = useColors();
  const loginAs = useAuthStore((s) => s.loginAs);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!email.trim() || !password) {
      Alert.alert(t.common.error, "Email e password sono richiesti.");
      return;
    }
    Alert.alert(
      "Demo MVP",
      "L'autenticazione reale arriverà con Firebase. Scegli come entrare:",
      [
        {
          text: "Cliente Demo",
          onPress: () =>
            loginAs({
              id: "demo-customer",
              role: "customer",
              email,
              name: "Marco Cliente",
              phone: "+393331110000",
            }),
        },
        {
          text: "Pro Demo",
          onPress: () =>
            loginAs({
              id: "demo-pro",
              role: "professional",
              email,
              name: "Officina Demo",
              phone: "+393331110001",
              vatNumber: "12345678901",
              workshopId: "w1",
              inviteCode: "NVM-CRV-A4F9",
            }),
        },
        { text: t.common.cancel, style: "cancel" },
      ]
    );
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
          <Text style={{ fontSize: 28, fontWeight: "800", color: colors.text }}>
            {t.auth.welcomeBack}
          </Text>
          <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 6, marginBottom: 24 }}>
            Accedi al tuo account Nvmcars.
          </Text>

          <View style={{ gap: 14 }}>
            <TextField
              label={t.auth.email}
              value={email}
              onChangeText={setEmail}
              placeholder="mario@esempio.it"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextField
              label={t.auth.password}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
            />
          </View>

          <View style={{ gap: 10, marginTop: 22 }}>
            <PrimaryButton label={t.auth.login} onPress={handleLogin} />
            <PrimaryButton
              label={t.auth.noAccount}
              variant="ghost"
              onPress={() => navigation.navigate("RoleSelection")}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
