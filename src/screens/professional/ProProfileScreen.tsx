import { Text, View } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuthStore } from "@/store/useAuthStore";

export function ProProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  if (!user || user.role !== "professional") return null;

  return (
    <ScreenContainer>
      <View className="flex-1 px-6 py-6 gap-4">
        <View className="bg-white rounded-3xl p-6 border border-ink-100 items-center gap-3">
          <View className="w-20 h-20 rounded-full bg-accent-500/10 items-center justify-center">
            <Text className="text-4xl">🔧</Text>
          </View>
          <Text className="text-xl font-bold text-ink-900">{user.name}</Text>
          <Text className="text-sm text-ink-500">{user.email}</Text>
          <View className="bg-accent-500 px-3 py-1 rounded-full">
            <Text className="text-xs font-semibold text-white">PROFESSIONISTA</Text>
          </View>
        </View>

        <InfoRow label="Telefono" value={user.phone} />
        <InfoRow label="Partita IVA" value={user.vatNumber} />
        <InfoRow label="Codice invito usato" value={user.inviteCode} />

        <View className="flex-1 justify-end">
          <PrimaryButton label="Esci" variant="ghost" onPress={logout} />
        </View>
      </View>
    </ScreenContainer>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="bg-white rounded-2xl p-4 border border-ink-100">
      <Text className="text-xs text-ink-500 uppercase tracking-wide">{label}</Text>
      <Text className="text-base text-ink-900 mt-1">{value}</Text>
    </View>
  );
}
