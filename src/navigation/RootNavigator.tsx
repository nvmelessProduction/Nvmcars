import { NavigationContainer } from "@react-navigation/native";
import { useAuthStore } from "@/store/useAuthStore";
import { AuthNavigator } from "./AuthNavigator";
import { CustomerNavigator } from "./CustomerNavigator";
import { ProNavigator } from "./ProNavigator";

export function RootNavigator() {
  const user = useAuthStore((s) => s.user);

  return (
    <NavigationContainer>
      {user === null ? (
        <AuthNavigator />
      ) : user.role === "customer" ? (
        <CustomerNavigator />
      ) : (
        <ProNavigator />
      )}
    </NavigationContainer>
  );
}
