import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ProProfileScreen } from "@/screens/professional/ProProfileScreen";
import { ProEditWorkshopScreen } from "@/screens/professional/ProEditWorkshopScreen";
import { ProSettingsScreen } from "@/screens/professional/ProSettingsScreen";
import { PrivacyPolicyScreen } from "@/screens/legal/PrivacyPolicyScreen";
import { TermsOfServiceScreen } from "@/screens/legal/TermsOfServiceScreen";
import { DataExportScreen } from "@/screens/legal/DataExportScreen";
import { DeleteAccountScreen } from "@/screens/legal/DeleteAccountScreen";
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
