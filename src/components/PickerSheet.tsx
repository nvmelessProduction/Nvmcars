import { useMemo, useState } from "react";
import { FlatList, Modal, Pressable, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/store/useThemeStore";

type Props = {
  visible: boolean;
  title: string;
  searchPlaceholder?: string;
  options: string[];
  selected?: string | null;
  onSelect: (value: string) => void;
  onClose: () => void;
};

export function PickerSheet({
  visible,
  title,
  searchPlaceholder = "Cerca...",
  options,
  selected,
  onSelect,
  onClose,
}: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, query]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: colors.scrim }}
      />
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.bg,
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          maxHeight: "82%",
          paddingTop: 8,
        }}
      >
        <View style={{ alignItems: "center", paddingTop: 6 }}>
          <View
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: colors.border,
            }}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 18,
            paddingTop: 14,
            paddingBottom: 10,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text }}>
            {title}
          </Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={{ color: colors.accent, fontWeight: "700", fontSize: 15 }}>
              Chiudi
            </Text>
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={searchPlaceholder}
            placeholderTextColor={colors.textMuted}
            autoFocus
            style={{
              backgroundColor: colors.bgElevated,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 12,
              color: colors.text,
              fontSize: 15,
            }}
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 + insets.bottom }}
          renderItem={({ item }) => {
            const active = item === selected;
            return (
              <Pressable
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
                style={{
                  paddingVertical: 14,
                  paddingHorizontal: 14,
                  borderRadius: 12,
                  marginBottom: 6,
                  backgroundColor: active ? colors.accentSoft : "transparent",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: active ? "700" : "500",
                    color: colors.text,
                  }}
                >
                  {item}
                </Text>
                {active ? (
                  <Text style={{ color: colors.accent, fontSize: 18 }}>✓</Text>
                ) : null}
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <Text
              style={{
                color: colors.textMuted,
                textAlign: "center",
                paddingVertical: 40,
              }}
            >
              Nessun risultato per "{query}"
            </Text>
          }
        />
      </View>
    </Modal>
  );
}
