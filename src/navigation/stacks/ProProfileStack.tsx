import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ProProfileScreen } from "@/screens/professional/ProProfileScreen";
import { ProEditWorkshopScreen } from "@/screens/professional/ProEditWorkshopScreen";
import { ProSettingsScreen } from "@/screens/professional/ProSettingsScreen";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import type { ProProfileStackParamList } from "../types";

const Stack = createNativeStackNavigator<ProProfileStackParamList>();

export function ProProfileStack() {
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
        name="ProProfile"
        component={ProProfileScreen}
        options={{ title: t.profile.yourProfile }}
      />
      <Stack.Screen
        name="ProEditWorkshop"
        component={ProEditWorkshopScreen}
        options={{ title: t.pro.editWorkshop }}
      />
      <Stack.Screen
        name="ProSettings"
        component={ProSettingsScreen}
        options={{ title: t.settings.settings }}
      />
    </Stack.Navigator>
  );
}
