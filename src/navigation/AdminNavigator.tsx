import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AdminHomeScreen } from "@/screens/admin/AdminHomeScreen";
import { useColors } from "@/store/useThemeStore";
import type { AdminStackParamList } from "./types";

const Stack = createNativeStackNavigator<AdminStackParamList>();

export function AdminNavigator() {
  const colors = useColors();
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
        name="AdminHome"
        component={AdminHomeScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
