import { useEffect, useState } from "react";
import * as Location from "expo-location";

const CERVETERI_FALLBACK = { lat: 41.9926, lng: 12.0992 };

export type UserLocation = {
  lat: number;
  lng: number;
  source: "gps" | "fallback";
};

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          if (!cancelled) {
            setLocation({ ...CERVETERI_FALLBACK, source: "fallback" });
            setLoading(false);
          }
          return;
        }
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!cancelled) {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            source: "gps",
          });
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setLocation({ ...CERVETERI_FALLBACK, source: "fallback" });
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { location, loading };
}
