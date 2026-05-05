import { FlatList, Text, View } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { getServiceLabel } from "@/data/services";
import type { ServiceRequest } from "@/types";

const MOCK_REQUESTS: ServiceRequest[] = [
  {
    id: "r1",
    customerId: "c1",
    workshopId: "w1",
    service: "tagliando",
    status: "pending",
    createdAt: Date.now() - 1000 * 60 * 30,
  },
  {
    id: "r2",
    customerId: "c2",
    workshopId: "w1",
    service: "cambioGomme",
    status: "pending",
    createdAt: Date.now() - 1000 * 60 * 60 * 4,
  },
  {
    id: "r3",
    customerId: "c3",
    workshopId: "w1",
    service: "freni",
    status: "confirmed",
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
  },
];

const STATUS_LABEL: Record<ServiceRequest["status"], string> = {
  pending: "In attesa",
  confirmed: "Confermata",
  completed: "Completata",
  cancelled: "Annullata",
};

const STATUS_COLOR: Record<ServiceRequest["status"], string> = {
  pending: "bg-warning",
  confirmed: "bg-success",
  completed: "bg-ink-500",
  cancelled: "bg-danger",
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} min fa`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h fa`;
  return `${Math.floor(hours / 24)}g fa`;
}

export function ProRequestsScreen() {
  return (
    <ScreenContainer>
      <FlatList
        data={MOCK_REQUESTS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <View className="bg-white rounded-2xl p-4 border border-ink-100 gap-2">
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <Text className="text-base font-bold text-ink-900">
                  {getServiceLabel(item.service)}
                </Text>
                <Text className="text-xs text-ink-500 mt-0.5">
                  Cliente #{item.customerId} · {timeAgo(item.createdAt)}
                </Text>
              </View>
              <View
                className={`px-3 py-1 rounded-full ${STATUS_COLOR[item.status]}`}
              >
                <Text className="text-xs font-semibold text-white">
                  {STATUS_LABEL[item.status]}
                </Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Text className="text-ink-500">Nessuna richiesta ricevuta.</Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}
