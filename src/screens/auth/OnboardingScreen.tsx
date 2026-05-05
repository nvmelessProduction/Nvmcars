import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Text, View } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuthStore } from "@/store/useAuthStore";
import type { AuthStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<AuthStackParamList, "Onboarding">;

export function OnboardingScreen() {
  const navigation = useNavigation<Nav>();
  const finishOnboarding = useAuthStore((s) => s.finishOnboarding);

  const handleStart = () => {
    finishOnboarding();
    navigation.replace("RoleSelection");
  };

  return (
    <ScreenContainer dark>
      <View className="flex-1 px-6 justify-between py-12">
        <View />
        <View className="items-center gap-6">
          <Text className="text-7xl">🚗</Text>
          <Text className="text-4xl font-bold text-white text-center">
            Nvmcars
          </Text>
          <Text className="text-lg text-ink-300 text-center leading-7">
            La tua auto si guasta?{"\n"}
            Risolviamo il problema in modo invisibile e senza stress.
          </Text>
          <View className="gap-2 mt-4">
            <Row icon="🔍" text="Confronta i prezzi delle officine vicine" />
            <Row icon="📍" text="Trovi i partner di Cerveteri e Ladispoli" />
            <Row icon="💬" text="Prenoti via WhatsApp in un tap" />
          </View>
        </View>
        <PrimaryButton label="Iniziamo" onPress={handleStart} />
      </View>
    </ScreenContainer>
  );
}

function Row({ icon, text }: { icon: string; text: string }) {
  return (
    <View className="flex-row items-center gap-3">
      <Text className="text-xl">{icon}</Text>
      <Text className="text-base text-ink-100 flex-1">{text}</Text>
    </View>
  );
}
