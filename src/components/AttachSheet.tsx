import { Modal, Pressable, Text, View } from "react-native";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";

type Action = "camera" | "gallery" | "video";

type Props = {
  visible: boolean;
  onClose: () => void;
  onPick: (a: Action) => void;
};

export function AttachSheet({ visible, onClose, onPick }: Props) {
  const colors = useColors();
  const t = useT();

  const items: { key: Action; emoji: string; label: string }[] = [
    { key: "camera", emoji: "📷", label: t.chat.fromCamera },
    { key: "gallery", emoji: "🖼️", label: t.chat.fromGallery },
    { key: "video", emoji: "🎬", label: t.chat.recordVideo },
  ];

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)" }}
      />
      <View
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 28,
        }}
      >
        <View
          style={{
            backgroundColor: colors.bg,
            borderRadius: 18,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          {items.map((it, idx) => (
            <Pressable
              key={it.key}
              onPress={() => {
                onClose();
                setTimeout(() => onPick(it.key), 350);
              }}
              style={({ pressed }) => ({
                paddingVertical: 16,
                paddingHorizontal: 18,
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
                backgroundColor: pressed ? colors.bgElevated : "transparent",
                borderTopWidth: idx === 0 ? 0 : 1,
                borderTopColor: colors.border,
              })}
            >
              <Text style={{ fontSize: 22 }}>{it.emoji}</Text>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: "600" }}>
                {it.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <Pressable
          onPress={onClose}
          style={{
            marginTop: 10,
            backgroundColor: colors.bg,
            borderRadius: 18,
            paddingVertical: 16,
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ color: colors.accent, fontWeight: "800", fontSize: 16 }}>
            {t.common.cancel}
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
}
