import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from "react-native";
import { z } from "zod";
import { ScreenContainer } from "@/components/ScreenContainer";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuthStore } from "@/store/useAuthStore";

const schema = z.object({
  name: z.string().min(2, "Nome troppo corto."),
  email: z.string().email("Email non valida."),
  phone: z.string().min(8, "Telefono non valido."),
  password: z.string().min(6, "La password deve avere almeno 6 caratteri."),
});

export function RegisterCustomerScreen() {
  const registerCustomer = useAuthStore((s) => s.registerCustomer);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    const parsed = schema.safeParse({ name, email, phone, password });
    if (!parsed.success) {
      Alert.alert("Dati non validi", parsed.error.issues[0].message);
      return;
    }
    registerCustomer({ name, email, phone });
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 px-6 py-8 gap-4">
            <Text className="text-3xl font-bold text-ink-900 mt-4">
              Registrati come Cliente
            </Text>
            <Text className="text-base text-ink-500 mb-2">
              Crea il tuo account per cercare officine e prenotare servizi.
            </Text>

            <Field label="Nome e cognome" value={name} onChangeText={setName} placeholder="Mario Rossi" />
            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="mario@esempio.it"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Field
              label="Telefono"
              value={phone}
              onChangeText={setPhone}
              placeholder="+39 333 1234567"
              keyboardType="phone-pad"
            />
            <Field
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Min. 6 caratteri"
              secureTextEntry
            />

            <View className="mt-6">
              <PrimaryButton label="Crea account" onPress={handleSubmit} />
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
