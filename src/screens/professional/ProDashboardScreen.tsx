import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Pressable, ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useAuthStore } from "@/store/useAuthStore";
import type { ProStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<ProStackParamList, "ProDashboard">;

export function ProDashboardScreen() {
  const navigation = useNavigation<Nav>();
  const user = useAuthStore((s) => s.user);
  if (!user || user.role !== "professional") return null;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-6 pt-6 gap-4">
          <View>
            <Text className="text-sm text-ink-500">Benvenuto in Nvmcars</Text>
            <Text className="text-2xl font-bold text-ink-900">{user.name}</Text>
          </View>

          <View className="flex-row gap-3">
            <StatCard label="Nuove richieste" value="3" emoji="📨" />
            <StatCard label="Confermate" value="7" emoji="✅" />
          </View>
          <View className="flex-row gap-3">
            <StatCard label="Rating medio" value="4.7" emoji="⭐" />
            <StatCard label="Visite profilo" value="142" emoji="👀" />
          </View>

          <ActionRow
            emoji="📨"
            title="Richieste ricevute"
            subtitle="Gestisci le richieste dei clienti"
            badge="3"
            onPress={() => navigation.navigate("ProRequests")}
          />
          <ActionRow
            emoji="👤"
            title="Il tuo profilo"
            subtitle="Dati account e logout"
            onPress={() => navigation.navigate("ProProfile")}
          />

          <View className="bg-accent-soft border border-accent-400 rounded-2xl p-4 mt-2">
            <Text className="text-sm font-semibold text-ink-900 mb-1">
              💡 Versione MVP
            </Text>
            <Text className="text-sm text-ink-700 leading-5">
              Listino prezzi, gestione foto e statistiche reali arriveranno con
              l'integrazione Firebase. Per ora l'obiettivo è validare il flusso con
              le officine partner di Cerveteri e Ladispoli.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function StatCard({
  label,
  value,
  emoji,
}: {
  label: string;
  value: string;
  emoji: string;
}) {
  return (
    <View className="flex-1 bg-white rounded-2xl p-4 border border-ink-100">
      <Text className="text-2xl">{emoji}</Text>
      <Text className="text-2xl font-bold text-ink-900 mt-1">{value}</Text>
      <Text className="text-xs text-ink-500 mt-0.5">{label}</Text>
    </View>
  );
}

function ActionRow({
  emoji,
  title,
  subtitle,
  badge,
  onPress,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  badge?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-2xl p-4 border border-ink-100 flex-row items-center gap-4 active:opacity-80"
    >
      <View className="w-12 h-12 rounded-2xl bg-ink-100 items-center justify-center">
        <Text className="text-2xl">{emoji}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-base font-bold text-ink-900">{title}</Text>
        <Text className="text-sm text-ink-500 mt-0.5">{subtitle}</Text>
      </View>
      {badge ? (
        <View className="bg-accent-500 w-7 h-7 rounded-full items-center justify-center">
          <Text className="text-xs text-white font-bold">{badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}
