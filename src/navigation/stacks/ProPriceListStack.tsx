import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ProPriceListScreen } from "@/screens/professional/ProPriceListScreen";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import type { ProPriceListStackParamList } from "../types";

const Stack = createNativeStackNavigator<ProPriceListStackParamList>();

export function ProPriceListStack() {
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
        name="ProPriceList"
        component={ProPriceListScreen}
        options={{ title: t.tabs.priceList }}
      />
    </Stack.Navigator>
  );
}
