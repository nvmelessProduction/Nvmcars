/**
 * Web stub for react-native-maps.
 * On web, MapView renders a placeholder and Marker/Polyline are no-ops.
 */
import { View, Text } from "react-native";

function MapView({ style, children }) {
  return (
    <View
      style={[
        { backgroundColor: "#e8e8e8", alignItems: "center", justifyContent: "center" },
        style,
      ]}
    >
      <Text style={{ color: "#666", fontSize: 14 }}>Mappa non disponibile su web</Text>
      {children}
    </View>
  );
}

function Marker() {
  return null;
}

function Polyline() {
  return null;
}

const PROVIDER_DEFAULT = "default";
const PROVIDER_GOOGLE = "google";

export default MapView;
export { MapView, Marker, Polyline, PROVIDER_DEFAULT, PROVIDER_GOOGLE };
