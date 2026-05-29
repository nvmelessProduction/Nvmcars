import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MyBookingsScreen } from "@/screens/customer/MyBookingsScreen";
import { MyBookingDetailScreen } from "@/screens/customer/MyBookingDetailScreen";
import { AddReviewScreen } from "@/screens/customer/AddReviewScreen";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import type { BookingsStackParamList } from "../types";

const Stack = createNativeStackNavigator<BookingsStackParamList>();

export function BookingsStack() {
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
        name="BookingsList"
        component={MyBookingsScreen}
        options={{ title: t.bookings.myBookings }}
      />
      <Stack.Screen
        name="BookingDetail"
        component={MyBookingDetailScreen}
        options={{ title: t.bookings.bookingDetail }}
      />
      <Stack.Screen
        name="AddReview"
        component={AddReviewScreen}
        options={{ title: t.reviews.leaveReview }}
      />
    </Stack.Navigator>
  );
}
