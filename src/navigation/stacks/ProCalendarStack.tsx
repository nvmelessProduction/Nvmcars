import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ProCalendarScreen } from "@/screens/professional/ProCalendarScreen";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import type { ProCalendarStackParamList } from "../types";

const Stack = createNativeStackNavigator<ProCalendarStackParamList>();

export function ProCalendarStack() {
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
        name="ProCalendar"
        component={ProCalendarScreen}
        options={{ title: t.tabs.calendar }}
      />
    </Stack.Navigator>
  );
}
