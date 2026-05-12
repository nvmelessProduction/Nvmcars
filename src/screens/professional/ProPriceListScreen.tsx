import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { KAV } from "@/components/KAV";
import { useAuthStore } from "@/store/useAuthStore";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import { SERVICES } from "@/data/services";
import { CAR_BRANDS } from "@/data/carBrands";
import { useWorkshopStore, useOwnWorkshop } from "@/store/useWorkshopStore";
import type { ServiceKey, ServicePriceOverride } from "@/types";

export function ProPriceListScreen() {
  const colors = useColors();
  const t = useT();
  const user = useAuthStore((s) => s.user);
  const workshopId = user && user.role === "professional" ? user.workshopId : undefined;
  const workshop = useOwnWorkshop(workshopId);

  const ensureWorkshop = useWorkshopStore((s) => s.ensureWorkshop);
  const setServices = useWorkshopStore((s) => s.setServices);
  const addOverride = useWorkshopStore((s) => s.addOverride);
  const removeOverride = useWorkshopStore((s) => s.removeOverride);

  useEffect(() => {
    if (workshopId) ensureWorkshop(workshopId, user?.id);
  }, [workshopId, ensureWorkshop, user?.id]);

  const [prices, setPrices] = useState<Partial<Record<ServiceKey, string>>>({});
  const [overrideModalFor, setOverrideModalFor] = useState<ServiceKey | null>(null);

  useEffect(() => {
    if (!workshop) return;
    const out: Partial<Record<ServiceKey, string>> = {};
    for (const k of Object.keys(workshop.services) as ServiceKey[]) {
      const v = workshop.services[k];
      if (v !== undefined) out[k] = String(v);
    }
    setPrices(out);
  }, [workshop?.id]);

  const togglePrice = (k: ServiceKey) =>
    setPrices((s) => {
      const next = { ...s };
      if (next[k] !== undefined) delete next[k];
      else next[k] = "";
      return next;
    });

  const updatePrice = (k: ServiceKey, v: string) =>
    setPrices((s) => ({ ...s, [k]: v }));

  const handleSave = () => {
    if (!workshopId) return;
    const out: Partial<Record<ServiceKey, number>> = {};
    for (const [k, v] of Object.entries(prices)) {
      if (v && parseInt(v, 10) > 0) out[k as ServiceKey] = parseInt(v, 10);
    }
    setServices(workshopId, out);
    Alert.alert("Listino aggiornato", "Le modifiche sono visibili ai clienti.", [
      { text: t.common.ok },
    ]);
  };

  const overridesByService = useMemo(() => {
    const map: Partial<Record<ServiceKey, ServicePriceOverride[]>> = {};
    for (const o of workshop?.priceOverrides ?? []) {
      map[o.serviceKey] = map[o.serviceKey] ?? [];
      map[o.serviceKey]!.push(o);
    }
    return map;
  }, [workshop?.priceOverrides]);

  return (
    <ScreenContainer>
      <KAV style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          <Card>
            <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text }}>
              💶 {t.pro.editPriceList}
            </Text>
            <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 6, lineHeight: 19 }}>
              💡 {t.pro.pricingExpertBody}
            </Text>
          </Card>

          {SERVICES.map((s) => {
            const enabled = prices[s.key] !== undefined;
            const overrides = overridesByService[s.key] ?? [];
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
                  <Switch value={enabled} onValueChange={() => togglePrice(s.key)} />
                </View>

                {enabled ? (
                  <>
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
                          backgroundColor: colors.bgElevated,
                          borderWidth: 1,
                          borderColor: colors.border,
                          borderRadius: 10,
                          paddingHorizontal: 10,
                        }}
                      >
                        <Text style={{ fontSize: 16, color: colors.textMuted }}>€</Text>
                        <TextInput
                          value={prices[s.key] ?? ""}
                          onChangeText={(v) => updatePrice(s.key, v.replace(/[^0-9]/g, ""))}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor={colors.textMuted}
                          style={{
                            flex: 1,
                            padding: 10,
                            color: colors.text,
                            textAlign: "right",
                            fontWeight: "700",
                          }}
                        />
                      </View>
                    </View>

                    {overrides.length > 0 ? (
                      <View style={{ marginTop: 12, gap: 6 }}>
                        <Text
                          style={{
                            fontSize: 11,
                            color: colors.textMuted,
                            fontWeight: "700",
                            letterSpacing: 0.6,
                          }}
                        >
                          PREZZI PERSONALIZZATI
                        </Text>
                        {overrides.map((o) => (
                          <View
                            key={o.id}
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between",
                              backgroundColor: colors.bgElevated,
                              borderRadius: 10,
                              paddingHorizontal: 10,
                              paddingVertical: 8,
                              borderWidth: 1,
                              borderColor: colors.border,
                            }}
                          >
                            <View style={{ flex: 1 }}>
                              <Text style={{ color: colors.text, fontSize: 13, fontWeight: "700" }}>
                                {o.brand}
                                {o.model ? ` ${o.model}` : ` (tutti i modelli)`}
                              </Text>
                              <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
                                €{o.price}
                              </Text>
                            </View>
                            <Pressable
                              onPress={() => workshopId && removeOverride(workshopId, o.id)}
                              hitSlop={8}
                            >
                              <Text style={{ color: colors.danger, fontSize: 18, fontWeight: "700" }}>
                                ×
                              </Text>
                            </Pressable>
                          </View>
                        ))}
                      </View>
                    ) : null}

                    <Pressable
                      onPress={() => setOverrideModalFor(s.key)}
                      style={{
                        marginTop: 10,
                        paddingVertical: 10,
                        borderRadius: 10,
                        borderWidth: 1.2,
                        borderColor: colors.accent,
                        borderStyle: "dashed",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: colors.accent, fontWeight: "700", fontSize: 13 }}>
                        + {t.pro.addOverride}
                      </Text>
                    </Pressable>
                  </>
                ) : null}
              </Card>
            );
          })}
        </ScrollView>

        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            padding: 16,
            paddingBottom: 28,
            backgroundColor: colors.bg,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <PrimaryButton label={t.common.save} icon="💾" onPress={handleSave} />
        </View>
      </KAV>

      <OverrideModal
        visible={overrideModalFor !== null}
        onClose={() => setOverrideModalFor(null)}
        onConfirm={(brand, model, price) => {
          if (!workshopId || !overrideModalFor) return;
          addOverride(workshopId, {
            serviceKey: overrideModalFor,
            brand,
            model,
            price,
          });
          setOverrideModalFor(null);
        }}
      />
    </ScreenContainer>
  );
}

function OverrideModal({
  visible,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: (brand: string, model: string | undefined, price: number) => void;
}) {
  const colors = useColors();
  const t = useT();
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [price, setPrice] = useState("");
  const [scope, setScope] = useState<"brand" | "model">("model");

  useEffect(() => {
    if (visible) {
      setBrand("");
      setModel("");
      setPrice("");
      setScope("model");
    }
  }, [visible]);

  const brands = useMemo(() => Object.keys(CAR_BRANDS), []);
  const models = useMemo(() => (brand ? CAR_BRANDS[brand]?.map((m) => m.model) ?? [] : []), [brand]);

  const handleConfirm = () => {
    if (!brand || !price || parseInt(price, 10) <= 0) {
      Alert.alert("Dati mancanti", "Seleziona marca e inserisci un prezzo > 0.");
      return;
    }
    if (scope === "model" && !model) {
      Alert.alert("Seleziona modello", "Per la modalità per marca+modello seleziona un modello.");
      return;
    }
    onConfirm(brand, scope === "model" ? model : undefined, parseInt(price, 10));
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: colors.bg,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            maxHeight: "85%",
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text }}>
              {t.pro.addOverride}
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Text style={{ color: colors.textMuted, fontSize: 22 }}>×</Text>
            </Pressable>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled">
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
              <Pressable
                onPress={() => setScope("brand")}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: scope === "brand" ? colors.accent : colors.bgElevated,
                  borderWidth: 1,
                  borderColor: scope === "brand" ? colors.accent : colors.border,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: scope === "brand" ? "#FFF" : colors.text,
                    fontWeight: "700",
                    fontSize: 13,
                  }}
                >
                  {t.pro.overrideForBrand}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setScope("model")}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: scope === "model" ? colors.accent : colors.bgElevated,
                  borderWidth: 1,
                  borderColor: scope === "model" ? colors.accent : colors.border,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: scope === "model" ? "#FFF" : colors.text,
                    fontWeight: "700",
                    fontSize: 13,
                  }}
                >
                  {t.pro.overrideForModel}
                </Text>
              </Pressable>
            </View>

            <Text style={{ fontSize: 13, color: colors.textMuted, fontWeight: "600", marginBottom: 6 }}>
              {t.pro.overrideBrand}
            </Text>
            <View style={{ height: 200, marginBottom: 16 }}>
              <FlatList
                data={brands}
                keyExtractor={(b) => b}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => {
                      setBrand(item);
                      setModel("");
                    }}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                      backgroundColor: brand === item ? colors.accentSoft : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        color: brand === item ? colors.accent : colors.text,
                        fontWeight: brand === item ? "800" : "500",
                      }}
                    >
                      {item}
                    </Text>
                  </Pressable>
                )}
              />
            </View>

            {scope === "model" && brand ? (
              <>
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.textMuted,
                    fontWeight: "600",
                    marginBottom: 6,
                  }}
                >
                  {t.pro.overrideModel}
                </Text>
                <View style={{ height: 180, marginBottom: 16 }}>
                  <FlatList
                    data={models}
                    keyExtractor={(m) => m}
                    renderItem={({ item }) => (
                      <Pressable
                        onPress={() => setModel(item)}
                        style={{
                          paddingVertical: 10,
                          paddingHorizontal: 12,
                          borderRadius: 8,
                          backgroundColor: model === item ? colors.accentSoft : "transparent",
                        }}
                      >
                        <Text
                          style={{
                            color: model === item ? colors.accent : colors.text,
                            fontWeight: model === item ? "800" : "500",
                          }}
                        >
                          {item}
                        </Text>
                      </Pressable>
                    )}
                  />
                </View>
              </>
            ) : null}

            <Text style={{ fontSize: 13, color: colors.textMuted, fontWeight: "600", marginBottom: 6 }}>
              {t.pro.overridePrice}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 10,
                paddingHorizontal: 12,
                marginBottom: 18,
                backgroundColor: colors.bgElevated,
              }}
            >
              <Text style={{ color: colors.textMuted, fontSize: 16 }}>€</Text>
              <TextInput
                value={price}
                onChangeText={(v) => setPrice(v.replace(/[^0-9]/g, ""))}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                style={{
                  flex: 1,
                  padding: 12,
                  color: colors.text,
                  textAlign: "right",
                  fontWeight: "700",
                  fontSize: 16,
                }}
              />
            </View>

            <PrimaryButton label={t.common.save} icon="💾" onPress={handleConfirm} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
