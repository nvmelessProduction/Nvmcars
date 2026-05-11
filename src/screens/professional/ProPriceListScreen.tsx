import { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuthStore } from "@/store/useAuthStore";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import { WORKSHOPS } from "@/data/workshops";
import { SERVICES, getServiceLabel, getServiceEmoji } from "@/data/services";
import type { ServiceKey } from "@/types";

export function ProPriceListScreen() {
  const colors = useColors();
  const t = useT();
  const user = useAuthStore((s) => s.user);
  const workshop = user && user.role === "professional" ? WORKSHOPS.find((w) => w.id === user.workshopId) : null;

  const initial = useMemo<Partial<Record<ServiceKey, number>>>(
    () => (workshop ? { ...workshop.services } : {}),
    [workshop]
  );
  const [prices, setPrices] = useState<Partial<Record<ServiceKey, string>>>(() => {
    const out: Partial<Record<ServiceKey, string>> = {};
    for (const k of Object.keys(initial) as ServiceKey[]) {
      out[k] = `${initial[k]}`;
    }
    return out;
  });

  const handleSave = () => {
    Alert.alert("Listino aggiornato", "Le modifiche saranno propagate ai clienti.", [
      { text: t.common.ok },
    ]);
  };

  const updatePrice = (key: ServiceKey, value: string) => {
    setPrices({ ...prices, [key]: value });
  };

  const togglePrice = (key: ServiceKey) => {
    const exists = prices[key] !== undefined;
    if (exists) {
      const { [key]: _, ...rest } = prices;
      setPrices(rest);
    } else {
      setPrices({ ...prices, [key]: "50" });
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>
          <Text style={{ fontSize: 13, color: colors.textMuted }}>
            Imposta i tuoi prezzi base. Per ogni cliente i prezzi vengono adattati alla
            categoria della sua auto (citycar, suv, premium, ...).
          </Text>

          {SERVICES.map((s) => {
            const enabled = prices[s.key] !== undefined;
            return (
              <Card key={s.key}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <Text style={{ fontSize: 26 }}>{s.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text }}>
                      {s.label}
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                      {enabled ? "Servizio attivo" : "Disabilitato"}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => togglePrice(s.key)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 999,
                      backgroundColor: enabled ? "rgba(16,185,129,0.15)" : colors.border,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "800",
                        color: enabled ? colors.success : colors.textMuted,
                      }}
                    >
                      {enabled ? "ATTIVO" : "OFF"}
                    </Text>
                  </Pressable>
                </View>

                {enabled ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 12,
                      gap: 10,
                    }}
                  >
                    <Text style={{ fontSize: 14, color: colors.textMuted, fontWeight: "600" }}>
                      Prezzo base
                    </Text>
                    <View
                      style={{
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: colors.bg,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: colors.border,
                        paddingHorizontal: 12,
                      }}
                    >
                      <Text style={{ fontSize: 16, color: colors.textMuted }}>€</Text>
                      <TextInput
                        value={prices[s.key] ?? ""}
                        onChangeText={(v) => updatePrice(s.key, v.replace(/[^0-9]/g, ""))}
                        keyboardType="numeric"
                        style={{
                          flex: 1,
                          paddingVertical: 10,
                          paddingHorizontal: 6,
                          fontSize: 16,
                          fontWeight: "700",
                          color: colors.text,
                        }}
                      />
                    </View>
                  </View>
                ) : null}
              </Card>
            );
          })}

          <View style={{ marginTop: 8 }}>
            <PrimaryButton label="Salva listino" icon="💾" onPress={handleSave} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
