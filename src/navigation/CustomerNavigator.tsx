import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "@/screens/customer/HomeScreen";
import { WorkshopListScreen } from "@/screens/customer/WorkshopListScreen";
import { WorkshopDetailScreen } from "@/screens/customer/WorkshopDetailScreen";
import { CustomerProfileScreen } from "@/screens/customer/CustomerProfileScreen";
import { colors } from "@/theme/colors";
import type { CustomerStackParamList } from "./types";

const Stack = createNativeStackNavigator<CustomerStackParamList>();

export function CustomerNavigator() {
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
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WorkshopList"
        component={WorkshopListScreen}
        options={{ title: "Officine vicine" }}
      />
      <Stack.Screen
        name="WorkshopDetail"
        component={WorkshopDetailScreen}
        options={{ title: "Dettaglio officina" }}
      />
      <Stack.Screen
        name="CustomerProfile"
        component={CustomerProfileScreen}
        options={{ title: "Il tuo profilo" }}
      />
    </Stack.Navigator>
  );
}
