import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Banner sempre visibile in cima allo schermo quando un admin
 * sta impersonando un cliente/pro. Tap per tornare al pannello admin.
 *
 * Si monta a livello top sopra il NavigationContainer in App.tsx.
 */
export function AdminBanner() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const snapshot = useAuthStore((s) => s.switchSnapshot);
  const restoreAdmin = useAuthStore((s) => s.restoreAdmin);

  const impersonating = Boolean(snapshot && snapshot.role === "admin" && user?.role !== "admin");
  if (!impersonating) return null;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        top: insets.top,
        left: 0,
        right: 0,
        zIndex: 9999,
        alignItems: "center",
        paddingHorizontal: 8,
      }}
    >
      <Pressable
        onPress={restoreAdmin}
        accessibilityRole="button"
        accessibilityLabel="Torna al pannello admin"
        style={{
          backgroundColor: "#0F172A",
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 999,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          borderWidth: 1,
          borderColor: "#06B6D4",
          shadowColor: "#000",
          shadowOpacity: 0.3,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        }}
      >
        <Text style={{ fontSize: 14 }}>👑</Text>
        <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 12 }}>
          ADMIN MODE — torna al pannello
        </Text>
      </Pressable>
    </View>
  );
}
