import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Alert, Text, View } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { KeyboardAwareScrollView } from "@/components/KAV";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TextField } from "@/components/TextField";
import { useAuthStore } from "@/store/useAuthStore";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { AuthStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<AuthStackParamList, "Login">;

export function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const t = useT();
  const colors = useColors();
  const loginWithPassword = useAuthStore((s) => s.loginWithPassword);
  const authLoading = useAuthStore((s) => s.authLoading);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert(t.common.error, t.auth.emailPasswordRequired);
      return;
    }
    // Login reale via Supabase. Niente account demo.
    if (!isSupabaseConfigured) {
      Alert.alert(
        "Backend non configurato",
        "Le credenziali Supabase non sono impostate. Configura il file .env per accedere."
      );
      return;
    }
    const res = await loginWithPassword(email.trim(), password);
    if (!res.ok) Alert.alert(t.common.error, res.reason);
  };

  return (
    <ScreenContainer>
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 22, paddingTop: 28, paddingBottom: 60 }}
      >
          <Text style={{ fontSize: 28, fontWeight: "800", color: colors.text }}>
            {t.auth.welcomeBack}
          </Text>
          <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 6, marginBottom: 24 }}>
            {t.auth.loginSubtitle}
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
            <PrimaryButton
              label={authLoading ? t.common.loading : t.auth.login}
              onPress={handleLogin}
              disabled={authLoading}
            />
            <PrimaryButton
              label={t.auth.noAccount}
              variant="ghost"
              onPress={() => navigation.navigate("RoleSelection")}
            />
          </View>
      </KeyboardAwareScrollView>
    </ScreenContainer>
  );
}
