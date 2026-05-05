import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Pressable, Text, View } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { PrimaryButton } from "@/components/PrimaryButton";
import type { AuthStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<AuthStackParamList, "RoleSelection">;

export function RoleSelectionScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <ScreenContainer>
      <View className="flex-1 px-6 py-8">
        <Text className="text-3xl font-bold text-ink-900 mt-4">Benvenuto</Text>
        <Text className="text-base text-ink-500 mt-2 mb-8">
          Come vuoi usare Nvmcars?
        </Text>

        <View className="gap-4">
          <RoleCard
            emoji="🚗"
            title="Sono un Cliente"
            description="Cerco un'officina e prenoto un servizio per la mia auto."
            onPress={() => navigation.navigate("RegisterCustomer")}
          />
          <RoleCard
            emoji="🔧"
            title="Sono un Professionista"
            description="Gestisco un'officina e voglio ricevere richieste."
            badge="Solo su invito"
            onPress={() => navigation.navigate("RegisterProfessional")}
          />
        </View>

        <View className="flex-1 justify-end gap-3">
          <Text className="text-center text-ink-500">Hai già un account?</Text>
          <PrimaryButton
            label="Accedi"
            variant="ghost"
            onPress={() => navigation.navigate("Login")}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

function RoleCard({
  emoji,
  title,
  description,
  onPress,
  badge,
}: {
  emoji: string;
  title: string;
  description: string;
  onPress: () => void;
  badge?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-3xl p-5 border border-ink-100 active:opacity-80"
    >
      <View className="flex-row items-center gap-4">
        <View className="w-14 h-14 rounded-2xl bg-ink-100 items-center justify-center">
          <Text className="text-3xl">{emoji}</Text>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-lg font-bold text-ink-900">{title}</Text>
            {badge ? (
              <View className="bg-accent-500 px-2 py-0.5 rounded-full">
                <Text className="text-xs text-white font-semibold">{badge}</Text>
              </View>
            ) : null}
          </View>
          <Text className="text-sm text-ink-500 mt-1">{description}</Text>
        </View>
      </View>
    </Pressable>
  );
}
