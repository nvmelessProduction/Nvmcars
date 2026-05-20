import { useCallback, useMemo, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FlatList, RefreshControl, View } from "react-native";
import { useColors } from "@/store/useThemeStore";
import { ScreenContainer } from "@/components/ScreenContainer";
import { WorkshopCard } from "@/components/WorkshopCard";
import { EmptyState } from "@/components/EmptyState";
import { useFavoritesStore } from "@/store/useFavoritesStore";
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
  const { location } = useUserLocation();
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const favorites = useMemo(
    () =>
      WORKSHOPS.filter((w) => ids.includes(w.id)).map((w) => ({
        workshop: w,
        distance: location ? haversineKm(location.lat, location.lng, w.lat, w.lng) : undefined,
      })),
    [ids, location]
  );

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
