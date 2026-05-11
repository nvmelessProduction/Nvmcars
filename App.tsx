import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RootNavigator } from "@/navigation/RootNavigator";
import { useIsDark } from "@/store/useThemeStore";

export default function App() {
  return (
    <SafeAreaProvider>
      <RootNavigator />
      <ThemedStatusBar />
    </SafeAreaProvider>
  );
}

function ThemedStatusBar() {
  const isDark = useIsDark();
  return <StatusBar style={isDark ? "light" : "light"} />;
}
