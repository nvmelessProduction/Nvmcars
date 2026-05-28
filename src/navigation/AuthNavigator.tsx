import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { OnboardingScreen } from "@/screens/auth/OnboardingScreen";
import { RoleSelectionScreen } from "@/screens/auth/RoleSelectionScreen";
import { LoginScreen } from "@/screens/auth/LoginScreen";
import { RegisterCustomerScreen } from "@/screens/auth/RegisterCustomerScreen";
import { RegisterProfessionalScreen } from "@/screens/auth/RegisterProfessionalScreen";
import { useAuthStore } from "@/store/useAuthStore";
import { useColors } from "@/store/useThemeStore";
import type { AuthStackParamList } from "./types";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  const colors = useColors();
  const hasOnboarded = useAuthStore((s) => s.hasOnboarded);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
      initialRouteName={hasOnboarded ? "RoleSelection" : "Onboarding"}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="RegisterCustomer" component={RegisterCustomerScreen} />
      <Stack.Screen
        name="RegisterProfessional"
        component={RegisterProfessionalScreen}
      />
    </Stack.Navigator>
  );
}
