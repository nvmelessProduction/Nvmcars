import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { useAuthStore } from "@/store/useAuthStore";
import { useIsDark } from "@/store/useThemeStore";
import { useMfaRequired } from "@/hooks/useMfaRequired";
import { AuthNavigator } from "./AuthNavigator";
import { CustomerNavigator } from "./CustomerNavigator";
import { ProNavigator } from "./ProNavigator";
import { AdminNavigator } from "./AdminNavigator";
import { MfaChallengeScreen } from "@/screens/auth/MfaChallengeScreen";

const MfaStack = createNativeStackNavigator();

function MfaNavigator() {
  return (
    <MfaStack.Navigator screenOptions={{ headerShown: false }}>
      <MfaStack.Screen name="MfaChallenge" component={MfaChallengeScreen} />
    </MfaStack.Navigator>
  );
}

export function RootNavigator() {
  const user = useAuthStore((s) => s.user);
  const isDark = useIsDark();
  const mfaRequired = useMfaRequired();

  return (
    <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
      {user === null ? (
        <AuthNavigator />
      ) : mfaRequired ? (
        <MfaNavigator />
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
