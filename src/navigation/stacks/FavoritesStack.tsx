import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { FavoritesScreen } from "@/screens/customer/FavoritesScreen";
import { WorkshopDetailScreen } from "@/screens/customer/WorkshopDetailScreen";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import type { FavoritesStackParamList } from "../types";

const Stack = createNativeStackNavigator<FavoritesStackParamList>();

export function FavoritesStack() {
  const colors = useColors();
  const t = useT();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bgHeader },
        headerTitleStyle: { color: "#FFFFFF", fontWeight: "700" },
        headerTintColor: "#FFFFFF",
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen
        name="FavoritesList"
        component={FavoritesScreen}
        options={{ title: t.favorites.yourFavorites }}
      />
      <Stack.Screen
        name="WorkshopDetail"
        component={WorkshopDetailScreen}
        options={{ title: "" }}
      />
    </Stack.Navigator>
  );
}
