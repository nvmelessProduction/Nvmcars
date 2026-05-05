import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ProDashboardScreen } from "@/screens/professional/ProDashboardScreen";
import { ProRequestsScreen } from "@/screens/professional/ProRequestsScreen";
import { ProProfileScreen } from "@/screens/professional/ProProfileScreen";
import { colors } from "@/theme/colors";
import type { ProStackParamList } from "./types";

const Stack = createNativeStackNavigator<ProStackParamList>();

export function ProNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.ink900 },
        headerTitleStyle: { color: colors.white, fontWeight: "700" },
        headerTintColor: colors.white,
        contentStyle: { backgroundColor: colors.ink100 },
      }}
    >
      <Stack.Screen
        name="ProDashboard"
        component={ProDashboardScreen}
        options={{ title: "Dashboard" }}
      />
      <Stack.Screen
        name="ProRequests"
        component={ProRequestsScreen}
        options={{ title: "Richieste ricevute" }}
      />
      <Stack.Screen
        name="ProProfile"
        component={ProProfileScreen}
        options={{ title: "Profilo" }}
      />
    </Stack.Navigator>
  );
}
