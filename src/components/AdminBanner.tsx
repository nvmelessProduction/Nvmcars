import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Pillola flottante in basso a destra, sempre visibile, quando un admin
 * sta impersonando un cliente/pro. Tap per tornare al pannello admin.
 *
 * Posizionata in basso a destra (FAB-like) per non sovrapporsi al
 * navigation header. Sopra la tab bar (offset insets.bottom + tab height).
 */
export function AdminBanner() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const snapshot = useAuthStore((s) => s.switchSnapshot);
  const restoreAdmin = useAuthStore((s) => s.restoreAdmin);

  const impersonating = Boolean(snapshot && snapshot.role === "admin" && user?.role !== "admin");
  if (!impersonating) return null;

  // ~64px di tab bar + insets.bottom (home indicator) + 12 di gap
  const bottomOffset = insets.bottom + 64 + 12;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        bottom: bottomOffset,
        right: 12,
        zIndex: 9999,
      }}
    >
      <Pressable
        onPress={restoreAdmin}
        accessibilityRole="button"
        accessibilityLabel="Torna al pannello admin"
        style={({ pressed }) => ({
          backgroundColor: "#0F172A",
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderRadius: 999,
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          borderWidth: 1.5,
          borderColor: "#06B6D4",
          shadowColor: "#000",
          shadowOpacity: 0.4,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          elevation: 8,
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        })}
      >
        <Text style={{ fontSize: 16 }}>👑</Text>
        <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 12 }}>
          ADMIN
        </Text>
      </Pressable>
    </View>
  );
}
