import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ProProfileScreen } from "@/screens/professional/ProProfileScreen";
import { ProEditWorkshopScreen } from "@/screens/professional/ProEditWorkshopScreen";
import { ProOnboardingScreen } from "@/screens/professional/ProOnboardingScreen";
import { ProPriceListScreen } from "@/screens/professional/ProPriceListScreen";
import { ProNotificationsScreen } from "@/screens/professional/ProNotificationsScreen";
import { ProSettingsScreen } from "@/screens/professional/ProSettingsScreen";
import { ProChatsListScreen } from "@/screens/professional/ProChatsListScreen";
import { ProChatScreen } from "@/screens/professional/ProChatScreen";
import { CreateQuoteScreen } from "@/screens/professional/CreateQuoteScreen";
import { QuoteDetailScreen } from "@/screens/customer/QuoteDetailScreen";
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
        name="ProOnboarding"
        component={ProOnboardingScreen}
        options={{ title: t.pro.onboardingTitle, headerBackVisible: false }}
      />
      <Stack.Screen
        name="ProEditWorkshop"
        component={ProEditWorkshopScreen}
        options={{ title: t.pro.editWorkshop }}
      />
      <Stack.Screen
        name="ProPriceList"
        component={ProPriceListScreen}
        options={{ title: t.pro.editPriceList }}
      />
      <Stack.Screen
        name="ProNotifications"
        component={ProNotificationsScreen}
        options={{ title: t.notifications.notifications }}
      />
      <Stack.Screen
        name="ProSettings"
        component={ProSettingsScreen}
        options={{ title: t.settings.settings }}
      />
      <Stack.Screen
        name="ProChatsList"
        component={ProChatsListScreen}
        options={{ title: t.chat.chats }}
      />
      <Stack.Screen
        name="ProChat"
        component={ProChatScreen}
        options={{ title: "" }}
      />
      <Stack.Screen
        name="CreateQuote"
        component={CreateQuoteScreen}
        options={{ title: t.quote.createQuote }}
      />
      <Stack.Screen
        name="QuoteDetail"
        component={QuoteDetailScreen}
        options={{ title: t.quote.quote }}
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
