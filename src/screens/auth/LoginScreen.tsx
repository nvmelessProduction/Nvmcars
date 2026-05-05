import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuthStore } from "@/store/useAuthStore";
import type { AuthStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<AuthStackParamList, "Login">;

export function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const loginAs = useAuthStore((s) => s.loginAs);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!email.trim() || !password) {
      Alert.alert("Dati mancanti", "Inserisci email e password.");
      return;
    }
    Alert.alert(
      "Demo MVP",
      "L'autenticazione reale arriverà con Firebase. Per ora puoi entrare come Cliente o come Professionista da questa schermata.",
      [
        {
          text: "Entra come Cliente",
          onPress: () =>
            loginAs({
              id: "demo-customer",
              role: "customer",
              email,
              name: "Cliente Demo",
              phone: "+393331110000",
            }),
        },
        {
          text: "Entra come Pro",
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
        { text: "Annulla", style: "cancel" },
      ]
    );
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 px-6 py-8 gap-4">
            <Text className="text-3xl font-bold text-ink-900 mt-4">Bentornato</Text>
            <Text className="text-base text-ink-500 mb-4">
              Accedi al tuo account Nvmcars.
            </Text>

            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="mario@esempio.it"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Field
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
            />

            <View className="mt-4 gap-3">
              <PrimaryButton label="Accedi" onPress={handleLogin} />
              <PrimaryButton
                label="Non hai un account? Registrati"
                variant="ghost"
                onPress={() => navigation.navigate("RoleSelection")}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad" | "numeric";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
};

function Field({ label, ...rest }: FieldProps) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-ink-700">{label}</Text>
      <TextInput
        className="bg-white border border-ink-300 rounded-2xl px-4 py-3 text-base text-ink-900"
        placeholderTextColor="#94A3B8"
        {...rest}
      />
    </View>
  );
}
