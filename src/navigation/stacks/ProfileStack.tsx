import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { CustomerProfileScreen } from "@/screens/customer/CustomerProfileScreen";
import { SettingsScreen } from "@/screens/customer/SettingsScreen";
import { MyCarScreen } from "@/screens/customer/MyCarScreen";
import { AddCarScreen } from "@/screens/customer/AddCarScreen";
import { PrivacyPolicyScreen } from "@/screens/legal/PrivacyPolicyScreen";
import { TermsOfServiceScreen } from "@/screens/legal/TermsOfServiceScreen";
import { DataExportScreen } from "@/screens/legal/DataExportScreen";
import { DeleteAccountScreen } from "@/screens/legal/DeleteAccountScreen";
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
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{ title: t.settings.privacyPolicy }}
      />
      <Stack.Screen
        name="TermsOfService"
        component={TermsOfServiceScreen}
        options={{ title: t.settings.termsOfService }}
      />
      <Stack.Screen
        name="DataExport"
        component={DataExportScreen}
        options={{ title: t.settings.exportData }}
      />
      <Stack.Screen
        name="DeleteAccount"
        component={DeleteAccountScreen}
        options={{ title: t.settings.deleteAccount }}
      />
    </Stack.Navigator>
  );
}
