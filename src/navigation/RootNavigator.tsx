import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { useAuthStore } from "@/store/useAuthStore";
import { useIsDark } from "@/store/useThemeStore";
import { AuthNavigator } from "./AuthNavigator";
import { CustomerNavigator } from "./CustomerNavigator";
import { ProNavigator } from "./ProNavigator";
import { AdminNavigator } from "./AdminNavigator";

export function RootNavigator() {
  const user = useAuthStore((s) => s.user);
  const isDark = useIsDark();

  return (
    <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
      {user === null ? (
        <AuthNavigator />
      ) : user.role === "admin" ? (
        <AdminNavigator />
      ) : user.role === "customer" ? (
        <CustomerNavigator />
      ) : (
        <ProNavigator />
      )}
    </NavigationContainer>
  );
}
