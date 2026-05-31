import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { FavoritesScreen } from "@/screens/customer/FavoritesScreen";
import { WorkshopDetailScreen } from "@/screens/customer/WorkshopDetailScreen";
import { BookingFormScreen } from "@/screens/customer/BookingFormScreen";
import { ChatScreen } from "@/screens/customer/ChatScreen";
import { AddReviewScreen } from "@/screens/customer/AddReviewScreen";
import { QuoteDetailScreen } from "@/screens/customer/QuoteDetailScreen";
import { PaymentScreen } from "@/screens/customer/PaymentScreen";
import { PaymentSuccessScreen } from "@/screens/customer/PaymentSuccessScreen";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import type { FavoritesStackParamList } from "../types";

const Stack = createNativeStackNavigator<FavoritesStackParamList>();

export function FavoritesStack() {
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
        name="FavoritesList"
        component={FavoritesScreen}
        options={{ title: t.favorites.yourFavorites }}
      />
      <Stack.Screen
        name="WorkshopDetail"
        component={WorkshopDetailScreen}
        options={{ title: "" }}
      />
      <Stack.Screen
        name="BookingForm"
        component={BookingFormScreen}
        options={{ title: "Prenota servizio" }}
      />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: "" }} />
      <Stack.Screen
        name="AddReview"
        component={AddReviewScreen}
        options={{ title: t.reviews.leaveReview }}
      />
      <Stack.Screen
        name="QuoteDetail"
        component={QuoteDetailScreen}
        options={{ title: t.quote.quote }}
      />
      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{ title: t.payment.title }}
      />
      <Stack.Screen
        name="PaymentSuccess"
        component={PaymentSuccessScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
