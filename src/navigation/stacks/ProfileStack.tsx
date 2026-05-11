import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { CustomerProfileScreen } from "@/screens/customer/CustomerProfileScreen";
import { SettingsScreen } from "@/screens/customer/SettingsScreen";
import { MyCarScreen } from "@/screens/customer/MyCarScreen";
import { AddCarScreen } from "@/screens/customer/AddCarScreen";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import type { ProfileStackParamList } from "../types";

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStack() {
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
        name="Profile"
        component={CustomerProfileScreen}
        options={{ title: t.profile.yourProfile }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: t.settings.settings }}
      />
      <Stack.Screen name="MyCar" component={MyCarScreen} options={{ title: t.car.yourCar }} />
      <Stack.Screen name="AddCar" component={AddCarScreen} options={{ title: t.home.addCar }} />
    </Stack.Navigator>
  );
}
