import { Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

type Props = {
  size?: number;
  variant?: "mark" | "horizontal" | "wordmark";
  tone?: "auto" | "dark" | "light";
  color?: string;
};

const ACCENT_DARK = "#06B6D4";
const ACCENT_LIGHT = "#22D3EE";
const INK = "#0F172A";
const WHITE = "#FFFFFF";

export function Logo({
  size = 40,
  variant = "horizontal",
  tone = "auto",
  color,
}: Props) {
  const onDark = tone === "light";
  const strokeColor = color ?? (onDark ? ACCENT_LIGHT : INK);
  const textColor = color ?? (onDark ? WHITE : INK);

  if (variant === "mark") {
    return <Mark size={size} color={color ?? ACCENT_DARK} />;
  }

  if (variant === "wordmark") {
    return <Wordmark size={size} color={textColor} prefix="n" />;
  }

  const markSize = size;
  const textSize = size * 0.78;

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <NMark size={markSize} color={strokeColor} />
      <View style={{ width: markSize * 0.18 }} />
      <Wordmark size={textSize} color={textColor} prefix="" />
    </View>
  );
}

function Mark({ size, color }: { size: number; color: string }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.225,
        backgroundColor: color,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg
        width={size * 0.62}
        height={size * 0.62}
        viewBox="0 0 100 100"
        fill="none"
      >
        <Path
          d="M 18 78 C 18 22, 82 22, 82 78"
          stroke={WHITE}
          strokeWidth={16}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

function NMark({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size * 0.78} height={size} viewBox="0 0 100 100" fill="none">
      <Path
        d="M 18 78 C 18 22, 82 22, 82 78"
        stroke={color}
        strokeWidth={16}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function Wordmark({
  size,
  color,
  prefix,
}: {
  size: number;
  color: string;
  prefix: string;
}) {
  return (
    <Text
      style={{
        color,
        fontSize: size,
        fontWeight: "900",
        letterSpacing: -size * 0.05,
        includeFontPadding: false,
      }}
    >
      {prefix}vmcars
    </Text>
  );
}
