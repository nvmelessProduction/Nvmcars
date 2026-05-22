import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ProDashboardScreen } from "@/screens/professional/ProDashboardScreen";
import { ProStatsScreen } from "@/screens/professional/ProStatsScreen";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import type { ProDashboardStackParamList } from "../types";

const Stack = createNativeStackNavigator<ProDashboardStackParamList>();

export function ProDashboardStack() {
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
        name="ProDashboard"
        component={ProDashboardScreen}
        options={{ title: t.pro.dashboard }}
      />
      <Stack.Screen
        name="ProStats"
        component={ProStatsScreen}
        options={{ title: "Statistiche" }}
      />
    </Stack.Navigator>
  );
}
