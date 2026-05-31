import { Text, View } from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

type Props = {
  size?: number;
  variant?: "mark" | "horizontal" | "wordmark";
  tone?: "auto" | "dark" | "light";
  color?: string;
};

// Brand "Performance / Automotive": tile nero + N arancio.
const TILE_DARK = "#0A0A0B";
const ORANGE_TOP = "#FF8A2A";
const ORANGE_BOT = "#FF5A00";
const INK = "#18181B";
const WHITE = "#FFFFFF";

export function Logo({
  size = 40,
  variant = "horizontal",
  tone = "auto",
  color,
}: Props) {
  const onDark = tone === "light";
  const textColor = color ?? (onDark ? WHITE : INK);

  if (variant === "mark") {
    return <NTile size={size} />;
  }

  if (variant === "wordmark") {
    return <Wordmark size={size * 0.78} color={textColor} />;
  }

  const tileSize = size;
  const textSize = size * 0.62;

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <NTile size={tileSize} />
      <View style={{ width: tileSize * 0.28 }} />
      <Wordmark size={textSize} color={textColor} />
    </View>
  );
}

/** Quadrato arrotondato nero con la "N" arancio (monogramma di brand). */
function NTile({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="nOrange" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={ORANGE_TOP} />
          <Stop offset="1" stopColor={ORANGE_BOT} />
        </LinearGradient>
      </Defs>
      {/* Tile */}
      <Path
        d="M0 26 C0 8 8 0 26 0 H74 C92 0 100 8 100 26 V74 C100 92 92 100 74 100 H26 C8 100 0 92 0 74 Z"
        fill={TILE_DARK}
      />
      {/* Monogramma N */}
      <NGlyph color="url(#nOrange)" />
    </Svg>
  );
}

/**
 * Solo la lettera N, in 3 tratti spessi a estremità arrotondate.
 * I tratti stanno in un UNICO path: con un gradiente (objectBoundingBox) un
 * path perfettamente verticale ha bounding-box di larghezza 0 e non verrebbe
 * disegnato — tenendoli insieme il bounding-box è 2D e il gradiente si applica.
 */
function NGlyph({ color }: { color: string }) {
  return (
    <Path
      d="M32 74 L32 30 M68 70 L68 26 M32 30 L68 70"
      stroke={color}
      strokeWidth={14}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  );
}

function Wordmark({ size, color }: { size: number; color: string }) {
  return (
    <Text
      style={{
        color,
        fontSize: size,
        fontWeight: "900",
        letterSpacing: -size * 0.04,
        includeFontPadding: false,
      }}
    >
      nvmcars
    </Text>
  );
}
