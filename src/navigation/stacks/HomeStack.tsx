import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "@/screens/customer/HomeScreen";
import { WorkshopListScreen } from "@/screens/customer/WorkshopListScreen";
import { WorkshopDetailScreen } from "@/screens/customer/WorkshopDetailScreen";
import { BookingFormScreen } from "@/screens/customer/BookingFormScreen";
import { AddReviewScreen } from "@/screens/customer/AddReviewScreen";
import { ChatScreen } from "@/screens/customer/ChatScreen";
import { QuoteDetailScreen } from "@/screens/customer/QuoteDetailScreen";
import { PaymentScreen } from "@/screens/customer/PaymentScreen";
import { PaymentSuccessScreen } from "@/screens/customer/PaymentSuccessScreen";
import { MyCarScreen } from "@/screens/customer/MyCarScreen";
import { AddCarScreen } from "@/screens/customer/AddCarScreen";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import type { HomeStackParamList } from "../types";

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStack() {
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
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="WorkshopList"
        component={WorkshopListScreen}
        options={{ title: t.workshop.workshopsNear }}
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
      <Stack.Screen
        name="AddReview"
        component={AddReviewScreen}
        options={{ title: t.reviews.leaveReview }}
      />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: "" }} />
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
      <Stack.Screen name="MyCar" component={MyCarScreen} options={{ title: t.car.yourCar }} />
      <Stack.Screen name="AddCar" component={AddCarScreen} options={{ title: t.home.addCar }} />
    </Stack.Navigator>
  );
}
