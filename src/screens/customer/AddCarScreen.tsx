import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TextField } from "@/components/TextField";
import { Card } from "@/components/Card";
import { PickerSheet } from "@/components/PickerSheet";
import { useCarStore } from "@/store/useCarStore";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import {
  CAR_BRANDS,
  CAR_BRANDS_LIST,
  CATEGORY_LABEL,
  inferCategory,
} from "@/data/carBrands";
import { isValidItalianPlate, lookupPlate } from "@/data/plateLookup";
import type { FuelType } from "@/types";
import type { HomeStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<HomeStackParamList, "AddCar">;

const FUELS: FuelType[] = ["benzina", "diesel", "ibrido", "elettrico", "gpl", "metano"];

type Mode = "plate" | "manual";

export function AddCarScreen() {
  const navigation = useNavigation<Nav>();
  const colors = useColors();
  const t = useT();
  const addCar = useCarStore((s) => s.addCar);

  const [mode, setMode] = useState<Mode>("plate");

  const [plate, setPlate] = useState("");
  const [lookupBusy, setLookupBusy] = useState(false);
  const [lookupResult, setLookupResult] = useState<ReturnType<typeof lookupPlate>>(null);

  const [make, setMake] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [year, setYear] = useState(`${new Date().getFullYear() - 5}`);
  const [fuel, setFuel] = useState<FuelType>("benzina");
  const [displacement, setDisplacement] = useState("1400");
  const [nickname, setNickname] = useState("");

  const [makeOpen, setMakeOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);

  const handleLookup = () => {
    const p = plate.trim().toUpperCase().replace(/\s+/g, "");
    if (!isValidItalianPlate(p)) {
      Alert.alert(
        "Targa non valida",
        "Formato atteso: AB 123 CD (2 lettere + 3 cifre + 2 lettere)."
      );
      return;
    }
    setLookupBusy(true);
    setLookupResult(null);
    setTimeout(() => {
      const r = lookupPlate(p);
      setLookupResult(r);
      if (r) {
        setMake(r.make);
        setModel(r.model);
        setYear(String(r.year));
        setFuel(r.fuel);
        setDisplacement(String(r.displacement));
      }
      setLookupBusy(false);
    }, 700);
  };

  const handleSwitchToManual = () => {
    setMode("manual");
  };

  const handleSaveFromLookup = () => {
    if (!lookupResult) return;
    addCar({
      plate: lookupResult.plate,
      make: lookupResult.make,
      model: lookupResult.model,
      year: lookupResult.year,
      fuel: lookupResult.fuel,
      displacement: lookupResult.displacement,
      category: lookupResult.category,
      nickname: nickname.trim() || undefined,
    });
    navigation.goBack();
  };

  const handleSaveManual = () => {
    if (!make || !model) {
      Alert.alert(t.common.error, "Seleziona marca e modello.");
      return;
    }
    const yearNum = Number(year);
    if (!yearNum || yearNum < 1980 || yearNum > new Date().getFullYear() + 1) {
      Alert.alert(t.common.error, "Anno non valido.");
      return;
    }
    const cc = Number(displacement);
    if (fuel !== "elettrico" && (!cc || cc < 50 || cc > 8000)) {
      Alert.alert(t.common.error, "Cilindrata non valida.");
      return;
    }
    const plateTrim = plate.trim().toUpperCase().replace(/\s+/g, "");
    addCar({
      plate: plateTrim || `MAN-${Date.now().toString(36).toUpperCase()}`,
      make,
      model,
      year: yearNum,
      fuel,
      displacement: fuel === "elettrico" ? 0 : cc,
      category: inferCategory(make, model),
      nickname: nickname.trim() || undefined,
    });
    navigation.goBack();
  };

  const models = make ? CAR_BRANDS[make].map((m) => m.model) : [];

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={{ fontSize: 22, fontWeight: "800", color: colors.text }}>
            {t.home.addCar}
          </Text>
          <Text style={{ fontSize: 14, color: colors.textMuted, marginBottom: 6 }}>
            Scegli come vuoi inserire la tua auto.
          </Text>

          <ModeToggle mode={mode} onChange={setMode} colors={colors} />

          {mode === "plate" ? (
            <View style={{ gap: 14 }}>
              <TextField
                label={t.car.plate}
                value={plate}
                onChangeText={(v) => {
                  setPlate(v.toUpperCase());
                  setLookupResult(null);
                }}
                placeholder="AB 123 CD"
                autoCapitalize="characters"
                maxLength={9}
                hint="Targa italiana (formato AB123CD)"
              />

              {!lookupResult ? (
                <PrimaryButton
                  label={lookupBusy ? "Ricerca..." : "Trova la mia auto"}
                  onPress={handleLookup}
                  disabled={lookupBusy || plate.length < 7}
                />
              ) : null}

              {lookupBusy ? (
                <Card padding={20}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <ActivityIndicator color={colors.accent} />
                    <Text style={{ color: colors.textMuted, fontSize: 14 }}>
                      Sto cercando la tua auto nei registri...
                    </Text>
                  </View>
                </Card>
              ) : null}

              {lookupResult ? (
                <>
                  <Card padding={18}>
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "800",
                        color: colors.accent,
                        letterSpacing: 0.5,
                        marginBottom: 6,
                      }}
                    >
                      AUTO TROVATA
                    </Text>
                    <Text
                      style={{
                        fontSize: 22,
                        fontWeight: "800",
                        color: colors.text,
                      }}
                    >
                      {lookupResult.make} {lookupResult.model}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: colors.textMuted,
                        marginTop: 4,
                      }}
                    >
                      {lookupResult.year} •{" "}
                      {lookupResult.fuel === "elettrico"
                        ? "Elettrica"
                        : `${lookupResult.displacement}cc ${t.car[lookupResult.fuel]}`}{" "}
                      • {CATEGORY_LABEL[lookupResult.category]}
                    </Text>
                    <View
                      style={{
                        marginTop: 14,
                        paddingTop: 14,
                        borderTopWidth: 1,
                        borderTopColor: colors.border,
                      }}
                    >
                      <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                        Targa
                      </Text>
                      <Text
                        style={{
                          color: colors.text,
                          fontSize: 16,
                          fontWeight: "700",
                          letterSpacing: 1.5,
                          marginTop: 2,
                        }}
                      >
                        {lookupResult.plate}
                      </Text>
                    </View>
                  </Card>

                  <TextField
                    label={`${t.car.nickname} (${t.common.optional})`}
                    value={nickname}
                    onChangeText={setNickname}
                    placeholder={t.car.nicknameHint}
                  />

                  <View style={{ gap: 8 }}>
                    <PrimaryButton
                      label="Conferma e salva"
                      onPress={handleSaveFromLookup}
                    />
                    <PrimaryButton
                      label="I dati non sono giusti, inserisci a mano"
                      variant="ghost"
                      onPress={handleSwitchToManual}
                    />
                  </View>
                </>
              ) : null}

              <Pressable onPress={handleSwitchToManual} style={{ paddingVertical: 6 }}>
                <Text
                  style={{
                    color: colors.accent,
                    textAlign: "center",
                    fontWeight: "600",
                    fontSize: 14,
                  }}
                >
                  Non vuoi inserire la targa? Inserisci manualmente →
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={{ gap: 14 }}>
              <SelectField
                label={t.car.make}
                value={make}
                placeholder="Seleziona marca"
                onPress={() => setMakeOpen(true)}
                colors={colors}
              />

              <SelectField
                label={t.car.model}
                value={model}
                placeholder={make ? "Seleziona modello" : "Prima scegli una marca"}
                onPress={() => make && setModelOpen(true)}
                disabled={!make}
                colors={colors}
              />

              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <TextField
                    label={t.car.year}
                    value={year}
                    onChangeText={setYear}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <TextField
                    label={t.car.displacement}
                    value={displacement}
                    onChangeText={setDisplacement}
                    keyboardType="numeric"
                    maxLength={4}
                    hint="cc"
                    editable={fuel !== "elettrico"}
                  />
                </View>
              </View>

              <View>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: colors.textMuted,
                    marginBottom: 6,
                  }}
                >
                  {t.car.fuel}
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {FUELS.map((f) => {
                    const active = f === fuel;
                    return (
                      <Pressable
                        key={f}
                        onPress={() => setFuel(f)}
                        style={{
                          paddingHorizontal: 14,
                          paddingVertical: 9,
                          borderRadius: 999,
                          backgroundColor: active ? colors.accent : colors.bgElevated,
                          borderWidth: 1,
                          borderColor: active ? colors.accent : colors.border,
                        }}
                      >
                        <Text
                          style={{
                            color: active ? "#FFF" : colors.text,
                            fontWeight: "700",
                            fontSize: 13,
                          }}
                        >
                          {t.car[f]}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <TextField
                label={`${t.car.plate} (${t.common.optional})`}
                value={plate}
                onChangeText={(v) => setPlate(v.toUpperCase())}
                placeholder={t.car.plateHint}
                autoCapitalize="characters"
                maxLength={9}
              />

              <TextField
                label={`${t.car.nickname} (${t.common.optional})`}
                value={nickname}
                onChangeText={setNickname}
                placeholder={t.car.nicknameHint}
              />

              <View style={{ marginTop: 8 }}>
                <PrimaryButton label={t.car.saveCar} onPress={handleSaveManual} />
              </View>
            </View>
          )}
        </ScrollView>

        <PickerSheet
          visible={makeOpen}
          title="Seleziona marca"
          searchPlaceholder="Cerca tra 35+ marche..."
          options={CAR_BRANDS_LIST}
          selected={make}
          onSelect={(v) => {
            setMake(v);
            setModel(null);
          }}
          onClose={() => setMakeOpen(false)}
        />

        <PickerSheet
          visible={modelOpen}
          title={`Modelli ${make ?? ""}`}
          searchPlaceholder="Cerca modello..."
          options={models}
          selected={model}
          onSelect={setModel}
          onClose={() => setModelOpen(false)}
        />
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

function ModeToggle({
  mode,
  onChange,
  colors,
}: {
  mode: Mode;
  onChange: (m: Mode) => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: colors.bgElevated,
        borderRadius: 14,
        padding: 4,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      {(["plate", "manual"] as const).map((m) => {
        const active = m === mode;
        return (
          <Pressable
            key={m}
            onPress={() => onChange(m)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 10,
              backgroundColor: active ? colors.bg : "transparent",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: active ? colors.text : colors.textMuted,
                fontWeight: active ? "800" : "600",
                fontSize: 14,
              }}
            >
              {m === "plate" ? "Cerca con targa" : "Inserisci manualmente"}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function SelectField({
  label,
  value,
  placeholder,
  onPress,
  disabled,
  colors,
}: {
  label: string;
  value: string | null;
  placeholder: string;
  onPress: () => void;
  disabled?: boolean;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View>
      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: colors.textMuted,
          marginBottom: 6,
        }}
      >
        {label}
      </Text>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={{
          backgroundColor: colors.bgElevated,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 14,
          opacity: disabled ? 0.5 : 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{
            color: value ? colors.text : colors.textMuted,
            fontSize: 15,
            fontWeight: value ? "700" : "500",
          }}
        >
          {value ?? placeholder}
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 14 }}>▼</Text>
      </Pressable>
    </View>
  );
}
