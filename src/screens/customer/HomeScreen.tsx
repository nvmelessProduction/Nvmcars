import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Pressable, ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { ServiceChip } from "@/components/ServiceChip";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SERVICES } from "@/data/services";
import { useAuthStore } from "@/store/useAuthStore";
import type { CustomerStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<CustomerStackParamList, "Home">;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const user = useAuthStore((s) => s.user);
  const firstName = user?.name?.split(" ")[0] ?? "Ciao";

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="bg-ink-900 px-6 pt-12 pb-10 rounded-b-[40px]">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-ink-300 text-sm">Ciao,</Text>
              <Text className="text-white text-2xl font-bold">{firstName} 👋</Text>
            </View>
            <Pressable
              onPress={() => navigation.navigate("CustomerProfile")}
              className="w-11 h-11 rounded-full bg-ink-800 items-center justify-center"
            >
              <Text className="text-xl">👤</Text>
            </Pressable>
          </View>

          <View className="mt-8">
            <Text className="text-white text-3xl font-bold leading-9">
              La tua auto ha{"\n"}bisogno di un check?
            </Text>
            <Text className="text-ink-300 mt-3">
              Risolviamo il problema in modo invisibile e senza stress.
            </Text>
          </View>
        </View>

        <View className="px-6 mt-8 gap-4">
          <Text className="text-lg font-bold text-ink-900">Cosa ti serve oggi?</Text>
          <View className="flex-row flex-wrap gap-3">
            {SERVICES.map((service) => (
              <ServiceChip
                key={service.key}
                service={service}
                onPress={() =>
                  navigation.navigate("WorkshopList", { service: service.key })
                }
              />
            ))}
          </View>

          <View className="mt-4">
            <PrimaryButton
              label="Officine vicino a me"
              icon="📍"
              variant="secondary"
              onPress={() => navigation.navigate("WorkshopList")}
            />
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
