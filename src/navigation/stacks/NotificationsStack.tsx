import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NotificationsScreen } from "@/screens/customer/NotificationsScreen";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import type { NotificationsStackParamList } from "../types";

const Stack = createNativeStackNavigator<NotificationsStackParamList>();

export function NotificationsStack() {
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
        name="NotificationsList"
        component={NotificationsScreen}
        options={{ title: t.notifications.notifications }}
      />
    </Stack.Navigator>
  );
}
