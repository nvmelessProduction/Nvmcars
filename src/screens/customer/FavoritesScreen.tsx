import { useCallback, useMemo, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FlatList, RefreshControl, View } from "react-native";
import { useColors } from "@/store/useThemeStore";
import { ScreenContainer } from "@/components/ScreenContainer";
import { WorkshopCard } from "@/components/WorkshopCard";
import { EmptyState } from "@/components/EmptyState";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useWorkshopStore } from "@/store/useWorkshopStore";
import { useT } from "@/i18n";
import { WORKSHOPS } from "@/data/workshops";
import { useUserLocation } from "@/hooks/useUserLocation";
import { haversineKm } from "@/utils/distance";
import type { FavoritesStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<FavoritesStackParamList, "FavoritesList">;

export function FavoritesScreen() {
  const navigation = useNavigation<Nav>();
  const t = useT();
  const colors = useColors();
  const ids = useFavoritesStore((s) => s.ids);
  const hydrateFavorites = useFavoritesStore((s) => s.hydrate);
  const userId = useAuthStore((s) => s.user?.id);
  const remoteWorkshops = useWorkshopStore((s) => s.remoteWorkshops);
  const { location } = useUserLocation();
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    if (!userId) return;
    setRefreshing(true);
    try {
      await hydrateFavorites(userId);
    } finally {
      setRefreshing(false);
    }
  }, [userId, hydrateFavorites]);

  const favorites = useMemo(() => {
    const byId = new Map<string, (typeof WORKSHOPS)[number]>();
    for (const w of WORKSHOPS) byId.set(w.id, w);
    for (const w of remoteWorkshops) byId.set(w.id, w);
    return ids
      .map((id) => byId.get(id))
      .filter((w): w is (typeof WORKSHOPS)[number] => Boolean(w))
      .map((w) => ({
        workshop: w,
        distance: location ? haversineKm(location.lat, location.lng, w.lat, w.lng) : undefined,
      }));
  }, [ids, location, remoteWorkshops]);

  if (favorites.length === 0) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <EmptyState
            emoji="❤️"
            title={t.favorites.noFavorites}
            body={t.favorites.noFavoritesHint}
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.workshop.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
        renderItem={({ item, index }) => (
          <WorkshopCard
            workshop={item.workshop}
            distanceKm={item.distance}
            index={index}
            onPress={() =>
              navigation.navigate("WorkshopDetail", { workshopId: item.workshop.id })
            }
          />
        )}
      />
    </ScreenContainer>
  );
}
