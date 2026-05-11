import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ProRequestsScreen } from "@/screens/professional/ProRequestsScreen";
import { ProChatScreen } from "@/screens/professional/ProChatScreen";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import type { ProRequestsStackParamList } from "../types";

const Stack = createNativeStackNavigator<ProRequestsStackParamList>();

export function ProRequestsStack() {
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
        name="ProRequests"
        component={ProRequestsScreen}
        options={{ title: t.tabs.requests }}
      />
      <Stack.Screen
        name="ProChat"
        component={ProChatScreen}
        options={{ title: "" }}
      />
    </Stack.Navigator>
  );
}
