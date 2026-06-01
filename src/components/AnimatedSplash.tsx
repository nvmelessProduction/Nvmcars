import { useEffect, useState } from "react";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

const TILE = "#0A0A0B";
const ORANGE_TOP = "#FF8A2A";
const ORANGE_BOT = "#FF5A00";

/**
 * Splash animata mostrata all'avvio: il tile con la "N" entra in scala con un
 * piccolo rimbalzo, poi appare il wordmark "nvmcars", infine il tutto sfuma e
 * lascia spazio all'app. Durata totale ~2s. `onDone` viene chiamato a fine
 * animazione per smontare lo splash.
 */
export function AnimatedSplash({ onDone }: { onDone: () => void }) {
  const scale = useSharedValue(0.4);
  const tileOpacity = useSharedValue(0);

  useEffect(() => {
    tileOpacity.value = withTiming(1, { duration: 350 });
    scale.value = withSequence(
      withTiming(1.12, { duration: 520, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 260, easing: Easing.inOut(Easing.quad) })
    );
    // chiude lo splash dopo ~2s
    const id = setTimeout(() => {
      runOnJS(onDone)();
    }, 2000);
    return () => clearTimeout(id);
  }, []);

  const tileStyle = useAnimatedStyle(() => ({
    opacity: tileOpacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      exiting={FadeOut.duration(350)}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: TILE,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
      }}
    >
      <Animated.View style={tileStyle}>
        <NTile size={120} />
      </Animated.View>
      <Animated.Text
        entering={FadeIn.delay(650).duration(500)}
        style={{
          color: "#FAFAFA",
          fontSize: 34,
          fontWeight: "900",
          letterSpacing: -1,
          marginTop: 22,
        }}
      >
        nvmcars
      </Animated.Text>
      <Animated.Text
        entering={FadeIn.delay(950).duration(500)}
        style={{
          color: ORANGE_TOP,
          fontSize: 13,
          fontWeight: "700",
          letterSpacing: 2,
          marginTop: 6,
        }}
      >
        OFFICINE SENZA STRESS
      </Animated.Text>
    </Animated.View>
  );
}

function NTile({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="splashN" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={ORANGE_TOP} />
          <Stop offset="1" stopColor={ORANGE_BOT} />
        </LinearGradient>
      </Defs>
      <Path
        d="M0 26 C0 8 8 0 26 0 H74 C92 0 100 8 100 26 V74 C100 92 92 100 74 100 H26 C8 100 0 92 0 74 Z"
        fill="#161618"
      />
      <Path
        d="M32 74 L32 30 M68 70 L68 26 M32 30 L68 70"
        stroke="url(#splashN)"
        strokeWidth={14}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

/** Hook helper: true finché lo splash è visibile. */
export function useSplash() {
  const [visible, setVisible] = useState(true);
  return { visible, hide: () => setVisible(false) };
}
