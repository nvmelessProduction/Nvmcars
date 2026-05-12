import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ProChatsListScreen } from "@/screens/professional/ProChatsListScreen";
import { ProChatScreen } from "@/screens/professional/ProChatScreen";
import { CreateQuoteScreen } from "@/screens/professional/CreateQuoteScreen";
import { QuoteDetailScreen } from "@/screens/customer/QuoteDetailScreen";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import type { ProChatStackParamList } from "../types";

const Stack = createNativeStackNavigator<ProChatStackParamList>();

export function ProChatStack() {
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
    </Stack.Navigator>
  );
}
