import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from "react-native";
import { z } from "zod";
import { ScreenContainer } from "@/components/ScreenContainer";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuthStore } from "@/store/useAuthStore";

const schema = z.object({
  name: z.string().min(2, "Nome officina troppo corto."),
  email: z.string().email("Email non valida."),
  phone: z.string().min(8, "Telefono non valido."),
  vatNumber: z.string().min(11, "Partita IVA non valida (11 cifre).").max(11),
  password: z.string().min(6, "La password deve avere almeno 6 caratteri."),
  inviteCode: z.string().min(4, "Codice invito mancante."),
});

export function RegisterProfessionalScreen() {
  const registerProfessional = useAuthStore((s) => s.registerProfessional);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  const handleSubmit = () => {
    const parsed = schema.safeParse({ name, email, phone, vatNumber, password, inviteCode });
    if (!parsed.success) {
      Alert.alert("Dati non validi", parsed.error.issues[0].message);
      return;
    }
    const result = registerProfessional({ name, email, phone, vatNumber, inviteCode });
    if (!result.ok) {
      Alert.alert("Codice invito non valido", result.reason);
    }
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
              Registrati come Professionista
            </Text>
            <Text className="text-base text-ink-500 mb-2">
              Per registrare la tua officina ti serve un codice invito Nvmcars.
            </Text>

            <View className="bg-accent-500/10 border border-accent-400 rounded-2xl p-4 mb-2">
              <Text className="text-sm text-ink-900">
                💡 Per il test MVP usa uno di questi codici:
              </Text>
              <Text className="text-xs text-ink-700 mt-1 font-mono">
                NVM-CRV-A4F9 · NVM-LAD-D33M
              </Text>
            </View>

            <Field
              label="Codice invito"
              value={inviteCode}
              onChangeText={setInviteCode}
              placeholder="NVM-XXX-XXXX"
              autoCapitalize="characters"
            />
            <Field label="Nome officina" value={name} onChangeText={setName} placeholder="Autofficina Rossi" />
            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="info@autofficina.it"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Field
              label="Telefono"
              value={phone}
              onChangeText={setPhone}
              placeholder="+39 06 1234567"
              keyboardType="phone-pad"
            />
            <Field
              label="Partita IVA"
              value={vatNumber}
              onChangeText={setVatNumber}
              placeholder="11 cifre"
              keyboardType="numeric"
            />
            <Field
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Min. 6 caratteri"
              secureTextEntry
            />

            <View className="mt-6">
              <PrimaryButton label="Verifica codice e registrati" onPress={handleSubmit} />
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
