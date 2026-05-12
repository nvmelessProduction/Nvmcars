import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, View } from "react-native";
import { HomeStack } from "./stacks/HomeStack";
import { BookingsStack } from "./stacks/BookingsStack";
import { FavoritesStack } from "./stacks/FavoritesStack";
import { NotificationsStack } from "./stacks/NotificationsStack";
import { ProfileStack } from "./stacks/ProfileStack";
import { useColors } from "@/store/useThemeStore";
import { useNotificationsStore } from "@/store/useNotificationsStore";
import { useBookingsStore } from "@/store/useBookingsStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useT } from "@/i18n";
import type { CustomerTabParamList } from "./types";

const Tab = createBottomTabNavigator<CustomerTabParamList>();

function TabIcon({ emoji, focused, badge }: { emoji: string; focused: boolean; badge?: number }) {
  return (
    <View style={{ width: 40, alignItems: "center", justifyContent: "center", paddingTop: 4 }}>
      <Text style={{ fontSize: focused ? 26 : 22 }}>{emoji}</Text>
      {badge && badge > 0 ? (
        <View
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            backgroundColor: "#EF4444",
            borderRadius: 9,
            minWidth: 18,
            height: 18,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 4,
          }}
        >
          <Text style={{ color: "#FFF", fontSize: 11, fontWeight: "700" }}>
            {badge > 9 ? "9+" : badge}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export function CustomerNavigator() {
  const colors = useColors();
  const t = useT();
  const user = useAuthStore((s) => s.user);
  const allNotifications = useNotificationsStore((s) => s.notifications);
  const allBookings = useBookingsStore((s) => s.bookings);
  const unread = user
    ? allNotifications.filter((n) => n.userId === user.id && !n.read).length
    : 0;
  const slotsToConfirm = user
    ? allBookings.filter((b) => b.customerId === user.id && b.status === "slot_proposed").length
    : 0;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bgElevated,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          title: t.tabs.home,
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="BookingsTab"
        component={BookingsStack}
        options={{
          title: t.tabs.bookings,
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📅" focused={focused} badge={slotsToConfirm} />
          ),
        }}
      />
      <Tab.Screen
        name="FavoritesTab"
        component={FavoritesStack}
        options={{
          title: t.tabs.favorites,
          tabBarIcon: ({ focused }) => <TabIcon emoji="❤️" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsStack}
        options={{
          title: t.tabs.notifications,
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🔔" focused={focused} badge={unread} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          title: t.tabs.profile,
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}
