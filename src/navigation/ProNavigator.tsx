import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, View } from "react-native";
import { ProDashboardStack } from "./stacks/ProDashboardStack";
import { ProRequestsStack } from "./stacks/ProRequestsStack";
import { ProPriceListStack } from "./stacks/ProPriceListStack";
import { ProCalendarStack } from "./stacks/ProCalendarStack";
import { ProProfileStack } from "./stacks/ProProfileStack";
import { useColors } from "@/store/useThemeStore";
import { useBookingsStore } from "@/store/useBookingsStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useT } from "@/i18n";
import type { ProTabParamList } from "./types";

const Tab = createBottomTabNavigator<ProTabParamList>();

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

export function ProNavigator() {
  const colors = useColors();
  const t = useT();
  const user = useAuthStore((s) => s.user);
  const allBookings = useBookingsStore((s) => s.bookings);
  const pendingCount =
    user && user.role === "professional"
      ? allBookings.filter((b) => b.workshopId === user.workshopId && b.status === "pending").length
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
        name="ProDashboardTab"
        component={ProDashboardStack}
        options={{
          title: t.tabs.dashboard,
          tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ProRequestsTab"
        component={ProRequestsStack}
        options={{
          title: t.tabs.requests,
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📨" focused={focused} badge={pendingCount} />
          ),
        }}
      />
      <Tab.Screen
        name="ProPriceListTab"
        component={ProPriceListStack}
        options={{
          title: t.tabs.priceList,
          tabBarIcon: ({ focused }) => <TabIcon emoji="💶" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ProCalendarTab"
        component={ProCalendarStack}
        options={{
          title: t.tabs.calendar,
          tabBarIcon: ({ focused }) => <TabIcon emoji="🗓️" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ProProfileTab"
        component={ProProfileStack}
        options={{
          title: t.tabs.profile,
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}
