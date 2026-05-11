import { Text, View } from "react-native";

type Props = {
  size?: number;
  variant?: "mark" | "horizontal" | "wordmark";
  tone?: "auto" | "dark" | "light";
  wordmarkColor?: string;
};

export function Logo({
  size = 40,
  variant = "horizontal",
  tone = "auto",
  wordmarkColor,
}: Props) {
  if (variant === "mark") {
    return <Mark size={size} />;
  }

  if (variant === "wordmark") {
    return <Wordmark size={size} color={wordmarkColor ?? "#0F172A"} />;
  }

  const textColor =
    wordmarkColor ??
    (tone === "light" ? "#FFFFFF" : tone === "dark" ? "#0F172A" : "#0F172A");

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Mark size={size} />
      <View style={{ width: size * 0.3 }} />
      <Wordmark size={size * 0.72} color={textColor} />
    </View>
  );
}

function Mark({ size }: { size: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.225,
        backgroundColor: "#06B6D4",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          color: "#FFFFFF",
          fontSize: size * 0.7,
          fontWeight: "900",
          letterSpacing: -size * 0.05,
          lineHeight: size * 0.95,
          textAlign: "center",
          includeFontPadding: false,
        }}
      >
        n.
      </Text>
    </View>
  );
}

function Wordmark({ size, color }: { size: number; color: string }) {
  return (
    <Text
      style={{
        color,
        fontSize: size,
        fontWeight: "900",
        letterSpacing: -size * 0.045,
        includeFontPadding: false,
      }}
    >
      nvmcars
    </Text>
  );
}
