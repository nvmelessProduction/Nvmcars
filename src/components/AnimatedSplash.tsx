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
          {/* scie di velocità sotto la macchina (movimento verso l'alto) */}
          <Animated.View
            style={{ position: "absolute", top: 70, left: -28, width: 8, height: 120, borderRadius: 4, backgroundColor: ORANGE_TOP, opacity: 0.85 }}
          />
          <Animated.View
            style={{ position: "absolute", top: 80, width: 6, height: 95, borderRadius: 3, backgroundColor: ORANGE_BOT, opacity: 0.6 }}
          />
          <Animated.View
            style={{ position: "absolute", top: 80, left: 28, width: 6, height: 95, borderRadius: 3, backgroundColor: ORANGE_BOT, opacity: 0.45 }}
          />
          <Ferrari width={230} />
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

/**
 * Crossover sportivo rosso di profilo, stile "Purosangue" (SUV-coupé):
 * tetto spiovente, cerchi neri grandi con pinza rossa, fascia rossa bassa.
 * Disegnata di profilo (muso a destra). Nessun marchio.
 */
function Ferrari({ width }: { width: number }) {
  const h = width * 0.5;
  return (
    <Svg width={width} height={h} viewBox="0 0 310 135">
      <Defs>
        <LinearGradient id="ferBody" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FF353B" />
          <Stop offset="0.45" stopColor="#D6080F" />
          <Stop offset="1" stopColor="#7c0205" />
        </LinearGradient>
        <LinearGradient id="ferShine" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#ffffff" stopOpacity="0.5" />
          <Stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </LinearGradient>
        <LinearGradient id="ferLower" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#5a0103" />
          <Stop offset="1" stopColor="#2a0001" />
        </LinearGradient>
        <LinearGradient id="ferGlass" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#e6f4ff" />
          <Stop offset="1" stopColor="#1c2730" />
        </LinearGradient>
        <LinearGradient id="ferRim" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#3a3a40" />
          <Stop offset="0.55" stopColor="#1c1c20" />
          <Stop offset="1" stopColor="#070708" />
        </LinearGradient>
      </Defs>

      <Ellipse cx="155" cy="112" rx="135" ry="9" fill="#000000" opacity="0.45" />

      {/* corpo SUV-coupé */}
      <Path
        d="M296 74 C302 72 302 64 296 62 L274 58 C266 50 254 45 240 43 C232 33 214 27 188 27 C158 26 140 31 126 40 C108 27 86 24 66 27 C46 30 32 40 26 54 L18 60 C10 63 8 70 12 78 C14 84 20 87 30 87 L284 87 C292 87 296 81 296 74 Z"
        fill="url(#ferBody)"
      />
      <Path d="M150 33 C188 28 226 33 262 52 L262 58 C228 44 190 41 150 44 Z" fill="url(#ferShine)" opacity="0.45" />
      {/* vetri */}
      <Path d="M70 35 C92 26 116 24 140 25 C170 26 196 32 220 46 L196 47 L96 49 C84 49 76 44 70 35 Z" fill="url(#ferGlass)" />
      <Path d="M70 35 C64 40 60 47 60 55 L78 53 L96 49 Z" fill="url(#ferBody)" />
      {/* minigonna + fascia rossa */}
      <Path d="M30 87 L284 87 C292 87 296 81 296 74 L286 75 L40 79 C30 80 24 84 30 87 Z" fill="url(#ferLower)" />
      <Path d="M44 80 L260 77" stroke="#ff2d32" strokeWidth="2" opacity="0.8" />
      {/* presa d'aria */}
      <Path d="M160 60 L196 55 L202 66 L166 70 Z" fill="#150203" />
      {/* fari */}
      <Path d="M262 62 L280 64 L279 70 L262 68 Z" fill="#FFF0C4" />
      <Circle cx="22" cy="66" r="3.2" fill="#ff5050" />
      <Circle cx="22" cy="74" r="3.2" fill="#cc2222" />
      {/* ruote */}
      <Circle cx="88" cy="88" r="26" fill="#0a0a0c" />
      <Circle cx="88" cy="88" r="14.5" fill="url(#ferRim)" />
      <Circle cx="88" cy="88" r="3.6" fill="#e10911" />
      <Circle cx="240" cy="88" r="26" fill="#0a0a0c" />
      <Circle cx="240" cy="88" r="14.5" fill="url(#ferRim)" />
      <Circle cx="240" cy="88" r="3.6" fill="#e10911" />
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
