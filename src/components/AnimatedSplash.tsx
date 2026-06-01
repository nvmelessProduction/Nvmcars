import { useEffect, useState } from "react";
import { Dimensions } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  Keyframe,
} from "react-native-reanimated";
import Svg, { Defs, LinearGradient, Path, Stop, Ellipse, Circle } from "react-native-svg";

const BG = "#0A0A0B";
const ORANGE_TOP = "#FF8A2A";
const ORANGE_BOT = "#FF5A00";

const { height: SCREEN_H } = Dimensions.get("window");
const TRAVEL = Math.max(SCREEN_H, 760);

/**
 * Splash animata di avvio:
 *  1) una Ferrari rossa parte dal basso e sfreccia verso l'alto fino a uscire
 *     dallo schermo (con scie di velocità);
 *  2) compare il tile con la "N" arancio, poi il wordmark "nvmcars" + tagline;
 *  3) il tutto sfuma e lascia spazio all'app.
 * Durata totale ~3.1s. `onDone` smonta lo splash a fine sequenza.
 *
 * NB: per il movimento usiamo `Keyframe` (entering) invece di
 * useSharedValue+withTiming, perché i keyframe entering funzionano in modo
 * affidabile sia su nativo che su web.
 */

// Corsa della Ferrari: parte in basso fuori vista, attraversa lo schermo
// accelerando, esce in alto. La scia/opacità accompagna il movimento.
const carRun = new Keyframe({
  0: { opacity: 0, transform: [{ translateY: TRAVEL * 0.62 }] },
  15: { opacity: 1, transform: [{ translateY: TRAVEL * 0.45 }] },
  60: { opacity: 1, transform: [{ translateY: 0 }] },
  90: { opacity: 1, transform: [{ translateY: -TRAVEL * 0.5 }] },
  100: { opacity: 0, transform: [{ translateY: -TRAVEL * 0.62 }] },
});

export function AnimatedSplash({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"car" | "logo">("car");

  useEffect(() => {
    // dopo che la Ferrari è passata, mostra il logo
    const toLogo = setTimeout(() => setPhase("logo"), 1450);
    // chiude lo splash
    const done = setTimeout(() => onDone(), 3100);
    return () => {
      clearTimeout(toLogo);
      clearTimeout(done);
    };
  }, []);

  return (
    <Animated.View
      exiting={FadeOut.duration(350)}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: BG,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
        overflow: "hidden",
      }}
    >
      {phase === "car" ? (
        <Animated.View
          entering={carRun.duration(1500)}
          style={{ position: "absolute", alignItems: "center" }}
        >
          {/* scie di velocità dietro la macchina */}
          <Animated.View
            style={{ position: "absolute", top: 135, width: 10, height: 110, borderRadius: 5, backgroundColor: ORANGE_TOP, opacity: 0.85 }}
          />
          <Animated.View
            style={{ position: "absolute", top: 150, left: -34, width: 6, height: 80, borderRadius: 3, backgroundColor: ORANGE_BOT, opacity: 0.6 }}
          />
          <Animated.View
            style={{ position: "absolute", top: 150, left: 28, width: 6, height: 80, borderRadius: 3, backgroundColor: ORANGE_BOT, opacity: 0.4 }}
          />
          <Ferrari width={150} />
        </Animated.View>
      ) : (
        <Animated.View entering={FadeIn.duration(300)} style={{ alignItems: "center" }}>
          <NTile size={120} />
          <Animated.Text
            entering={FadeIn.delay(200).duration(450)}
            style={{ color: "#FAFAFA", fontSize: 34, fontWeight: "900", letterSpacing: -1, marginTop: 22 }}
          >
            nvmcars
          </Animated.Text>
          <Animated.Text
            entering={FadeIn.delay(450).duration(450)}
            style={{ color: ORANGE_TOP, fontSize: 13, fontWeight: "700", letterSpacing: 2, marginTop: 6 }}
          >
            OFFICINE SENZA STRESS
          </Animated.Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

/** Ferrari stilizzata vista dall'alto (supercar rossa), punta verso l'alto. */
function Ferrari({ width }: { width: number }) {
  const h = width * 1.6;
  return (
    <Svg width={width} height={h} viewBox="0 0 100 160">
      <Defs>
        <LinearGradient id="ferRed" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#B11217" />
          <Stop offset="0.5" stopColor="#FF1E27" />
          <Stop offset="1" stopColor="#B11217" />
        </LinearGradient>
        <LinearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#1a1a1f" />
          <Stop offset="1" stopColor="#3a3a44" />
        </LinearGradient>
      </Defs>

      {/* ombra */}
      <Ellipse cx="50" cy="150" rx="30" ry="8" fill="#000000" opacity="0.35" />

      {/* corpo auto (vista dall'alto, muso in alto) */}
      <Path
        d="M50 4
           C40 4 33 14 31 28
           C20 32 14 42 14 62
           C14 92 16 120 22 138
           C26 150 38 154 50 154
           C62 154 74 150 78 138
           C84 120 86 92 86 62
           C86 42 80 32 69 28
           C67 14 60 4 50 4 Z"
        fill="url(#ferRed)"
      />
      {/* parabrezza */}
      <Path d="M38 50 C42 46 58 46 62 50 C64 60 64 70 60 78 C54 74 46 74 40 78 C36 70 36 60 38 50 Z" fill="url(#glass)" />
      {/* cofano posteriore / vetro dietro */}
      <Path d="M40 96 C46 92 54 92 60 96 C61 104 61 114 58 122 C53 119 47 119 42 122 C39 114 39 104 40 96 Z" fill="url(#glass)" opacity="0.85" />
      {/* riga centrale */}
      <Path d="M50 30 L50 150" stroke="#7a0c10" strokeWidth="1.4" opacity="0.5" />
      {/* ruote */}
      <Path d="M10 44 h10 v26 h-10 z" fill="#141417" />
      <Path d="M80 44 h10 v26 h-10 z" fill="#141417" />
      <Path d="M9 104 h11 v28 h-11 z" fill="#141417" />
      <Path d="M80 104 h11 v28 h-11 z" fill="#141417" />
      {/* fari anteriori */}
      <Circle cx="40" cy="16" r="3" fill="#FFE9B0" />
      <Circle cx="60" cy="16" r="3" fill="#FFE9B0" />
      {/* fanali posteriori */}
      <Path d="M34 146 h12 v4 h-12 z" fill="#ff5a5a" />
      <Path d="M54 146 h12 v4 h-12 z" fill="#ff5a5a" />
    </Svg>
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
